import { useAppState } from '../context/AppState';

/**
 * Custom hook for accessing and managing followers/following data globally
 * 
 * Usage:
 * const { followers, following, toggleFollow, isFollowing } = useFollowersSync();
 */
export function useFollowersSync() {
  const appState = useAppState();
  
  return {
    // Data
    followers: appState.followers,
    following: appState.following,
    followerCount: appState.followerCount,
    followingCount: appState.followingCount,
    followerIds: appState.followerIds,
    followingIds: appState.followingIds,
    
    // Quick checks
    isFollowing: (userId: string) => appState.isFollowing(userId),
    hasFollowers: appState.followerCount > 0,
    hasFollowing: appState.followingCount > 0,
    
    // Actions
    toggleFollow: appState.toggleFollow,
    syncFollowersFollowing: appState.syncFollowersFollowing,
    fetchFollowersAndFollowing: appState.fetchFollowersAndFollowing,
  };
}

/**
 * Hook to check if user is following a specific person
 * 
 * Usage:
 * const isFollowingJohn = useIsFollowing('user_john_id');
 */
export function useIsFollowing(userId: string) {
  const { isFollowing } = useFollowersSync();
  return isFollowing(userId);
}

/**
 * Hook to get current user's followers list
 * 
 * Usage:
 * const myFollowers = useMyFollowers();
 * // Returns sorted, cached followers data
 */
export function useMyFollowers() {
  const { followers } = useFollowersSync();
  return followers;
}

/**
 * Hook to get current user's following list
 * 
 * Usage:
 * const myFollowing = useMyFollowing();
 * // Returns sorted, cached following data
 */
export function useMyFollowing() {
  const { following } = useFollowersSync();
  return following;
}

/**
 * Hook to manage follow/unfollow action
 * 
 * Usage:
 * const { toggleFollow, isFollowing, loading } = useFollowAction();
 * await toggleFollow(userId);
 */
export function useFollowAction() {
  const { toggleFollow, isFollowing } = useFollowersSync();
  
  return {
    toggleFollow,
    isFollowing,
    followAction: async (userId: string) => {
      try {
        await toggleFollow(userId);
        return { success: true };
      } catch (error) {
        console.error('Failed to toggle follow:', error);
        return { success: false, error };
      }
    },
  };
}
