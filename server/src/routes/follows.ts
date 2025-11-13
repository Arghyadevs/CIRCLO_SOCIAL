import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import type { AuthedRequest } from '../middleware/auth.js';

const router: Router = createRouter();

const followSchema = z.object({
  followeeId: z.string().min(1)
});

// POST /api/follows - Follow user
router.post('/', async (req: AuthedRequest, res) => {
  try {
    const validated = followSchema.parse(req.body);

    if (validated.followeeId === req.auth!.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Ensure both users have profiles
    await User.findOneAndUpdate(
      { clerkId: req.auth!.userId },
      { isVerified: false, isPrivate: false },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { clerkId: validated.followeeId },
      { isVerified: false, isPrivate: false },
      { upsert: true }
    );

    const existing = await Follow.findOne({
      followerId: req.auth!.userId,
      followeeId: validated.followeeId
    });

    if (existing) {
      return res.status(409).json({ error: 'Already following' });
    }

    await Follow.create({
      followerId: req.auth!.userId,
      followeeId: validated.followeeId
    });

    // Create notification for the followed user
    await Notification.create({
      userId: validated.followeeId,
      type: 'follow',
      actorId: req.auth!.userId,
      isRead: false,
    });

    res.status(201).json({ message: 'Followed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// DELETE /api/follows/:followeeId - Unfollow user
router.delete('/:followeeId', async (req: AuthedRequest, res) => {
  try {
    const result = await Follow.deleteOne({
      followerId: req.auth!.userId,
      followeeId: req.params.followeeId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// GET /api/follows/followers/:clerkId - Get followers
router.get('/followers/:clerkId', async (req, res) => {
  try {
    const followers = await Follow.find({ followeeId: req.params.clerkId })
      .select('followerId createdAt')
      .lean();

    // Get full user details for each follower
    const followerUserIds = followers.map(f => f.followerId);
    const users = await User.find({ clerkId: { $in: followerUserIds } }).lean();
    
    // Create a map for quick lookup
    const userMap = Object.fromEntries(users.map(u => [u.clerkId, u]));
    
    // Return full user objects
    const followerUsers = followerUserIds
      .map(id => userMap[id])
      .filter(Boolean);

    res.json({ followers: followerUsers });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// GET /api/follows/following/:clerkId - Get following
router.get('/following/:clerkId', async (req, res) => {
  try {
    const following = await Follow.find({ followerId: req.params.clerkId })
      .select('followeeId createdAt')
      .lean();

    // Get full user details for each person being followed
    const followeeUserIds = following.map(f => f.followeeId);
    const users = await User.find({ clerkId: { $in: followeeUserIds } }).lean();
    
    // Create a map for quick lookup
    const userMap = Object.fromEntries(users.map(u => [u.clerkId, u]));
    
    // Return full user objects
    const followingUsers = followeeUserIds
      .map(id => userMap[id])
      .filter(Boolean);

    res.json({ following: followingUsers });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

export default router;