import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus, Bell, AtSign, Eye } from "lucide-react";
import { notificationsApi, profilesApi } from "@/utils/api";
import type { Notification, User } from "@/types";
import UserAvatar from "./common/UserAvatar";

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications();
      // Normalize response: API may return an array or an object with { notifications } / { items }
      const raw: any = data;
      let list: any = Array.isArray(raw) ? raw : (raw?.notifications || raw?.items || []);
      // If list is an object (id -> notification), convert to array
      if (list && !Array.isArray(list) && typeof list === 'object') {
        list = Object.values(list);
      }
      if (!Array.isArray(list)) list = [];

      setNotifications(list as Notification[]);

      // Fetch user profiles for actors
      const actorIds = [...new Set((list as any[]).map((n) => n?.actorId).filter(Boolean))];
      const userPromises = actorIds.map(async (id) => {
        try {
          return await profilesApi.getProfile(id);
        } catch {
          return null;
        }
      });

      const users = await Promise.all(userPromises);
      const newUserCache: Record<string, User> = {};
      users.forEach((user) => {
        if (user && (user as any).clerkId) newUserCache[(user as any).clerkId] = user as User;
      });
      setUserCache(newUserCache);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'story_view':
        return <Eye className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you in a comment';
      case 'story_view':
        return 'viewed your story';
      default:
        return 'interacted with your content';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter((n) =>
    filter === 'all' ? true : !n.isRead
  );

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 font-[Outfit]">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500 animate-pulse">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-4 font-[Outfit]"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-purple-700 tracking-tight">
          Notifications 🔔
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-500 hover:text-blue-700 font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2 px-1 font-semibold text-sm transition ${
            filter === 'all'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-2 px-1 font-semibold text-sm transition flex items-center gap-2 ${
            filter === 'unread'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-10 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            {filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {filter === 'unread'
              ? 'All notifications have been read'
              : "When someone likes, comments, or follows you, you'll see it here"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {filteredNotifications.map((notif) => {
            const actor = userCache[notif.actorId];
            const avatar = actor?.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${notif.actorId}`;
            const username = actor?.username || actor?.name || 'Someone';

            return (
              <div
                key={notif._id}
                className={`flex items-start gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition cursor-pointer ${
                  !notif.isRead ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              >
                <div className="relative flex-shrink-0">
                  <UserAvatar src={avatar} alt={username} size="md" userId={notif.actorId} />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm">
                    <span className="font-semibold">{username}</span>{' '}
                    {getNotificationText(notif)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(notif.createdAt)}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}