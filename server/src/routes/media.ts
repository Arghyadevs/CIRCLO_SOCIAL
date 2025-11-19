import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const router = Router();

// Uploads directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => cb(null, UPLOAD_DIR),
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// Helper to build absolute URL for a file
function publicUrl(req: Request, relativePath: string) {
  const host = req.get('host') || 'localhost';
  const protocol = req.protocol || 'http';
  return `${protocol}://${host}${relativePath}`;
}

// POST /api/media - upload a single file and return its public URL and detected type
router.post('/', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const file = req.file;
    const type: 'image' | 'video' = file.mimetype?.startsWith('video') ? 'video' : 'image';
    const relativeUrl = `/uploads/${file.filename}`;
    const url = publicUrl(req, relativeUrl);

    return res.status(201).json({
      url,
      type,
      filename: file.originalname,
      size: file.size,
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Max 200MB' });
    }
    console.error('Media upload failed:', err);
    return res.status(500).json({ error: 'Failed to upload media' });
  }
});

export default router;
