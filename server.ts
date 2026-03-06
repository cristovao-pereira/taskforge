import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import prisma from './lib/prisma';
import { processEvent } from './services/metricsService';
import { authenticateUser, optionalAuth, getFirebaseAdmin } from './lib/firebaseAuth';
import multer from 'multer';
import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import Stripe from 'stripe';

const app = express();
const httpServer = createServer(app);

// Stripe Configuration
const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
const hasValidStripeSecretKey =
    (stripeSecretKey.startsWith('sk_test_') || stripeSecretKey.startsWith('sk_live_')) &&
    !stripeSecretKey.includes('...');

const stripe = hasValidStripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2026-02-25.clover',
    })
    : null;

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// CORS configuration from environment
const getCorsOrigins = () => {
    const fromEnv = process.env.CORS_ORIGIN
        ?.split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    if (fromEnv && fromEnv.length > 0) {
        return fromEnv;
    }

    const vercelUrl = process.env.VERCEL_URL?.trim();
    if (vercelUrl) {
        return [`https://${vercelUrl}`, 'http://localhost:5173'];
    }

    return ['http://localhost:5173'];
};

const corsOrigins = getCorsOrigins();

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: corsOrigins,
    credentials: true
}));
const jsonParser = express.json();
app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhooks/stripe') {
        return next();
    }

    return jsonParser(req, res, next);
});

// Multer Setup
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const DOCUMENT_WORKER_INTERVAL_MS = 4000;
const DOCUMENT_RETENTION_DAYS = parseInt(process.env.DOCUMENT_RETENTION_DAYS || '90', 10);
let documentWorkerTimer: NodeJS.Timeout | null = null;
let isDocumentWorkerRunning = false;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

const getFileChecksum = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex');

/**
 * Get or create user by Firebase UID or email
 * Handles migration from users without firebaseUid
 */
async function getOrCreateUser(firebaseUid: string, email?: string, name?: string) {
    // Try to find by firebaseUid first
    let user = await prisma.user.findUnique({
        where: { firebaseUid }
    });

    // If not found and email provided, try by email
    if (!user && email) {
        user = await prisma.user.findUnique({
            where: { email }
        });

        // If found by email, update with firebaseUid
        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { firebaseUid }
            });
        }
    }

    // If still not found, create new user
    if (!user) {
        user = await prisma.user.create({
            data: {
                firebaseUid,
                email: email || `user-${firebaseUid}@taskforge.local`,
                name: name || 'Usuário',
            }
        });
    }

    return user;
}

async function persistUploadedFile(file: Express.Multer.File, userId: string, documentId: string) {
    const sanitizedName = sanitizeFilename(file.originalname);
    const storagePath = `documents/${userId}/${documentId}-${sanitizedName}`;
    const checksum = getFileChecksum(file.buffer);

    try {
        const admin = getFirebaseAdmin();
        if (admin.apps.length) {
            const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
            const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
            const bucketFile = bucket.file(storagePath);

            await bucketFile.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        checksum,
                        uploadedBy: userId
                    }
                },
                resumable: false,
            });

            return {
                storageUrl: `gs://${bucket.name}/${storagePath}`,
                storagePath,
                checksum,
                mimeType: file.mimetype,
            };
        }
    } catch (error) {
        console.warn('Firebase Storage unavailable, using local fallback:', error);
    }

    const localRelativePath = path.join('uploads', userId, `${documentId}-${sanitizedName}`);
    const localAbsolutePath = path.resolve(process.cwd(), localRelativePath);
    await mkdir(path.dirname(localAbsolutePath), { recursive: true });
    await writeFile(localAbsolutePath, file.buffer);

    return {
        storageUrl: localRelativePath.replace(/\\/g, '/'),
        storagePath: localRelativePath.replace(/\\/g, '/'),
        checksum,
        mimeType: file.mimetype,
    };
}

async function enqueueDocumentAnalysis(documentId: string, userId: string, payload?: unknown) {
    return prisma.documentIngestionJob.create({
        data: {
            documentId,
            userId,
            status: 'queued',
            payloadJson: payload ? JSON.stringify(payload) : null,
            nextRetryAt: new Date(),
        }
    });
}

