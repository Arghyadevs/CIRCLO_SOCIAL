# 🔗 Vercel + Render Deployment Setup

This guide shows how to connect your Vercel frontend to your Render backend.

## Current Deployment Status

- ✅ **Frontend:** https://circlo-devs7.vercel.app (Vercel)
- ✅ **Backend:** https://circlo-social.onrender.com (Render)

## Step 1: Configure Backend (Render) ✅

Your backend environment variables are already set:

```env
MONGO_URI=mongodb+srv://arghyadipinfo_db_user:***@circlo.opgzfuq.mongodb.net/circlo_db
CLERK_JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----
CLIENT_ORIGIN=https://circlo-devs7.vercel.app,http://localhost:5173
PORT=4000
NODE_ENV=development  # ⚠️ Should be "production"
SKIP_AUTH=false
FIREBASE_PROJECT_ID=circlo-d9991
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@circlo-d9991.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
FIREBASE_PRIVATE_KEY_ID=af3aaa17054f791391a61dd96f69ae2bc3ead85e
MAX_UPLOAD_MB=200
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

### ⚠️ Important Backend Updates Needed:

1. **Change NODE_ENV to production:**
   - Go to Render Dashboard → Your Service → Environment
   - Change `NODE_ENV` from `development` to `production`

2. **Verify CLIENT_ORIGIN includes your frontend:**
   - ✅ Already set: `https://circlo-devs7.vercel.app`

3. **Ensure service is running:**
   - Check: https://circlo-social.onrender.com/api/health
   - Should return: `{"ok":true,"service":"circlo-social","ts":...}`

## Step 2: Configure Frontend (Vercel)

### Required Environment Variables in Vercel:

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

#### 1. Clerk Authentication
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_KEY
```
Get from: https://dashboard.clerk.com → API Keys

#### 2. API Configuration
```
VITE_API_URL=https://circlo-social.onrender.com/api
```
This connects your frontend to your backend!

#### 3. Firebase Configuration (REQUIRED)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```
Get from: https://console.firebase.google.com → Project Settings

**Why required?** The app uses Firebase for real-time reactions, likes, and chat features.

#### 4. App Configuration
```
VITE_APP_URL=https://circlo-devs7.vercel.app
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### How to Add Variables in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project: `circlo-devs7`
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar
5. Add each variable:
   - Key: `VITE_API_URL`
   - Value: `https://circlo-social.onrender.com/api`
   - Environment: Select "Production", "Preview", and "Development"
   - Click "Save"

6. Repeat for all variables above

### Redeploy Frontend:

After adding environment variables:

**Option 1: Via Vercel Dashboard**
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

**Option 2: Via Git Push**
```bash
git commit --allow-empty -m "Trigger Vercel rebuild with new env vars"
git push
```

## Step 3: Verify Connection

### Test 1: Backend Health Check

Open in browser or curl:
```bash
curl https://circlo-social.onrender.com/api/health
```

Expected response:
```json
{"ok":true,"service":"circlo-social","ts":1234567890}
```

### Test 2: Frontend Access

Open: https://circlo-devs7.vercel.app

Expected: Landing page loads correctly

### Test 3: API Connection

Open browser console (F12) on https://circlo-devs7.vercel.app

Check Network tab when:
1. Loading the page
2. Signing in
3. Creating a post

Look for requests to: `https://circlo-social.onrender.com/api/*`

Should see:
- ✅ Status: 200 OK
- ✅ Response headers include CORS headers
- ✅ No CORS errors in console

### Test 4: CORS Verification

In browser console on https://circlo-devs7.vercel.app:

```javascript
fetch('https://circlo-social.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend connected:', data))
  .catch(err => console.error('Connection failed:', err))
```

Should print: `Backend connected: {ok: true, ...}`

## Troubleshooting

### Issue: CORS Error

**Symptom:** Console shows:
```
Access to fetch at 'https://circlo-social.onrender.com/api/...' from origin 'https://circlo-devs7.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Go to Render → Your Service → Environment
2. Check `CLIENT_ORIGIN` includes: `https://circlo-devs7.vercel.app`
3. Save and restart service

### Issue: API Calls Return 401 Unauthorized

**Symptom:** API calls fail with 401 status

**Possible causes:**

1. **Missing Clerk token:**
   - Verify `VITE_CLERK_PUBLISHABLE_KEY` is set in Vercel
   - Check Clerk dashboard for correct key

2. **Backend JWT verification failing:**
   - Verify `CLERK_JWT_PUBLIC_KEY` is correct in Render
   - Get key from: Clerk Dashboard → API Keys → Show JWT public key
   - Ensure it starts with `-----BEGIN PUBLIC KEY-----`

3. **SKIP_AUTH setting:**
   - If `SKIP_AUTH=true`, authentication is bypassed
   - For production, should be `SKIP_AUTH=false`

### Issue: Backend Not Responding

**Symptom:** Requests timeout or return 503

**Solutions:**

