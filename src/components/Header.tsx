// src/components/Header.tsx
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import ThemeToggle from "./ThemeToggle";
import NotificationsSection from "./NotificationsSection";

export default function Header() {
  const navigate = useNavigate();

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
          <SignedIn>
            <NotificationsSection />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-3">
              {/* Sign In */}
              <SignInButton mode="modal" fallbackRedirectUrl="/home">
                <button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          {/* Logged-in user avatar */}
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    "w-10 h-10 rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-all",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