async function processDocumentIngestionQueue() {
    if (isDocumentWorkerRunning) return;
    isDocumentWorkerRunning = true;

    try {
        const now = new Date();
        const job = await prisma.documentIngestionJob.findFirst({
            where: {
                OR: [
                    { status: 'queued' },
                    {
                        status: 'failed',
                        nextRetryAt: { lte: now }
                    }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        if (!job) return;

        await prisma.documentIngestionJob.update({
            where: { id: job.id },
            data: {
                status: 'processing',
                attempts: { increment: 1 },
                startedAt: new Date(),
            }
        });

        await prisma.document.update({
            where: { id: job.documentId },
            data: { status: 'processing' }
        });

        try {
            await processDocumentPipeline(job.documentId, job.userId);

            await prisma.documentIngestionJob.update({
                where: { id: job.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    lastError: null,
                    nextRetryAt: null,
                }
            });
        } catch (error) {
            const freshJob = await prisma.documentIngestionJob.findUnique({ where: { id: job.id } });
            const attempts = freshJob?.attempts ?? 1;
            const maxAttempts = freshJob?.maxAttempts ?? 3;
            const canRetry = attempts < maxAttempts;
            const backoffMinutes = Math.min(30, attempts * 2);
            const nextRetryAt = canRetry
                ? new Date(Date.now() + backoffMinutes * 60 * 1000)
                : null;

            await prisma.documentIngestionJob.update({
                where: { id: job.id },
                data: {
                    status: 'failed',
                    lastError: error instanceof Error ? error.message : String(error),
                    nextRetryAt,
                }
            });

            await prisma.document.update({
                where: { id: job.documentId },
                data: { status: canRetry ? 'uploaded' : 'error' }
            });
        }
    } finally {
        isDocumentWorkerRunning = false;
    }
}

function startDocumentWorker() {
    if (documentWorkerTimer) return;
    documentWorkerTimer = setInterval(() => {
        processDocumentIngestionQueue().catch((error) => {
            console.error('Document worker iteration failed:', error);
        });
    }, DOCUMENT_WORKER_INTERVAL_MS);
}

async function logDocumentAudit(
    documentId: string,
    userId: string,
    action: string,
    reason?: string,
    metadata?: Record<string, any>,
    ipAddress?: string
) {
    try {
        await prisma.documentAuditLog.create({
            data: {
                documentId,
                userId,
                action,
                reason,
                metadata: metadata ? JSON.stringify(metadata) : null,
                ipAddress,
            }
        });
    } catch (error) {
        console.warn('Failed to log document audit:', error);
    }
}

async function cleanupExpiredDocuments() {
    try {
        const now = new Date();
        const expiredCount = await prisma.document.count({
            where: {
                retentionExpiresAt: { lte: now },
                status: { not: 'deleted' }
            }
        });

        if (expiredCount === 0) return;

        console.log(`Found ${expiredCount} expired documents for cleanup`);

        const expired = await prisma.document.findMany({
            where: {
                retentionExpiresAt: { lte: now },
                status: { not: 'deleted' }
            },
            take: 50
        });

        for (const doc of expired) {
            try {
                // Log deletion audit
                await logDocumentAudit(
                    doc.id,
                    doc.userId,
                    'delete',
                    'Automatic retention expiration',
                    { expiresAt: doc.retentionExpiresAt }
                );

                // Delete from Firebase Storage if applicable
                if (doc.storagePath?.startsWith('documents/')) {
                    try {
                        const admin = getFirebaseAdmin();
                        if (admin.apps.length) {
                            const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
                            const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
                            await bucket.file(doc.storagePath).delete().catch(() => {
                                // File may not exist, ignore error
                            });
                        }
                    } catch (error) {
                        console.warn(`Failed to delete file ${doc.storagePath}:`, error);
                    }
                }

                // Mark as deleted
                await prisma.document.update({
                    where: { id: doc.id },
                    data: { status: 'deleted', storageUrl: null, storagePath: null }
                });

                console.log(`Deleted expired document ${doc.id}`);
            } catch (error) {
                console.error(`Error deleting document ${doc.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

function startCleanupWorker() {
    // Run cleanup every 6 hours
    setInterval(() => {
        cleanupExpiredDocuments().catch(error => {
            console.error('Cleanup worker failed:', error);
        });
    }, 6 * 60 * 60 * 1000);

    // Also run once on startup
    cleanupExpiredDocuments().catch(error => {
        console.error('Initial cleanup failed:', error);
    });
}

// --- Socket.io with Multi-tenant Authorization ---

io.on('connection', async (socket) => {
    console.log('Client socket connected:', socket.id);

    // Authenticate socket via Firebase token
    const token = socket.handshake.auth.token;
    let userId: string | null = null;

    try {
        if (token) {
            const admin = getFirebaseAdmin();
            const decodedToken = await admin.auth().verifyIdToken(token);
            userId = decodedToken.uid;

            // Join user-specific room
            socket.join(userId);
            socket.data.userId = userId;
            console.log(`Socket ${socket.id} authenticated for userId ${userId}, joined room ${userId}`);
        } else {
            console.warn(`Socket ${socket.id} connected without token, disconnecting`);
            socket.disconnect();
            return;
        }
    } catch (error) {
        console.error(`Socket ${socket.id} auth failed:`, error);
        socket.disconnect();
        return;
    }

    socket.on('disconnect', () => {
        console.log(`Client socket disconnected: ${socket.id} (userId: ${userId})`);
    });
});

// --- API Routes ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User Profile Endpoints
app.get('/api/user/profile', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        let user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user && req.user) {
            // Create user if doesn't exist
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: req.user.email || `${userId}@unknown.com`,
                    name: req.user.name || 'User',
                },
            });
        }

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            objective: user.objective,
            strategicMode: user.strategicMode,
            plan: user.plan?.toLowerCase() || 'gratis',
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/user/profile', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const { hasCompletedOnboarding, objective, strategicMode, name } = req.body;

        const updateData: any = {};
        if (hasCompletedOnboarding !== undefined) updateData.hasCompletedOnboarding = hasCompletedOnboarding;
        if (objective !== undefined) updateData.objective = objective;
        if (strategicMode !== undefined) updateData.strategicMode = strategicMode;
        if (name !== undefined) updateData.name = name;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            objective: user.objective,
            strategicMode: user.strategicMode,
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Events Endpoint - Requires Authentication
app.post('/api/events', authenticateUser, async (req, res) => {
    try {
        const { eventType, entityType, entityId, metadata } = req.body;
        const firebaseUserId = req.userId!;

        // 1. Find or create user based on Firebase UID
        let user = await prisma.user.findUnique({ where: { id: firebaseUserId } });
        if (!user && req.user) {
            // Create user from Firebase token
            user = await prisma.user.create({
                data: {
                    id: firebaseUserId,
                    email: req.user.email || `${firebaseUserId}@unknown.com`,
                    name: req.user.name || 'User',
                },
            });
        }

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const event = await prisma.eventLog.create({
            data: {
                eventType,
                entityType,
                entityId,
                metadata: JSON.stringify(metadata || {}),
                userId: user.id,
            }
        });

        // Emit raw event to user's room only
        io.to(user.id).emit('event:new', { ...event, metadata: JSON.parse(event.metadata || '{}') });

        // 2. Process Metrics Logic via Service
        const updates = await processEvent(event.id);

        if (updates) {
            for (const update of updates) {
                // Log explanation
                await prisma.explanationLog.create({
                    data: {
                        relatedEventId: event.id,
                        title: update.type === 'dna_update' ? 'DNA Estratégico' : 'System Health',
                        whatChanged: `Score alterado de ${update.scoreBefore} para ${update.scoreAfter}`,
                        whyChanged: update.reason,
                        impact: 'Impacto na priorização.',
                        recommendation: update.recommendation,
                    }
                });

                // Emit explanation update to user's room only
                io.to(user.id).emit('explanation:new', {
                    relatedEventId: event.id,
                    type: update.type,
                    ...update
                });

                // Also emit updated metrics to refresh UI immediately (to user's room)
                if (update.type === 'dna_update') {
                    const dna = await prisma.strategicDNA.findUnique({ where: { userId: user.id } });
                    io.to(user.id).emit('metrics:dna:update', dna);
                } else if (update.type === 'health_update') {
                    const health = await prisma.systemHealth.findUnique({ where: { userId: user.id } });
                    io.to(user.id).emit('metrics:health:update', health);
                }
            }
        }

        res.json({ success: true, eventId: event.id });
    } catch (error) {
        console.error('Error processing event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Metrics Endpoints - Requires Authentication
app.get('/api/metrics/dna', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        let dna = await prisma.strategicDNA.findUnique({ where: { userId } });

        if (!dna) {
            // Ensure user exists
            let user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: 'user@example.com',
                        name: 'Demo User'
                    }
                });
            }

            dna = await prisma.strategicDNA.create({
                data: { userId }
            });
        }
        res.json(dna);
    } catch (error) {
        console.error('Error fetching DNA metrics:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});

app.get('/api/metrics/health', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        let health = await prisma.systemHealth.findUnique({ where: { userId } });

        if (!health) {
            // Ensure user exists
            let user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: 'user@example.com',
                        name: 'Demo User'
                    }
                });
            }

            health = await prisma.systemHealth.create({
                data: { userId }
            });
        }
        res.json(health);
    } catch (error) {
        console.error('Error fetching health metrics:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});

// Explanations Endpoint - Now authenticated and per-user
app.get('/api/explanations', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const limit = parseInt(req.query.limit as string) || 20;

        // Return empty array - explanations table may be empty for this user
        const explanations: any[] = [];

        res.json(explanations);
    } catch (error) {
        console.error('Error fetching explanations:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});

// Document Routes - Requires Authentication
app.get('/api/documents', authenticateUser, async (req, res) => {
    const userId = req.userId!;
    const docs = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { insights: true, linkedDecisions: true, linkedPlans: true, linkedRisks: true }
    });
    res.json(docs);
});

app.get('/api/documents/score', authenticateUser, async (req, res) => {
    const userId = req.userId!;

    const totalDocs = await prisma.document.count({ where: { userId } });
    if (totalDocs === 0) return res.json({ score: 0 });

    const processedDocs = await prisma.document.count({ where: { userId, status: { in: ['processed', 'insights_ready', 'risk_detected'] } } });
    const linkedDocs = await prisma.document.count({
        where: {
            userId,
            OR: [
                { linkedDecisions: { some: {} } },
                { linkedPlans: { some: {} } },
                { linkedRisks: { some: {} } }
            ]
        }
    });

    // Simple mock calculation
    const score = Math.round(
        ((processedDocs / totalDocs) * 40) +
        ((linkedDocs / totalDocs) * 40) +
        20 // Base score
    );

    res.json({ score: Math.min(100, score) });
});

app.post('/api/documents/upload', authenticateUser, upload.single('file'), async (req, res) => {
    try {
        const userId = req.userId!;
        const file = req.file;
        const ipAddress = req.ip || req.socket.remoteAddress;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user && req.user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: req.user.email || `${userId}@unknown.com`,
                    name: req.user.name || 'User'
                }
            });
        }

        // Calculate retention expiry (default 90 days from now)
        const retentionExpiresAt = new Date();
        retentionExpiresAt.setDate(retentionExpiresAt.getDate() + DOCUMENT_RETENTION_DAYS);

        const doc = await prisma.document.create({
            data: {
                title: file.originalname,
                type: file.mimetype.includes('pdf') ? 'PDF' : file.mimetype.includes('word') ? 'DOCX' : 'DOC',
                size: file.size,
                userId,
                status: 'uploaded',
                retentionExpiresAt,
            }
        });

        const persisted = await persistUploadedFile(file, userId, doc.id);

        const updatedDoc = await prisma.document.update({
            where: { id: doc.id },
            data: {
                storageUrl: persisted.storageUrl,
                storagePath: persisted.storagePath,
                checksum: persisted.checksum,
                mimeType: persisted.mimeType,
            },
            include: { insights: true, linkedDecisions: true, linkedPlans: true, linkedRisks: true }
        });

        // Log upload audit
        await logDocumentAudit(
            updatedDoc.id,
            userId,
            'upload',
            'Document uploaded via API',
            { filename: file.originalname, size: file.size, mimeType: file.mimetype },
            ipAddress
        );

        const job = await enqueueDocumentAnalysis(updatedDoc.id, userId, {
            source: 'upload',
            filename: file.originalname,
            mimeType: file.mimetype,
            checksum: persisted.checksum
        });

        io.to(userId).emit('document:uploaded', { id: updatedDoc.id, title: updatedDoc.title, status: updatedDoc.status });
        processDocumentIngestionQueue().catch(error => console.error('Failed to trigger immediate document processing:', error));

        res.json({ ...updatedDoc, ingestionJobId: job.id });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

async function processDocumentPipeline(docId: string, userId: string) {
    console.log(`Starting processing for doc ${docId}...`);

    await sleep(3000);

    // Get document creation time to calculate processing duration
    const document = await prisma.document.findUnique({ where: { id: docId } });
    const processingTimeMs = document ? Date.now() - document.createdAt.getTime() : 0;

    const insightsData = {
        summary: "Análise estratégica automatizada detectou oportunidades de expansão e riscos regulatórios.",
        decisionsJson: JSON.stringify([
            { title: "Acelerar entrada no mercado", confidence: 88, impact: "high" },
            { title: "Revisar compliance local", confidence: 92, impact: "critical" }
        ]),
        risksJson: JSON.stringify([
            { title: "Risco Regulatório Elevado", severity: "high" },
            { title: "Saturação de Canal", severity: "medium" }
        ]),
        opportunitiesJson: JSON.stringify([
            "Parceria com players locais",
            "Automação de vendas"
        ]),
        suggestedPlanJson: JSON.stringify({
            title: "Plano de Mitigação e Expansão",
            steps: ["Auditoria Legal", "Setup de Canais", "Contratação"]
        }),
        confidenceScore: 89.5,
        processingTimeMs,
        processedAt: new Date()
    };

    await prisma.documentInsights.upsert({
        where: { documentId: docId },
        create: {
            documentId: docId,
            ...insightsData
        },
        update: insightsData
    });

    await prisma.decisionSuggestion.deleteMany({ where: { documentId: docId, status: 'pending' } });
    await prisma.planSuggestion.deleteMany({ where: { documentId: docId, status: 'pending' } });

    const decisions = JSON.parse(insightsData.decisionsJson);
    if (decisions.length > 0 && insightsData.confidenceScore >= 60) {
        for (const decisionItem of decisions) {
            await prisma.decisionSuggestion.create({
                data: {
                    userId,
                    documentId: docId,
                    title: decisionItem.title,
                    description: `Sugestão gerada automaticamente a partir da análise do documento. Confiança: ${decisionItem.confidence}%`,
                    impactScore: decisionItem.impact === 'high' ? 80 : decisionItem.impact === 'medium' ? 50 : 20,
                    confidenceScore: decisionItem.confidence,
                    status: 'pending'
                }
            });
        }

        await prisma.eventLog.create({
            data: {
                eventType: 'suggestion.created',
                entityType: 'decision_suggestion',
                userId,
                metadata: JSON.stringify({ count: decisions.length, sourceDoc: docId })
            }
        });
    }

    const plan = JSON.parse(insightsData.suggestedPlanJson);
    if (plan && insightsData.confidenceScore >= 70) {
        await prisma.planSuggestion.create({
            data: {
                userId,
                documentId: docId,
                title: plan.title,
                objective: "Implementar estratégia definida no documento.",
                phasesJson: JSON.stringify(plan.steps),
                confidenceScore: Math.floor(insightsData.confidenceScore),
                status: 'pending'
            }
        });

        await prisma.eventLog.create({
            data: {
                eventType: 'suggestion.created',
                entityType: 'plan_suggestion',
                userId,
                metadata: JSON.stringify({ title: plan.title, sourceDoc: docId })
            }
        });
    }

    const updatedDoc = await prisma.document.update({
        where: { id: docId },
        data: {
            status: 'processed',
            processedAt: new Date()
        },
        include: { insights: true, decisionSuggestions: true, planSuggestions: true }
    });

    io.to(userId).emit('document:processed', updatedDoc);
    io.to(userId).emit('document:insights_extracted', { id: docId, title: updatedDoc.title });

    const risks = JSON.parse(insightsData.risksJson);
    const hasHighRisk = risks.some((risk: any) => risk.severity === 'high' || risk.severity === 'critical');

    if (hasHighRisk) {
        await prisma.risk.create({
            data: {
                title: `Risco Detectado em: ${updatedDoc.title}`,
                description: "Análise automática identificou riscos de alta severidade.",
                severity: 'high',
                status: 'active',
                userId
            }
        });
        io.to(userId).emit('risk.detected', { title: updatedDoc.title, severity: 'high' });

        await prisma.systemHealth.upsert({
            where: { userId },
            create: { userId },
            update: {
                activeRisksSeverity: { decrement: 10 },
                overallScore: { decrement: 5 }
            }
        });

        const riskEvent = await prisma.eventLog.create({
            data: {
                eventType: 'risk.detected',
                entityType: 'document',
                entityId: docId,
                userId,
                metadata: JSON.stringify({ source: 'document_pipeline' })
            }
        });

        await prisma.explanationLog.create({
            data: {
                title: "Risco Crítico Detectado",
                whatChanged: "Saúde do Sistema penalizada.",
                whyChanged: "Documento analisado contém riscos de alta severidade.",
                impact: "Atenção imediata requerida.",
                recommendation: "Revisar documento e mitigar riscos.",
                relatedEventId: riskEvent.id
            }
        });
    }

    await prisma.strategicDNA.upsert({
        where: { userId },
        create: { userId },
        update: {
            focusLeverage: { increment: 2 },
            strategicConsistency: { increment: 1 },
            overallScore: { increment: 1 }
        }
    });

    const dna = await prisma.strategicDNA.findUnique({ where: { userId } });
    const health = await prisma.systemHealth.findUnique({ where: { userId } });
    io.to(userId).emit('metrics:dna:update', dna);
    io.to(userId).emit('metrics:health:update', health);

    await prisma.eventLog.create({
        data: {
            eventType: 'document.processed',
            entityType: 'document',
            entityId: docId,
            userId,
            metadata: JSON.stringify({ hasRisks: hasHighRisk })
        }
    });
}

app.post('/api/documents/:id/analyze', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    const document = await prisma.document.findFirst({ where: { id, userId } });
    if (!document) {
        return res.status(404).json({ error: 'Document not found' });
    }

    const job = await enqueueDocumentAnalysis(id, userId, { source: 'manual_reanalysis' });
    await prisma.document.update({ where: { id }, data: { status: 'uploaded' } });

    processDocumentIngestionQueue().catch(error => console.error('Failed to trigger manual document processing:', error));

    res.json({ success: true, message: "Analysis queued", ingestionJobId: job.id });
});

// Get specific document by ID with ownership validation
app.get('/api/documents/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId!;

        const document = await prisma.document.findFirst({
            where: { id, userId },
            include: { insights: true, linkedDecisions: true, linkedPlans: true, linkedRisks: true, decisionSuggestions: true, planSuggestions: true }
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Log access
        await logDocumentAudit(id, userId, 'view', 'User accessed document details', { uri: req.originalUrl }, req.ip);

        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete document by ID with ownership validation
app.delete('/api/documents/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId!;
        const reason = req.body?.reason || 'User-initiated deletion';

        const document = await prisma.document.findFirst({
            where: { id, userId }
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Log deletion audit
        await logDocumentAudit(id, userId, 'delete', reason, { deletedAt: new Date() }, req.ip);

        // Delete from Storage if applicable
        if (document.storagePath?.startsWith('documents/')) {
            try {
                const admin = getFirebaseAdmin();
                if (admin.apps.length) {
                    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
                    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
                    await bucket.file(document.storagePath).delete().catch(() => {
                        // File may not exist, ignore error
                    });
                }
            } catch (error) {
                console.warn(`Failed to delete file ${document.storagePath}:`, error);
            }
        }

        // Mark as deleted
        await prisma.document.update({
            where: { id },
            data: { status: 'deleted', storageUrl: null, storagePath: null }
        });

        io.to(userId).emit('document:deleted', { id, title: document.title });

        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Suggestion Endpoints
app.get('/api/documents/:id/suggestions', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;
    const suggestions = await prisma.document.findFirst({
        where: { id, userId },
        include: {
            decisionSuggestions: true,
            planSuggestions: true
        }
    });

    if (!suggestions) {
        return res.status(404).json({ error: 'Document not found' });
    }

    res.json(suggestions);
});

app.get('/api/suggestions/pending', authenticateUser, async (req, res) => {
    const userId = req.userId!;

    // Fetch pending decision suggestions
    const decisionSuggestions = await prisma.decisionSuggestion.findMany({
        where: { userId, status: 'pending' },
        include: { document: { select: { title: true } } }
    });

    // Fetch pending plan suggestions
    const planSuggestions = await prisma.planSuggestion.findMany({
        where: { userId, status: 'pending' },
        include: { document: { select: { title: true } } }
    });

    // Normalize and combine
    const combined = [
        ...decisionSuggestions.map(d => ({
            id: d.id,
            type: 'decision',
            title: d.title,
            origin: d.document.title,
            impactScore: d.impactScore,
            confidenceScore: d.confidenceScore,
            data: d
        })),
        ...planSuggestions.map(p => ({
            id: p.id,
            type: 'plan',
            title: p.title,
            origin: p.document.title,
            impactScore: 50, // Default for plans if not present
            confidenceScore: p.confidenceScore,
            data: p
        }))
    ];

    // Sort by impact score desc
    combined.sort((a, b) => b.impactScore - a.impactScore);

    res.json(combined.slice(0, 3)); // Limit to 3
});

app.post('/api/suggestions/decision/:id/accept', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { title, description, impactScore, riskScore } = req.body; // Accept edited fields
    const userId = req.userId!;

    const suggestion = await prisma.decisionSuggestion.findUnique({ where: { id } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    // Create Real Decision with edited or original data
    const decision = await prisma.decision.create({
        data: {
            userId,
            title: title || suggestion.title,
            description: description || suggestion.description,
            impact: (impactScore || suggestion.impactScore) > 70 ? 'high' : 'medium',
            confidence: suggestion.confidenceScore,
            status: 'active'
        }
    });

    // Update Suggestion Status
    await prisma.decisionSuggestion.update({
        where: { id },
        data: { status: 'accepted' }
    });

    // Update DNA & Health (Mock logic based on impact/risk)
    const impactVal = impactScore || suggestion.impactScore;
    if (impactVal > 50) {
        await prisma.strategicDNA.update({
            where: { userId },
            data: { overallScore: { increment: 2 } }
        });
    }

    // Log Explanation
    await prisma.explanationLog.create({
        data: {
            title: "Decisão Confirmada",
            whatChanged: "Nova decisão estratégica ativada.",
            whyChanged: "Sugestão do sistema aceita pelo usuário.",
            impact: "Impacto no DNA Estratégico.",
            recommendation: "Monitorar execução.",
            event: {
                connect: {
                    id: (await prisma.eventLog.create({
                        data: {
                            eventType: 'decision.created',
                            entityType: 'decision',
                            userId,
                            metadata: JSON.stringify({ origin: 'document_suggestion', documentId: suggestion.documentId })
                        }
                    })).id
                }
            }
        }
    });

    io.to(userId).emit('decision:created', decision);
    res.json(decision);
});

app.get('/api/suggestions/plan/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;
    const suggestion = await prisma.planSuggestion.findFirst({ where: { id, userId } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
    res.json(suggestion);
});

app.post('/api/suggestions/decision/:id/dismiss', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { usefulnessScore, comment } = req.body;
    const userId = req.userId!;

    const suggestion = await prisma.decisionSuggestion.findFirst({ where: { id, userId } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    await prisma.decisionSuggestion.update({
        where: { id },
        data: { status: 'dismissed' }
    });

    await prisma.suggestionFeedback.create({
        data: {
            userId,
            suggestionId: id,
            suggestionType: 'decision',
            action: 'dismissed',
            usefulnessScore,
            comment
        }
    });

    res.json({ success: true });
});

app.post('/api/suggestions/plan/:id/accept', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { usefulnessScore, comment } = req.body;
    const userId = req.userId!;

    const suggestion = await prisma.planSuggestion.findFirst({ where: { id, userId } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    const plan = await prisma.plan.create({
        data: {
            userId,
            title: suggestion.title,
            description: suggestion.objective,
            status: 'planning',
            priority: 'high'
        }
    });

    await prisma.planSuggestion.update({
        where: { id },
        data: { status: 'accepted' }
    });

    await prisma.suggestionFeedback.create({
        data: {
            userId,
            suggestionId: id,
            suggestionType: 'plan',
            action: 'accepted',
            usefulnessScore,
            comment
        }
    });

    io.to(userId).emit('plan:created', plan);
    res.json(plan);
});

app.post('/api/suggestions/plan/:id/dismiss', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { usefulnessScore, comment } = req.body;
    const userId = req.userId!;

    const suggestion = await prisma.planSuggestion.findFirst({ where: { id, userId } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    await prisma.planSuggestion.update({
        where: { id },
        data: { status: 'dismissed' }
    });

    await prisma.suggestionFeedback.create({
        data: {
            userId,
            suggestionId: id,
            suggestionType: 'plan',
            action: 'dismissed',
            usefulnessScore,
            comment
        }
    });

    res.json({ success: true });
});

app.get('/api/documents/quality-metrics', authenticateUser, async (req, res) => {
    const userId = req.userId!;

    try {
        // Total documents processed
        const totalDocs = await prisma.document.count({
            where: { userId, status: 'processed' }
        });

        // Decision suggestions stats
        const decisionStats = await prisma.decisionSuggestion.groupBy({
            by: ['status'],
            where: { userId },
            _count: true
        });

        // Plan suggestions stats
        const planStats = await prisma.planSuggestion.groupBy({
            by: ['status'],
            where: { userId },
            _count: true
        });

        // Feedback data
        const feedback = await prisma.suggestionFeedback.findMany({
            where: { userId }
        });

        // Processing time metrics
        const insights = await prisma.documentInsights.findMany({
            where: { document: { userId } }
        });

        // Calculate derived metrics
        const decisionAccepted = decisionStats.find(s => s.status === 'accepted')?._count || 0;
        const decisionDismissed = decisionStats.find(s => s.status === 'dismissed')?._count || 0;
        const decisionTotal = decisionAccepted + decisionDismissed;
        const decisionAcceptanceRate = decisionTotal > 0 ? (decisionAccepted / decisionTotal) * 100 : 0;

        const planAccepted = planStats.find(s => s.status === 'accepted')?._count || 0;
        const planDismissed = planStats.find(s => s.status === 'dismissed')?._count || 0;
        const planTotal = planAccepted + planDismissed;
        const planAcceptanceRate = planTotal > 0 ? (planAccepted / planTotal) * 100 : 0;

        const totalAccepted = decisionAccepted + planAccepted;
        const totalDismissed = decisionDismissed + planDismissed;
        const totalSuggestions = totalAccepted + totalDismissed;
        const overallAcceptanceRate = totalSuggestions > 0 ? (totalAccepted / totalSuggestions) * 100 : 0;

        const avgProcessingTime = insights.length > 0
            ? insights.reduce((sum, i) => sum + (i.processingTimeMs || 0), 0) / insights.length
            : 0;

        const avgConfidenceScore = insights.length > 0
            ? insights.reduce((sum, i) => sum + (i.confidenceScore || 0), 0) / insights.length
            : 0;

        const feedbackWithUsefulnessScore = feedback.filter(f => f.usefulnessScore !== null);
        const avgUsefulnessScore = feedbackWithUsefulnessScore.length > 0
            ? feedbackWithUsefulnessScore.reduce((sum, f) => sum + (f.usefulnessScore || 0), 0) / feedbackWithUsefulnessScore.length
            : 0;

        // Confidence score distribution
        const confidenceDistribution = {
            excellent: insights.filter(i => i.confidenceScore >= 80).length,
            good: insights.filter(i => i.confidenceScore >= 60 && i.confidenceScore < 80).length,
            fair: insights.filter(i => i.confidenceScore >= 40 && i.confidenceScore < 60).length,
            poor: insights.filter(i => i.confidenceScore < 40).length
        };

        res.json({
            summary: {
                totalDocumentsProcessed: totalDocs,
                totalSuggestionsGenerated: totalSuggestions,
                totalSuggestionsActioned: totalAccepted,
                totalSuggestionsDismissed: totalDismissed
            },
            suggestions: {
                decision: {
                    total: decisionTotal,
                    accepted: decisionAccepted,
                    dismissed: decisionDismissed,
                    acceptanceRate: Number(decisionAcceptanceRate.toFixed(2))
                },
                plan: {
                    total: planTotal,
                    accepted: planAccepted,
                    dismissed: planDismissed,
                    acceptanceRate: Number(planAcceptanceRate.toFixed(2))
                }
            },
            performance: {
                overallAcceptanceRate: Number(overallAcceptanceRate.toFixed(2)),
                avgProcessingTimeMs: Math.round(avgProcessingTime),
                avgConfidenceScore: Number(avgConfidenceScore.toFixed(2)),
                avgUsefulnessScore: Number(avgUsefulnessScore.toFixed(2))
            },
            quality: {
                confidenceDistribution,
                feedbackCount: feedback.length,
                feedbackWithRatingsCount: feedbackWithUsefulnessScore.length
            }
        });
    } catch (error) {
        console.error('Error calculating quality metrics:', error);
        res.status(500).json({ error: 'Failed to calculate metrics' });
    }
});

app.get('/api/compliance/document-retention', authenticateUser, async (req, res) => {
    const userId = req.userId!;

    try {
        const now = new Date();

        // Overall stats
        const totalDocuments = await prisma.document.count({ where: { userId } });
        const activeDocuments = await prisma.document.count({
            where: { userId, status: { not: 'deleted' } }
        });
        const deletedDocuments = await prisma.document.count({
            where: { userId, status: 'deleted' }
        });

        // Retention timeline
        const expiringIn7Days = await prisma.document.count({
            where: {
                userId,
                status: { not: 'deleted' },
                retentionExpiresAt: {
                    lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                    gt: now
                }
            }
        });

        const alreadyExpired = await prisma.document.count({
            where: {
                userId,
                status: { not: 'deleted' },
                retentionExpiresAt: { lte: now }
            }
        });

        // Confidentiality stats
        const confidentialCount = await prisma.document.count({
            where: { userId, isConfidential: true }
        });

        // Audit trail summary
        const auditLogs = await prisma.documentAuditLog.groupBy({
            by: ['action'],
            where: { userId },
            _count: true
        });

        // Recent deletion records (for GDPR compliance)
        const deletionRecords = await prisma.documentAuditLog.findMany({
            where: {
                userId,
                action: 'delete'
            },
            include: {
                document: {
                    select: { title: true, createdAt: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Audit action breakdown
        const auditBreakdown = auditLogs.reduce((acc: Record<string, number>, log) => {
            acc[log.action] = log._count;
            return acc;
        }, {});

        res.json({
            overview: {
                totalDocuments,
                activeDocuments,
                deletedDocuments,
                confidentialCount
            },
            retention: {
                expiringIn7Days,
                alreadyExpired,
                defaultRetentionDays: DOCUMENT_RETENTION_DAYS
            },
            compliance: {
                auditLogsCount: await prisma.documentAuditLog.count({ where: { userId } }),
                auditActionBreakdown: auditBreakdown,
                deletionRecords: deletionRecords.map(record => ({
                    documentTitle: record.document?.title,
                    deletedAt: record.createdAt,
                    reason: record.reason
                }))
            },
            generatedAt: new Date().toISOString(),
            reportType: 'GDPR_COMPLIANCE'
        });
    } catch (error) {
        console.error('Error generating compliance report:', error);
        res.status(500).json({ error: 'Failed to generate compliance report' });
    }
});

app.get('/api/documents/:id/audit-history', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    try {
        // Verify document belongs to user
        const doc = await prisma.document.findFirst({
            where: { id, userId }
        });

        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const auditLogs = await prisma.documentAuditLog.findMany({
            where: { documentId: id },
            include: {
                user: {
                    select: { email: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            documentId: id,
            documentTitle: doc.title,
            auditLogs: auditLogs.map(log => ({
                action: log.action,
                performedBy: log.user.email,
                performedByName: log.user.name,
                timestamp: log.createdAt,
                reason: log.reason,
                ipAddress: log.ipAddress,
                details: log.metadata ? JSON.parse(log.metadata) : null
            }))
        });
    } catch (error) {
        console.error('Error fetching audit history:', error);
        res.status(500).json({ error: 'Failed to fetch audit history' });
    }
});

app.post('/api/plans', authenticateUser, async (req, res) => {
    const { title, description, phases, tasks, suggestionId } = req.body;
    const userId = req.userId!;

    // Create Real Plan
    const plan = await prisma.plan.create({
        data: {
            userId,
            title,
            description,
            status: 'planning',
            priority: 'high'
        }
    });

    // If created from suggestion, update suggestion status
    if (suggestionId) {
        await prisma.planSuggestion.update({
            where: { id: suggestionId },
            data: { status: 'accepted' }
        });

        // Log Explanation
        await prisma.explanationLog.create({
            data: {
                title: "Plano de Execução Criado",
                whatChanged: "Novo plano estratégico iniciado.",
                whyChanged: "Sugestão de documento transformada em plano.",
                impact: "Aumento na capacidade de execução.",
                recommendation: "Acompanhar progresso das fases.",
                event: {
                    connect: {
                        id: (await prisma.eventLog.create({
                            data: {
                                eventType: 'plan.created',
                                entityType: 'plan',
                                userId,
                                metadata: JSON.stringify({ origin: 'document_suggestion', suggestionId })
                            }
                        })).id
                    }
                }
            }
        });
    }

    io.to(userId).emit('plan:created', plan);
    res.json(plan);
});

// User Endpoint
let userProfileCache: any = {
    company: "TechCorp",
    role: "CTO",
    objective: "Atingir 10M em ARR até o final do ano com margem de 20%.",
    deepMode: true,
    alertSensitivity: "normal",
    notifications: {
        emailCritical: true,
        weeklyReport: true,
        sessionReminder: false,
        pendingSuggestions: true
    }
};

// Endpoint duplicado removido - usar o endpoint na linha ~421

app.put('/api/user/profile', authenticateUser, async (req, res) => {
    const userId = req.userId!;
    const { name, strategicMode, company, role, objective, deepMode, alertSensitivity, notifications } = req.body;

    // Update Prisma fields
    await prisma.user.update({
        where: { id: userId },
        data: { name, strategicMode }
    });

    // Update Cache fields
    userProfileCache = {
        ...userProfileCache,
        company,
        role,
        objective,
        deepMode,
        alertSensitivity,
        notifications
    };

    res.json({ success: true });
});

app.get('/api/user/credits', (req, res) => {
    res.json({
        balance: 450,
        history: [
            { id: 1, date: '2024-02-28', agent: 'DecisionForge', amount: -15, desc: 'Análise de Contrato' },
            { id: 2, date: '2024-02-27', agent: 'ClarityForge', amount: -10, desc: 'Organização de Backlog' },
            { id: 3, date: '2024-02-25', agent: 'System', amount: 500, desc: 'Recarga Mensal' },
        ],
        usageByAgent: [
            { name: 'DecisionForge', value: 40, color: '#10b981' },
            { name: 'ClarityForge', value: 25, color: '#3b82f6' },
            { name: 'LeverageForge', value: 35, color: '#f97316' },
        ]
    });
});

app.get('/api/user/mode', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        let user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user && req.user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: req.user.email || `${userId}@unknown.com`,
                    name: req.user.name || 'User',
                    strategicMode: 'equilibrado'
                }
            });
        }
        res.json({ mode: user?.strategicMode || 'equilibrado' });
    } catch (error) {
        console.error('Error fetching user mode:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});

// --- Stripe Checkout & Billing ---

// Create Checkout Session
app.post('/api/checkout/create-session', authenticateUser, async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({
                error: 'Stripe not configured',
                message: 'Stripe não configurado. Defina STRIPE_SECRET_KEY válida no .env e reinicie o servidor.'
            });
        }

        const { priceId, mode, successUrl, cancelUrl } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get or create user
        const user = await getOrCreateUser(userId, req.user?.email, req.user?.name);

        // Create Stripe customer if not exists
        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id.toString(),
                    firebaseUid: userId,
                }
            });
            stripeCustomerId = customer.id;

            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId }
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode || 'subscription', // 'subscription' or 'payment'
            success_url: successUrl || `${corsOrigins[0]}/app/billing?success=true`,
            cancel_url: cancelUrl || `${corsOrigins[0]}/app/billing?canceled=true`,
            metadata: {
                userId: user.id.toString(),
                firebaseUid: userId,
            },
            allow_promotion_codes: true,
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);

        if (error instanceof Stripe.errors.StripeAuthenticationError) {
            return res.status(503).json({
                error: 'Stripe authentication failed',
                message: 'Falha de autenticação no Stripe. Verifique STRIPE_SECRET_KEY no .env.'
            });
        }

        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});

// Stripe Webhook Handler
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) {
        return res.status(503).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'];

    if (!sig || !STRIPE_WEBHOOK_SECRET) {
        console.error('Missing stripe signature or webhook secret');
        return res.status(400).send('Webhook signature missing');
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : String(err)}`);
    }

    console.log('Stripe webhook event:', event.type);

    // Helper function to resolve plan from price ID
    const resolvePlan = (priceId: string | undefined): 'gratis' | 'essencial' | 'profissional' | 'estrategico' => {
        if (!priceId) return 'gratis';

        const planMap: Record<string, 'essencial' | 'profissional' | 'estrategico'> = {
            'price_1T6O7HBNgnXewP8Me1hVETGA': 'essencial',
            'price_1T6O6QBNgnXewP8Mude8pCy8': 'profissional',
            'price_1T6O6XBNgnXewP8M5BxqsMGU': 'estrategico',
            'price_1TAnnualBuilder': 'profissional',
            'price_1TAnnualStrategic': 'estrategico',
        };

        return planMap[priceId] || 'gratis';
    };

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const firebaseUid = session.metadata?.firebaseUid;
                if (!firebaseUid) {
                    console.error('Missing firebaseUid in session metadata');
                    break;
                }

                // Get line items to determine credits and plan
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                const priceId = lineItems.data[0]?.price?.id;

                // Map price IDs to credits
                const creditMap: Record<string, number> = {
                    'price_1T6O7HBNgnXewP8Me1hVETGA': 500,    // Essencial
                    'price_1T6O6QBNgnXewP8Mude8pCy8': 2000,   // Profissional
                    'price_1T6O6XBNgnXewP8M5BxqsMGU': 5000,   // Estratégico
                    'price_1T6O6bBNgnXewP8MulEJ7pza': 500,    // Pack 500
                    'price_1T6O5OBNgnXewP8MlJvNPkU6': 1000,   // Pack 1000
                    'price_1T6O5RBNgnXewP8MSKndCTN0': 5000,   // Pack 5000
                    'price_1TAnnualBuilder': 2000,             // Builder Annual
                    'price_1TAnnualStrategic': 5000,           // Strategic Annual
                };

                const credits = priceId ? (creditMap[priceId] || 0) : 0;
                const plan = resolvePlan(priceId);

                // Update user credits and plan
                await prisma.user.update({
                    where: { firebaseUid },
                    data: {
                        credits: {
                            increment: credits
                        },
                        ...(plan !== 'gratis' && { plan })
                    }
                });
                console.log(`Checkout completed: Added ${credits} credits and set plan to ${plan} for user ${firebaseUid}`);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                // Find user by stripe customer ID
                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId }
                });

                if (!user) {
                    console.error('User not found for customer:', customerId);
                    break;
                }

                // Get subscription details
                const subscriptionId = (invoice as any).subscription as string | undefined;
                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = subscription.items.data[0]?.price.id;

                    const creditMap: Record<string, number> = {
                        'price_1T6O7HBNgnXewP8Me1hVETGA': 500,
                        'price_1T6O6QBNgnXewP8Mude8pCy8': 2000,
                        'price_1T6O6XBNgnXewP8M5BxqsMGU': 5000,
                        'price_1TAnnualBuilder': 2000,
                        'price_1TAnnualStrategic': 5000,
                    };

                    const credits = priceId ? (creditMap[priceId] || 0) : 0;
                    const plan = resolvePlan(priceId);

                    if (credits > 0) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                credits: {
                                    increment: credits
                                },
                                ...(plan !== 'gratis' && { plan })
                            }
                        });
                        console.log(`Renewed subscription: Added ${credits} credits and set plan to ${plan} for user ${user.id}`);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId }
                });

                if (user) {
                    // Reset plan to gratis when subscription is canceled
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { plan: 'gratis' }
                    });
                    console.log(`Subscription canceled: Reset plan to gratis for user ${user.id}`);
                }
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Only process active subscriptions
                const activeStatuses: Stripe.Subscription.Status[] = ['active', 'trialing'];
                if (!activeStatuses.includes(subscription.status)) {
                    console.log(`Subscription ${subscription.id} is ${subscription.status}, skipping plan update`);
                    break;
                }

                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId }
                });

                if (user) {
                    const priceId = subscription.items.data[0]?.price?.id;
                    const plan = resolvePlan(priceId);

                    if (plan !== 'gratis') {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { plan }
                        });
                        console.log(`Subscription ${event.type}: Updated plan to ${plan} for user ${user.id}`);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Get User Subscription Status
