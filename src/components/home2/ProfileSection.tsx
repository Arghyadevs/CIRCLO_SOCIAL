import React, { useEffect, useState } from "react";
import { useAppState } from "../../context/AppState";
import { useUser } from "@clerk/clerk-react";
import { useFollowersSync } from "../../hooks/useFollowersSync";
import {
  Settings,
  Link as LinkIcon,
  Edit3,
  Bookmark,
  ChevronRight,
  X,
  UserCog,
  Bell,
  Lock,
  LogOut,
  Video,
} from "lucide-react";
import { postsApi } from "../../utils/api";
import FollowersFollowingModal from "./FollowersFollowingModal";

/**
 * ProfileSection (refactored & feature-complete)
 *
 * - View Archive modal implemented
 * - Saved Posts modal implemented with remove functionality
 * - Settings item handlers wired to open specific modals
 * - Edit Profile modal: upload file and save (uses updateProfile if available; otherwise local)
 * - Logout attempts appState.logout(), else logs to console (plug your auth signOut here)
 * - Notification and preferences persisted to localStorage
 *
 * Keep this file in the same place and ensure public assets paths exist (or update).
 */

export default function ProfileSection() {
  const appState = useAppState();
  const { currentUser } = appState;
  const updateProfile = (appState as any).updateProfile;
  const logout = (appState as any).logout;
  const { user: clerkUser } = useUser();
  
  // Get global followers/following sync
  const { followerCount, followingCount } = useFollowersSync();

  // UI state
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");

  // Premium feature modals
  const [boostModal, setBoostModal] = useState<{ show: boolean; post: any | null }>({ show: false, post: null });
  const [reframeModal, setReframeModal] = useState<{ show: boolean; post: any | null }>({ show: false, post: null });
  const [moodModal, setMoodModal] = useState<{ show: boolean; post: any | null; mood: string }>({ show: false, post: null, mood: '' });
  const [collabModal, setCollabModal] = useState<{ show: boolean; post: any | null; collab: string }>({ show: false, post: null, collab: '' });
  const [remixModal, setRemixModal] = useState<{ show: boolean; post: any | null; enabled: boolean }>({ show: false, post: null, enabled: false });

  // Initial user fallback
  const cu = currentUser as any;
  const [editForm, setEditForm] = useState({
    name: cu?.name || "User Name",
    username: cu?.username || "",
    bio: cu?.bio || "Share your vibe, grow your tribe 🌈",
    link: cu?.link || "https://circlo.app/",
  });

  // Fetch user posts from database
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const authorId = cu?.clerkId || clerkUser?.id;
        if (authorId) {
          const data = await postsApi.getUserPosts(authorId);
          setPosts(data.items || []);
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (cu?.clerkId || clerkUser?.id) {
      fetchUserPosts();
    } else {
      setLoadingPosts(false);
    }
  }, [cu?.clerkId, clerkUser?.id]);

  const user = {
    ...cu,
    username: cu?.username || clerkUser?.username || clerkUser?.firstName || "@username",
    followers: followerCount ?? cu?.stats?.followerCount ?? 0,
    following: followingCount ?? cu?.stats?.followingCount ?? 0,
    posts: posts.length,
    avatar: cu?.avatarUrl || clerkUser?.imageUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${clerkUser?.id}`,
  };
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [archivedPosts, setArchivedPosts] = useState<string[]>([]);

  // Notification & preference toggles (stored in localStorage)
  const [notifState, setNotifState] = useState({
    push: true,
    email: false,
    msgRequests: true,
    postLikes: true,
  });

  const [prefsState, setPrefsState] = useState({
    theme: "Dark",
    language: "English",
    showOnline: true,
  });

  useEffect(() => {
    // hydrate toggles from localStorage if present
    try {
      const savedNotif = localStorage.getItem("circlo_notif");
      if (savedNotif) setNotifState(JSON.parse(savedNotif));
      const savedPrefs = localStorage.getItem("circlo_prefs");
      if (savedPrefs) setPrefsState(JSON.parse(savedPrefs));
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    // keep editForm in sync with currentUser and Clerk user changes
    setEditForm({
      name: cu?.name || clerkUser?.fullName || clerkUser?.firstName || "User Name",
      username: cu?.username || clerkUser?.username || "",
      bio: cu?.bio || "Share your vibe, grow your tribe 🌈",
      link: cu?.links?.[0] || "https://circlo.app/",
    });
  }, [cu?.name, cu?.username, cu?.bio, cu?.links, clerkUser?.fullName, clerkUser?.username]);

  // Handlers
  const handleUploadAvatar = (file?: File | null) => {
    if (!file) return;
    if (typeof updateProfile === "function") {
      // try to use provided updateProfile (expected to handle file upload)
      updateProfile({}, file);
    } else {
      // fallback: create an object URL for preview (demo only)
      const url = URL.createObjectURL(file);
      // If your app supports updateProfile differently, plug it in
      // For demo, we mutate current user's avatar locally (this won't persist across refresh)
      (cu as any).avatarUrl = url;
      // force rerender by updating editForm
      setEditForm((s) => ({ ...s }));
    }
  };

  const handleUseClerkImage = () => {
    if (typeof updateProfile === "function") {
      updateProfile?.({ avatarUrl: clerkUser?.imageUrl });
    } else {
      (cu as any).avatarUrl = clerkUser?.imageUrl;
      setEditForm((s) => ({ ...s }));
    }
  };

  const handleUsernameChange = (newUsername: string) => {
    // Check if username is unique (demo: just check against existing users)
    const isUnique = !appState.users.some((u: any) => u.username === newUsername && u.id !== cu.id);
    if (!isUnique) {
      alert("Username already taken. Please choose a different one.");
      return;
    }
    setEditForm({ ...editForm, username: newUsername });
  };

  const handleSaveProfile = () => {
    // Build payload mapping 'link' -> 'links' (server expects array)
    const payload: any = {
      name: editForm.name,
      username: editForm.username,
      bio: editForm.bio,
    };
    if (editForm.link) payload.links = [editForm.link];

    if (typeof updateProfile === "function") {
      updateProfile?.(payload as any);
    } else {
      // local fallback: update cu fields (demo only)
      (cu as any).name = editForm.name;
      (cu as any).username = editForm.username;
      (cu as any).bio = editForm.bio;
      (cu as any).links = editForm.link ? [editForm.link] : [];
    }
    setShowEdit(false);
  };

  const handleRemoveSaved = (postId: string) => {
    setSavedPosts((prev) => prev.filter((p) => p !== postId));
  };

  const handleUnarchive = (postId: string) => {
    setArchivedPosts((a) => a.filter((p) => p !== postId));
  };

  const handleLogout = async () => {
    // Attempt appState logout first
    if (typeof logout === "function") {
      try {
        await logout();
        // optionally redirect or show toast; for demo, close confirm
        setShowLogoutConfirm(false);
        return;
      } catch (e) {
        console.warn("logout failed:", e);
      }
    }
    // Fallbacks: try Clerk signOut if available
    try {
      const maybeClerk = (appState as any).clerk;
      if (maybeClerk && typeof maybeClerk.signOut === "function") {
        await maybeClerk.signOut();
        setShowLogoutConfirm(false);
        return;
      }
    } catch (e) {
      // ignore
    }
    // final fallback: console and close modal
    console.log("Logout - no logout function provided. Implement appState.logout or Clerk signOut.");
    setShowLogoutConfirm(false);
  };

  const saveNotifState = (next: typeof notifState) => {
    setNotifState(next);
    try {
      localStorage.setItem("circlo_notif", JSON.stringify(next));
    } catch (e) {}
  };

  const savePrefsState = (next: typeof prefsState) => {
    setPrefsState(next);
    try {
      localStorage.setItem("circlo_prefs", JSON.stringify(next));
    } catch (e) {}
  };

  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editPostText, setEditPostText] = useState('');
  // per-post menu state and light local handlers for the new options
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [postLifespans, setPostLifespans] = useState<Record<string, number>>({});

  const togglePostMenu = (postId: string) => setOpenMenuPostId((prev) => (prev === postId ? null : postId));
  const closePostMenu = () => setOpenMenuPostId(null);

  // Close menu on outside click or Escape key
  useEffect(() => {
    if (!openMenuPostId) return;
    const onDocClick = () => {
      closePostMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePostMenu();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey as any);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey as any);
    };
  }, [openMenuPostId]);

  // modal-based delete flow instead of confirm()
  const [pendingDeletePost, setPendingDeletePost] = useState<any | null>(null);

  const confirmDeletePost = (post: any) => {
    // open modal
    setPendingDeletePost(post);
    closePostMenu();
  };

  const performDeletePost = async () => {
    if (!pendingDeletePost) return;
    try {
      await postsApi.deletePost(pendingDeletePost._id);
      setPosts((prev) => prev.filter((p) => p._id !== pendingDeletePost._id));
      setPendingDeletePost(null);
    } catch (err) {
      console.error('Failed to delete post', err);
      alert('Failed to delete post');
    }
  };

  // submit edit (used by Edit Post modal Save button)
  const submitEditPost = async () => {
    if (!editingPost) return;
    try {
      const res = await postsApi.updatePost(editingPost._id, { text: editPostText });
      setPosts((prev) => prev.map((p) => (p._id === editingPost._id ? res : p)));
      setEditingPost(null);
    } catch (err) {
      console.error('Failed to update post', err);
      alert('Failed to update post');
    }
  };

  // open edit modal for a post
  const openEditPost = (post: any) => {
    setEditingPost(post);
    setEditPostText(post?.text || '');
    closePostMenu();
  };

  // handle menu options
  const handlePostOption = async (option: string, post: any) => {
    closePostMenu();
    try {
      switch (option) {
        case 'boost':
          setBoostModal({ show: true, post });
          break;
        case 'reframe':
          setReframeModal({ show: true, post });
          break;
        case 'mood':
          setMoodModal({ show: true, post, mood: '' });
          break;
        case 'collab':
          setCollabModal({ show: true, post, collab: '' });
          break;
        case 'remix':
          setRemixModal({ show: true, post, enabled: false });
          break;
        case 'visibility': {
          const vis = prompt('Change visibility (Public / Friends / Private):', 'Public');
          if (vis) alert('Visibility set to: ' + vis);
          break;
        }
        case 'insights':
          alert('View Insights 📊 - coming soon');
          break;
        case 'save':
          if (savedPosts.includes(post._id)) {
            setSavedPosts((s) => s.filter((id) => id !== post._id));
            alert('Removed from board');
          } else {
            setSavedPosts((s) => [post._id, ...s]);
            alert('Saved to board');
          }
          break;
        case 'lifespan': {
          const hours = Number(prompt('Set lifespan in hours (0 to clear):', '24'));
          if (!isNaN(hours) && hours > 0) {
            const expiresAt = Date.now() + hours * 3600 * 1000;
            setPostLifespans((prev) => ({ ...prev, [post._id]: expiresAt }));
            alert('Lifespan set for ' + hours + ' hour(s)');
          } else if (hours === 0) {
            setPostLifespans((prev) => {
              const copy = { ...prev };
              delete copy[post._id];
              return copy;
            });
            alert('Lifespan cleared');
          }
          break;
        }
        case 'edit':
          openEditPost(post);
          break;
        case 'delete':
          confirmDeletePost(post);
          break;
        case 'cancel':
        default:
          break;
      }
    } catch (err) {
      console.error('Post option failed', err);
      alert('Action failed');
    }
  };

  // helper to determine ownership of a post
  const getCurrentUserId = () => clerkUser?.id || (cu as any)?.clerkId || null;
  const isPostOwner = (post: any) => {
    if (!post) return false;
    const authorId = post.authorId || post.userId || post.creatorId || post.author?._id || post.author?.id || post.author?.clerkId || (post.user && (post.user._id || post.user.id));
    const currentId = getCurrentUserId();
    return !!(authorId && currentId && String(authorId) === String(currentId));
  };

  return (
    <>
    <section className="w-full min-h-screen text-white font-[Outfit] relative">
      {/* 🔹 Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-10 border-b border-white/10">
        {/* Profile Avatar */}
        <div className="flex-shrink-0">
          <img
            src={user.avatar}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
          />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col md:flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-2xl font-semibold">{user.username}</h2>
            <div className="flex gap-3 justify-center md:justify-start">
              <button
                onClick={() => setShowEdit(true)}
                className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm font-medium transition"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowArchive(true)}
                className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm font-medium transition"
              >
                View Archive
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 text-sm">
            <div>
              <span className="font-bold">{user.posts}</span> posts
            </div>
            <button
              onClick={() => {
                setFollowersModalTab("followers");
                setShowFollowersModal(true);
              }}
              className="hover:text-purple-400 transition cursor-pointer"
            >
              <span className="font-bold">{user.followers}</span> followers
            </button>
            <button
              onClick={() => {
                setFollowersModalTab("following");
                setShowFollowersModal(true);
              }}
              className="hover:text-purple-400 transition cursor-pointer"
            >
              <span className="font-bold">{user.following}</span> following
            </button>
          </div>

          {/* Name, Bio, and Link */}
          <div className="text-gray-300 text-sm leading-relaxed space-y-1">
            <p className="font-semibold text-white">{editForm.name}</p>
            <p>{editForm.bio}</p>
            <a
              href={editForm.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 hover:underline"
            >
              <LinkIcon size={14} />
              {editForm.link}
            </a>
          </div>
        </div>
      </div>

      {/* 🔹 Tabs */}
      <div className="border-t border-white/10 flex justify-center gap-12 text-gray-400 text-sm font-medium uppercase tracking-wider mt-4">
        <button
          onClick={() => setTab("posts")}
          className={`flex items-center gap-2 py-4 ${
            tab === "posts"
              ? "text-white border-t-2 border-white"
              : "hover:text-white/70"
          }`}
        >
          <Edit3 size={15} />
          Posts
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`flex items-center gap-2 py-4 ${
            tab === "saved"
              ? "text-white border-t-2 border-white"
              : "hover:text-white/70"
          }`}
        >
          <Bookmark size={15} />
          Saved
        </button>
      </div>

      {/* 🔹 Posts Grid */}
      <div className="grid grid-cols-3 gap-1 mt-6">
        {loadingPosts ? (
          <div className="col-span-3 flex items-center justify-center py-8">
            <div className="text-gray-400">Loading posts...</div>
          </div>
        ) : tab === "posts" ? (
          posts.length > 0 ? (
            posts.map((p, i) => {
              const mediaUrl = p.media?.[0]?.url || '';
              const mediaType = p.media?.[0]?.type || 'image'; // 'image' or 'video'
              const isVideo = mediaType.toLowerCase() === 'video' || mediaUrl.toLowerCase().match(/\.(mp4|webm|mov|avi)$/i);
              return (
                <div key={p._id || i} className="relative group overflow-hidden bg-gray-800 aspect-square">
                  {mediaUrl ? (
                    isVideo ? (
                      <video
                        src={mediaUrl}
                        className="object-cover w-full h-full aspect-square group-hover:opacity-70 transition"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={`Post ${i}`}
                        className="object-cover w-full h-full aspect-square group-hover:opacity-70 transition"
                      />
                    )
                  ) : (
                    <div className="w-full h-full aspect-square bg-gray-700 flex items-center justify-center text-gray-400">
                      No media
                    </div>
                  )}
                  {/* Video Badge */}
                  {isVideo && (
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <Video size={12} /> Video
                    </div>
                  )}
                  {/* Lifespan badge if set */}
                  {postLifespans[p._id] && (
                    <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                      Expires in {Math.max(0, Math.ceil((postLifespans[p._id] - Date.now()) / (1000 * 60 * 60)))}h
                    </div>
                  )}

                  {/* Top Right Menu Button - Always Visible */}
                  <div className="absolute top-2 right-2 z-40">
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePostMenu(p._id); }}
                        className="bg-black/40 hover:bg-black/60 p-2 rounded-full transition backdrop-blur-sm"
                        aria-haspopup="menu"
                        aria-expanded={openMenuPostId === p._id}
                        title="Post options"
                      >
                        ⋮
                      </button>

                      {openMenuPostId === p._id && (
                        <div className="absolute right-0 mt-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-1 rounded-lg shadow-2xl text-xs z-50 min-w-[220px]" role="menu">
                          {/* Premium Features Section */}
                          <div className="px-2 pt-2 pb-1">
                            <p className="text-purple-400 text-xs font-semibold px-2 mb-2 opacity-70">Premium Features</p>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('boost', p); }} className="block w-full text-left px-3 py-2 hover:bg-purple-600/30 rounded transition text-purple-300 mb-1">🚀 Boost This Post</button>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('reframe', p); }} className="block w-full text-left px-3 py-2 hover:bg-indigo-600/30 rounded transition text-indigo-300">✨ Reframe with AI</button>
                          </div>

                          {/* Post Settings Section */}
                          <hr className="my-2 border-white/5" />
                          <div className="px-2 pb-1">
                            <p className="text-blue-400 text-xs font-semibold px-2 mb-2 opacity-70">Post Settings</p>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('mood', p); }} className="block w-full text-left px-3 py-2 hover:bg-blue-600/20 rounded transition text-blue-300 mb-1">🎭 Add Mood Tag</button>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('collab', p); }} className="block w-full text-left px-3 py-2 hover:bg-cyan-600/20 rounded transition text-cyan-300 mb-1">🤝 Add Collaborator</button>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('remix', p); }} className="block w-full text-left px-3 py-2 hover:bg-pink-600/20 rounded transition text-pink-300 mb-1">🎨 Allow Remixing</button>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('visibility', p); }} className="block w-full text-left px-3 py-2 hover:bg-green-600/20 rounded transition text-green-300">🌍 Change Visibility</button>
                          </div>

                          {/* Analytics & Actions */}
                          <hr className="my-2 border-white/5" />
                          <div className="px-2 pb-1">
                            <p className="text-yellow-400 text-xs font-semibold px-2 mb-2 opacity-70">Analytics</p>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('insights', p); }} className="block w-full text-left px-3 py-2 hover:bg-yellow-600/20 rounded transition text-yellow-300 mb-1">📊 View Insights</button>
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('lifespan', p); }} className="block w-full text-left px-3 py-2 hover:bg-orange-600/20 rounded transition text-orange-300">⏳ Set Lifespan</button>
                          </div>

                          {/* Organization */}
                          <hr className="my-2 border-white/5" />
                          <div className="px-2 pb-1">
                            <button onClick={(e) => { e.stopPropagation(); handlePostOption('save', p); }} className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded transition text-white/80 mb-1">📌 Save to Board</button>
                            {isPostOwner(p) && (
                              <button onClick={(e) => { e.stopPropagation(); handlePostOption('edit', p); }} className="block w-full text-left px-3 py-2 hover:bg-blue-600/20 rounded transition text-blue-200">✏️ Edit</button>
                            )}
                          </div>

                          {/* Danger Zone - Always Show Delete for Owners */}
                          {isPostOwner(p) && (
                            <>
                              <hr className="my-2 border-white/5" />
                              <div className="px-2 pb-2">
                                <button onClick={(e) => { e.stopPropagation(); handlePostOption('delete', p); }} className="block w-full text-left px-3 py-2 hover:bg-red-600/30 rounded transition text-red-400 font-medium">🗑️ Delete Post</button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Likes Display & Action Buttons - Show on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition bg-black/40 text-sm font-semibold">
                    <div>❤️ {p.likeCount || 0} likes</div>
                    
                    {/* Action Buttons Row */}
                    <div className="flex gap-2 flex-wrap justify-center">
                      {/* Save Button */}
                      <button
                        onClick={() => {
                          if (savedPosts.includes(p._id)) {
                            handleRemoveSaved(p._id);
                            alert('Removed from board');
                          } else {
                            setSavedPosts((s) => [p._id, ...s]);
                            alert('Saved to board');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md transition font-medium text-xs ${
                          savedPosts.includes(p._id)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title={savedPosts.includes(p._id) ? 'Remove from board' : 'Save to board'}
                      >
                        {savedPosts.includes(p._id) ? '💾 Saved' : '📌 Save'}
                      </button>

                      {/* Edit Button - Only for Owner */}
                      {isPostOwner(p) && (
                        <button
                          onClick={() => openEditPost(p)}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition text-white font-medium text-xs"
                          title="Edit post"
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {/* Delete Button - Only for Owner */}
                      {isPostOwner(p) && (
                        <button
                          onClick={() => confirmDeletePost(p)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition text-white font-medium text-xs"
                          title="Delete post"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 flex items-center justify-center py-8">
              <div className="text-gray-400">No posts yet</div>
            </div>
          )
        ) : (
          // saved tab
          savedPosts.length > 0 ? (
            savedPosts.map((postId, i) => {
              const post = posts.find((p) => p._id === postId);
              const mediaUrl = post?.media?.[0]?.url || '';
              const mediaType = post?.media?.[0]?.type || 'image';
              const isVideo = mediaType.toLowerCase() === 'video' || mediaUrl.toLowerCase().match(/\.(mp4|webm|mov|avi)$/i);
              return (
                <div key={postId} className="relative group overflow-hidden bg-gray-800 aspect-square">
                  {mediaUrl ? (
                    isVideo ? (
                      <video
                        src={mediaUrl}
                        className="object-cover w-full h-full aspect-square group-hover:opacity-70 transition"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={`Saved ${i}`}
                        className="object-cover w-full h-full aspect-square"
                      />
                    )
                  ) : (
                    <div className="w-full h-full aspect-square bg-gray-700 flex items-center justify-center text-gray-400">
                      No media
                    </div>
                  )}
                  {/* Video Badge */}
                  {isVideo && (
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <Video size={12} /> Video
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition bg-black/40 text-sm font-semibold">
                    <button
                      onClick={() => handleRemoveSaved(postId)}
                      className="bg-white/10 px-3 py-1 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // empty saved
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center bg-white/5 text-gray-400 p-6">
                No saved posts
              </div>
            ))
          )
        )}
      </div>

      {/* ⚙️ Edit Profile Modal */}
      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="Edit Profile">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <img
                src={user.avatar}
                alt="Current Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-pink-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleUploadAvatar(file);
                    };
                    input.click();
                  }}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Upload New
                </button>
                <button
                  onClick={handleUseClerkImage}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Use Clerk Image
                </button>
              </div>
            </div>

            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Name"
              className="w-full p-2 rounded-lg bg-white/10 outline-none"
            />
            <input
              value={editForm.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Username"
              className="w-full p-2 rounded-lg bg-white/10 outline-none"
            />
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Bio"
              className="w-full p-2 rounded-lg bg-white/10 outline-none resize-none"
            />
            <input
              value={editForm.link}
              onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
              placeholder="Website / Link"
              className="w-full p-2 rounded-lg bg-white/10 outline-none"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                handleSaveProfile();
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* ⚙️ Settings Drawer */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-[#1a1a1a] w-80 h-full p-6 relative animate-slideLeft border-l border-white/10">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-6">Settings</h3>

            <ul className="space-y-3 text-sm">
              <SettingItem
                icon={<UserCog />}
                label="Account"
                onClick={() => {
                  setShowSettings(false);
                  setShowAccount(true);
                }}
              />
              <SettingItem
                icon={<Bell />}
                label="Notifications"
                onClick={() => {
                  setShowSettings(false);
                  setShowNotifications(true);
                }}
              />
              <SettingItem
                icon={<Lock />}
                label="Privacy & Security"
                onClick={() => {
                  setShowSettings(false);
                  setShowPrivacy(true);
                }}
              />
              <SettingItem
                icon={<Bookmark />}
                label="Saved Posts"
                onClick={() => {
                  setShowSettings(false);
                  setShowSavedPosts(true);
                }}
              />
              <SettingItem
                icon={<Settings />}
                label="Preferences"
                onClick={() => {
                  setShowSettings(false);
                  setShowPreferences(true);
                }}
              />
              <SettingItem
                icon={<LogOut />}
                label="Log Out"
                highlight
                onClick={() => {
                  setShowSettings(false);
                  setShowLogoutConfirm(true);
                }}
              />
            </ul>
          </div>

          <style>{`
            @keyframes slideLeft {
              0% { transform: translateX(100%); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
            .animate-slideLeft {
              animation: slideLeft 0.4s ease forwards;
            }
          `}</style>
        </div>
      )}

      {/* Account Modal */}
      {showAccount && (
        <Modal onClose={() => setShowAccount(false)} title="Account">
          <div className="space-y-4 text-sm">
            <p>
              <strong>Email:</strong>{" "}
              {clerkUser?.primaryEmailAddress?.emailAddress || "Not set"}
            </p>
            <p>
              <strong>Username:</strong> {clerkUser?.username || "Not set"}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {clerkUser?.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString() : "Unknown"}
            </p>
            <p>
              <strong>Profile Name:</strong> {editForm.name}
            </p>
            <p>
              <strong>Username:</strong> {editForm.username}
            </p>
            <p>
              <strong>Bio:</strong> {editForm.bio}
            </p>
            <p>
              <strong>Link:</strong>{" "}
              <a href={editForm.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                {editForm.link}
              </a>
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAccount(false);
                  setShowEdit(true);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setShowAccount(false);
                }}
                className="w-full bg-white/5 px-6 py-2 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <Modal onClose={() => setShowNotifications(false)} title="Notifications">
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Push Notifications</span>
              <input
                type="checkbox"
                checked={notifState.push}
                onChange={(e) => saveNotifState({ ...notifState, push: e.target.checked })}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Email Alerts</span>
              <input
                type="checkbox"
                checked={notifState.email}
                onChange={(e) => saveNotifState({ ...notifState, email: e.target.checked })}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Message Requests</span>
              <input
                type="checkbox"
                checked={notifState.msgRequests}
                onChange={(e) => saveNotifState({ ...notifState, msgRequests: e.target.checked })}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Post Likes</span>
              <input
                type="checkbox"
                checked={notifState.postLikes}
                onChange={(e) => saveNotifState({ ...notifState, postLikes: e.target.checked })}
                className="rounded"
              />
            </label>

            <div className="flex gap-2">
              <button onClick={() => setShowNotifications(false)} className="w-full bg-white/5 px-6 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Privacy & Security Modal */}
      {showPrivacy && (
        <Modal onClose={() => setShowPrivacy(false)} title="Privacy & Security">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Profile Visibility</label>
              <select className="w-full p-2 rounded-lg bg-white/10 outline-none" defaultValue="Public">
                <option>Public</option>
                <option>Friends</option>
                <option>Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Post Visibility</label>
              <select className="w-full p-2 rounded-lg bg-white/10 outline-none" defaultValue="Public">
                <option>Public</option>
                <option>Friends</option>
                <option>Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data Sharing</label>
              <select className="w-full p-2 rounded-lg bg-white/10 outline-none" defaultValue="Limited">
                <option>Limited</option>
                <option>Standard</option>
                <option>Full</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowPrivacy(false)} className="w-full bg-white/5 px-6 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Saved Posts Modal */}
      {showSavedPosts && (
        <Modal onClose={() => setShowSavedPosts(false)} title="Saved Posts">
          <div className="space-y-4">
            {savedPosts.length === 0 ? (
              <p className="text-gray-400 text-sm">You have no saved posts.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {savedPosts.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt={`Saved ${i}`} className="w-full h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => handleRemoveSaved(p)}
                      className="absolute top-2 right-2 bg-black/40 px-2 py-1 rounded text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowSavedPosts(false)} className="w-full bg-white/5 px-6 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <Modal onClose={() => setShowPreferences(false)} title="Preferences">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={prefsState.theme}
                onChange={(e) => savePrefsState({ ...prefsState, theme: e.target.value })}
                className="w-full p-2 rounded-lg bg-white/10 outline-none"
              >
                <option>Dark</option>
                <option>Light</option>
                <option>Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={prefsState.language}
                onChange={(e) => savePrefsState({ ...prefsState, language: e.target.value })}
                className="w-full p-2 rounded-lg bg-white/10 outline-none"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <label className="flex items-center justify-between">
              <span>Show Online Status</span>
              <input
                type="checkbox"
                checked={prefsState.showOnline}
                onChange={(e) => savePrefsState({ ...prefsState, showOnline: e.target.checked })}
                className="rounded"
              />
            </label>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowPreferences(false)} className="w-full bg-white/5 px-6 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Archive Modal */}
      {showArchive && (
        <Modal onClose={() => setShowArchive(false)} title="Archive">
          <div className="space-y-4">
            {archivedPosts.length === 0 ? (
              <p className="text-gray-400">No archived posts yet — archive posts from your feed.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {archivedPosts.map((postId, i) => {
                  const post = posts.find(p => p._id === postId);
                  const mediaUrl = post?.media?.[0]?.url || '';
                  const mediaType = post?.media?.[0]?.type || 'image';
                  const isVideo = mediaType.toLowerCase() === 'video' || mediaUrl.toLowerCase().match(/\.(mp4|webm|mov|avi)$/i);
                  return (
                    <div key={postId} className="relative bg-gray-800 rounded-lg overflow-hidden">
                      {mediaUrl ? (
                        isVideo ? (
                          <video
                            src={mediaUrl}
                            className="w-full h-20 object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img src={mediaUrl} alt={`Archived ${i}`} className="w-full h-20 object-cover" />
                        )
                      ) : (
                        <div className="w-full h-20 bg-gray-700 flex items-center justify-center text-gray-400">
                          No media
                        </div>
                      )}
                      {isVideo && (
                        <div className="absolute top-1 right-1 bg-black/60 px-1 py-0.5 rounded text-xs">
                          <Video size={10} className="inline" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                        <button onClick={() => handleUnarchive(postId)} className="bg-white/10 px-2 py-1 rounded text-xs">Unarchive</button>
                        <button onClick={() => setArchivedPosts((a) => a.filter((x) => x !== postId))} className="bg-red-600/20 px-2 py-1 rounded text-xs">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowArchive(false)} className="w-full bg-white/5 px-6 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <Modal onClose={() => setShowLogoutConfirm(false)} title="Confirm Logout">
          <div className="space-y-4">
            <p>Are you sure you want to log out?</p>
            <div className="flex gap-2">
              <button onClick={handleLogout} className="w-full bg-red-600 px-6 py-2 rounded-lg">Log Out</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full bg-white/5 px-6 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <Modal onClose={() => setEditingPost(null)} title="Edit Post">
          <div className="space-y-4">
            <textarea value={editPostText} onChange={(e) => setEditPostText(e.target.value)} className="w-full p-2 rounded bg-white/10" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingPost(null)} className="bg-white/5 px-4 py-2 rounded">Cancel</button>
              <button onClick={submitEditPost} className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Post Confirm Modal */}
      {pendingDeletePost && (
        <Modal onClose={() => setPendingDeletePost(null)} title="Delete Post">
          <div className="space-y-4">
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingDeletePost(null)} className="bg-white/5 px-4 py-2 rounded">Cancel</button>
              <button onClick={performDeletePost} className="bg-red-600 px-4 py-2 rounded text-white">Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Followers/Following Modal */}
      {showFollowersModal && currentUser && (
        <FollowersFollowingModal
          userId={currentUser.clerkId}
          initialTab={followersModalTab}
          onClose={() => setShowFollowersModal(false)}
        />
      )}
    </section>

    {/* Premium Feature Modals - Rendered Outside Section for Proper Fixed Positioning */}
    {boostModal.show && (
      <Modal onClose={() => setBoostModal({ show: false, post: null })} title="🚀 Boost Your Post">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 rounded-lg border border-purple-500/20">
            <h4 className="font-semibold mb-2">Boost Your Post</h4>
            <p className="text-sm text-gray-300 mb-4">Increase visibility with our premium boost service. Get more reach, engagement, and followers!</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Boost Duration:</span><span className="font-semibold">24 Hours</span></div>
              <div className="flex justify-between"><span>Estimated Reach:</span><span className="font-semibold">10K+ users</span></div>
              <div className="flex justify-between"><span>Price:</span><span className="font-semibold text-purple-400">$9.99</span></div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setBoostModal({ show: false, post: null })} className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition">Cancel</button>
            <button onClick={() => { alert('Boost feature coming soon! 🚀'); setBoostModal({ show: false, post: null }); }} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold">Boost Now</button>
          </div>
        </div>
      </Modal>
    )}

    {reframeModal.show && (
      <Modal onClose={() => setReframeModal({ show: false, post: null })} title="✨ Reframe with AI">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 p-4 rounded-lg border border-indigo-500/20">
            <h4 className="font-semibold mb-2">AI-Powered Caption Enhancement</h4>
            <p className="text-sm text-gray-300 mb-4">Let our AI rewrite your caption to be more engaging and reach a wider audience.</p>
            <div className="bg-black/30 p-3 rounded-lg text-sm">
              <p className="text-gray-400 mb-2">Original Caption:</p>
              <p className="text-white">{reframeModal.post?.text || "No caption provided"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setReframeModal({ show: false, post: null })} className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition">Cancel</button>
            <button onClick={() => { alert('AI Reframe feature coming soon! ✨'); setReframeModal({ show: false, post: null }); }} className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition font-semibold">Generate Variations</button>
          </div>
        </div>
      </Modal>
    )}

    {moodModal.show && (
      <Modal onClose={() => setMoodModal({ show: false, post: null, mood: '' })} title="🎭 Add Mood Tag">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">How are you feeling with this post?</p>
          <div className="grid grid-cols-2 gap-2">
            {['Happy 😊', 'Chill 😌', 'Energetic ⚡', 'Thoughtful 🤔', 'Inspired 💡', 'Creative 🎨'].map((mood) => (
              <button
                key={mood}
                onClick={() => setMoodModal({ ...moodModal, mood })}
                className={`p-3 rounded-lg transition border-2 text-sm font-medium ${
                  moodModal.mood === mood
                    ? 'bg-purple-600/30 border-purple-500'
                    : 'bg-white/5 border-white/10 hover:border-purple-500/50'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMoodModal({ show: false, post: null, mood: '' })} className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition">Cancel</button>
            <button onClick={() => { if(moodModal.mood) { alert(`Mood set: ${moodModal.mood}`); setMoodModal({ show: false, post: null, mood: '' }); } }} className="flex-1 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50" disabled={!moodModal.mood}>Set Mood</button>
          </div>
        </div>
      </Modal>
    )}

    {collabModal.show && (
      <Modal onClose={() => setCollabModal({ show: false, post: null, collab: '' })} title="🤝 Add Collaborator">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">Add a collaborator to this post</p>
          <input
            type="text"
            placeholder="Enter username or email..."
            value={collabModal.collab}
            onChange={(e) => setCollabModal({ ...collabModal, collab: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <div className="bg-white/5 p-3 rounded-lg text-sm text-gray-300">
            <p className="mb-2 font-medium">Collaborators will be able to:</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Edit post caption</li>
              <li>✓ Add media</li>
              <li>✓ View analytics</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCollabModal({ show: false, post: null, collab: '' })} className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition">Cancel</button>
            <button onClick={() => { if(collabModal.collab) { alert(`Collaborator added: ${collabModal.collab}`); setCollabModal({ show: false, post: null, collab: '' }); } }} className="flex-1 bg-cyan-600 px-4 py-2 rounded-lg hover:bg-cyan-700 transition font-semibold disabled:opacity-50" disabled={!collabModal.collab}>Add Collaborator</button>
          </div>
        </div>
      </Modal>
    )}

    {remixModal.show && (
      <Modal onClose={() => setRemixModal({ show: false, post: null, enabled: false })} title="🎨 Remix Settings">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 p-4 rounded-lg border border-pink-500/20">
            <h4 className="font-semibold mb-2">Allow Remixing</h4>
            <p className="text-sm text-gray-300">Let other creators build on your work and create remixes of your content.</p>
          </div>
          
          <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={remixModal.enabled}
              onChange={(e) => setRemixModal({ ...remixModal, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="font-medium">Enable Remixing</span>
          </label>

          {remixModal.enabled && (
            <div className="bg-white/5 p-3 rounded-lg text-sm space-y-2">
              <p className="font-medium">Remix Settings:</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Allow credit required</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Allow commercial use</span>
              </label>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setRemixModal({ show: false, post: null, enabled: false })} className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition">Cancel</button>
            <button onClick={() => { alert(`Remixing ${remixModal.enabled ? 'enabled' : 'disabled'}`); setRemixModal({ show: false, post: null, enabled: false }); }} className="flex-1 bg-pink-600 px-4 py-2 rounded-lg hover:bg-pink-700 transition font-semibold">Save Settings</button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
}

/* ---------------------------
   Helper UI components
   --------------------------- */

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
      <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-lg text-white relative z-[10000]">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        {title && <h3 className="text-xl font-semibold mb-4 text-center">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}

function SettingItem({
  icon,
  label,
  highlight,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition ${
        highlight
          ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
          : "bg-white/5 hover:bg-white/10 text-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
      <ChevronRight size={16} />
    </button>
  );
}
