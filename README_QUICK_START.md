# 🚀 Quick Start Guide

## Current Issue: MongoDB Not Running

The application requires MongoDB to be running. Here's how to fix it:

### Option 1: Install and Start MongoDB (Recommended)

**macOS:**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.version()"
```

### Option 2: Use MongoDB Atlas (Cloud - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `server/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/circlo_social
```

## Start the Application

### Terminal 1 - Backend Server
```bash
cd server
npm install
npm run dev
```

You should see:
```
Server listening on http://localhost:4000
MongoDB connected
```

### Terminal 2 - Frontend
```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features Working

✅ **Create Post Section** - Upload images/videos and post
✅ **Auto-refresh Feed** - Feed refreshes after creating a post
✅ **Real-time Comments** - Add comments to posts
✅ **Reactions** - Like/love posts
✅ **Messages** - Send messages to users
✅ **Profile** - View and edit your profile
✅ **User Suggestions** - See people you may know

## Test the Create Post Feature

1. Click on "Create" tab or use the create section on home
2. Type some text
3. Optionally upload an image or video
4. Click "Post"
5. Feed will auto-refresh and show your new post

## Troubleshooting

**"Failed to load feed" error:**
- Make sure MongoDB is running
- Make sure backend server is running on port 4000
- Check `server/.env` has correct settings

**Backend won't start:**
```bash
# Kill any process on port 4000
lsof -ti:4000 | xargs kill -9

# Restart backend
cd server && npm run dev
```

**Frontend won't start:**
```bash
# Kill any process on port 5173
lsof -ti:5173 | xargs kill -9

# Restart frontend
npm run dev
```