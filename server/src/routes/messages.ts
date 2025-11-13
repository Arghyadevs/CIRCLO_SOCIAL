import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import Message from '../models/Message.js';
import type { AuthedRequest } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router: Router = createRouter();

const sendMessageSchema = z.object({
  toId: z.string().min(1),
  text: z.string().min(1).max(5000).optional(),
  mediaUrl: z.string().url().optional()
}).refine(data => data.text || data.mediaUrl, {
  message: 'Either text or mediaUrl must be provided'
});

// GET /api/messages/conversations - Get list of conversations
router.get('/conversations', async (req: AuthedRequest, res) => {
  try {
    const userId = req.auth!.userId;

    // Get unique conversation partners
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ fromId: userId }, { toId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$fromId', userId] },
              '$toId',
              '$fromId'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/messages/:userId - Get messages with specific user
router.get('/:userId', async (req: AuthedRequest, res) => {
  try {
    const currentUserId = req.auth!.userId;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { fromId: currentUserId, toId: otherUserId },
        { fromId: otherUserId, toId: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .lean();

    // Mark messages as read
    await Message.updateMany(
      { fromId: otherUserId, toId: currentUserId, readAt: null },
      { readAt: new Date() }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages - Send message
router.post('/', async (req: AuthedRequest, res) => {
  try {
    const validated = sendMessageSchema.parse(req.body);

    if (validated.toId === req.auth!.userId) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    const message = await Message.create({
      fromId: req.auth!.userId,
      toId: validated.toId,
      text: validated.text,
      mediaUrl: validated.mediaUrl
    });

    // Create recipient notification
    await Notification.create({
      userId: validated.toId,
      type: 'message',
      fromId: req.auth!.userId,
      messageId: message._id,
    });

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/messages/:id - Delete message
router.delete('/:id', async (req: AuthedRequest, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.fromId !== req.auth!.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;