# 🚀 Deployment Guide - Circlo Social

This guide covers deploying both the frontend and backend of Circlo Social.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Environment Variables](#environment-variables)
- [Deployment Platforms](#deployment-platforms)

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Clerk Account** - For authentication
   - Get your publishable key from [Clerk Dashboard](https://dashboard.clerk.com)
   - Get your JWT public key for backend verification

2. ✅ **MongoDB Database** - Options:
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Recommended for production)
   - Self-hosted MongoDB
   - Docker container

3. ✅ **Firebase Account** (Optional)
   - For file storage and real-time features
   - Get config from [Firebase Console](https://console.firebase.google.com)

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel is optimized for React applications and offers automatic deployments.

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**
   
   Create `.env.production`:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
   VITE_API_URL=https://api.yourdomain.com/api
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   VITE_APP_URL=https://yourdomain.com
   VITE_APP_ENV=production
   ```

3. **Deploy**
   ```bash
   # Build the project
   npm run build
   
   # Deploy to Vercel
   vercel --prod
   ```

4. **Add Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all `VITE_*` variables
   - Redeploy

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   # Build
   npm run build
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Configure in Netlify Dashboard**
   - Add environment variables
   - The `netlify.toml` is already configured

### Option 3: Docker

1. **Build Docker Image**
   ```bash
   # Make sure .env.production is configured
   docker build \
     --build-arg VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
     --build-arg VITE_API_URL="$VITE_API_URL" \
     -t circlo-frontend:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d -p 3000:3000 --name circlo-frontend circlo-frontend:latest
   ```

---

## Backend Deployment

### Option 1: Railway (Recommended for Node.js)

1. **Create Railway Account** at [railway.app](https://railway.app)

2. **Create New Project**
   - Connect your GitHub repository
   - Select the `server` directory as the root

3. **Configure Environment Variables**
   ```env
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/circlo_social
   CLERK_JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----
   PORT=4000
   NODE_ENV=production
   CLIENT_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
   SKIP_AUTH=false
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Get your deployment URL (e.g., `https://your-app.railway.app`)

### Option 2: Render

1. **Create Render Account** at [render.com](https://render.com)

2. **Create New Web Service**
   - Connect your repository
   - Root directory: `server`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Add Environment Variables** (same as Railway)

4. **Deploy**
   - Render will build and deploy automatically

### Option 3: Docker (Self-Hosted or Any Platform)

1. **Create Dockerfile for Backend**
   
   Create `server/Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 4000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   cd server
   
   # Build
   docker build -t circlo-backend:latest .
   
   # Run
   docker run -d \
     -p 4000:4000 \
     -e MONGO_URI="your_mongo_uri" \
     -e CLERK_JWT_PUBLIC_KEY="your_key" \
     -e CLIENT_ORIGIN="https://yourdomain.com" \
     --name circlo-backend \
     circlo-backend:latest
   ```

### Option 4: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   cd server
   heroku create circlo-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI="your_mongo_uri"
   heroku config:set CLERK_JWT_PUBLIC_KEY="your_key"
   heroku config:set CLIENT_ORIGIN="https://yourdomain.com"
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix server heroku main
   ```

---

## Environment Variables

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | ✅ Yes | `pk_live_...` |
| `VITE_API_URL` | Backend API URL | ✅ Yes | `https://api.yourdomain.com/api` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | ⚠️ Optional | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ⚠️ Optional | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ⚠️ Optional | `project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage | ⚠️ Optional | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | ⚠️ Optional | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | ⚠️ Optional | `1:123:web:abc` |
| `VITE_FIREBASE_DATABASE_URL` | Firebase database URL | ⚠️ Optional | `https://project.firebaseio.com` |
| `VITE_APP_URL` | Your app's URL | ⚠️ Optional | `https://yourdomain.com` |
| `VITE_APP_ENV` | Environment name | ⚠️ Optional | `production` |

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | ✅ Yes | `mongodb://...` or `mongodb+srv://...` |
| `CLERK_JWT_PUBLIC_KEY` | Clerk JWT public key | ✅ Yes | `-----BEGIN PUBLIC KEY-----...` |
| `PORT` | Server port | ⚠️ Optional | `4000` (default: 3000) |
| `NODE_ENV` | Environment | ⚠️ Optional | `production` |
| `CLIENT_ORIGIN` | Allowed CORS origins | ✅ Yes | `https://yourdomain.com` |
| `SKIP_AUTH` | Skip auth verification | ❌ No (dev only) | `false` |

---

## Full Stack Deployment with Docker Compose

For deploying both frontend and backend together:

1. **Create `docker-compose.yml` in root**
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build:
         context: ./server
         dockerfile: Dockerfile
       ports:
         - "4000:4000"
       environment:
         - MONGO_URI=${MONGO_URI}
         - CLERK_JWT_PUBLIC_KEY=${CLERK_JWT_PUBLIC_KEY}
         - CLIENT_ORIGIN=${CLIENT_ORIGIN}
         - NODE_ENV=production
         - PORT=4000
       restart: unless-stopped
   
     frontend:
       build:
         context: .
         dockerfile: Dockerfile
         args:
           - VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
           - VITE_API_URL=${VITE_API_URL}
           - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
           - VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
           - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
           - VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
           - VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
           - VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
           - VITE_FIREBASE_DATABASE_URL=${VITE_FIREBASE_DATABASE_URL}
       ports:
         - "3000:3000"
       depends_on:
         - backend
       restart: unless-stopped
   ```

2. **Deploy**
   ```bash
   # Create .env file with all variables
   docker-compose up -d
   ```

---

## Post-Deployment Checklist

- [ ] Frontend is accessible and loads correctly
- [ ] Backend API health endpoint responds: `GET /api/health`
- [ ] Authentication works (Clerk sign-in)
- [ ] API calls from frontend to backend succeed
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] MongoDB connection is established
- [ ] SSL/HTTPS is enabled (if applicable)
- [ ] Domain/DNS is configured
- [ ] Monitoring/logging is set up

---

## Troubleshooting

### Frontend can't connect to backend
- ✅ Check `VITE_API_URL` points to correct backend URL
- ✅ Verify backend is running and accessible
- ✅ Check CORS configuration in backend (`CLIENT_ORIGIN`)

### Authentication not working
- ✅ Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- ✅ Check `CLERK_JWT_PUBLIC_KEY` in backend matches Clerk dashboard
- ✅ Ensure Clerk application is in production mode

### Database connection failed
- ✅ Verify `MONGO_URI` is correct
- ✅ Check MongoDB server is running
- ✅ Verify network access (IP whitelist for MongoDB Atlas)

### Build errors
- ✅ Run `npm install` in both root and server directories
- ✅ Check Node.js version (requires 18+)
- ✅ Clear node_modules and reinstall if needed

---

## Support

For more help:
- 📖 [Main README](./README.md)
- 🐛 [Open an issue](https://github.com/Arghyadevs/CIRCLO_SOCIAL/issues)
- 📧 Contact the development team

---

**Happy Deploying! 🚀**