app.get('/api/billing/subscription', authenticateUser, async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({
                error: 'Stripe not configured',
                message: 'Stripe não configurado. Defina STRIPE_SECRET_KEY válida no .env e reinicie o servidor.'
            });
        }

        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await getOrCreateUser(userId, req.user?.email, req.user?.name);

        if (!user || !user.stripeCustomerId) {
            return res.json({
                credits: user?.credits || 0,
                subscription: null
            });
        }

        let subscriptions: Stripe.ApiList<Stripe.Subscription>;
        try {
            subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'all',
                limit: 20,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const isStripeAuthError =
                error instanceof Stripe.errors.StripeAuthenticationError ||
                message.toLowerCase().includes('invalid api key');

            if (isStripeAuthError) {
                console.error('Stripe authentication failed while fetching subscription:', message);
                return res.json({
                    credits: user.credits || 0,
                    subscription: null,
                    billingUnavailable: true,
                });
            }

            throw error;
        }

        const allowedStatuses: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due', 'incomplete', 'unpaid'];
        const statusPriority: Record<Stripe.Subscription.Status, number> = {
            incomplete: 2,
            incomplete_expired: 0,
            trialing: 4,
            active: 5,
            past_due: 3,
            canceled: 0,
            unpaid: 1,
            paused: 0,
        };

        const planPriorityByPriceId: Record<string, number> = {
            'price_1T6O7HBNgnXewP8Me1hVETGA': 1,
            'price_1T6O6QBNgnXewP8Mude8pCy8': 2,
            'price_1T6O6XBNgnXewP8M5BxqsMGU': 3,
        };

        const planPriorityByProductId: Record<string, number> = {
            'prod_U4X21x0lWIvsHW': 1,
            'prod_U4X5DxJ5ZGRfab': 2,
            'prod_U4X2cEVz8fot8E': 3,
        };

        const resolvePlanFromPrice = (price?: Stripe.Price | null): 'essencial' | 'profissional' | 'estrategico' | null => {
            if (!price) return null;

            const priceId = price.id || '';
            const productId = typeof price.product === 'string' ? price.product : price.product?.id || '';
            const priorityByPrice = planPriorityByPriceId[priceId] || 0;
            const priorityByProduct = planPriorityByProductId[productId] || 0;
            const amount = price.unit_amount || 0;

            const priority = Math.max(
                priorityByPrice,
                priorityByProduct,
                amount >= 49990 ? 3 : amount >= 19990 ? 2 : amount > 0 ? 1 : 0
            );

            if (priority >= 3) return 'estrategico';
            if (priority === 2) return 'profissional';
            if (priority === 1) return 'essencial';
            return null;
        };

        const subscription = subscriptions.data
            .filter(sub => allowedStatuses.includes(sub.status))
            .slice()
            .sort((a, b) => {
                const aStatus = statusPriority[a.status] || 0;
                const bStatus = statusPriority[b.status] || 0;
                if (aStatus !== bStatus) {
                    return bStatus - aStatus;
                }

                const aPrice = a.items.data[0]?.price;
                const bPrice = b.items.data[0]?.price;
                const aPlan = resolvePlanFromPrice(aPrice);
                const bPlan = resolvePlanFromPrice(bPrice);

                const aPlanPriority = aPlan === 'estrategico' ? 3 : aPlan === 'profissional' ? 2 : aPlan === 'essencial' ? 1 : 0;
                const bPlanPriority = bPlan === 'estrategico' ? 3 : bPlan === 'profissional' ? 2 : bPlan === 'essencial' ? 1 : 0;

                if (aPlanPriority !== bPlanPriority) {
                    return bPlanPriority - aPlanPriority;
                }

                return (b.created || 0) - (a.created || 0);
            })[0];

        const selectedPrice = subscription?.items.data[0]?.price;
        const selectedPlan = resolvePlanFromPrice(selectedPrice);

        res.json({
            credits: user.credits || 0,
            subscription: subscription ? {
                id: subscription.id,
                status: subscription.status,
                currentPeriodEnd: (subscription as any).current_period_end,
                priceId: subscription.items.data[0]?.price.id,
                productId: typeof selectedPrice?.product === 'string' ? selectedPrice.product : selectedPrice?.product?.id,
                plan: selectedPlan,
            } : null
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});


