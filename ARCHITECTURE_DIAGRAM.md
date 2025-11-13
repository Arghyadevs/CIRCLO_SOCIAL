# 🎯 Followers/Following Architecture & Data Flow

## 📐 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP (Home.tsx)                          │
│  Listens to circlo:openProfile event                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌──────────────────┐  ┌────────────────────────┐
│ ProfileSection   │  │ UserProfileModal       │
│ (Your Profile)   │  │ (Other User Profile)   │
│                  │  │                        │
│ Stats Clickable: │  │ Stats Clickable:       │
│ - Followers ●    │  │ - Followers ●          │
│ - Following ●    │  │ - Following ●          │
└────────┬─────────┘  └────────┬────────────────┘
         │                     │
         └─────────┬───────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │ FollowersFollowingModal          │
    │ (Universal Modal for ANY user)   │
    │                                  │
    │ ┌────────────────────────────┐   │
    │ │ Followers  │ Following    │   │
    │ └────────────────────────────┘   │
    │                                  │
    │ [User List with Follow btns] ●   │
    │ Click user → navigate away  ●    │
    │ Follow/Unfollow updates    ●    │
    └──────────────────────────────────┘
             │
             ▼
    ┌──────────────────────┐
    │  followsApi          │
    │  (API Client)        │
    │                      │
    │ • getFollowers()     │
    │ • getFollowing()     │
    │ • toggleFollow()     │
    └──────────┬───────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │  Backend API Endpoints           │
    │                                  │
    │ GET /follows/followers/{id}      │
    │ GET /follows/following/{id}      │
    │ POST /follows (toggleFollow)     │
    └──────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Flow: User Clicks Followers Stat

```
┌───────────────────────────────────────────────────────────────┐
│ User clicks "100 followers" on profile                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ ProfileSection/UserProfileModal state:                       │
│ • setShowFollowersModal(true)                                │
│ • setFollowersModalTab("followers")                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ FollowersFollowingModal mounts                               │
│ useEffect [] → calls fetchLists()                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ Promise.all([                                                │
│   followsApi.getFollowers(userId),    ◄──┐                  │
│   followsApi.getFollowing(userId)     ◄──┤ Parallel calls   │
│ ])                                        │                  │
│                                           │                  │
│ authenticatedFetch(url, { JWT token })◄──┘                  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ Backend receives request with userId & JWT token             │
│                                                               │
│ GET /api/follows/followers/{clerkId}                         │
│   → Query database for followers                             │
│   → Get follower User objects                                │
│   → Return User[]                                            │
│                                                               │
│ GET /api/follows/following/{clerkId}                         │
│   → Query database for following                             │
│   → Get following User objects                               │
│   → Return User[]                                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼ 200 OK
┌───────────────────────────────────────────────────────────────┐
│ Response received with user arrays:                           │
│ {                                                             │
│   followers: [                                               │
│     { clerkId, username, name, avatarUrl, bio, stats },      │
│     { ... }, { ... }                                         │
│   ]                                                           │
│ }                                                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ Modal updates state:                                          │
│ • setFollowers(followersList)                                │
│ • setFollowing(followingList)                                │
│ • setLoading(false)                                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│ Modal renders user list:                                      │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ [Alice's Avatar]                          [Follow]    │  │
│ │ @alice                                                 │  │
│ │ "Love to create content"                             │  │
│ └─────────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ [Bob's Avatar]                            [Following] │  │
│ │ @bob                                                   │  │
│ │ "Designer & Developer"                               │  │
│ └─────────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ [Charlie's Avatar]                        [Follow]    │  │
│ │ @charlie                                               │  │
│ │ "Content Creator"                                      │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 State Management

```
ProfileSection/UserProfileModal
│
├─ showFollowersModal: boolean
│  └─ Controls modal visibility
│
├─ followersModalTab: "followers" | "following"
│  └─ Controls which list to show
│
└─ Passes userId to FollowersFollowingModal

FollowersFollowingModal
│
├─ tab: "followers" | "following"
│  └─ Current tab (switched by user)
│
├─ followers: User[]
│  └─ Array of followers from API
│
├─ following: User[]
│  └─ Array of following from API
│
├─ loading: boolean
│  └─ Fetch in progress?
│
├─ followStates: Record<string, boolean>
│  └─ Track follow status for each user
│  └─ { userId: isFollowing }
│
└─ userId: string (prop)
   └─ Which user's followers to fetch
```

---

## 🔐 Authentication Flow

```
User Action (Click followers)
    │
    ▼
Component State Update
    │
    ▼
followsApi.getFollowers(userId)
    │
    ▼
authenticatedFetch(url, {
  headers: {
    Authorization: `Bearer ${jwtToken}`  ◄── Clerk JWT
  }
})
    │
    ▼
Backend receives request
    │
    ├─ Verify JWT signature
    ├─ Extract userId from JWT
    ├─ Query database
    └─ Return data
    │
    ▼
