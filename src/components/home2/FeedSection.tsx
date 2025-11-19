// src/components/home2/FeedSection.tsx
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import PostCard from "./common/PostCard";
import { postsApi, profilesApi } from "@/utils/api";
import type { Post, User } from "@/types";
import { PostSkeleton } from "@/components/shared/LoadingSkeleton";
import { InfiniteScroll } from "@/components/shared/InfiniteScroll";

export default function FeedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFeed(1, false);
  }, []);

  const fetchFeed = async (pageNum: number, append: boolean) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await postsApi.getFeed(pageNum, 10);

      // Fetch user data for each post author
      const authorIds = [...new Set(data.items.map((p) => p.authorId))];
      const userPromises = authorIds.map(async (id) => {
        if (userCache[id]) return { id, data: userCache[id] };
        try {
          const userData = await profilesApi.getProfile(id);
          return { id, data: userData };
        } catch (err) {
          console.error(`Failed to fetch user ${id}:`, err);
          return { id, data: null };
        }
      });

      const users = await Promise.all(userPromises);
      const newUserCache: Record<string, User> = { ...userCache };
      
      users.forEach(({ id, data }) => {
        if (data) newUserCache[id] = data;
      });
      setUserCache(newUserCache);

      if (append) {
        setPosts((prev) => [...prev, ...data.items]);
      } else {
        setPosts(data.items);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeed(1, false);
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1, true);
    }
  }, [page, loadingMore, hasMore]);

  const handleEdit = (postId: string) => {
    const post = posts.find((p) => p._id === postId);
    if (!post) return;

    const newText = prompt('Edit post text:', post.text || '');
    if (newText !== null) {
      postsApi
        .updatePost(postId, { text: newText })
        .then((updated) => {
          setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
        })
        .catch(() => alert('Failed to update post'));
    }
  };

  const handleDelete = (postId: string) => {
    if (!confirm('Delete this post?')) return;
    postsApi
      .deletePost(postId)
      .then(() => setPosts((prev) => prev.filter((p) => p._id !== postId)))
      .catch(() => alert('Failed to delete'));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    const isServerError =
      error.includes('API server not responding') ||
      error.includes('Failed to fetch') ||
      error.includes('fetch');

    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600 font-medium text-center mb-3">Failed to load feed</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>

        {isServerError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm">
            <p className="font-semibold text-yellow-800 mb-2">⚠️ Backend Server Not Running</p>
            <p className="text-yellow-700 mb-2">Please ensure:</p>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1 ml-2">
              <li>MongoDB is running on port 27017</li>
              <li>Backend server is running on port 3000</li>
            </ol>
            <p className="text-yellow-700 mt-3">
              Run: <code className="bg-yellow-100 px-2 py-1 rounded">cd server && npm run dev</code>
            </p>
          </div>
        )}

        <button
          onClick={() => fetchFeed(1, false)}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <p className="text-gray-600 text-lg font-medium">No posts yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Follow people to see their posts in your feed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pull to refresh */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh feed'}
        </button>
      </div>

      {/* Posts with infinite scroll */}
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={loadingMore}
        onLoadMore={handleLoadMore}
      >
        {posts.map((post) => {
          const author = userCache[post.authorId] || {
            username: 'Unknown',
            name: 'Unknown User',
            avatarUrl: `https://api.dicebear.com/8.x/avataaars/svg?seed=${post.authorId}`,
          };

          return (
            <PostCard
              key={post._id}
              post={post}
              author={author}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          );
        })}
      </InfiniteScroll>
    </div>
  );
}