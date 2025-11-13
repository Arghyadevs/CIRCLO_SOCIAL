// src/components/home2/common/PostCard.tsx
import { MoreHorizontal, MessageCircle, Bookmark, ChevronLeft, ChevronRight, Repeat, Share2, Link as LinkIcon } from "lucide-react";
import { useState } from 'react';
import type { Post } from '@/types';
import UserAvatar from "./UserAvatar";
import ReactionBar from './ReactionBar';
import CommentsPanel from './CommentsPanel';
import { postsApi } from '@/utils/api';

interface PostCardProps {
  post: Post;
  author: {
    username?: string;
    name?: string;
    avatarUrl?: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function PostCard({
  post,
  author,
  onEdit,
  onDelete,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [reposting, setReposting] = useState(false);
  const avatarUrl = author.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${post.authorId}`;
  const hasMultipleMedia = (post.media?.length || 0) > 1;

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
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

  const nextMedia = () => {
    if (post.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(prev => prev + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(prev => prev - 1);
    }
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 animate-fadeIn">
      {/* Header */}
      <header className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('circlo:openProfile', { detail: { userId: post.authorId } }))}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Open profile"
          >
            <UserAvatar src={avatarUrl} alt={author.username} size="sm" userId={post.authorId} />
          </button>
          <div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('circlo:openProfile', { detail: { userId: post.authorId } }))}
              className="font-semibold text-sm text-gray-900 hover:underline text-left"
              aria-label="Open profile"
            >
              {author.username}
            </button>
            {post.location && (
              <p className="text-xs text-gray-500">{post.location}</p>
            )}
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('circlo:openChat', { detail: { userId: post.authorId } }))}
            className="ml-2 px-2 py-1 text-xs rounded-md border border-purple-200 text-purple-700 hover:bg-purple-50"
            title="Message user"
          >
            Message
          </button>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="text-gray-700 hover:text-gray-900 transition p-1"
            aria-label="More options"
          >
            <MoreHorizontal size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
              <button 
                className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                onClick={() => { setMenuOpen(false); onEdit?.(post._id); }}
              >
                Edit post
              </button>
              <button 
                className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-red-600 font-medium"
                onClick={() => { setMenuOpen(false); onDelete?.(post._id); }}
              >
                Delete
              </button>
              <button 
                className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Media Carousel */}
      {post.media && post.media.length > 0 && (
        <div className="relative bg-black group">
          {post.media[currentMediaIndex].type === "image" ? (
            <img
              src={post.media[currentMediaIndex].url}
              alt="Post content"
              loading="lazy"
              className="w-full h-auto max-h-[600px] object-contain"
            />
          ) : (
            <video
              src={post.media[currentMediaIndex].url}
              controls
              className="w-full h-auto max-h-[600px] object-contain"
            />
          )}

          {/* Media navigation */}
          {hasMultipleMedia && (
            <>
              {currentMediaIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {currentMediaIndex < post.media.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              )}
              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.media.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      idx === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-4">
          {/* Mongo-backed reactions */}
          <ReactionBar postId={post._id} initialCount={post.likeCount || 0} />
          <button
            className="flex items-center gap-1 hover:text-pink-500 transition"
            onClick={() => setShowComments(true)}
            aria-label="Comment"
          >
            <MessageCircle className="text-gray-900" size={22} />
            <span className="mt-1">Comment</span>
          </button>
          <button
            disabled={reposting}
            onClick={async () => {
              try {
                setReposting(true);
                await postsApi.repost(post._id);
              } catch (e) {
                console.error('Failed to repost', e);
              } finally {
                setReposting(false);
              }
            }}
            className="flex items-center gap-1 hover:text-green-600 transition disabled:opacity-50"
            aria-label="Repost"
          >
            <Repeat size={20} />
            <span className="mt-1">Repost</span>
          </button>
          {/* Share: internal (Circlo DM) and external */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('circlo:openChat', { detail: { userId: post.authorId } }))}
            className="flex items-center gap-1 hover:text-purple-600 transition"
            title="Share in Circlo"
          >
            <Share2 size={20} />
            <span className="mt-1">Share</span>
          </button>
          <button
            onClick={async () => {
              const url = `${window.location.origin}/post/${post._id}`;
              try {
                if (navigator.share) {
                  await navigator.share({ title: 'Circlo', text: post.text || 'Check this post', url });
                } else {
                  await navigator.clipboard.writeText(url);
                  alert('Link copied to clipboard');
                }
              } catch (e) {
                try {
                  await navigator.clipboard.writeText(url);
                  alert('Link copied to clipboard');
                } catch (_) { /* ignore */ }
              }
            }}
            className="flex items-center gap-1 hover:text-gray-800 transition"
            title="Copy link"
          >
            <LinkIcon size={20} />
          </button>
        </div>
        <button className="hover:text-pink-500 transition">
          <Bookmark size={22} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-3 pb-3">
          <CommentsPanel postId={post._id} />
        </div>
      )}

      {/* Caption */}
      {post.text && (
        <div className="text-sm">
          <span className="font-semibold text-gray-900 mr-2">{author.username}</span>
          <span className="text-gray-900">{post.text}</span>
        </div>
      )}

      {/* View comments */}
      {post.commentCount > 0 && !showComments && (
        <button
          onClick={() => setShowComments(true)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          View all {post.commentCount} comments
        </button>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-500 uppercase">
        {formatTimestamp(post.createdAt)}
      </p>

      {/* Repost indicator */}
      {post.sharedFrom && (
        <p className="text-xs text-gray-500">Reposted</p>
      )}
    </article>
  );
}