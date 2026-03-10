import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required Firebase configuration
const requiredFields = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];
const missingFields = requiredFields.filter(
  (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
);

if (missingFields.length > 0) {
  console.error(
    "❌ Missing required Firebase environment variables:",
    missingFields
      .map(
        (f) =>
          `VITE_FIREBASE_${f
            .replace(/[A-Z]/g, (m) => "_" + m)
            .toUpperCase()}`
      )
      .join(", ")
  );
  throw new Error(
    `Missing Firebase configuration: ${missingFields.join(
      ", "
    )}. Please add the required environment variables to your deployment.`
  );
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google via a popup.
 * Returns the UserCredential on success.
 */
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

let analytics: Analytics | undefined;
// Initialize analytics only if supported (avoids errors on http or non-browser)
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => { });

export { app as firebaseApp, analytics };
