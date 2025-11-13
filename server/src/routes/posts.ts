import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import Post from '../models/Post.js';
import type { AuthedRequest } from '../middleware/auth.js';

const router: Router = createRouter();

// Validation schemas
const createPostSchema = z.object({
  text: z.string().max(5000).optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video'])
  })).max(10).optional()
});

const updatePostSchema = createPostSchema.partial();

// GET /api/posts - Get feed posts or user posts
router.get('/', async (req: AuthedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const authorId = req.query.authorId as string;

    const query = authorId ? { authorId } : {};

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:id - Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/posts - Create post
router.post('/', async (req: AuthedRequest, res) => {
  try {
    const validated = createPostSchema.parse(req.body);
    
    const post = await Post.create({
      authorId: req.auth!.userId,
      text: validated.text || '',
      media: validated.media || []
    });

    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PATCH /api/posts/:id - Update post
router.patch('/:id', async (req: AuthedRequest, res) => {
  try {
    const validated = updatePostSchema.parse(req.body);
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.auth!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(post, validated);
    await post.save();

    res.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', async (req: AuthedRequest, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.auth!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/posts/:id/repost - Repost an existing post
router.post('/:id/repost', async (req: AuthedRequest, res) => {
  try {
    const originalId = req.params.id;
    const original = await Post.findById(originalId).lean();
    if (!original) return res.status(404).json({ error: 'Original post not found' });

    const newPost = await Post.create({
      authorId: req.auth!.userId,
      text: original.text,
      media: original.media,
      visibility: 'public',
      hashtags: original.hashtags || [],
      mentions: [],
      sharedFrom: originalId
    });

    await Post.findByIdAndUpdate(originalId, { $inc: { shareCount: 1 } });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error reposting:', error);
    res.status(500).json({ error: 'Failed to repost' });
  }
});

export default router;