// --- Debug endpoint to diagnose plan sync issues ---
app.get('/api/billing/debug', authenticateUser, async (req, res) => {
    try {
        const firebaseUid = req.userId!;
        const user = await prisma.user.findUnique({
            where: { firebaseUid },
            select: {
                id: true,
                firebaseUid: true,
                email: true,
                plan: true,
                stripeCustomerId: true,
            }
        });

        if (!user) {
            return res.json({
                error: 'User not found in database',
                firebaseUid
            });
        }

        // Try to fetch from Stripe
        let stripeInfo = null;
        if (user.stripeCustomerId && stripe) {
            try {
                const subscriptions = await stripe.subscriptions.list({
                    customer: user.stripeCustomerId,
                    status: 'all',
                    limit: 3,
                });

                const activeStatuses: Stripe.Subscription.Status[] = ['active', 'trialing'];
                const active = subscriptions.data.find(s => activeStatuses.includes(s.status));

                if (active) {
                    stripeInfo = {
                        subscriptionId: active.id,
                        status: active.status,
                        priceId: active.items.data[0]?.price?.id,
                    };
                }
            } catch (error) {
                stripeInfo = { error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }

        res.json({
            firebaseUid,
            database: {
                email: user.email,
                plan: user.plan || 'gratis',
                stripeCustomerId: user.stripeCustomerId,
            },
            stripe: stripeInfo,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            error: 'Debug failed',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});


// --- Sync Plan with Stripe ---
app.post('/api/billing/sync-plan', authenticateUser, async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({
                error: 'Stripe not configured',
                message: 'Stripe não configurado.'
            });
        }

        const userId = req.userId!;
        const user = await prisma.user.findUnique({
            where: { firebaseUid: userId },
            select: {
                id: true,
                email: true,
                plan: true,
                stripeCustomerId: true,
            }
        });

        if (!user) {
            return res.status(404).json({
                error: 'USER_NOT_FOUND',
                message: 'Usuário não encontrado.'
            });
        }

        if (!user.stripeCustomerId) {
            return res.json({
                status: 'no-customer',
                message: 'Usuário não tem Customer ID no Stripe',
                currentPlan: user.plan || 'gratis'
            });
        }

        // Fetch subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'all',
            limit: 10,
        });

        // Helper to resolve plan from price
        const resolvePlan = (priceId: string | undefined): 'gratis' | 'essencial' | 'profissional' | 'estrategico' => {
            if (!priceId) return 'gratis';

            const planMap: Record<string, 'essencial' | 'profissional' | 'estrategico'> = {
                'price_1T6O7HBNgnXewP8Me1hVETGA': 'essencial',
                'price_1T6O6QBNgnXewP8Mude8pCy8': 'profissional',
                'price_1T6O6XBNgnXewP8M5BxqsMGU': 'estrategico',
                'price_1TAnnualBuilder': 'profissional',
                'price_1TAnnualStrategic': 'estrategico',
            };

            return planMap[priceId] || 'gratis';
        };

        // Find active subscription
        const activeStatuses: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due'];
        const activeSubscriptions = subscriptions.data.filter(sub =>
            activeStatuses.includes(sub.status)
        );

        if (activeSubscriptions.length === 0) {
            return res.json({
                status: 'no-active-subscription',
                message: 'Nenhuma subscription ativa encontrada',
                currentPlan: user.plan || 'gratis'
            });
        }

        // Get highest priority active subscription
        const subscription = activeSubscriptions.sort((a, b) => {
            const aPriority = (a.items.data[0]?.price?.id === 'price_1T6O6XBNgnXewP8M5BxqsMGU') ? 3 :
                (a.items.data[0]?.price?.id === 'price_1T6O6QBNgnXewP8Mude8pCy8') ? 2 : 1;
            const bPriority = (b.items.data[0]?.price?.id === 'price_1T6O6XBNgnXewP8M5BxqsMGU') ? 3 :
                (b.items.data[0]?.price?.id === 'price_1T6O6QBNgnXewP8Mude8pCy8') ? 2 : 1;
            return bPriority - aPriority;
        })[0];

        const stripePlan = resolvePlan(subscription.items.data[0]?.price?.id);
        const currentPlan = (user.plan || 'gratis').toLowerCase();

        // Update if different
        if (currentPlan !== stripePlan) {
            await prisma.user.update({
                where: { id: user.id },
                data: { plan: stripePlan }
            });

            return res.json({
                status: 'updated',
                message: `Plano atualizado com sucesso: ${currentPlan} → ${stripePlan}`,
                previousPlan: currentPlan,
                newPlan: stripePlan,
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status
            });
        }

        res.json({
            status: 'synchronized',
            message: 'Plano já estava sincronizado',
            currentPlan: stripePlan,
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status
        });

    } catch (error) {
        console.error('Error syncing plan:', error);
        if (error instanceof Stripe.errors.StripeError) {
            return res.status(400).json({
                error: 'STRIPE_ERROR',
                message: error.message
            });
        }
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});


// --- Strategic Simulation Engine ---

app.post('/api/simulate', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const { hypotheticalMode, actions } = req.body;

        // 1. Validate plan
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                error: 'USER_NOT_FOUND',
                message: 'Usuário não encontrado.'
            });
        }

        // Verificação case-insensitive (plano em português)
        const userPlanLower = user.plan?.toLowerCase().trim();
        if (userPlanLower !== 'estrategico') {
            return res.status(403).json({
                error: 'PLAN_REQUIRED',
                requiredPlan: 'estrategico',
                userPlan: user.plan || 'gratis',
                message: 'Simulação Estratégica está disponível apenas no plano Estratégico.'
            });
        }

        if (!hypotheticalMode || !actions || !Array.isArray(actions)) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'hypotheticalMode e actions array são obrigatórios.'
            });
        }

        // Import simulation engine
        const { simulateScenario } = await import('./services/simulationEngine');

        // Run simulation
        const result = await simulateScenario({
            userId,
            hypotheticalMode,
            actions
        });

        res.json(result);
    } catch (error) {
        console.error('Simulation error:', error);
        res.status(500).json({
            error: 'Simulation failed',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});

// --- Vite Middleware (Dev Mode) ---

async function startServer() {
    const basePort = Number(process.env.PORT || 5000);
    const port = basePort;

    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: {
                middlewareMode: true,
                hmr: {
                    server: httpServer,
                },
            },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        // Serve static files in production
        // app.use(express.static('dist'));
    }

    httpServer.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        startDocumentWorker();
        startCleanupWorker();
    });

    httpServer.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Stop the existing process or change PORT in .env.`);
            process.exit(1);
        }

        console.error('Server startup error:', error);
        process.exit(1);
    });

    // Global Error Handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('Unhandled Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: err instanceof Error ? err.message : String(err)
        });
    });
}

// --- Agent Endpoints (Phases 6-7 of AI Agent Implementation) ---

/**
 * POST /api/agents/retrieve
 * Retrieve relevant documents for agent consultation based on query
 * Used by DecisionForge, ClarityForge, and LeverageForge
 * Input: query (search), mode (strategic), documentIds (optional filter), topK (default 5)
 * Output: chunks with metadata and citation info, userId-isolated
 */
app.post('/api/agents/retrieve', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const { query, mode = 'equilibrado', documentIds = [], topK = 5 } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Validate topK
        const limit = Math.min(Math.max(topK, 1), 20); // Clamp between 1-20

        // Build query filters
        const docFilters: any = { userId };
        if (documentIds.length > 0) {
            docFilters.id = { in: documentIds };
        }
        docFilters.status = { in: ['processed', 'insights_ready', 'risk_detected'] };

        // For now, return full documents sorted by relevance (mock)
        // Future: implement embedding-based semantic search
        const documents = await prisma.document.findMany({
            where: docFilters,
            orderBy: { processedAt: 'desc' },
            take: limit,
            include: { insights: true }
        });

        if (documents.length === 0) {
            return res.json({
                query,
                mode,
                topK: limit,
                results: [],
                message: 'No documents found for this query'
            });
        }

        // Log retrieval audit
        await logDocumentAudit(
            'N/A',
            userId,
            'retrieve',
            'Agent performed document retrieval',
            { query, mode, documentCount: documents.length, topK: limit },
            req.ip
        );

        // Format response with citation info
        const results = documents.map(doc => ({
            documentId: doc.id,
            title: doc.title,
            type: doc.type,
            excerpt: doc.insights?.summary ? doc.insights.summary.substring(0, 200) : 'No summary available',
            confidence: doc.insights?.confidenceScore || 0,
            insights: {
                decisions: doc.insights?.decisionsJson ? JSON.parse(doc.insights.decisionsJson) : [],
                risks: doc.insights?.risksJson ? JSON.parse(doc.insights.risksJson) : [],
                opportunities: doc.insights?.opportunitiesJson ? JSON.parse(doc.insights.opportunitiesJson) : [],
            },
            processedAt: doc.processedAt,
            retentionExpiresAt: doc.retentionExpiresAt
        }));

        res.json({
            query,
            mode,
            topK: limit,
            results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in agent retrieval:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /api/agents/decision
 * DecisionForge agent endpoint - analyze decision with document context
 * Validates risk, 2nd order impact, premises, strategic consistency
 */
app.post('/api/agents/decision', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const { decision, context = {}, documentIds = [] } = req.body;

        if (!decision || decision.trim().length === 0) {
            return res.status(400).json({ error: 'Statement description is required' });
        }

        // 1. Get user to check credits/plan
        const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // 2. Create AgentJob
        const job = await prisma.agentJob.create({
            data: {
                userId: user.id,
                agentType: 'DECISION',
                status: 'PENDING',
                inputPayload: { decision, context, documentIds }
            }
        });

        // 3. Log audit
        await logDocumentAudit('N/A', user.id, 'agent_query', 'DecisionForge analysis initiated (Async)', { jobId: job.id, documentCount: documentIds.length }, req.ip);

        // 4. Trigger n8n (asynchronous)
        triggerN8nAgent(job.id, 'DECISION', decision, user.id, documentIds);

        // 5. Respond with jobId
        res.json({
            jobId: job.id,
            status: 'PENDING',
            message: 'Análise iniciada. Você receberá uma notificação quando estiver pronta.'
        });
    } catch (error) {
        console.error('Error in DecisionForge:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /api/agents/clarity
 * ClarityForge agent endpoint - structure thinking with document context
 */
app.post('/api/agents/clarity', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const { input, context = {}, documentIds = [] } = req.body;

        if (!input || input.trim().length === 0) {
            return res.status(400).json({ error: 'Input is required' });
        }

        const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const job = await prisma.agentJob.create({
            data: {
                userId: user.id,
                agentType: 'CLARITY',
                status: 'PENDING',
                inputPayload: { input, context, documentIds }
            }
        });

        await logDocumentAudit('N/A', user.id, 'agent_query', 'ClarityForge analysis initiated (Async)', { jobId: job.id, documentCount: documentIds.length }, req.ip);

        triggerN8nAgent(job.id, 'CLARITY', input, user.id, documentIds);

        res.json({
            jobId: job.id,
            status: 'PENDING',
            message: 'Estruturação de pensamento iniciada.'
        });
    } catch (error) {
        console.error('Error in ClarityForge:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /api/agents/leverage
 * LeverageForge agent endpoint - identify high-impact actions with document context
 */
app.post('/api/agents/leverage', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const { objective, context = {}, documentIds = [] } = req.body;

        if (!objective || objective.trim().length === 0) {
            return res.status(400).json({ error: 'Objective is required' });
        }

        const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const job = await prisma.agentJob.create({
            data: {
                userId: user.id,
                agentType: 'LEVERAGE',
                status: 'PENDING',
                inputPayload: { objective, context, documentIds }
            }
        });

        await logDocumentAudit('N/A', user.id, 'agent_query', 'LeverageForge analysis initiated (Async)', { jobId: job.id, documentCount: documentIds.length }, req.ip);

        triggerN8nAgent(job.id, 'LEVERAGE', objective, user.id, documentIds);

        res.json({
            jobId: job.id,
            status: 'PENDING',
            message: 'Plano de execução estratégica iniciado.'
        });
    } catch (error) {
        console.error('Error in LeverageForge:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET /api/agents/history
 * List agent job history for the authenticated user
 */
app.get('/api/agents/history', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const jobs = await prisma.agentJob.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching agent history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * GET /api/agents/jobs/:jobId
 * Get details of a specific agent job
 */
app.get('/api/agents/jobs/:jobId', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId!;
        const { jobId } = req.params;

        const user = await prisma.user.findUnique({ where: { firebaseUid: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const job = await prisma.agentJob.findUnique({
            where: { id: jobId }
        });

        if (!job || job.userId !== user.id) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('Error fetching agent job:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- n8n Integration Helpers ---

async function triggerN8nAgent(jobId: string, agentType: string, input: any, userId: string, documentIds: string[]) {
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL}/taskforge`;
    const apiKey = process.env.N8N_API_KEY;

    console.log(`[n8n] Triggering analysis for job ${jobId} (${agentType})`);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                jobId,
                agentType,
                input,
                userId,
                documentIds
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`n8n webhook failed with status ${response.status}: ${errorText}`);
        }

        console.log(`[n8n] Job ${jobId} successfully sent to analysis server`);
    } catch (error) {
        console.error(`[n8n] Failed to trigger analysis for job ${jobId}:`, error);

        // Update job status to FAILED in DB
        await prisma.agentJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorMessage: error instanceof Error ? error.message : String(error)
            }
        });

        // Notify user via socket
        io.to(userId).emit('agent:job_update', {
            jobId,
            status: 'FAILED',
            error: 'Erro de comunicação interna com o servidor de análise.'
        });
    }
}

