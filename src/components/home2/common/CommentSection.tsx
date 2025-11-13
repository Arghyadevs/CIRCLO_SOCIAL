import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Heart, X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { commentsApi, profilesApi, searchApi } from "@/utils/api";
import type { Comment } from "@/types";

interface CommentSectionProps {
  postId: string;
  onClose?: () => void;
}

export default function CommentSection({ postId, onClose }: CommentSectionProps) {
  const { userId } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, any>>({});
  const [mentions, setMentions] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentsApi.getComments(postId);
      setComments(data);

      // Fetch user profiles for commenters
      const authorIds = [...new Set(data.map((c: Comment) => c.authorId))];
      const userPromises = authorIds.map(async (id) => {
        try {
          return await profilesApi.getProfile(id);
        } catch {
          return null;
        }
      });

      const users = await Promise.all(userPromises);
      const newUserCache: Record<string, any> = {};
      users.forEach((user) => {
        if (user) newUserCache[user.clerkId] = user;
      });
      
      setUserCache(newUserCache);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle @ mention search
  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInput(text);

    // Detect @ mention pattern
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const cursorPosition = e.target.selectionStart;
      const queryPart = text.substring(lastAtIndex + 1, cursorPosition);
      const afterAt = queryPart.split(/\s/)[0];

      if (cursorPosition > lastAtIndex && /^[a-zA-Z0-9_]*$/.test(afterAt)) {
        setMentionQuery(afterAt);
        setShowMentions(true);

        // Search for users as soon as they start typing after @
        try {
          const results: any = await searchApi.searchUsers(afterAt);
          // API returns { users: [...] }, so we need to access the 'users' property
          const users = Array.isArray(results?.users) ? results.users : [];
          setMentions(users.slice(0, 5)); // Limit to 5 suggestions
        } catch (err) {
          console.error('Failed to search users:', err);
          setMentions([]);
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Insert mention when selected
  const handleSelectMention = (username: string) => {
    const lastAtIndex = input.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const beforeMention = input.substring(0, lastAtIndex);
      const afterQuery = input.substring(input.lastIndexOf(mentionQuery) + mentionQuery.length);
      const newText = `${beforeMention}@${username}${afterQuery}`;
      setInput(newText);
      setShowMentions(false);
      setMentionQuery("");
      
      // Focus back on input
      if (inputRef.current) {
        inputRef.current.focus();
        // Set cursor position after the mention
        setTimeout(() => {
          if (inputRef.current) {
            const cursorPos = beforeMention.length + username.length + 1;
            inputRef.current.setSelectionRange(cursorPos, cursorPos);
          }
        }, 0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const optimisticComment: Comment = {
      _id: `temp_${Date.now()}`,
      postId,
      authorId: userId,
      text: input,
      likeCount: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComments([...comments, optimisticComment]);
    const tempInput = input;
    setInput("");
    setShowMentions(false);

    try {
      const newComment = await commentsApi.createComment({ postId, text: tempInput });
      setComments((prev) =>
        prev.map((c) => (c._id === optimisticComment._id ? newComment : c))
      );
    } catch (err) {
      console.error('Error posting comment:', err);
      setComments((prev) => prev.filter((c) => c._id !== optimisticComment._id));
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await commentsApi.toggleCommentLike(commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likeCount: result.likeCount, isLiked: result.isLiked }
            : c
        )
      );
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${diffWeeks}w`;
  };

  const currentUserAvatar = userId ? (userCache[userId]?.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${userId}`) : '';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      {onClose && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Comments</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
            aria-label="Close comments"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart size={32} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No comments yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Be the first to share your thoughts!</p>
            </div>
          </div>
        ) : (
          comments.map((c) => {
            const user = userCache[c.authorId];
            const username = user?.username || user?.name || 'User';
            const avatar = user?.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${c.authorId}`;

            return (
              <div
                key={c._id}
                className="group flex gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-150"
              >
                <UserAvatar src={avatar} size="sm" userId={c.authorId} />
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white hover:underline cursor-pointer">
                        {username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed break-words">
                      {c.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 px-3">
                    {c.likeCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {c.likeCount} {c.likeCount === 1 ? 'like' : 'likes'}
                      </span>
                    )}
                    <button className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleLikeComment(c._id)}
                  className="mt-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  aria-label="Like comment"
                >
                  <Heart
                    size={16}
                    className={`transition-all duration-200 ${
                      c.isLiked
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                    }`}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <UserAvatar src={currentUserAvatar} size="sm" />
          <div className="flex-1 relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                rows={1}
                maxLength={500}
              />

              {/* Character count */}
              {input.length > 400 && (
                <div className="absolute bottom-3 right-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                  {input.length}/500
                </div>
              )}
            </div>

            {/* Mention suggestions dropdown */}
            {showMentions && mentions.length > 0 && (
              <div
                ref={mentionsRef}
                className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="max-h-48 overflow-y-auto">
                  {mentions.map((user: any, index: number) => {
                    const username = user.username || user.name || 'User';
                    const avatar = user.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.clerkId}`;
                    return (
                      <button
                        key={user.clerkId}
                        type="button"
                        onClick={() => handleSelectMention(username)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-gray-700/50 transition-colors ${
                          index !== mentions.length - 1
                            ? 'border-b border-gray-100 dark:border-gray-700'
                            : ''
                        }`}
                      >
                        <img
                          src={avatar}
                          alt={username}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          @{username}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center min-w-fit"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}