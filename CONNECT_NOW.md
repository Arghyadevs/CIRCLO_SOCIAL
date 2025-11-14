# 🔌 CONNECT YOUR DEPLOYMENT NOW

## ⚡ 3 Simple Steps (10 Minutes)

Your backend is ready! Just connect your frontend:

---

## Step 1: Add Environment Variables to Vercel (5 min)

### Go to Vercel:
👉 **https://vercel.com/dashboard**

1. Click your project: **circlo-devs7**
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in left menu

### Add These 2 Variables:

#### Variable 1: API URL
```
Name:        VITE_API_URL
Value:       https://circlo-social.onrender.com/api
Environment: ✅ Production ✅ Preview ✅ Development
```
👆 Copy this exactly! ⚠️ No quotes, no trailing slash

#### Variable 2: Clerk Key
```
Name:        VITE_CLERK_PUBLISHABLE_KEY  
Value:       [Get from Clerk Dashboard]
Environment: ✅ Production ✅ Preview ✅ Development
```

**How to get Clerk key:**
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Go to: **API Keys**
4. Copy the **Publishable Key** (starts with `pk_`)

### 💡 Optional: Add Firebase (if you use it)
```
VITE_FIREBASE_PROJECT_ID=circlo-d9991
VITE_FIREBASE_AUTH_DOMAIN=circlo-d9991.firebaseapp.com
```

---

## Step 2: Redeploy Vercel (2 min)

### Option A: Via Dashboard (Easier)
1. Go to **"Deployments"** tab in Vercel
2. Find your latest deployment
3. Click the **"..."** menu button
4. Click **"Redeploy"**
5. Click **"Redeploy"** again to confirm

### Option B: Via Git Push
```bash
git commit --allow-empty -m "Add production env vars"
git push
```

**Wait 2-3 minutes for deployment to complete** ⏱️

---

## Step 3: Test Your App (3 min)

### 1. Open Your App
👉 **https://circlo-devs7.vercel.app**

### 2. Check Console (Press F12)
- Should see NO red errors
- Should see NO CORS errors

### 3. Try These Actions:
- ✅ Click "Get Started" or "Sign In"
- ✅ Sign in with Clerk
- ✅ Create a post
- ✅ Upload an image
- ✅ View your profile

### 4. Run Test Script (Optional)
```bash
./test-production.sh
```

---

## ✅ Success Checklist

Your app is connected when:

- [ ] Vercel shows latest deployment is "Ready"
- [ ] App loads without errors
- [ ] No CORS errors in browser console
- [ ] Can sign in successfully
- [ ] Can create posts
- [ ] Posts appear in the feed

---

## 🚨 If Something's Wrong

### "CORS error" in console?
**Fix:** 
- Double-check `VITE_API_URL` in Vercel
- Make sure it's: `https://circlo-social.onrender.com/api`
- No trailing slash!

### "401 Unauthorized" errors?
**Fix:**
- Add `VITE_CLERK_PUBLISHABLE_KEY` to Vercel
- Get it from: https://dashboard.clerk.com
- Redeploy Vercel

### Backend not responding?
**Fix:**
- Render free tier spins down after inactivity
- First request takes 30-60 seconds
- Just wait and refresh

### Still stuck?
**Check:**
1. [VERCEL_RENDER_SETUP.md](./VERCEL_RENDER_SETUP.md) - Detailed guide
2. [DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md) - Quick reference
3. Run `./test-production.sh` for diagnostics

---

## 🎯 Quick Reference

### Your URLs
- **Frontend:** https://circlo-devs7.vercel.app
- **Backend:** https://circlo-social.onrender.com
- **Health Check:** https://circlo-social.onrender.com/api/health

### Required Environment Variables
| Platform | Variable | Value |
|----------|----------|-------|
| Vercel | `VITE_API_URL` | `https://circlo-social.onrender.com/api` |
| Vercel | `VITE_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard |
| Render | Already configured ✅ | All set! |

---

## 📸 Visual Guide

### 1. Vercel Dashboard
```
Dashboard → Your Project → Settings → Environment Variables
```

### 2. Add Variable Screen
```
[Name Field]          VITE_API_URL
[Value Field]         https://circlo-social.onrender.com/api
[Environment]         ✅ Production ✅ Preview ✅ Development
[Save Button]         👈 Click here
```

### 3. Redeploy
```
Deployments → Latest → ... Menu → Redeploy
```

---

## ⏱️ Time Breakdown

- Add env vars: **2 minutes**
- Redeploy wait: **2-3 minutes**  
- Test app: **2-3 minutes**
- **Total: ~7-10 minutes**

---

## 💡 Pro Tips

1. **Copy-paste carefully** - One typo breaks everything
2. **No quotes needed** - Vercel adds them automatically
3. **Check all 3 environments** - Production, Preview, Development
4. **Clear browser cache** - After redeployment
5. **Wait for green checkmark** - In Vercel deployments

---

## 🎉 You're Almost There!

Your backend is already configured and running. Just add those 2 variables to Vercel and you're done!

**Need help?** Check the detailed guides in this repo.

---

**Let's go! 🚀**
