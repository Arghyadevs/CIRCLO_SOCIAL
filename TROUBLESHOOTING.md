# 🔧 Troubleshooting Guide - Circlo Social

## Common Issues and Solutions

### 1. Firebase Initialization Error

**Symptom:** 
```
Error: Missing Firebase configuration
```

**Cause:** Firebase environment variables not set in Vercel

**Solution:**
Add ALL 7 Firebase variables to Vercel:
```
VITE_FIREBASE_API_KEY=AIzaSyB30pDe0kQkIURaoOsS1MuLJp2NyHbXMY0
VITE_FIREBASE_AUTH_DOMAIN=circlo-d9991.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=circlo-d9991
VITE_FIREBASE_STORAGE_BUCKET=circlo-d9991.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=388239881953
VITE_FIREBASE_APP_ID=1:388239881953:web:847e9123297f3cdcdaa9a0
VITE_FIREBASE_MEASUREMENT_ID=G-EPGN2TKHYB
```

**Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above (one by one)
3. Select "Production", "Preview", and "Development" for each
4. Click Save
5. Redeploy: Deployments → ... menu → Redeploy

---

### 2. API Connection Failed / CORS Error

**Symptom:** 
```
Access to fetch blocked by CORS policy
```
or
```
Failed to fetch
```

**Cause:** `VITE_API_URL` not set or incorrect

**Solution:**
1. Add to Vercel:
```
VITE_API_URL=https://circlo-social.onrender.com/api
```
2. Verify backend `CLIENT_ORIGIN` in Render includes:
```
CLIENT_ORIGIN=https://circlo-devs7.vercel.app,http://localhost:5173
```

---

### 3. Authentication Not Working

**Symptom:**
- Can't sign in
- 401 Unauthorized errors
- Clerk sign-in screen doesn't appear

**Cause:** Missing Clerk configuration

**Solution:**
Add to Vercel:
```
VITE_CLERK_PUBLISHABLE_KEY=[your_clerk_key]
```

Get from: https://dashboard.clerk.com → API Keys

---

### 4. Backend Not Responding (503)

**Symptom:**
- API calls timeout
- 503 Service Unavailable
- First load is very slow

**Cause:** Render free tier spins down after inactivity

**Solution:**
- First request takes 30-60 seconds to wake up
- Wait and refresh
- For production, upgrade to paid tier for always-on service

---

### 5. Real-time Features Not Working

**Symptom:**
- Reactions/likes don't update in real-time
- Chat messages don't appear
- Can't see live updates

**Cause:** Firebase not properly configured

**Solution:**
1. Verify ALL 7 Firebase variables are set in Vercel
2. Check browser console for Firebase errors
3. Ensure Firebase Firestore is enabled in Firebase Console
4. Check Firebase security rules allow read/write

---

### 6. Images/Videos Not Loading

**Symptom:**
- Uploaded images don't display
- 404 errors on media files

**Cause:** File upload path or CORS issue

**Solution:**
1. Check backend `CLIENT_ORIGIN` includes your frontend URL
2. Verify uploads directory exists on backend
3. Check backend logs for upload errors

---

### 7. Build Fails on Vercel

**Symptom:**
```
Build failed
```

**Cause:** 
- Missing environment variables during build
- TypeScript errors
- Dependency issues

**Solution:**
1. Check Vercel build logs for specific error
2. Ensure all `VITE_*` variables are set
3. Variables must be set BEFORE building
4. Try redeploy after adding variables

---

### 8. Environment Variables Not Applied

**Symptom:**
- Changes not taking effect
- Still seeing old behavior

**Cause:** Variables not included in build

**Solution:**
1. Environment variables must start with `VITE_` for Vite to include them
2. Must redeploy after adding/changing variables
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console: `console.log(import.meta.env)`

---

## Quick Diagnostic Steps

### Step 1: Check All Variables Are Set

**Vercel Environment Variables (Required):**
- [ ] `VITE_API_URL`
- [ ] `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID`

**Render Environment Variables (Should be set):**
- [x] `MONGO_URI`
- [x] `CLERK_JWT_PUBLIC_KEY`
- [x] `CLIENT_ORIGIN`
- [x] `PORT`
- [x] `NODE_ENV`
- [x] Firebase variables

### Step 2: Check Browser Console

1. Open your app: https://circlo-devs7.vercel.app
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors (red text)

**Common errors:**
- `Missing Firebase configuration` → Add Firebase env vars
- `Failed to fetch` → Check VITE_API_URL
- `CORS policy` → Check CLIENT_ORIGIN on backend
- `401 Unauthorized` → Check Clerk key

### Step 3: Check Network Tab

1. F12 → Network tab
2. Refresh page
3. Look for failed requests (red)
4. Click on failed request
5. Check:
   - Request URL - Should point to correct backend
   - Response - Check error message
   - Headers - Check CORS headers

### Step 4: Verify Backend

Test backend directly:
```bash
curl https://circlo-social.onrender.com/api/health
```

Should return:
```json
{"ok":true,"service":"circlo-social","ts":...}
```

If not:
- Check Render service status
- Check Render logs for errors
- Verify backend is deployed and running

---

## How to Check Your Configuration

### Method 1: Check Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (circlo-devs7)
3. Go to Settings → Environment Variables
4. Verify all variables are present and correct
5. Variables should show "..." (hidden) for security

### Method 2: Check Browser Console

In browser console, run:
```javascript
// Check if API URL is set
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check if Firebase is configured
console.log('Firebase Project:', import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Check if Clerk is configured
console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + '...');
```

If any show `undefined`, that variable is not set.

### Method 3: Check Deployment Logs

**Vercel:**
1. Go to Deployments
2. Click on latest deployment
3. View build logs
4. Look for errors or warnings

**Render:**
1. Go to your service
2. Click Logs tab
3. Look for errors when app starts
4. Check for MongoDB connection
5. Check for CORS issues

---

## Still Having Issues?

### What to Check:

1. **All environment variables are set in Vercel** (not just some)
2. **Redeployed Vercel after adding variables** (variables only apply after redeploy)
3. **Backend is running** (check Render dashboard shows "Live")
4. **CLIENT_ORIGIN on backend includes your frontend URL exactly**
5. **No typos in environment variable names** (must match exactly, including case)
6. **No extra spaces** in variable values

### Get More Help:

1. Check browser console for specific error messages
2. Check Render logs for backend errors
3. Check Vercel build logs for deployment errors
4. Review [CONNECT_NOW.md](./CONNECT_NOW.md) for step-by-step setup
5. Review [VERCEL_RENDER_SETUP.md](./VERCEL_RENDER_SETUP.md) for detailed guide

---

## Verification Checklist

After fixing issues, verify everything works:

- [ ] App loads without errors
- [ ] No errors in browser console
- [ ] Can sign in with Clerk
- [ ] Can create a post
- [ ] Can like/react to posts
- [ ] Can comment on posts
- [ ] Can upload images
- [ ] Can send messages
- [ ] Real-time updates work

---

## Emergency Reset

If nothing works, try this:

1. **Delete all environment variables in Vercel**
2. **Add them back one by one** using values from your notes
3. **Redeploy after adding all variables**
4. **Clear browser cache completely**
5. **Test in incognito/private window**

---

**Remember:** Most issues are caused by:
1. Missing environment variables (70%)
2. Not redeploying after adding variables (20%)
3. Typos in variable names or values (10%)

Double-check your setup using the checklists above!
