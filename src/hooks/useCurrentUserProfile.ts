import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { profilesApi } from '@/utils/api';
import type { User } from '@/types';

/**
 * Hook to fetch and cache current user profile from database
 * Always use this instead of useUser() for display purposes
 */
export function useCurrentUserProfile() {
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const profile = await profilesApi.getProfile(userId);
        if (mounted) {
          setUser(profile);
        }
      } catch (err) {
        console.error('Failed to fetch current user profile:', err);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { user, loading, userId };
}
