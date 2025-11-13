import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import type { AuthedRequest } from '../middleware/auth.js';

const router: Router = createRouter();

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  links: z.array(z.string().url()).max(5).optional()
});

// GET /api/profiles/me - Get current user profile
router.get('/me', async (req: AuthedRequest, res) => {
  try {
    let user = await User.findOne({ clerkId: req.auth!.userId });
    
    if (!user) {
      // Auto-create user profile on first access with minimal data
      user = await User.create({ 
        clerkId: req.auth!.userId,
        isVerified: false,
        isPrivate: false
      });
    }

    const [postCount, followerCount, followingCount] = await Promise.all([
      Post.countDocuments({ authorId: req.auth!.userId }),
      Follow.countDocuments({ followeeId: req.auth!.userId }),
      Follow.countDocuments({ followerId: req.auth!.userId })
    ]);

    res.json({
      ...user.toObject(),
      stats: { postCount, followerCount, followingCount }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/profiles/:clerkId - Get user profile by Clerk ID
router.get('/:clerkId', async (req: AuthedRequest, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [postCount, followerCount, followingCount, isFollowing] = await Promise.all([
      Post.countDocuments({ authorId: req.params.clerkId }),
      Follow.countDocuments({ followeeId: req.params.clerkId }),
      Follow.countDocuments({ followerId: req.params.clerkId }),
      Follow.exists({ 
        followerId: req.auth!.userId, 
        followeeId: req.params.clerkId 
      })
    ]);

    res.json({
      ...user.toObject(),
      stats: { postCount, followerCount, followingCount },
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /api/profiles/me - Update current user profile
router.patch('/me', async (req: AuthedRequest, res) => {
  try {
    const validated = updateProfileSchema.parse(req.body);

    // Check username uniqueness if updating
    if (validated.username) {
      const existing = await User.findOne({ 
        username: validated.username,
        clerkId: { $ne: req.auth!.userId }
      });
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.auth!.userId },
      validated,
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/profiles/:clerkId/posts - Get user's posts
router.get('/:clerkId/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ authorId: req.params.clerkId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({ authorId: req.params.clerkId });

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

export default router;