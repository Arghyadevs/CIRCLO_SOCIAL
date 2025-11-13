import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import type { AuthedRequest } from '../middleware/auth.js';

const router: Router = createRouter();

const createCommentSchema = z.object({
  postId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  text: z.string().min(1).max(2000)
});

// GET /api/comments?postId=xxx - Get comments for a post
router.get('/', async (req, res) => {
  try {
    const { postId } = req.query;
    if (!postId) {
      return res.status(400).json({ error: 'postId required' });
    }

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .lean();

    // Load author profiles in bulk to avoid many requests from the client
    const authorIds = [...new Set(comments.map((c: any) => c.authorId))];
    const users = await User.find({ clerkId: { $in: authorIds } }).lean();
    const userMap: Record<string, any> = {};
    users.forEach((u: any) => {
      userMap[u.clerkId] = u;
    });

    const enriched = comments.map((c: any) => ({
      ...c,
      author: userMap[c.authorId] || null
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/comments - Create comment
router.post('/', async (req: AuthedRequest, res) => {
  try {
    const validated = createCommentSchema.parse(req.body);

    // Verify post exists
    const post = await Post.findById(validated.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      postId: validated.postId,
      authorId: req.auth!.userId,
      text: validated.text
    });

    // Increment comment count
    await Post.findByIdAndUpdate(validated.postId, {
      $inc: { commentCount: 1 }
    });

    // Create notification for the post author
    if (post.authorId !== req.auth!.userId) {
      await Notification.create({
        userId: post.authorId,
        type: 'comment',
        actorId: req.auth!.userId,
        postId: validated.postId,
        commentId: comment._id,
        isRead: false,
      });
    }

    // Attach author profile to response
    const author = await User.findOne({ clerkId: req.auth!.userId }).lean();
    const enriched = { ...comment.toObject(), author: author || null };
    res.status(201).json(enriched);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', async (req: AuthedRequest, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.auth!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await comment.deleteOne();

    // Decrement comment count
    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentCount: -1 }
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;