// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, signInWithGoogle as firebaseGoogleSignIn } from "../lib/firebase";

/* ----------------------------------
   🔑 Auth Context Types
---------------------------------- */
interface AuthContextType {
  /** Firebase user object (null when signed out) */
  user: FirebaseUser | null;
  /** Convenience boolean */
  isSignedIn: boolean;
  /** True while Firebase is determining the initial auth state */
  isLoading: boolean;
  /** Firebase uid (empty string if signed out) */
  userId: string;
  /** Trigger a Google OAuth popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign the user out of Firebase */
  signOut: () => Promise<void>;
  /** Get a Firebase ID token for authenticated API calls */
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ----------------------------------
   🚀 Auth Provider Component
---------------------------------- */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await firebaseGoogleSignIn();
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  const value: AuthContextType = {
    user,
    isSignedIn: !!user,
    isLoading,
    userId: user?.uid ?? "",
    signInWithGoogle,
    signOut,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ----------------------------------
   🧩 Hook
---------------------------------- */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
