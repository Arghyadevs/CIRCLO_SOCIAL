// src/components/Header.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationsSection from "./NotificationsSection";

export default function Header() {
  const navigate = useNavigate();
  const { isSignedIn, user, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent shadow-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10 py-3">
        {/* 🌀 Circlo Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <div className="relative flex-shrink-0 h-20 w-20 md:h-28 md:w-28 transition-transform hover:scale-105 drop-shadow-sm dark:drop-shadow-lg">
            <img
              src="/Public/Circlo_tp.png"
              alt="Circlo Logo"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* 🔐 Authentication Section */}
        <div className="flex items-center gap-4 md:gap-6">
          <ThemeToggle />

          {isSignedIn ? (
            <>
              <NotificationsSection />
              {/* User avatar + sign out */}
              <div className="relative group">
                <button
                  className="flex items-center gap-2"
                  title="Account"
                >
                  <img
                    src={user?.photoURL || "/Public/Circlo_tp.png"}
                    alt={user?.displayName || "User"}
                    className="w-10 h-10 rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-all object-cover"
                  />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 px-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
                </svg>
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