Frontend receives data
    │
    ├─ Status 200 OK: Update state
    ├─ Status 401: Refresh token or redirect to login
    ├─ Status 403: User doesn't have permission
    ├─ Status 500: Show error message
    │
    ▼
Modal renders or shows error
```

---

## 🎨 UI State Transitions

```
┌──────────────┐
│ Initial      │
│ (Stats Show) │
└──────┬───────┘
       │ User clicks stat
       ▼
┌──────────────────┐
│ Loading          │
│ (Spinner)        │
└──────┬───────────┘
       │ API response received
       ▼
┌────────────────────┐
│ Loaded             │
│ (User List)        │
└──────┬─────────────┘
       │ User interactions:
       │ - Click user
       │ - Click Follow
       │ - Click Following
       │ - Switch tabs
       ▼
┌────────────────────┐
│ Updated            │
│ (New State)        │
└──────┬─────────────┘
       │ User clicks close
       ▼
┌──────────────┐
│ Closed       │
│ (Modal gone) │
└──────────────┘
```

---

## 🌐 User Navigation Example

```
Your Profile (ProfileSection)
    │
    ├─ Click "50 followers"
    │  └─ Modal shows: Your 50 followers
    │      │
    │      ├─ See: @alice, @bob, @charlie
    │      │
    │      └─ Click @alice
    │         └─ circlo:openProfile event
    │            │
    │            ▼
    │         UserProfileModal opens
    │         Alice's Profile
    │            │
    │            ├─ Click "20 followers"
    │            │  └─ Modal shows: Alice's 20 followers
    │            │      │
    │            │      ├─ See: @diana, @eve, @frank
    │            │      │
    │            │      └─ Click @diana
    │            │         └─ Navigate to Diana's Profile
    │            │            └─ Continue indefinitely...
    │            │
    │            └─ Click "100 following"
    │               └─ Modal shows: Alice's 100 following
    │                   └─ Navigate through her network
    │
    └─ Click "120 following"
       └─ Modal shows: People you follow
           └─ Explore their networks
```

---

## 🔄 Follow/Unfollow Flow

```
User clicks "Follow" button
    │
    ▼
Button disabled (prevent double-click)
    │
    ▼
followsApi.toggleFollow(userId)
    │
    ├─ POST /api/follows { followeeId }
    ├─ With JWT token
    │
    ▼
Backend processes
    │
    ├─ Check if already following
    │  ├─ YES → Delete follow relationship
    │  │       Response: { isFollowing: false }
    │  │
    │  └─ NO  → Create follow relationship
    │          Response: { isFollowing: true }
    │
    ▼
Frontend updates state
    │
    ├─ Update followStates[userId]
    ├─ Button re-renders
    ├─ Shows "Follow" or "Following"
    │
    ▼
User sees instant visual feedback
```

---

## 📊 Type Definitions

```typescript
interface User {
  clerkId: string;           // Unique identifier
  username: string;          // @username
  name: string;             // Display name
  avatarUrl?: string;       // Profile picture
  bio?: string;             // User bio
  stats?: {
    followerCount: number;  // How many follow them
    followingCount: number; // How many they follow
    postCount: number;      // Their post count
  };
}

interface FollowersFollowingModalProps {
  userId: string;                              // Which user
  initialTab?: "followers" | "following";      // Start tab
  onClose: () => void;                         // Close handler
}
```

---

## ✨ Key Design Decisions

1. **Modal Pattern**
   - Pros: Non-blocking, can navigate away
   - Alternative considered: Full page
   - Chosen because: Better UX for quick browsing

2. **Real API Data**
   - Pros: Always accurate, live updates
   - Alternative considered: Mock data
   - Chosen because: User-specific and authentic

3. **Universal Component**
   - Pros: Reusable for any user
   - Alternative considered: Separate components
   - Chosen because: DRY principle, maintainability

4. **Tab Navigation**
   - Pros: Organized, easy switching
   - Alternative considered: Separate pages
   - Chosen because: Better UX, less context switching

---

## 🚀 Optimization Points

```
Performance Optimization
│
├─ Parallel API calls
│  └─ Promise.all() for followers + following
│
├─ User caching
│  └─ Prevent refetch of same user profiles
│
├─ Memo components
│  └─ React.memo on user list items
│
├─ Lazy loading
│  └─ Load avatars on demand
│
└─ Efficient re-renders
   └─ Only update when state changes
```

---

## 📈 Scalability Considerations

For future scaling:

```
1. Pagination
   └─ Fetch 50 users at a time
   └─ Load more on scroll

2. Infinite Scroll
   └─ Auto-load more as user scrolls
   └─ Virtual scrolling for performance

3. Search
   └─ Filter followers by username
   └─ Search within list

4. Sorting
   └─ Sort by recent followers
   └─ Sort by activity

5. Analytics
   └─ Track how often viewed
   └─ Track follow patterns
```

---

This architecture ensures:
✅ Clean separation of concerns
✅ Reusable components
✅ Efficient data flow
✅ Secure authentication
✅ Optimized performance
✅ Scalable design
