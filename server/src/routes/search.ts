import type { Router } from 'express';
import { Router as createRouter } from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import type { AuthedRequest } from '../middleware/auth.js';

const router: Router = createRouter();

// Disable caching for all search endpoints to avoid 304/ETag behavior during dev
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// GET /api/search/users - Get user suggestions (people you may know)
router.get('/users', async (req: AuthedRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const currentUserId = req.auth!.userId;

    // Get users the current user is already following
    const following = await Follow.find({ followerId: currentUserId }).distinct('followeeId');
    
    // Find users not being followed, excluding self
    const users = await User.find({
      clerkId: { $nin: [...following, currentUserId] }
    })
    .limit(limit)
    .lean();

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [postCount, followerCount, followingCount] = await Promise.all([
          Post.countDocuments({ authorId: user.clerkId }),
          Follow.countDocuments({ followeeId: user.clerkId }),
          Follow.countDocuments({ followerId: user.clerkId })
        ]);

        return {
          ...user,
          stats: { postCount, followerCount, followingCount }
        };
      })
    );

    res.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching user suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// GET /api/search?q=query&type=users|posts|all
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const searchRegex = new RegExp(q, 'i');
    const results: any = {};

    if (type === 'users' || type === 'all') {
      results.users = await User.find({
        $or: [
          { username: searchRegex },
          { name: searchRegex }
        ]
      })
      .limit(20)
      .lean();
    }

    if (type === 'posts' || type === 'all') {
      results.posts = await Post.find({
        text: searchRegex
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    }

    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;