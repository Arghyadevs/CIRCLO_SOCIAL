# Development Setup Guide

## Prerequisites

### 1. Install MongoDB

**macOS:**
```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 2. Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
# or
mongo --eval "db.version()"
```

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend** (`.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_API_URL=http://localhost:4000/api
```

**Backend** (`server/.env`):
```env
MONGO_URI=mongodb://127.0.0.1:27017/circlo_social
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SKIP_AUTH=true
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/health

## Troubleshooting

### "Failed to load feed" Error

This usually means:
1. MongoDB is not running - Start MongoDB first
2. Backend server is not running - Check Terminal 1
3. CORS issues - Verify CLIENT_ORIGIN in server/.env

### MongoDB Connection Error

```bash
# Check if MongoDB is running
ps aux | grep mongod

# If not running, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Linux
```

### Port Already in Use

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## Development Mode Features

- **SKIP_AUTH=true**: Bypasses Clerk authentication for testing
- **Hot Reload**: Both frontend and backend support hot reload
- **Auto-refresh**: Posts auto-refresh after creation

## Testing Without MongoDB

If you can't install MongoDB, you can:
1. Use MongoDB Atlas (free cloud database)
2. Update `MONGO_URI` in `server/.env` to your Atlas connection string

Example:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/circlo_social
```