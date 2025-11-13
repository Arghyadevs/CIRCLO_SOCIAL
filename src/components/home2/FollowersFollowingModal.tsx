import { useState, useEffect } from "react";
import { X, UserPlus, UserCheck } from "lucide-react";
import { followsApi } from "@/utils/api";
import { useFollowersSync } from "@/hooks/useFollowersSync";
import type { User } from "@/types";

interface FollowersFollowingModalProps {
  userId: string;
  initialTab?: "followers" | "following";
  onClose: () => void;
}

export default function FollowersFollowingModal({
  userId,
  initialTab = "followers",
  onClose,
}: FollowersFollowingModalProps) {
  const [tab, setTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use global followers/following sync to check follow status
  const { 
    toggleFollow: globalToggleFollow,
    isFollowing: globalIsFollowing 
  } = useFollowersSync();

  useEffect(() => {
    fetchLists();
  }, [userId]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      console.log('📍 Fetching followers/following for userId:', userId);
      
      const [followersList, followingList] = await Promise.all([
        followsApi.getFollowers(userId),
        followsApi.getFollowing(userId),
      ]);
      
      console.log('✅ Followers response:', followersList);
      console.log('✅ Following response:', followingList);
      
      setFollowers(followersList || []);
      setFollowing(followingList || []);
    } catch (err) {
      console.error("❌ Error fetching followers/following:", err);
      setFollowers([]);
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    try {
      // Use global toggle to keep state synchronized across app
      await globalToggleFollow(targetUserId);
      console.log('✅ Follow state updated globally for userId:', targetUserId);
      
      // Refresh the followers/following lists to reflect the change
      await fetchLists();
    } catch (err) {
      console.error("❌ Error toggling follow:", err);
    }
  };

  const handleProfileClick = (targetUserId: string) => {
    window.dispatchEvent(
      new CustomEvent("circlo:openProfile", {
        detail: { userId: targetUserId },
      })
    );
    onClose();
  };

  const renderUserList = (users: User[]) => {
    if (users.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No {tab === "followers" ? "followers" : "following"} yet
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.clerkId}
            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
          >
            {/* User Info */}
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
              onClick={() => handleProfileClick(user.clerkId)}
            >
              <img
                src={
                  user.avatarUrl ||
                  `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.clerkId}`
                }
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {user.username || user.name || "User"}
                </p>
                {user.bio && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Follow/Unfollow Button */}
            <button
              onClick={() => handleFollowToggle(user.clerkId)}
              className={`ml-2 flex-shrink-0 px-4 py-1.5 rounded-full font-semibold text-sm transition flex items-center gap-1 ${
                globalIsFollowing(user.clerkId)
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {globalIsFollowing(user.clerkId) ? (
                <>
                  <UserCheck size={14} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Follow
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {tab === "followers" ? "Followers" : "Following"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            aria-label="Close"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => setTab("followers")}
            className={`flex-1 py-3 font-semibold text-sm transition border-b-2 ${
              tab === "followers"
                ? "text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => setTab("following")}
            className={`flex-1 py-3 font-semibold text-sm transition border-b-2 ${
              tab === "following"
                ? "text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400"
                : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div>
            </div>
          ) : tab === "followers" ? (
            renderUserList(followers)
          ) : (
            renderUserList(following)
          )}
        </div>
      </div>
    </div>
  );
}
