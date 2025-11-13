import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { profilesApi, followsApi } from '../utils/api';

export type User = {
  clerkId: string;
  username?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  links?: string[];
  isVerified: boolean;
  isPrivate: boolean;
  stats?: {
    postCount: number;
    followerCount: number;
    followingCount: number;
  };
};

export type FriendRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
};

export type Privacy = 'Public' | 'Friends' | 'Private';

export type Post = {
  id: string;
  authorId: string;
  text?: string;
  mediaUrl?: string; // image or video data URL
  mediaType?: 'image' | 'video';
  linkUrl?: string;
  privacy: Privacy;
  createdAt: number;
};

export type Reel = {
  id: string;
  videoUrl: string; // data URL
  authorId: string;
  createdAt: number;
  likes: number;
};

// stories are handled server-side via storiesApi

type AppState = {
  isAuthenticated: boolean;
  currentUser: User;
  users: User[];
  friendRequests: FriendRequest[];
  posts: Post[];
  reels: Reel[];
  // 👥 Followers/Following Sync
  followers: User[];
  following: User[];
  followerCount: number;
  followingCount: number;
  followerIds: Set<string>;
  followingIds: Set<string>;
  isFollowing: (userId: string) => boolean;
  // auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // data actions
  updateProfile: (patch: Partial<User>, avatarFile?: File) => Promise<void>;
  sendFriendRequest: (toUserId: string) => void;
  respondToFriendRequest: (requestId: string, action: 'accept' | 'reject') => void;
  addPost: (input: { text?: string; mediaFile?: File | null; linkUrl?: string; privacy: Privacy }) => Promise<void>;
  addReel: (file: File) => Promise<void>;
  // 👥 Followers/Following Actions
  fetchFollowersAndFollowing: () => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;
  syncFollowersFollowing: () => Promise<void>;
  // addStory handled by server; frontend calls storiesApi directly
};

