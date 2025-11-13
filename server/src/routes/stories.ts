import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { AuthedRequest } from '../middleware/auth.js';
import StoryModel from '../models/Story.js';

const router = Router();

// configure multer storage to server/uploads
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: (_req: Request, _file: any, cb: (error: Error | null, destination: string) => void) => cb(null, UPLOAD_DIR),
  filename: (_req: Request, file: any, cb: (error: Error | null, filename: string) => void) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// Helper to build absolute URL for a file
function publicUrl(req: Request, relativePath: string) {
  const host = req.get('host') || 'localhost';
  const protocol = req.protocol || 'http';
  return `${protocol}://${host}${relativePath}`;
}

// GET /api/stories (public) - fetch recent stories from DB
router.get('/', async (req: Request, res: Response) => {
  try {
    // only return stories from the last 24 hours; TTL index also handles expiry
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const docs = await StoryModel.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).lean();
    const withUrls = docs.map((d: any) => ({ ...d, url: d.url.startsWith('http') ? d.url : publicUrl(req, d.url) }));
    res.json({ stories: withUrls });
  } catch (err) {
    console.error('Failed to fetch stories', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST /api/stories - accepts multipart 'file' and optional 'text' (auth optional for dev)
router.post('/', upload.single('file'), async (req: AuthedRequest & { file?: any; body: any }, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const file = req.file;
    const type = file.mimetype.startsWith('video') ? 'video' : 'image';
    const relativeUrl = `/uploads/${file.filename}`;
    // Allow authorId from auth middleware if present, otherwise from form body (for dev), else anonymous
    const authorId = (req.auth && req.auth.userId) || req.body?.authorId || 'anonymous';
    const doc = await StoryModel.create({
      authorId,
      url: relativeUrl,
      type,
      text: req.body?.text?.toString(),
    });
    const result = { ...doc.toObject(), url: publicUrl(req, doc.url) };
    res.status(201).json({ story: result });
  } catch (err: any) {
    console.error('Failed to create story', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Max 200MB' });
    }
    res.status(500).json({ error: 'Failed to create story', details: err.message || String(err) });
  }
});

// PATCH /api/stories/:id - update story text and/or replace file
router.patch('/:id', upload.single('file'), async (req: AuthedRequest & { file?: any; body: any }, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await StoryModel.findById(id);
    if (!doc) return res.status(404).json({ error: 'Story not found' });

    // auth: if request is authenticated, only allow owner
    if (req.auth && req.auth.userId && doc.authorId !== req.auth.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this story' });
    }

    // Update text if provided
    if (req.body && typeof req.body.text === 'string') {
      doc.text = req.body.text;
    }

    // If a new file uploaded, replace the stored file and update url/type
    if (req.file) {
      const oldPath = doc.url && doc.url.startsWith('/uploads/') ? path.join(process.cwd(), doc.url) : null;
      const file = req.file;
      const type = file.mimetype.startsWith('video') ? 'video' : 'image';
      doc.url = `/uploads/${file.filename}`;
      doc.type = type;

      // attempt to delete old file (best-effort)
      if (oldPath) {
        import('fs').then(fs => {
          fs.unlink(oldPath, (err) => {
            if (err) console.warn('Failed to remove old story file:', oldPath, err.message || err);
          });
        }).catch(() => {});
      }
    }

    await doc.save();
    const result = { ...doc.toObject(), url: doc.url.startsWith('http') ? doc.url : publicUrl(req, doc.url) };
    res.json({ story: result });
  } catch (err) {
    console.error('Failed to update story', err);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

// DELETE /api/stories/:id - delete a story and remove file
router.delete('/:id', async (req: AuthedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await StoryModel.findById(id);
    if (!doc) return res.status(404).json({ error: 'Story not found' });

    // auth: if request is authenticated, only allow owner
    if (req.auth && req.auth.userId && doc.authorId !== req.auth.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }

    // delete file from disk if present
    if (doc.url && doc.url.startsWith('/uploads/')) {
      const full = path.join(process.cwd(), doc.url);
      import('fs').then(fs => {
        fs.unlink(full, (err) => {
          if (err) console.warn('Failed to unlink story file:', full, err.message || err);
        });
      });
    }

    await doc.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    console.error('Failed to delete story', err);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;
