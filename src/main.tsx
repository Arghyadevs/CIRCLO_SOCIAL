// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppStateProvider } from "./context/AppState";
import { ThemeProvider } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";

/* ----------------------------------
   ⚙️ DOM Setup and Splash Logic
---------------------------------- */
const rootEl = document.getElementById("root");
const splash = document.getElementById("splash");

// Ensure the root element exists
if (!rootEl) {
  throw new Error("Root element #root not found in index.html");
}

// Hide app initially during splash
rootEl.style.opacity = "0";
document.body.style.overflow = "hidden";

/* ----------------------------------
   🚀 Render the React Application
---------------------------------- */
createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AppStateProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AppStateProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);

/* ----------------------------------
   🎬 Splash Screen Controls
---------------------------------- */
// 🕒 Total visible time for splash
const splashDisplayDuration = 5000; // 5 seconds visible before fade
const fadeDuration = 800; // Fade-out animation time

requestAnimationFrame(() => {
  if (splash) {
    // Keep splash visible for `splashDisplayDuration`
    setTimeout(() => {
      // Start fade-out transition
      splash.style.transition = `opacity ${fadeDuration}ms ease`;
      splash.style.opacity = "0";

      // Reveal app smoothly
      rootEl.style.transition = "opacity 800ms ease";
      rootEl.style.opacity = "1";

      // Re-enable body scroll after fade-out
      document.body.style.overflow = "";

      // Remove splash from DOM after fade completes
      setTimeout(() => splash.remove(), fadeDuration + 300);
    }, splashDisplayDuration);
  } else {
    // ✅ Fallback — no splash found
    rootEl.style.opacity = "1";
    document.body.style.overflow = "";
  }
});
