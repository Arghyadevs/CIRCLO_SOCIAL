// src/App.tsx
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { useAuth } from "./context/AuthContext";
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
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 🌍 Public Marketing Page — redirect signed-in users to /home */}
            <Route
              path="/"
              element={
                isSignedIn ? (
                  <Navigate to="/home" replace />
                ) : (
                  <MarketingShell />
                )
              }
            />

            {/* 🏠 Protected Home */}
            <Route
              path="/home/*"
              element={
                isSignedIn ? (
                  <Suspense fallback={<LoadingFallback />}>
                    <Home />
                  </Suspense>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* 📝 Post Detail Page */}
            <Route
              path="/post/:postId"
              element={
                isSignedIn ? (
                  <Suspense fallback={<LoadingFallback />}>
                    <PostDetail />
                  </Suspense>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* 🌀 Fallback: Redirect unknown paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
