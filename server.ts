import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import prisma from './lib/prisma';
import { processEvent } from './services/metricsService';
import multer from 'multer';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Multer Setup
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- Socket.io ---

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- API Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Events Endpoint
app.post('/api/events', async (req, res) => {
  try {
    const { eventType, entityType, entityId, metadata, userId } = req.body;

    // 1. Log Event
    // Ensure user exists for mock purposes
    let user = await prisma.user.findUnique({ where: { id: userId || 'user-1' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: userId || 'user-1',
                email: 'user@example.com',
                name: 'Demo User'
            }
        });
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

    // Emit raw event
    io.emit('event:new', { ...event, metadata: JSON.parse(event.metadata || '{}') });

    // 2. Process Metrics Logic via Service
    const updates = await processEvent(event.id);

    if (updates) {
        for (const update of updates) {
            // Log explanation
            await prisma.explanationLog.create({
                data: {
                    relatedEventId: event.id,
                    title: update.type === 'dna_update' ? 'Strategic DNA' : 'System Health',
                    whatChanged: `Score alterado de ${update.scoreBefore} para ${update.scoreAfter}`,
                    whyChanged: update.reason,
                    impact: 'Impacto na priorização.',
                    recommendation: update.recommendation,
                }
            });
            
            // Emit explanation update
            io.emit('explanation:new', { 
                relatedEventId: event.id,
                type: update.type,
                ...update
            });

            // Also emit updated metrics to refresh UI immediately
            if (update.type === 'dna_update') {
                 const dna = await prisma.strategicDNA.findUnique({ where: { userId: user.id } });
                 io.emit('metrics:dna:update', dna);
            } else if (update.type === 'health_update') {
                 const health = await prisma.systemHealth.findUnique({ where: { userId: user.id } });
                 io.emit('metrics:health:update', health);
            }
        }
    }

    res.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Metrics Endpoints
app.get('/api/metrics/dna', async (req, res) => {
    try {
        const userId = 'user-1'; 
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

app.get('/api/metrics/health', async (req, res) => {
    try {
        const userId = 'user-1';
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

// Explanations Endpoint
app.get('/api/explanations', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const explanations = await prisma.explanationLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        res.json(explanations);
    } catch (error) {
        console.error('Error fetching explanations:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});

// Document Routes
app.get('/api/documents', async (req, res) => {
    const userId = 'user-1';
    const docs = await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { insights: true, linkedDecisions: true, linkedPlans: true, linkedRisks: true }
    });
    res.json(docs);
});

app.get('/api/documents/score', async (req, res) => {
    const userId = 'user-1';
    
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

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
    try {
        const userId = 'user-1';
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

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
        
        const doc = await prisma.document.create({
            data: {
                title: file.originalname,
                type: file.mimetype.includes('pdf') ? 'PDF' : 'DOC',
                size: file.size,
                userId,
                status: 'processing',
                storageUrl: `mock-storage/${file.originalname}` // Mock URL
            }
        });

        // Emit Upload Event
        io.emit('document:uploaded', { id: doc.id, title: doc.title });

        // Simulate Processing Pipeline
        processDocumentPipeline(doc.id, userId);

        res.json(doc);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Mock Processing Pipeline
async function processDocumentPipeline(docId: string, userId: string) {
    console.log(`Starting processing for doc ${docId}...`);
    
    // 1. Simulate Text Extraction & N8N Call (Delay)
    setTimeout(async () => {
        try {
            // Mock Insights Data
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
                confidenceScore: 89.5
            };

            // 2. Save Insights
            await prisma.documentInsights.create({
                data: {
                    documentId: docId,
                    ...insightsData
                }
            });

            // --- NEW: Generate Suggestions ---
            
            // Decision Suggestions
            const decisions = JSON.parse(insightsData.decisionsJson);
            if (decisions.length > 0 && insightsData.confidenceScore >= 60) {
                for (const d of decisions) {
                    await prisma.decisionSuggestion.create({
                        data: {
                            userId,
                            documentId: docId,
                            title: d.title,
                            description: `Sugestão gerada automaticamente a partir da análise do documento. Confiança: ${d.confidence}%`,
                            impactScore: d.impact === 'high' ? 80 : d.impact === 'medium' ? 50 : 20,
                            confidenceScore: d.confidence,
                            status: 'pending'
                        }
                    });
                }
                
                // Log Event
                await prisma.eventLog.create({
                    data: {
                        eventType: 'suggestion.created',
                        entityType: 'decision_suggestion',
                        userId,
                        metadata: JSON.stringify({ count: decisions.length, sourceDoc: docId })
                    }
                });
            }

            // Plan Suggestion
            const plan = JSON.parse(insightsData.suggestedPlanJson);
            if (plan && insightsData.confidenceScore >= 70) {
                await prisma.planSuggestion.create({
                    data: {
                        userId,
                        documentId: docId,
                        title: plan.title,
                        objective: "Implementar estratégia definida no documento.",
                        phasesJson: JSON.stringify(plan.steps), // Mock mapping
                        confidenceScore: Math.floor(insightsData.confidenceScore),
                        status: 'pending'
                    }
                });
                
                // Log Event
                await prisma.eventLog.create({
                    data: {
                        eventType: 'suggestion.created',
                        entityType: 'plan_suggestion',
                        userId,
                        metadata: JSON.stringify({ title: plan.title, sourceDoc: docId })
                    }
                });
            }

            // 3. Update Document Status
            const updatedDoc = await prisma.document.update({
                where: { id: docId },
                data: { 
                    status: 'processed',
                    processedAt: new Date()
                },
                include: { insights: true, decisionSuggestions: true, planSuggestions: true }
            });

            // 4. Emit Events
            io.emit('document:processed', updatedDoc);
            io.emit('document:insights_extracted', { id: docId, title: updatedDoc.title });

            // 5. System Updates (DNA, Health, Risks)
            
            // Create Risk Alert if high severity risk found
            const risks = JSON.parse(insightsData.risksJson);
            const hasHighRisk = risks.some((r: any) => r.severity === 'high' || r.severity === 'critical');

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
                io.emit('risk.detected', { title: updatedDoc.title, severity: 'high' });
                
                // Update Health (Penalty)
                await prisma.systemHealth.update({
                    where: { userId },
                    data: {
                        activeRisksSeverity: { decrement: 10 }, // Penalty
                        overallScore: { decrement: 5 }
                    }
                });
                
                // Log Explanation
                await prisma.explanationLog.create({
                    data: {
                        title: "Risco Crítico Detectado",
                        whatChanged: "Saúde do Sistema penalizada.",
                        whyChanged: "Documento analisado contém riscos de alta severidade.",
                        impact: "Atenção imediata requerida.",
                        recommendation: "Revisar documento e mitigar riscos.",
                        event: { connect: { id: (await prisma.eventLog.findFirst({where: {entityId: docId}}))?.id || 'unknown' } }
                    }
                });
            }

            // Update DNA (Bonus for processing)
            await prisma.strategicDNA.update({
                where: { userId },
                data: {
                    focusLeverage: { increment: 2 },
                    strategicConsistency: { increment: 1 },
                    overallScore: { increment: 1 }
                }
            });

            // Emit Metrics Updates
            const dna = await prisma.strategicDNA.findUnique({ where: { userId } });
            const health = await prisma.systemHealth.findUnique({ where: { userId } });
            io.emit('metrics:dna:update', dna);
            io.emit('metrics:health:update', health);

            // Log Completion Event
            await prisma.eventLog.create({
                data: {
                    eventType: 'document.processed',
                    entityType: 'document',
                    entityId: docId,
                    userId,
                    metadata: JSON.stringify({ hasRisks: hasHighRisk })
                }
            });

        } catch (error) {
            console.error('Pipeline error:', error);
            await prisma.document.update({
                where: { id: docId },
                data: { status: 'error' }
            });
        }
    }, 5000); // 5 seconds simulated delay
}

app.post('/api/documents/:id/analyze', async (req, res) => {
    // Legacy endpoint kept for compatibility, but now redirects to pipeline logic if needed
    // For now, just return success as the pipeline handles it automatically on upload
    // Or we can trigger re-analysis here
    const { id } = req.params;
    const userId = 'user-1';
    
    // Trigger pipeline again
    processDocumentPipeline(id, userId);
    
    res.json({ success: true, message: "Analysis started" });
});

// Suggestion Endpoints
app.get('/api/documents/:id/suggestions', async (req, res) => {
    const { id } = req.params;
    const suggestions = await prisma.document.findUnique({
        where: { id },
        include: {
            decisionSuggestions: true,
            planSuggestions: true
        }
    });
    res.json(suggestions);
});

app.get('/api/suggestions/pending', async (req, res) => {
    const userId = 'user-1';
    
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

app.post('/api/suggestions/decision/:id/accept', async (req, res) => {
    const { id } = req.params;
    const { title, description, impactScore, riskScore } = req.body; // Accept edited fields
    const userId = 'user-1';

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
            event: { connect: { id: (await prisma.eventLog.create({
                data: {
                    eventType: 'decision.created', 
                    entityType: 'decision', 
                    userId,
                    metadata: JSON.stringify({ origin: 'document_suggestion', documentId: suggestion.documentId })
                }
            })).id } }
        }
    });

    io.emit('decision:created', decision);
    res.json(decision);
});

app.get('/api/suggestions/plan/:id', async (req, res) => {
    const { id } = req.params;
    const suggestion = await prisma.planSuggestion.findUnique({ where: { id } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
    res.json(suggestion);
});

app.post('/api/suggestions/decision/:id/dismiss', async (req, res) => {
    const { id } = req.params;
    await prisma.decisionSuggestion.update({
        where: { id },
        data: { status: 'dismissed' }
    });
    res.json({ success: true });
});

app.post('/api/suggestions/plan/:id/accept', async (req, res) => {
    const { id } = req.params;
    const userId = 'user-1';

    const suggestion = await prisma.planSuggestion.findUnique({ where: { id } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });

    // Create Real Plan
    const plan = await prisma.plan.create({
        data: {
            userId,
            title: suggestion.title,
            description: suggestion.objective,
            status: 'planning',
            priority: 'high'
        }
    });

    // Update Suggestion Status
    await prisma.planSuggestion.update({
        where: { id },
        data: { status: 'accepted' }
    });

    io.emit('plan:created', plan);
    res.json(plan);
});

app.post('/api/suggestions/plan/:id/dismiss', async (req, res) => {
    const { id } = req.params;
    await prisma.planSuggestion.update({
        where: { id },
        data: { status: 'dismissed' }
    });
    res.json({ success: true });
});

app.post('/api/plans', async (req, res) => {
    const { title, description, phases, tasks, suggestionId } = req.body;
    const userId = 'user-1';

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
                event: { connect: { id: (await prisma.eventLog.create({
                    data: {
                        eventType: 'plan.created', 
                        entityType: 'plan', 
                        userId,
                        metadata: JSON.stringify({ origin: 'document_suggestion', suggestionId })
                    }
                })).id } }
            }
        });
    }

    io.emit('plan:created', plan);
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

app.get('/api/user/profile', async (req, res) => {
    const userId = 'user-1';
    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
        user = await prisma.user.create({
            data: {
                id: userId,
                email: 'user@example.com',
                name: 'Demo User',
                strategicMode: 'equilibrado'
            }
        });
    }
    
    res.json({
        name: user.name || 'Demo User',
        email: user.email || 'user@example.com',
        strategicMode: user.strategicMode || 'equilibrado',
        ...userProfileCache
    });
});

app.put('/api/user/profile', async (req, res) => {
    const userId = 'user-1';
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

app.get('/api/user/mode', async (req, res) => {
    try {
        const userId = 'user-1';
        let user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: 'user@example.com',
                    name: 'Demo User',
                    strategicMode: 'equilibrado'
                }
            });
        }
        res.json({ mode: user.strategicMode || 'equilibrado' });
    } catch (error) {
        console.error('Error fetching user mode:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) });
    }
});


// --- Vite Middleware (Dev Mode) ---

async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    // app.use(express.static('dist'));
  }

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
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

startServer();
