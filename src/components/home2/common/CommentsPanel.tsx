import { useEffect, useState } from 'react';
import { commentsApi } from '@/utils/api';

interface CommentDoc {
  _id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
  likeCount?: number;
  author?: {
    clerkId: string;
    username: string;
    avatarUrl?: string;
  } | null;
}

interface Props {
  postId: string;
}

export default function CommentsPanel({ postId }: Props) {
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const list = await commentsApi.getComments(postId);
      setComments(list as any);
    } catch (e) {
      console.error('Failed to load comments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSubmitting(true);
      const c = await commentsApi.createComment({ postId, text: text.trim() });
      setComments((prev) => [...prev, c as any]);
      setText('');
    } catch (e) {
      console.error('Failed to comment', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 rounded-full border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm disabled:opacity-50"
        >
          Post
        </button>
      </form>

      {loading ? (
        <div className="text-xs text-gray-500">Loading comments…</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-gray-500">Be the first to comment</div>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => {
            const displayName = c.author?.username || c.authorId;
            return (
              <li key={c._id} className="text-sm border-l-2 border-gray-200 pl-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold mr-2">{displayName}</span>
                    <span>{c.text}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
