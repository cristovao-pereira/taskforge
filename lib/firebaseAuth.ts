import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Initialize with application default credentials or service account
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Use application default credentials (works in Cloud Run, Cloud Functions, etc.)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    console.warn('⚠️  Firebase Admin SDK not initialized - authentication will fail');
    console.warn('    Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH');
  }
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
      userId?: string;
    }
  }
}

/**
 * Middleware to verify Firebase ID token
 * Expects Authorization header with format: "Bearer <token>"
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach user info to request
    req.user = decodedToken;
    req.userId = decodedToken.uid;
    
    next();
  } catch (error: any) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
}

/**
 * Optional authentication middleware
 * Verifies token if present, but allows request to proceed if not
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    req.userId = decodedToken.uid;
  } catch (error) {
    // Token is invalid, but we allow the request to proceed
    console.warn('Invalid token provided (optional auth)');
  }

  next();
}

/**
 * Get Firebase Admin SDK instance
 */
export function getFirebaseAdmin() {
  return admin;
}
