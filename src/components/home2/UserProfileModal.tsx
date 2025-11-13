import { useEffect, useState } from 'react';
import { profilesApi, postsApi } from '@/utils/api';
import { useFollowersSync } from '@/hooks/useFollowersSync';
import FollowersFollowingModal from './FollowersFollowingModal';

export default function UserProfileModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [user, setUser] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  
  // Use global followers/following sync
  const { toggleFollow: globalToggleFollow, isFollowing: globalIsFollowing } = useFollowersSync();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await profilesApi.getProfile(userId);
        const feed = await postsApi.getUserPosts(userId);
        if (!alive) return;
        setUser(u);
        setPosts(feed.items || []);
        
        // Set initial following state from global state
        setFollowing(globalIsFollowing(userId));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load profile', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, globalIsFollowing]);

  const handleToggleFollow = async () => {
    try {
      // Use global toggle to keep state synchronized across app
      await globalToggleFollow(userId);
      setFollowing(prev => !prev);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 shadow-xl">Loading…</div>
      </div>
    );
  }

  if (!user) return null;

  const username = user.username || user.name || 'User';
  const avatar = user.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${userId}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200">
          <img src={avatar} alt={username} className="w-14 h-14 rounded-full border object-cover" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{username}</div>
            {user.bio && <div className="text-sm text-gray-600 truncate">{user.bio}</div>}
          </div>
          <div className="flex gap-2">
            <button onClick={handleToggleFollow} className={`px-3 py-1.5 text-sm rounded-lg ${following ? 'bg-gray-200' : 'bg-purple-600 text-white'}`}>
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('circlo:openChat', { detail: { userId } }));
                onClose();
              }}
              className="px-3 py-1.5 text-sm rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Message
            </button>
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border">Close</button>
          </div>
        </div>
        {/* Stats */}
        <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200 flex gap-6">
          <div><span className="font-semibold">{user.stats?.postCount ?? posts.length}</span> posts</div>
          <button
            onClick={() => {
              setFollowersModalTab("followers");
              setShowFollowersModal(true);
            }}
            className="hover:text-purple-600 transition cursor-pointer"
          >
            <span className="font-semibold">{user.stats?.followerCount ?? 0}</span> followers
          </button>
          <button
            onClick={() => {
              setFollowersModalTab("following");
              setShowFollowersModal(true);
            }}
            className="hover:text-purple-600 transition cursor-pointer"
          >
            <span className="font-semibold">{user.stats?.followingCount ?? 0}</span> following
          </button>
        </div>
        {/* Grid */}
        <div className="p-4 grid grid-cols-3 gap-2">
          {posts.map((p) => (
            <div key={p._id} className="relative group bg-gray-100 aspect-square overflow-hidden rounded-lg">
              {p.media && p.media[0]?.type === 'video' ? (
                <video src={p.media[0].url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={p.media?.[0]?.url} alt="post" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
          {posts.length === 0 && <div className="col-span-3 text-center text-sm text-gray-500 py-8">No posts yet</div>}
        </div>
      </div>
      
      {/* Followers/Following Modal */}
      {showFollowersModal && (
        <FollowersFollowingModal
          userId={userId}
          initialTab={followersModalTab}
          onClose={() => setShowFollowersModal(false)}
        />
      )}
    </div>
  );
}
