import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
  auth?: {
    userId: string;
    email?: string;
  };
}

// Minimal Clerk-compatible JWT check: expects Authorization: Bearer <token>
// and CLERK_JWT_PUBLIC_KEY in env (PEM). In dev, you can skip verification by setting SKIP_AUTH=true.
export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === 'true') {
    req.auth = { userId: 'dev_user_123' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.substring('Bearer '.length);

  const publicKey = process.env.CLERK_JWT_PUBLIC_KEY;
  if (!publicKey) return res.status(500).json({ error: 'Missing CLERK_JWT_PUBLIC_KEY' });

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as jwt.JwtPayload;
    const userId = decoded.sub || (decoded as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });
    req.auth = { userId };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
