# MongoDB & Clerk Integration Guide

## ✅ Changes Made

All default/mock user data has been removed and replaced with real MongoDB + Clerk integration.

### Frontend Changes

1. **API Utilities** (`src/utils/api.ts`)
   - Created centralized API service for all backend calls
   - Handles posts, profiles, messages, comments, reactions, and follows

2. **Components Updated**
   - `FeedSection.tsx` - Now fetches posts from MongoDB
   - `MessagesSection.tsx` - Fetches real conversations and messages
   - `FriendsSection.tsx` - Shows user suggestions from database
   - `ProfileSection.tsx` - Uses Clerk username and fetches from MongoDB
   - `CommentSection.tsx` - Real-time comments from database
   - `ReactionBar.tsx` - Integrated with reactions API
   - `NotificationsSection.tsx` - New component for notifications
   - `Home.tsx` - Removed mock components

3. **Context Updates** (`src/context/AppState.tsx`)
   - Integrated with Clerk for authentication
   - Fetches user profile from MongoDB on login
   - Syncs Clerk user data with MongoDB

### Backend Changes

1. **Routes Enhanced**
   - `search.ts` - Added `/api/search/users` endpoint for user suggestions
   - `profiles.ts` - Auto-creates user profile on first access
   - All routes properly return user data with stats

### Removed

- All hardcoded user arrays
- Default avatar URLs (dicebear/pravatar)
- Mock data in FeedSection, MessagesSection, FriendsSection
- MessagesMock and NotificationsMock components
- Unsplash/Coverr placeholder images in feed

## 🚀 Setup Instructions

### 1. Environment Variables

**Frontend** (`.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:4000/api
```

**Backend** (`server/.env`):
```env
MONGO_URI=mongodb://127.0.0.1:27017/circlo_social
CLERK_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_KEY_HERE
-----END PUBLIC KEY-----"
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SKIP_AUTH=false
```

### 2. Start MongoDB

```bash
# Make sure MongoDB is running
mongod
```

### 3. Start Backend

```bash
cd server
npm install
npm run dev
```

### 4. Start Frontend

```bash
npm install
npm run dev
```

## 📝 How It Works

1. **User Authentication**: Clerk handles authentication
2. **User Profile**: On first login, a MongoDB user document is auto-created
3. **Username**: Fetched from Clerk user object (`clerkUser.username`)
4. **Posts**: All posts are fetched from MongoDB with author information
5. **Messages**: Real conversations between users
6. **Comments**: Real-time comments on posts
7. **Reactions**: Like/love/etc reactions stored in database
8. **Friends**: User suggestions based on who you don't follow

## 🔄 Data Flow

```
User Login (Clerk) 
  → Auto-create MongoDB profile
  → Fetch user data
  → Display in UI

User Action (Post/Comment/Like)
  → API call to backend
  → MongoDB update
  → UI refresh
```

## 🎯 Key Features

- ✅ No hardcoded user data
- ✅ All data from MongoDB
- ✅ Clerk username integration
- ✅ Real-time updates
- ✅ Proper error handling
- ✅ Loading states
- ✅ Fallback avatars only when no user data exists

## 🐛 Troubleshooting

**No posts showing?**
- Check MongoDB connection
- Ensure backend is running
- Check browser console for errors

**Username not showing?**
- Ensure Clerk user has username set
- Check profile API response

**Images not loading?**
- Check if media URLs are valid
- Verify CORS settings on backend