import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

// Firebase config (provided)
const firebaseConfig = {
  apiKey: "AIzaSyB30pDe0kQkIURaoOsS1MuLJp2NyHbXMY0",
  authDomain: "circlo-d9991.firebaseapp.com",
  projectId: "circlo-d9991",
  storageBucket: "circlo-d9991.firebasestorage.app",
  messagingSenderId: "388239881953",
  appId: "1:388239881953:web:847e9123297f3cdcdaa9a0",
  measurementId: "G-EPGN2TKHYB",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper: sign in using backend-issued custom token
export async function ensureFirebaseAuth(customTokenEndpoint: string, bearerToken: string) {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (err?: unknown) => {
      if (settled) return;
      settled = true;
      err ? reject(err) : resolve();
    };

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        unsub();
        finish();
      }
    });

    if (auth.currentUser) {
      unsub();
      finish();
      return;
    }

    fetch(customTokenEndpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bearerToken}` }
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text().catch(() => '');
          throw new Error(`Custom token endpoint failed: ${r.status} ${r.statusText} ${text}`);
        }
        return r.json();
      })
      .then(async (data) => {
        if (!data?.token) throw new Error('No custom token');
        await signInWithCustomToken(auth, data.token);
        // onAuthStateChanged above should resolve; add a fallback poll/timeout
        let tries = 0;
        const poll = () => {
          if (auth.currentUser) {
            console.log('Firebase signed in as uid:', auth.currentUser.uid);
            return; // finish() already called (or will be) by the auth listener
          }
          if (++tries > 100) { // ~10s
            finish(new Error('Firebase auth did not complete within 10s'));
            return;
          }
          setTimeout(poll, 100);
        };
        poll();
      })
      .catch(err => {
        unsub();
        finish(err);
      });
  });
}

let analytics: Analytics | undefined;
// Initialize analytics only if supported (avoids errors on http or non-browser)
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {});

export { app as firebaseApp, analytics };
