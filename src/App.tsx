// src/App.tsx
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import {
  ClerkLoaded,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
import Header from "./components/Header";
import Footer from "./components/Footer";

/* ----------------------------------
   ⚡ Lazy-loaded Components for Performance
---------------------------------- */
const Home = lazy(() => import("./components/Home"));
const Landing = lazy(() => import("./components/Landing"));
const FeatureIcons = lazy(() => import("./components/FeatureIcons"));
const FeatureSection = lazy(() => import("./components/FeatureSection"));
const ScrollSection = lazy(() => import("./components/ScrollSection"));
const TextColumns = lazy(() => import("./components/TextColumns"));
const PostDetail = lazy(() => import("./components/PostDetail"));

/* ----------------------------------
   🌈 Loading Fallback Component
---------------------------------- */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="px-6 py-4 rounded-lg bg-white/90 text-gray-700 font-semibold shadow-lg animate-pulse">
        Loading Circlo…
      </div>
    </div>
  );
}

/* ----------------------------------
   🪩 Marketing / Landing Shell
---------------------------------- */
function MarketingShell() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<LoadingFallback />}>
          <Landing />
          <FeatureIcons />
          <FeatureSection />
          <ScrollSection />
          <TextColumns />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

/* ----------------------------------
   🚀 Main App Component
---------------------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ClerkLoaded>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* 🌍 Public Marketing Page - show marketing only to signed-out users; redirect signed-in users to /home */}
              <Route
                path="/"
                element={
                  <>
                    <SignedIn>
                      <Navigate to="/home" replace />
                    </SignedIn>
                    <SignedOut>
                      <MarketingShell />
                    </SignedOut>
                  </>
                }
              />

              {/* 🔐 Clerk Authentication Pages */}
              <Route
                path="/sign-in/*"
                element={
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    afterSignInUrl="/home"
                    appearance={{
                      elements: {
                        card: "shadow-xl border border-gray-200 rounded-2xl",
                      },
                    }}
                  />
                }
              />
              <Route
                path="/sign-up/*"
                element={
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    afterSignUpUrl="/home"
                    appearance={{
                      elements: {
                        card: "shadow-xl border border-gray-200 rounded-2xl",
                      },
                    }}
                  />
                }
              />

              {/* 🏠 Protected Home (Clerk-only access) */}
              <Route
                path="/home/*"
                element={
                  <>
                    <SignedIn>
                      <Suspense fallback={<LoadingFallback />}>
                        <Home />
                      </Suspense>
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              {/* 📝 Post Detail Page */}
              <Route
                path="/post/:postId"
                element={
                  <>
                    <SignedIn>
                      <Suspense fallback={<LoadingFallback />}>
                        <PostDetail />
                      </Suspense>
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              {/* 🌀 Fallback: Redirect unknown paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ClerkLoaded>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
