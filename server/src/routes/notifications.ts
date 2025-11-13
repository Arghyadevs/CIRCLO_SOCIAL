import type { Router } from 'express';
import { Router as createRouter } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router: Router = createRouter();

// GET /api/notifications
router.get('/', async (req: AuthedRequest, res) => {
  try {
    const userId = req.auth!.userId;
    const items = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
    
    // Fetch actor info for each notification
    const actorIds = [...new Set(items.map((n: any) => n.actorId))];
    const actors = await User.find({ clerkId: { $in: actorIds } }).lean();
    const actorMap: Record<string, any> = {};
    actors.forEach((u: any) => {
      actorMap[u.clerkId] = u;
    });
    
    const enriched = items.map((n: any) => ({
      ...n,
      actor: actorMap[n.actorId] || null,
      isRead: !!n.readAt,
    }));
    
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req: AuthedRequest, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.auth!.userId }, { readAt: new Date() });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req: AuthedRequest, res) => {
  try {
    await Notification.updateMany({ userId: req.auth!.userId, readAt: null }, { readAt: new Date() });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;