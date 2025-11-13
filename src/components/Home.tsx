import { useState, lazy, Suspense, useEffect } from "react";
import {
  Home as HomeIcon,
  Search,
  Compass,
  Video,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import UserProfileModal from "./home2/UserProfileModal";
import { ensureFirebaseAuth } from "../lib/firebase";

// 🧩 Lazy load all Circlo dashboard sections
const FriendsSection = lazy(() => import("./home2/FriendsSection"));
const ProfileSection = lazy(() => import("./home2/ProfileSection"));
// Replaced MessagesSection with ChatSection (Firestore chat)
const ChatSection = lazy(() => import("./ChatSection"));
const NotificationsSection = lazy(() => import("./home2/NotificationsSection"));
const CreatePostSection = lazy(() => import("./home2/CreatePostSection"));
const FeedSection = lazy(() => import("./home2/FeedSection"));
const StoriesSection = lazy(() => import("./home2/StoriesSection"));
const ReelsSection = lazy(() => import("./home2/ReelsSection"));

export default function Home() {
  type Tab =
    | "home"
    | "search"
    | "explore"
    | "reels"
    | "create"
    | "messages"
    | "notifications"
    | "profile";

  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  // New: selected chat partner passed into ChatSection
  const [chatPartnerId, setChatPartnerId] = useState<string | undefined>(undefined);
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);

  const [darkTheme, setDarkTheme] = useState(false);

  const { getToken, isSignedIn } = useAuth();

  // Bridge Clerk to Firebase Auth
  useEffect(() => {
    (async () => {
      if (!isSignedIn) return;
      try {
        // Use the Clerk JWT template named "firebase" (configure in Clerk Dashboard)
        const token = await getToken({ template: "firebase" });
        if (!token) return;
        const base = (import.meta.env.VITE_API_URL?.replace(/\/$/, "")) || "http://localhost:4000/api";
        await ensureFirebaseAuth(`${base}/firebase/custom-token`, token);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Firebase custom token sign-in failed", e);
      }
    })();
  }, [isSignedIn, getToken]);

  // Listen for global chat open events from anywhere in the app
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ userId?: string }>;
      if (ce.detail?.userId) {
        setChatPartnerId(ce.detail.userId);
        setActiveTab("messages");
      }
    };
    window.addEventListener("circlo:openChat", handler as EventListener);
    return () => window.removeEventListener("circlo:openChat", handler as EventListener);
  }, []);

  // Listen for profile modal open events
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ userId?: string }>;
      if (ce.detail?.userId) {
        setProfileModalUserId(ce.detail.userId);
      }
    };
    window.addEventListener("circlo:openProfile", handler as EventListener);
    return () => window.removeEventListener("circlo:openProfile", handler as EventListener);
  }, []);

  // Typed navigation items to avoid TS inference issues when mapping
  const navItems: Array<[Tab, React.ComponentType<any>]> = [
    ["home", HomeIcon],
    ["search", Search],
    ["explore", Compass],
    ["reels", Video],
    ["create", PlusSquare],
    ["messages", MessageCircle],
    ["notifications", Heart],
    ["profile", User],
  ];

  /* ---------------------------------
     🔧 Section Renderer
  --------------------------------- */
  const renderSection = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="flex flex-col lg:flex-row justify-center gap-6 max-w-6xl mx-auto">
            <div className="flex-1 max-w-2xl">
              <Suspense fallback={<LoadingPlaceholder />}>
                <StoriesSection />
                <FeedSection key={feedRefreshKey} />
              </Suspense>
            </div>
            <div className="hidden lg:block w-80 space-y-8 sticky top-10">
              <Suspense fallback={<LoadingPlaceholder />}>
                <FriendsSection />
              </Suspense>
            </div>
            {profileModalUserId && (
              <UserProfileModal userId={profileModalUserId} onClose={() => setProfileModalUserId(null)} />
            )}
          </div>
        );

      case "search":
        return (
          <SimpleCard title="Search Circlo 🔍">
            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for users, posts, or topics..."
                  className="w-full px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <Search size={20} className="absolute right-4 top-3.5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Try searching for <span className="font-semibold text-purple-600 dark:text-purple-400">#hashtags</span>, <span className="font-semibold text-purple-600 dark:text-purple-400">@usernames</span>, or <span className="font-semibold text-purple-600 dark:text-purple-400">interests</span>.
              </p>
            </div>
          </SimpleCard>
        );

      case "explore":
        return (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 text-transparent bg-clip-text mb-2">Explore Trends</h2>
              <p className="text-gray-600 dark:text-gray-400">Discover what's trending around Circlo 🌍</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-3xl shadow-lg cursor-pointer border border-white/20 dark:border-purple-500/20 hover:border-purple-500/50 transition-all duration-500"
                >
                  <img
                    src={`https://source.unsplash.com/random/400x400?sig=${i}&social`}
                    alt="Explore"
                    className="object-cover w-full h-56 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">#Trending {i + 1}</h3>
                      <p className="text-gray-200 text-sm">{Math.floor(Math.random() * 10000) + 1000} posts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "reels":
        return (
          <div className="max-w-5xl mx-auto animate-fadeIn py-6">
            <Suspense fallback={<LoadingPlaceholder />}>
              <ReelsSection />
            </Suspense>
            {profileModalUserId && (
              <UserProfileModal userId={profileModalUserId} onClose={() => setProfileModalUserId(null)} />
            )}
          </div>
        );

      case "create":
        return (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <Suspense fallback={<LoadingPlaceholder />}>
              <CreatePostSection
                onPostCreated={() => {
                  setFeedRefreshKey(prev => prev + 1);
                  setActiveTab("home");
                }}
              />
            </Suspense>
            {profileModalUserId && (
              <UserProfileModal userId={profileModalUserId} onClose={() => setProfileModalUserId(null)} />
            )}
          </div>
        );

      case "messages":
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ChatSection initialPartnerId={chatPartnerId} />
            {profileModalUserId && (
              <UserProfileModal userId={profileModalUserId} onClose={() => setProfileModalUserId(null)} />
            )}
          </Suspense>
        );

      case "notifications":
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <NotificationsSection />
            {profileModalUserId && (
              <UserProfileModal userId={profileModalUserId} onClose={() => setProfileModalUserId(null)} />
            )}
          </Suspense>
        );

      case "profile":
        return (
          <Suspense fallback={<LoadingPlaceholder />}>
            <ProfileSection />
            {profileModalUserId && (
              <UserProfileModal userId={profileModalUserId} onClose={() => setProfileModalUserId(null)} />
            )}
          </Suspense>
        );

      default:
        return null;
    }
  };

  /* ---------------------------------
     🧩 Main Layout
  --------------------------------- */
  return (
    <div
      className={`min-h-screen font-[Outfit] transition-colors duration-700 ${
        darkTheme
          ? "bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900"
          : "bg-gradient-to-br from-white via-purple-50 to-blue-50"
      }`}
    >
      {/* 🔗 Top Bar with Clerk Controls */}
      <div className={`sticky top-0 z-40 border-b transition-all duration-500 backdrop-blur-xl ${
        darkTheme 
          ? "bg-gray-950/80 border-gray-800/50" 
          : "bg-white/80 border-gray-200/50"
      }`}>
        <div className="flex items-center justify-between px-6 py-1 max-w-full">
          {/* Logo */}
          <img
            src="/Public/Circlo_tp.png"
            alt="Circlo Logo"
            className="h-20 w-auto hover:opacity-80 transition-opacity duration-300"
          />

          {/* Center Navigation - Desktop */}
          <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-white/50 to-purple-50/50 dark:from-white/5 dark:to-purple-500/5 p-1 rounded-full border border-white/20 dark:border-purple-500/20">
            {navItems.slice(0, 5).map(([tab, Icon]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === tab
                    ? darkTheme
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-400/30"
                    : darkTheme
                    ? "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium hidden xl:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkTheme((prev) => !prev)}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkTheme
                  ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 text-yellow-400"
                  : "bg-gradient-to-br from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-600"
              }`}
              title="Toggle Theme"
            >
              {darkTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      "w-10 h-10 rounded-full border-2 border-purple-400/50 shadow-lg hover:shadow-xl transition-all hover:border-purple-500",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* 🧭 Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between w-72 fixed h-screen left-0 top-16 z-30 transition-all duration-500 ${
          darkTheme 
            ? "bg-gradient-to-b from-gray-950/50 to-gray-900/30 border-r border-gray-800/30 backdrop-blur-sm" 
            : "bg-gradient-to-b from-white/50 to-purple-50/30 border-r border-gray-200/30 backdrop-blur-sm"
        }`}
      >
        <div className="flex flex-col space-y-8 p-6">
          {/* Navigation */}
          <nav className="flex flex-col space-y-2">
            <p className={`text-xs font-bold uppercase tracking-widest px-3 mb-2 ${
              darkTheme ? "text-gray-500" : "text-gray-400"
            }`}>
              Main Menu
            </p>
            {navItems.map(([tab, Icon]) => (
              <SidebarItem
                key={tab}
                icon={<Icon size={20} />}
                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                theme={darkTheme}
              />
            ))}
          </nav>

          {/* Quick Actions */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            darkTheme
              ? "bg-gradient-to-br from-purple-950/40 to-blue-950/40 border-purple-500/20 hover:border-purple-500/40"
              : "bg-gradient-to-br from-purple-100/40 to-blue-100/40 border-purple-300/30 hover:border-purple-300/60"
          }`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
              darkTheme ? "text-purple-400" : "text-purple-600"
            }`}>
              Quick Actions
            </p>
            <button className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all mb-2 ${
              darkTheme
                ? "bg-purple-600/30 hover:bg-purple-600/50 text-purple-200"
                : "bg-purple-200/50 hover:bg-purple-300/50 text-purple-700"
            }`}>
              + Create Post
            </button>
            <button className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              darkTheme
                ? "bg-blue-600/30 hover:bg-blue-600/50 text-blue-200"
                : "bg-blue-200/50 hover:bg-blue-300/50 text-blue-700"
            }`}>
              👥 Find Friends
            </button>
          </div>
        </div>

        <div
          className={`text-xs mt-auto text-center pb-4 px-3 ${
            darkTheme ? "text-gray-500" : "text-gray-600"
          }`}
        >
          © {new Date().getFullYear()} Circlo • v1.0
        </div>
      </aside>

      {/* 🧱 Main Content */}
      <main className="flex-1 md:ml-72 py-8 px-4 pb-24 md:pb-10 transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          {renderSection()}
        </div>
      </main>

      {/* 📱 Mobile Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t transition-all duration-500 backdrop-blur-xl z-40 safe-area-inset-bottom ${
        darkTheme
          ? "bg-gray-950/80 border-gray-800/50"
          : "bg-white/80 border-gray-200/50"
      }`}>
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.slice(0, 5).map(([tab, Icon]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 group ${
                activeTab === tab
                  ? darkTheme
                    ? 'text-purple-400'
                    : 'text-purple-600'
                  : darkTheme
                  ? 'text-gray-500 group-hover:text-gray-300'
                  : 'text-gray-500 group-hover:text-gray-700'
              }`}
              aria-label={tab.charAt(0).toUpperCase() + tab.slice(1)}
            >
              <div className={`p-2 rounded-xl transition-all ${
                activeTab === tab
                  ? darkTheme
                    ? "bg-purple-600/30"
                    : "bg-purple-200/50"
                  : "bg-transparent group-hover:" + (darkTheme ? "bg-white/5" : "bg-white/30")
              }`}>
                <Icon size={22} strokeWidth={activeTab === tab ? 2.5 : 2} />
              </div>
              <span className="text-xs font-semibold">{tab === "reels" ? "Reels" : tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ✨ Animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInFromLeft {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
        .animate-slideInFromLeft { animation: slideInFromLeft 0.5s ease forwards; }
      `}</style>
    </div>
  );
}

/* 🧩 Reusable Components */

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  theme,
}: {
  icon: JSX.Element;
  label: string;
  active?: boolean;
  onClick?: () => void;
  theme: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full text-left rounded-xl px-4 py-3 transition-all duration-300 group ${
        active
          ? theme
            ? "bg-gradient-to-r from-purple-600/40 to-purple-700/40 text-purple-200 font-semibold shadow-lg shadow-purple-500/20 border border-purple-500/30"
            : "bg-gradient-to-r from-purple-200/60 to-purple-300/40 text-purple-900 font-semibold shadow-lg shadow-purple-300/20 border border-purple-300/50"
          : theme
          ? "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
          : "text-gray-600 hover:text-purple-700 hover:bg-white/40 border border-transparent"
      }`}
    >
      <div className={`transition-transform duration-300 ${
        active ? "scale-110" : "group-hover:scale-105"
      }`}>
        {icon}
      </div>
      <span className="font-medium tracking-wide">{label}</span>
      {active && (
        <div className={`ml-auto w-2 h-2 rounded-full ${
          theme ? "bg-purple-400" : "bg-purple-600"
        }`} />
      )}
    </button>
  );
}

function SimpleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-900/80 dark:via-purple-900/20 dark:to-blue-900/20 p-8 rounded-3xl shadow-xl border border-white/60 dark:border-purple-500/20 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 text-transparent bg-clip-text">
        {title}
      </h2>
      <div className="text-gray-700 dark:text-gray-200">
        {children}
      </div>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="text-center py-16 animate-pulse">
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 animate-spin" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Circlo…</p>
    </div>
  );
}

