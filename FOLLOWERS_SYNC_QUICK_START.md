# 🚀 How to Use Global Followers/Following Sync

## Quick Reference Guide

---

## 📍 Using the Hooks in Your Components

### **1. Get All Followers/Following Data**

```typescript
import { useFollowersSync } from '@/hooks/useFollowersSync';

export function MyComponent() {
  const { 
    followers,           // User[] - list of followers
    following,           // User[] - list of following
    followerCount,       // number - total followers
    followingCount,      // number - total following
    followerIds,         // Set<string> - IDs of followers
    followingIds,        // Set<string> - IDs of following
    hasFollowers,        // boolean - has any followers?
    hasFollowing,        // boolean - following anyone?
    isFollowing,         // (userId) => boolean
    toggleFollow,        // (userId) => Promise<void>
  } = useFollowersSync();

  return (
    <div>
      <p>Followers: {followerCount}</p>
      <p>Following: {followingCount}</p>
    </div>
  );
}
```

---

### **2. Check if Following a Specific User**

```typescript
import { useIsFollowing } from '@/hooks/useFollowersSync';

export function FollowButton({ userId }: { userId: string }) {
  const isFollowing = useIsFollowing(userId);

  return (
    <button>
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
```

---

### **3. Get Followers or Following List**

```typescript
import { useMyFollowers, useMyFollowing } from '@/hooks/useFollowersSync';

export function FollowersList() {
  const followers = useMyFollowers();  // User[]
  const following = useMyFollowing();  // User[]

  return (
    <div>
      <h3>My Followers ({followers.length})</h3>
      {followers.map(user => (
        <div key={user.clerkId}>{user.username}</div>
      ))}
    </div>
  );
}
```

---

### **4. Handle Follow/Unfollow with Error Handling**

```typescript
import { useFollowAction } from '@/hooks/useFollowersSync';

export function UserProfile({ userId }: { userId: string }) {
  const { isFollowing, toggleFollow, followAction } = useFollowAction();

  const handleClick = async () => {
    try {
      followAction(userId);  // Handles follow/unfollow
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  return (
    <button onClick={handleClick}>
      {isFollowing(userId) ? 'Following' : 'Follow'}
    </button>
  );
}
```

---

## 🔄 How It Works Behind the Scenes

### **Global State (AppState.tsx)**
- Stores followers/following data centrally
- Auto-syncs on user authentication
- Auto-updates on follow/unfollow

### **Custom Hooks (useFollowersSync.ts)**
- Provides clean API for components
- No direct AppState access needed
- All data flows through hooks

### **Components**
- Import hooks, not AppState
- Get data via hooks
- No manual state management needed

---

## 💡 Common Patterns

### **Display Follower Count with Real-Time Updates**
```typescript
const { followerCount } = useFollowersSync();
return <p>{followerCount} followers</p>;
```
✨ Automatically updates when following status changes!

---

### **Show Follow Button for Any User**
```typescript
const { isFollowing, toggleFollow } = useFollowersSync();

return (
  <button onClick={() => toggleFollow(userId)}>
    {isFollowing(userId) ? 'Following' : 'Follow'}
  </button>
);
```
✨ Button updates instantly globally!

---

### **List All Followers**
```typescript
const { followers } = useFollowersSync();

return followers.map(user => (
  <div key={user.clerkId}>
    <img src={user.avatarUrl} />
    <p>{user.username}</p>
  </div>
));
```
✨ Always synced with latest followers!

---

## 🎯 Migration Checklist (If Using Old State)

If you have old code using local state for followers/following:

**Before** (❌ Old Way):
```typescript
const [followers, setFollowers] = useState([]);

useEffect(() => {
  fetchFollowers();  // Manual fetching
}, []);
```

**After** (✅ New Way):
```typescript
const { followers } = useFollowersSync();  // Automatic!
```

---

## ⚡ Performance Tips

1. **For O(1) lookups**, use `isFollowing(userId)`:
   ```typescript
   const { isFollowing } = useFollowersSync();
   const following = isFollowing(userId);  // Instant!
   ```

2. **For displaying lists**, use `followers` or `following`:
   ```typescript
   const { followers } = useFollowersSync();
   return followers.map(user => ...);  // Already cached!
   ```

3. **Avoid repeated calls**, save in variable:
   ```typescript
   const data = useFollowersSync();
   // Use data.followers, data.following, etc.
   ```

---

## 🐛 Debugging

All operations log to console:
- 📍 Fetching starts
- ✅ Operation succeeded
- ❌ Error occurred

Open DevTools Console (F12) to see logs during testing.

---

## ❓ FAQ

**Q: Do I need to pass followers/following as props?**
A: No! Just use the hook in the component that needs it.

**Q: How often does it sync?**
A: On app init and after every follow/unfollow action.

**Q: Will changes update across all components?**
A: Yes! Global state means all components using the hook get updates instantly.

**Q: Can I use this hook in multiple components?**
A: Yes! Each component gets its own hook instance pointing to the same global state.

**Q: What if API fails?**
A: Errors are logged to console. Check logs for details.

---

## 📚 Full Hook API Reference

```typescript
// Main hook - get everything
const sync = useFollowersSync();
// sync.followers: User[]
// sync.following: User[]
// sync.followerCount: number
// sync.followingCount: number
// sync.followerIds: Set<string>
// sync.followingIds: Set<string>
// sync.hasFollowers: boolean
// sync.hasFollowing: boolean
// sync.isFollowing(userId): boolean
// sync.toggleFollow(userId): Promise<void>
// sync.syncFollowersFollowing(): Promise<void>
// sync.fetchFollowersAndFollowing(): Promise<void>

// Helper hooks
useIsFollowing(userId);     // boolean
useMyFollowers();           // User[]
useMyFollowing();           // User[]
useFollowAction();          // { isFollowing, toggleFollow, followAction }
```

---

**That's it! Start using the hooks and enjoy global followers/following synchronization! 🎉**