1. **Check Render service status:**
   - Go to Render Dashboard
   - Check if service is "Live" (green)
   - Check logs for errors

2. **Free tier spindown:**
   - Render free tier spins down after inactivity
   - First request may take 30-60 seconds
   - Subsequent requests will be fast

3. **Check MongoDB connection:**
   - Verify `MONGO_URI` is correct
   - Check MongoDB Atlas for connection issues

### Issue: Environment Variables Not Applied

**Symptom:** App behaves as if variables aren't set

**Solution:**
1. Verify variables are saved in Vercel
2. Variables must start with `VITE_` to be included in build
3. Redeploy after adding variables
4. Clear browser cache

### Issue: Build Errors After Adding Variables

**Symptom:** Vercel build fails

**Check:**
1. All required variables are set
2. Variables don't have quotes in Vercel UI (it adds them automatically)
3. Multi-line values (like keys) are properly formatted

## Complete Environment Variable Checklist

### Vercel (Frontend) - Required:
- [ ] `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] `VITE_API_URL=https://circlo-social.onrender.com/api`

### Vercel (Frontend) - Optional:
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_DATABASE_URL`
- [ ] `VITE_APP_URL`
- [ ] `VITE_APP_ENV=production`

### Render (Backend) - All Set ✅:
- [x] `MONGO_URI`
- [x] `CLERK_JWT_PUBLIC_KEY`
- [x] `CLIENT_ORIGIN`
- [x] `PORT=4000`
- [x] `NODE_ENV` (should be `production`)
- [x] `SKIP_AUTH=false`
- [x] Firebase variables
- [x] Rate limiting variables

## Quick Commands

### Test Backend from Terminal:
```bash
# Health check
curl https://circlo-social.onrender.com/api/health

# Test CORS
curl -H "Origin: https://circlo-devs7.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://circlo-social.onrender.com/api/health
```

### Check Render Logs:
```bash
# Go to Render Dashboard → Your Service → Logs
# Look for:
# - "Server listening on http://0.0.0.0:4000"
# - "MongoDB connected"
# - No error messages
```

### Force Vercel Rebuild:
```bash
# From your local repo
git commit --allow-empty -m "Redeploy with correct env vars"
git push
```

## Architecture Diagram

```
┌─────────────────────────────────────┐
│  User Browser                       │
└────────────┬────────────────────────┘
             │
             │ HTTPS
             ▼
┌─────────────────────────────────────┐
│  Vercel (Frontend)                  │
│  https://circlo-devs7.vercel.app   │
│                                     │
│  Environment:                       │
│  - VITE_API_URL=                   │
│    https://circlo-social.           │
│    onrender.com/api                │
│  - VITE_CLERK_PUBLISHABLE_KEY      │
└────────────┬────────────────────────┘
             │
             │ API Calls (HTTPS)
             │ with Clerk JWT
             ▼
┌─────────────────────────────────────┐
│  Render (Backend)                   │
│  https://circlo-social.onrender.com│
│                                     │
│  Environment:                       │
│  - CLIENT_ORIGIN=                  │
│    https://circlo-devs7.vercel.app │
│  - CLERK_JWT_PUBLIC_KEY            │
│  - MONGO_URI                       │
└────────────┬────────────────────────┘
             │
             │ MongoDB Protocol
             ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  circlo.opgzfuq.mongodb.net        │
│                                     │
│  Database: circlo_db                │
└─────────────────────────────────────┘
```

## Success Criteria

Your deployment is working correctly when:

1. ✅ https://circlo-devs7.vercel.app loads without errors
2. ✅ https://circlo-social.onrender.com/api/health returns `{"ok":true}`
3. ✅ You can sign in with Clerk
4. ✅ You can create posts
5. ✅ Browser console shows no CORS errors
6. ✅ Network tab shows successful API calls
7. ✅ Posts appear in MongoDB Atlas

## Next Steps

Once connected:

1. **Test all features:**
   - Authentication
   - Create posts
   - Upload images
   - Comments
   - Likes
   - User profiles

2. **Monitor performance:**
   - Check Vercel Analytics
   - Check Render metrics
   - Monitor MongoDB Atlas

3. **Set up monitoring (optional):**
   - Sentry for error tracking
   - LogRocket for session replay
   - Google Analytics

4. **Configure custom domain (optional):**
   - Add your domain to Vercel
   - Update `VITE_APP_URL` and `CLIENT_ORIGIN`

## Support

If you encounter issues:

1. Check Render logs for backend errors
2. Check Vercel deployment logs for build errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Test backend health endpoint directly

---

**Quick Summary:**

1. ✅ Backend is deployed and configured
2. ⚠️ Add `VITE_API_URL=https://circlo-social.onrender.com/api` to Vercel
3. ⚠️ Add `VITE_CLERK_PUBLISHABLE_KEY` to Vercel
4. ⚠️ Redeploy Vercel after adding variables
5. ✅ Test the connection

**Estimated Time:** 5-10 minutes

Good luck! 🚀
