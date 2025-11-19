# 🔧 Deployment Fix Guide: API URL Configuration

## Problem Summary

**Issue:** Frontend and backend hosted successfully but website not working.

**Root Cause:** The server port was changed from 4000 to 3000, but the frontend API URL configuration still defaulted to port 4000. When the `VITE_API_URL` environment variable was not set in production, the frontend tried to connect to the wrong port, causing all API calls to fail.

## What Was Fixed

### 1. Frontend API URLs Updated (Port 4000 → 3000)
- ✅ `src/utils/api.ts` - Main API client
- ✅ `src/components/Home.tsx` - Firebase authentication endpoint
- ✅ `src/components/home2/StoriesSection.tsx` - Stories media URLs
- ✅ `src/components/home2/FeedSection.tsx` - Error message text

### 2. Documentation Updated
- ✅ `README.md` - Main setup instructions
- ✅ `server/README.md` - Server documentation
- ✅ `server/.env.example` - Server environment template

### 3. Production Configuration Fixed
- ✅ `.env.production.example` - Changed `VITE_API_BASE_URL` to `VITE_API_URL` (correct variable name)

## How to Deploy the Fix

### For Local Development

1. **Update your local environment variables:**

   Create or update `.env` in the project root:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
   VITE_API_URL=http://localhost:3000/api
   ```

   Create or update `server/.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/circlo_social
   CLERK_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
   YOUR_KEY_HERE
   -----END PUBLIC KEY-----"
   PORT=3000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   SKIP_AUTH=true
   ```

2. **Start the services:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm install
   npm run dev
   
   # Terminal 2 - Frontend
   npm install
   npm run dev
   ```

3. **Verify the fix:**
   - Backend should be running on `http://localhost:3000`
   - Frontend should be accessible at `http://localhost:5173`
   - API calls should now work correctly

### For Production Deployment

#### Option 1: Vercel / Netlify (Frontend)

1. **Set environment variables in your hosting platform:**
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key
   VITE_API_URL=https://your-backend-url.com/api
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. **Redeploy your frontend:**
   ```bash
   npm run build
   # Deploy the 'dist' folder
   ```

#### Option 2: Railway / Render / Heroku (Backend)

1. **Set environment variables in your hosting platform:**
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/circlo_social
   CLERK_JWT_PUBLIC_KEY=your_jwt_public_key
   PORT=3000
   NODE_ENV=production
   CLIENT_ORIGIN=https://your-frontend-url.com
   SKIP_AUTH=false
   ```

2. **Deploy the backend:**
   ```bash
   cd server
   npm run build
   npm start
   ```

## Verification Checklist

After deploying, verify:

- [ ] Backend health endpoint responds: `curl https://your-backend.com/api/health`
- [ ] Frontend loads without errors in browser console
- [ ] Login/authentication works
- [ ] Posts load in the feed
- [ ] Can create new posts
- [ ] API network requests show 200 status codes (check browser DevTools Network tab)

## Troubleshooting

### Issue: Still getting connection errors

**Solution:** Verify environment variables are set correctly:

1. Check frontend build logs for the `VITE_API_URL` value
2. Check backend logs for the PORT value
3. Ensure CORS is configured correctly with `CLIENT_ORIGIN`

### Issue: 404 or 502 errors

**Solution:** 
- Ensure the backend is actually running and accessible
- Verify the `VITE_API_URL` includes the `/api` path
- Check that your backend hosting allows the PORT you've configured

### Issue: CORS errors

**Solution:**
- Ensure `CLIENT_ORIGIN` in backend matches your frontend URL
- For multiple origins, use comma-separated values: `https://app1.com,https://app2.com`

## Environment Variable Reference

### Frontend (VITE_ prefixed)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:3000/api` or `https://api.yourdomain.com/api` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | `pk_test_...` or `pk_live_...` |
| `VITE_FIREBASE_*` | Firebase configuration | See Firebase console |

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGO_URI` | MongoDB connection | `mongodb://localhost:27017/circlo_social` |
| `CLERK_JWT_PUBLIC_KEY` | Clerk JWT public key | PEM format |
| `CLIENT_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` or `production` |

## Need Help?

If you continue to experience issues:

1. Check browser console for specific error messages
2. Check backend logs for errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is accessible
5. Test the backend health endpoint directly

## Summary

This fix ensures that the frontend and backend communicate on the correct port (3000) by default, preventing deployment failures when environment variables are not explicitly configured. Always set the `VITE_API_URL` environment variable in production to point to your actual backend URL.
