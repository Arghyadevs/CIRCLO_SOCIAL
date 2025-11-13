import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { postsApi } from '@/utils/api';
import type { Post } from '@/types';
import PostCard from './home2/common/PostCard';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!postId) {
        setError('Post not found');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const p = await postsApi.getPost(postId);
        setPost(p as any);
      } catch (e) {
        console.error('Failed to load post:', e);
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">{error || 'Post not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <PostCard post={post} author={{ username: post.authorId }} />
      </div>
    </div>
  );
}