// --- n8n Webhooks ---

/**
 * POST /api/webhooks/n8n/complete
 * Received when n8n finishes processing an agent job
 */
app.post('/api/webhooks/n8n/complete', async (req, res) => {
    const authHeader = req.headers.authorization;
    const responseToken = process.env.N8N_RESPONSE_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${responseToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { jobId, result } = req.body;

    if (!jobId || !result) {
        return res.status(400).json({ error: 'Missing jobId or result' });
    }

    try {
        console.log(`[n8n Webhook] Completing job ${jobId}`);

        const job = await prisma.agentJob.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                outputResult: result,
                completedAt: new Date()
            },
            include: { user: true }
        });

        // Notify client via Socket.IO
        // Map agent type to legacy event names to maintain frontend compatibility
        const eventMap: Record<string, string> = {
            'DECISION': 'agent:decision_analysis_ready',
            'CLARITY': 'agent:clarity_structure_ready',
            'LEVERAGE': 'agent:leverage_execution_ready'
        };

        const eventName = eventMap[job.agentType] || 'agent:analysis_complete';

        // Emit standardized events
        // @ts-ignore - Prisma include can sometimes confuse simple type inference
        const firebaseUid = (job as any).user?.firebaseUid;
        if (firebaseUid) {
            io.to(firebaseUid).emit(eventName, result);
            io.to(firebaseUid).emit('agent:job_update', {
                jobId,
                status: 'COMPLETED',
                result
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[n8n Webhook] Error completing job:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * POST /api/webhooks/n8n/error
 * Received when n8n encounters an error
 */
app.post('/api/webhooks/n8n/error', async (req, res) => {
    const authHeader = req.headers.authorization;
    const responseToken = process.env.N8N_RESPONSE_TOKEN;

    if (!authHeader || authHeader !== `Bearer ${responseToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { jobId, error } = req.body;

    try {
        console.log(`[n8n Webhook] Error reported for job ${jobId}`);

        const job = await prisma.agentJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorMessage: (error as string) || 'Generic analysis error'
            },
            include: { user: true }
        });

        // @ts-ignore
        const firebaseUid = (job as any).user?.firebaseUid;
        if (firebaseUid) {
            io.to(firebaseUid).emit('agent:job_update', {
                jobId,
                status: 'FAILED',
                errorMessage: job.errorMessage
            });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('[n8n Webhook] Error reporting lab error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

startServer();