const AppStateContext = createContext<AppState | null>(null);

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  
  // 👥 Followers/Following State
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followerIds, setFollowerIds] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Fetch current user profile from MongoDB when Clerk user is available
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      fetchCurrentUser();
    } else {
      setCurrentUser(null);
      setFollowers([]);
      setFollowing([]);
      setFollowerIds(new Set());
      setFollowingIds(new Set());
    }
  }, [isSignedIn, clerkUser?.id]);

  // 👥 Sync followers/following AFTER currentUser is fetched
  useEffect(() => {
    if (currentUser?.clerkId) {
      console.log('📍 Auto-syncing followers/following for:', currentUser.clerkId);
      (async () => {
        // Get followers and following data
        try {
          const [followersList, followingList] = await Promise.all([
            followsApi.getFollowers(currentUser.clerkId),
            followsApi.getFollowing(currentUser.clerkId),
          ]);
          
          setFollowers(followersList || []);
          setFollowing(followingList || []);
          
          const fIds = new Set(followersList?.map(u => u.clerkId) || []);
          const wIds = new Set(followingList?.map(u => u.clerkId) || []);
          
          setFollowerIds(fIds);
          setFollowingIds(wIds);
          
          console.log('✅ Followers synced:', followersList?.length || 0);
          console.log('✅ Following synced:', followingList?.length || 0);
        } catch (err) {
          console.error('❌ Error syncing followers/following:', err);
        }
      })();
    }
  }, [currentUser?.clerkId]);

  const fetchCurrentUser = async () => {
    try {
      const profile = await profilesApi.getMyProfile();
      setCurrentUser(profile);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  // 👥 Fetch followers and following for current user
  const fetchFollowersAndFollowing = useCallback(async () => {
    if (!currentUser?.clerkId) return;
    
    try {
      console.log('📍 Syncing followers/following for:', currentUser.clerkId);
      const [followersList, followingList] = await Promise.all([
        followsApi.getFollowers(currentUser.clerkId),
        followsApi.getFollowing(currentUser.clerkId),
      ]);
      
      setFollowers(followersList || []);
      setFollowing(followingList || []);
      
      // Update IDs set for quick lookup
      const fIds = new Set(followersList?.map(u => u.clerkId) || []);
      const wIds = new Set(followingList?.map(u => u.clerkId) || []);
      
      setFollowerIds(fIds);
      setFollowingIds(wIds);
      
      console.log('✅ Followers synced:', followersList?.length || 0);
      console.log('✅ Following synced:', followingList?.length || 0);
    } catch (err) {
      console.error('❌ Error syncing followers/following:', err);
    }
  }, [currentUser?.clerkId]);

  // 👥 Sync followers and following
  const syncFollowersFollowing = useCallback(async () => {
    if (!currentUser?.clerkId && !clerkUser?.id) return;
    await fetchFollowersAndFollowing();
  }, [currentUser?.clerkId, clerkUser?.id, fetchFollowersAndFollowing]);

  // 👥 Toggle follow status and sync
  const toggleFollow = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Toggling follow for:', userId);
      await followsApi.toggleFollow(userId);
      
      // Refresh followers/following after toggle
      await fetchFollowersAndFollowing();
      
      console.log('✅ Follow toggled and synced');
    } catch (err) {
      console.error('❌ Error toggling follow:', err);
      throw err;
    }
  }, [fetchFollowersAndFollowing]);

  const login = async () => {
    // Clerk handles authentication, this is just for compatibility
    return true;
  };

  const logout = async () => {
    // Clerk handles logout
    setCurrentUser(null);
  };

  const updateProfile = async (patch: Partial<User>, avatarFile?: File) => {
    try {
      const avatarUrl = patch.avatarUrl;
      if (avatarFile) {
        // In a real app, upload to cloud storage and get URL
        // For now, we'll use Clerk's image or skip file upload
        console.warn('File upload not implemented. Use Clerk avatar instead.');
      }

      const updated = await profilesApi.updateProfile({
        username: patch.username,
        name: patch.name,
        bio: patch.bio,
        avatarUrl: avatarUrl || clerkUser?.imageUrl,
        links: patch.links,
      });

      setCurrentUser(updated);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const sendFriendRequest = (toUserId: string) => {
    if (!currentUser || toUserId === currentUser.clerkId) return; // cannot send to self

    // prevent duplicates or already accepted
    const exists = friendRequests.find(
      fr => ((fr.fromUserId === currentUser.clerkId && fr.toUserId === toUserId) ||
             (fr.fromUserId === toUserId && fr.toUserId === currentUser.clerkId)) &&
            fr.status === 'pending'
    );
    if (exists) return;

    setFriendRequests(prev => [
      { id: `fr_${Date.now()}`, fromUserId: currentUser.clerkId, toUserId, status: 'pending', createdAt: Date.now() },
      ...prev,
    ]);
  };

  const respondToFriendRequest = (requestId: string, action: 'accept' | 'reject') => {
    setFriendRequests(prev => prev.map(fr => fr.id === requestId ? { ...fr, status: action === 'accept' ? 'accepted' : 'rejected' } : fr));
  };

  const addPost = async (input: { text?: string; mediaFile?: File | null; linkUrl?: string; privacy: Privacy }) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const { text, mediaFile, linkUrl, privacy } = input;

    if (!text && !mediaFile && !linkUrl) throw new Error('Post cannot be empty');

    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | undefined;
    if (mediaFile) {
      const isImage = /image\/(png|jpeg|jpg|webp)/i.test(mediaFile.type);
      const isVideo = /video\/(mp4|webm)/i.test(mediaFile.type);
      if (!isImage && !isVideo) throw new Error('Unsupported media type. Allowed images: PNG/JPEG/WEBP, videos: MP4/WEBM');
      const maxMB = isVideo ? 20 : 10;
      if (mediaFile.size > maxMB * 1024 * 1024) throw new Error(`File too large. Max ${maxMB}MB`);
      mediaUrl = await fileToDataUrl(mediaFile);
      mediaType = isImage ? 'image' : 'video';
    }

    const post: Post = {
      id: `p_${Date.now()}`,
      authorId: currentUser.clerkId,
      text,
      mediaUrl,
      mediaType,
      linkUrl,
      privacy,
      createdAt: Date.now(),
    };

    setPosts(prev => [post, ...prev]);
  };

  const addReel = async (file: File) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const isVideo = /video\/(mp4|webm)/i.test(file.type);
    if (!isVideo) throw new Error('Reel must be a video (MP4/WEBM)');
    const maxMB = 30;
    if (file.size > maxMB * 1024 * 1024) throw new Error(`Video too large. Max ${maxMB}MB`);
    const videoUrl = await fileToDataUrl(file);
    const reel: Reel = { id: `r_${Date.now()}`, videoUrl, authorId: currentUser.clerkId, createdAt: Date.now(), likes: 0 };
    setReels(prev => [reel, ...prev]);
  };

  // Server handles story creation; frontend should call storiesApi.createStory

  const value = useMemo<AppState>(
    () => ({
      isAuthenticated: isSignedIn || false,
      currentUser: currentUser || {
        clerkId: clerkUser?.id || "",
        username: clerkUser?.username || undefined,
        name: clerkUser?.fullName || undefined,
        email: clerkUser?.primaryEmailAddress?.emailAddress || undefined,
        avatarUrl: clerkUser?.imageUrl || undefined,
        isVerified: false,
        isPrivate: false,
      },
      users: [],
      friendRequests,
      posts,
      reels,
      // 👥 Followers/Following
      followers,
      following,
      followerCount: followers.length,
      followingCount: following.length,
      followerIds,
      followingIds,
      isFollowing: (userId: string) => followingIds.has(userId),
      // expose actions (even if some are thin wrappers for Clerk/backend)
      login,
      logout,
      updateProfile,
      sendFriendRequest,
      respondToFriendRequest,
      addPost,
      addReel,
      // 👥 Followers/Following Actions
      fetchFollowersAndFollowing,
      toggleFollow,
      syncFollowersFollowing,
    }),
    [
      isSignedIn,
      currentUser,
      clerkUser,
      friendRequests,
      posts,
      reels,
      followers,
      following,
      followerIds,
      followingIds,
      fetchFollowersAndFollowing,
      toggleFollow,
      syncFollowersFollowing,
      // functions are stable within this provider so not included
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
