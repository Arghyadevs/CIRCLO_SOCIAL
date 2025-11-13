import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import Reaction from '../models/Reaction.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import type { AuthedRequest } from '../middleware/auth.js';

const router: Router = createRouter();

const toggleReactionSchema = z.object({
  postId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  type: z.enum(['love', 'laugh', 'angry', 'smile']).default('love')
});

// POST /api/reactions/toggle - Toggle like on post
router.post('/toggle', async (req: AuthedRequest, res) => {
  try {
    const validated = toggleReactionSchema.parse(req.body);

    const existing = await Reaction.findOne({
      postId: validated.postId,
      userId: req.auth!.userId
    });

    const post = await Post.findById(validated.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing) {
      // Remove previous reaction (toggle off or switch)
      await existing.deleteOne();
      await Post.findByIdAndUpdate(validated.postId, { $inc: { likeCount: -1 } });
      // If user clicked a different reaction than existing, create new one
      if (existing.type !== validated.type) {
        await Reaction.create({ postId: validated.postId, userId: req.auth!.userId, type: validated.type });
        await Post.findByIdAndUpdate(validated.postId, { $inc: { likeCount: 1 } });
        
        // Create notification for the post author
        if (post.authorId !== req.auth!.userId) {
          await Notification.create({
            userId: post.authorId,
            type: 'like',
            actorId: req.auth!.userId,
            postId: validated.postId,
            isRead: false,
          });
        }
        
        const total = (await Post.findById(validated.postId).select('likeCount'))?.likeCount || 0;
        return res.json({ isLiked: true, likeCount: total, type: validated.type });
      }
      const total = (await Post.findById(validated.postId).select('likeCount'))?.likeCount || 0;
      return res.json({ isLiked: false, likeCount: total });
    } else {
      // Add new reaction
      await Reaction.create({ postId: validated.postId, userId: req.auth!.userId, type: validated.type });
      await Post.findByIdAndUpdate(validated.postId, { $inc: { likeCount: 1 } });
      
      // Create notification for the post author
      if (post.authorId !== req.auth!.userId) {
        await Notification.create({
          userId: post.authorId,
          type: 'like',
          actorId: req.auth!.userId,
          postId: validated.postId,
          isRead: false,
        });
      }
      
      const total = (await Post.findById(validated.postId).select('likeCount'))?.likeCount || 0;
      res.json({ isLiked: true, likeCount: total, type: validated.type });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error toggling reaction:', error);
    res.status(500).json({ error: 'Failed to toggle reaction' });
  }
});

// GET /api/reactions/check?postId=xxx - Check if user liked post
router.get('/check', async (req: AuthedRequest, res) => {
  try {
    const { postId } = req.query;
    if (!postId) {
      return res.status(400).json({ error: 'postId required' });
    }
    const existing = await Reaction.findOne({ postId, userId: req.auth!.userId });
    res.json({ isLiked: !!existing, type: existing?.type });
  } catch (error) {
    console.error('Error checking reaction:', error);
    res.status(500).json({ error: 'Failed to check reaction' });
  }
});

export default router;