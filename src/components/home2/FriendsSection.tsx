import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { profilesApi, followsApi } from "../../utils/api";

export default function FriendsSection() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchSuggestions();
      // Load following state for the current user
      (async () => {
        try {
          const following = await followsApi.getFollowing(userId);
          const ids = new Set((following || []).map((f: any) => f.followeeId));
          setFollowingIds(ids);
        } catch (err) {
          // ignore
        }
      })();
    }
  }, [userId]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response: any = await profilesApi.getSuggestions(5);
      // The API returns { users: [...] }, so we extract the array
      setSuggestions(Array.isArray(response?.users) ? response.users : []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    // Optimistic update
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });

    try {
      await followsApi.toggleFollow(userId);
    } catch (err) {
      console.error('Error toggling follow:', err);
      // revert
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId); else next.add(userId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <aside className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-5">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">People You May Know</h3>
        <div className="text-center text-gray-500 py-4 animate-pulse">Loading...</div>
      </aside>
    );
  }

  if (suggestions.length === 0) {
    return (
      <aside className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-5">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">People You May Know</h3>
        <p className="text-sm text-gray-500 text-center py-4">No suggestions available</p>
      </aside>
    );
  }

  return (
    <aside className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-5">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">People You May Know</h3>
      <ul className="space-y-4">
        {suggestions.map((user) => {
          const isFollowing = followingIds.has(user.clerkId);
          const username = user.username || user.name || 'User';
          const avatar = user.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.clerkId}`;
          
          return (
            <li key={user.clerkId} className="flex items-center gap-3">
              <img
                src={avatar}
                alt={username}
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{username}</p>
                {user.stats?.followerCount > 0 && (
                  <p className="text-xs text-gray-500">{user.stats.followerCount} followers</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFollow(user.clerkId)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('circlo:openChat', { detail: { userId: user.clerkId } }))}
                  className="px-3 py-1.5 text-sm rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50"
                  title={`Message ${username}`}
                >
                  Message
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}