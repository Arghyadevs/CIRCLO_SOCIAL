# 🚀 Quick Start Guide - Circlo Social

Get Circlo Social running locally in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ MongoDB ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- ✅ Clerk Account ([Sign up](https://clerk.com))

---

## 🎯 Local Development Setup

> 💡 **Pro Tip:** Run `./check-config.sh` at any time to verify your setup!

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/Arghyadevs/CIRCLO_SOCIAL.git
cd CIRCLO_SOCIAL

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment

**Frontend (.env in root):**
```bash
# Copy template
cp .env.example .env

# Edit .env and add your Clerk key
# Get it from: https://dashboard.clerk.com
```

Minimum required in `.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=/api
```

**Backend (server/.env):**
```bash
# Copy template
cp server/.env.example server/.env

# Edit server/.env
```

Minimum required in `server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/circlo_social
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SKIP_AUTH=true
```

> 💡 **Tip:** Set `SKIP_AUTH=true` for quick testing without Clerk setup. For production, set it to `false` and configure `CLERK_JWT_PUBLIC_KEY`.

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# If MongoDB is installed locally
mongod
```

**Option B: MongoDB Atlas**
- Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Update `MONGO_URI` in `server/.env`

**Option C: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Expected output:
```
Server listening on http://localhost:4000
MongoDB connected
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 5: Open Your Browser

Navigate to: **http://localhost:5173**

🎉 **You're all set!**

---

## 🐳 Docker Setup (Alternative)

Want to run everything with one command?

```bash
# Copy Docker environment template
cp .env.docker.example .env.docker

# Edit .env.docker with your Clerk credentials

# Start everything
docker-compose --env-file .env.docker up -d
```

Access at: **http://localhost:3000**

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for details.

---

## 🧪 Testing the Setup

### 1. Check Backend Health

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{"ok":true,"service":"circlo-social","ts":1234567890}
```

### 2. Check Frontend

- Open http://localhost:5173
- You should see the Circlo landing page
- Click "Get Started" or "Sign In"

### 3. Test Authentication

- Sign up with Clerk (if configured)
- Or browse with `SKIP_AUTH=true`

---

## 📝 Common Issues & Solutions

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Find what's using the port
lsof -i :4000
lsof -i :5173

# Kill the process or use different ports
# Update PORT in server/.env and VITE_API_URL accordingly
```

### Issue: MongoDB Connection Failed

**Error:** `MongoServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running: `mongod` or Docker container
- Check `MONGO_URI` in `server/.env`
- For Atlas, whitelist your IP address

### Issue: Clerk Authentication Error

**Error:** `Missing Clerk Publishable Key`

**Solution:**
- Get key from https://dashboard.clerk.com
- Add to `.env` as `VITE_CLERK_PUBLISHABLE_KEY`
- Or use `SKIP_AUTH=true` in server/.env for testing

### Issue: CORS Error

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
- Check `CLIENT_ORIGIN` in `server/.env` includes `http://localhost:5173`
- Ensure using `VITE_API_URL=/api` (uses Vite proxy)
- Restart both servers

### Issue: Frontend Build Errors

**Error:** `Cannot find module` or type errors

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

---

## 🎨 Next Steps

Once everything is running:

1. **Explore the UI**
   - Create a post
   - Upload an image
   - Add a story
   - Try the search feature

2. **Customize**
   - Modify components in `src/components/`
   - Update styles in `src/index.css`
   - Add new API routes in `server/src/routes/`

3. **Deploy**
   - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - See [DOCKER_SETUP.md](./DOCKER_SETUP.md)

---

## 📚 Documentation

- [Main README](./README.md) - Full documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Docker Setup](./DOCKER_SETUP.md) - Docker Compose guide
- [API Reference](./API_REFERENCE.md) - Backend API docs

---

## 🆘 Need Help?

- 🐛 [Report issues](https://github.com/Arghyadevs/CIRCLO_SOCIAL/issues)
- 💬 Check existing issues for solutions
- 📖 Read the full README

---

## 📋 Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Frontend (Dev) | http://localhost:5173 | 5173 |
| Backend API | http://localhost:4000 | 4000 |
| MongoDB | localhost | 27017 |

### Key Files

| File | Purpose |
|------|---------|
| `.env` | Frontend environment variables |
| `server/.env` | Backend environment variables |
| `vite.config.ts` | Vite configuration (includes proxy) |
| `server/src/index.ts` | Backend entry point |
| `src/utils/api.ts` | API client |

### Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter

# Backend
cd server
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build

# Docker
docker-compose --env-file .env.docker up -d     # Start all services
docker-compose logs -f                          # View logs
docker-compose down                             # Stop all services
```

---

**Happy Coding! 🎉**
