import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

import postsRouter from './routes/posts.js';
import profilesRouter from './routes/profiles.js';
import commentsRouter from './routes/comments.js';
import reactionsRouter from './routes/reactions.js';
import followsRouter from './routes/follows.js';
import messagesRouter from './routes/messages.js';
import notificationsRouter from './routes/notifications.js';
import searchRouter from './routes/search.js';
import storiesRouter from './routes/stories.js';
import mediaRouter from './routes/media.js';

import { authMiddleware } from './middleware/auth.js';
import { rateLimit } from './middleware/rateLimit.js';
import { getFirebaseAdmin } from './firebaseAdmin.js';

dotenv.config({ path: process.cwd() + '/.env' });

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));
// Allow cross-origin resource loading for media served from /uploads.
// Helmet by default may set Cross-Origin-Resource-Policy to 'same-origin' which
// blocks cross-origin media requests. Configure it to allow 'cross-origin'.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/circlo_social';

// Fail fast if Mongo is unreachable (avoid request timeouts due to buffering)
mongoose.set('bufferCommands', false);

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error', err);
    // Do not exit in dev, but keep server up so /api/health and other non-DB routes respond
    // process.exit(1);
  });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'circlo-social', ts: Date.now() });
});

// Rate limiting - 100 requests per minute
// Rate limit: 1000 requests per minute for local dev
app.use('/api', rateLimit(1000, 60000));

// Protected routes (require Clerk JWT)
app.use('/api', authMiddleware);
app.use('/api/posts', postsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/reactions', reactionsRouter);
app.use('/api/follows', followsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/search', searchRouter);

// ensure uploads directory exists and serve static files
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
// serve uploads with CORS and range support
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    setHeaders: (res, _path, _stat) => {
      const origins = process.env.CLIENT_ORIGIN?.split(',');
      const allow = origins && origins.length > 0 ? origins[0] : '*';
      res.setHeader('Access-Control-Allow-Origin', allow);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Accept-Ranges', 'bytes');
      // Allow cross-origin embedding/usage of media files
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// Stories route
app.use('/api/stories', storiesRouter);
app.use('/api/media', mediaRouter);

// Custom token endpoint for Firebase Auth (Clerk -> Firebase bridge)
app.post('/api/firebase/custom-token', async (req, res) => {
  try {
    const uid = (req as any).auth?.userId;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const admin = getFirebaseAdmin();
    const token = await admin.auth().createCustomToken(uid);
    res.json({ token });
  } catch (err: any) {
    console.error('Failed to create Firebase custom token:', err);
    res.status(500).json({ error: 'Failed to create custom token' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
