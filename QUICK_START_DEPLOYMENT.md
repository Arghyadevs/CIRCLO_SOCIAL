# 🎯 Quick Start: Production Deployment Guide

## TL;DR - Get Live in 15 Minutes

### Step 1: Set Up Your Secrets (5 minutes)

```bash
# Copy the example environment file
cp .env.production.example .env.production

# Edit it with your credentials
nano .env.production  # or use your editor
```

Fill in these from your services:
- **Firebase:** [console.firebase.google.com](https://console.firebase.google.com)
- **Clerk:** [dashboard.clerk.com](https://dashboard.clerk.com)

### Step 2: Test Build Locally (5 minutes)

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview the build
npm run preview
```

✅ If no errors, you're ready to deploy!

### Step 3: Deploy (5 minutes)

**Choose your platform:**

#### 🎯 Vercel (Recommended - Easiest)
```bash
npm install -g vercel
npm run build
vercel deploy --prod
```

#### 🎯 Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

#### 🎯 Docker
```bash
docker build -t circlo-social:latest .
docker run -p 3000:3000 circlo-social:latest
```

---

## Detailed Setup Checklist

### 1️⃣ Firebase Setup

**Create Production Project:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or use existing
3. Add web app
4. Copy credentials to `.env.production`

**Configure Database:**
```
Firestore > Create Database > Production mode
```

**Set Security Rules:**
Go to Firestore > Rules tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.authorId == request.auth.uid;
      allow update: if request.auth.uid == resource.data.authorId;
      allow delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

**Create Cloud Storage:**
```
Storage > Create bucket > Production
```

### 2️⃣ Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create application
3. Enable authentication methods:
   - Email/Password
   - Google OAuth
4. Go to API Keys tab
5. Copy `Publishable Key` to `VITE_CLERK_PUBLISHABLE_KEY`
6. Set Redirect URLs:
   - Development: `http://localhost:3000/*`
   - Production: `https://yourdomain.com/*`

### 3️⃣ Environment Variables

Create `.env.production`:

```env
# Firebase
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
VITE_FIREBASE_DATABASE_URL=https://project.firebaseio.com

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# API
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
VITE_APP_ENV=production
```

⚠️ **NEVER commit this file to Git!**

### 4️⃣ Domain Setup

**DNS Configuration:**

| Type | Name | Value |
|------|------|-------|
| A | yourdomain.com | 76.76.19.165 |
| CNAME | www | cname.vercel-dns.com |

(Values depend on your hosting provider)

### 5️⃣ Build & Deploy

```bash
# Install dependencies
npm install

# Lint & type check
npm run lint
npm run typecheck

# Build
npm run build

# Test locally
npm run preview

# Deploy
# (Use your chosen platform commands above)
```

---

## Platform-Specific Guides

### 🟢 Vercel (Recommended)

**Pros:**
- Zero config needed
- Automatic deployments on push
- Global CDN
- Free SSL/HTTPS
- Up to 12 deployments/month free

**Setup:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link to project (first time)
vercel link

# 4. Deploy preview
vercel deploy

# 5. Deploy to production
vercel deploy --prod
```

**Add Environment Variables in Vercel Dashboard:**

Settings > Environment Variables

Add each variable from your `.env.production`

**Custom Domain:**

Settings > Domains

Add your domain and follow DNS instructions

---

### 🔵 Netlify

**Pros:**
- Easy GitHub integration
- Branch deployments
- Built-in forms
- Generous free tier

**Setup:**

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. Connect to Git (recommended)
# In Netlify Dashboard:
# New site from Git > Connect repository
```

**Build Settings:**

| Setting | Value |
|---------|-------|
| Build command | npm run build |
| Publish directory | dist |

**Environment Variables:**

Site settings > Build & deploy > Environment

Add all variables from `.env.production`

---

### 🐳 Docker

**Best for:**
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- Kubernetes
- Self-hosted servers

**Build:**

```bash
docker build \
  --build-arg VITE_FIREBASE_API_KEY="key" \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY="key" \
  -t circlo-social:latest .
```

**Run:**

```bash
docker run -p 3000:3000 circlo-social:latest
```

**Or use Docker Compose:**

```bash
docker-compose up -d
```

---

## Testing & Validation

### Before Deploying

```bash
# 1. Lint
npm run lint

# 2. Type check
npm run typecheck

# 3. Build
npm run build

# 4. Preview
npm run preview

# 5. Check file size
du -sh dist/
```

### After Deploying

```bash
✅ HTTPS working?
✅ Site loads in < 3 seconds?
✅ Authentication works?
✅ Database connected?
✅ Can create/edit/delete posts?
✅ Responsive on mobile?
✅ No console errors?
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Loading

```bash
# Check file exists and is in correct location
ls -la .env.production

# Verify format (no spaces around =)
cat .env.production

# Rebuild
npm run build
```

### Site Shows 404

**Solution:** Check SPA fallback configured:
- Vercel: vercel.json has redirects ✅
- Netlify: netlify.toml has redirects ✅
- Other: Configure server to serve index.html

### Slow Performance

```bash
# Analyze bundle
npm run build

# Check file sizes in dist/
du -sh dist/* | sort -hr
```

Common issues:
- Large images → compress with TinyPNG
- Unused deps → `npm audit`
- Missing code splitting → check build config

### Authentication Not Working

**Checklist:**
- [ ] Clerk publishable key correct
- [ ] Redirect URLs configured in Clerk dashboard
- [ ] Development/Production keys correct
- [ ] Environment variable properly set
- [ ] App deployed to correct domain

---

## Monitoring & Maintenance

### Daily (First Week)

- Check error logs
- Monitor uptime
- Test key features
- Review performance

### Weekly

```bash
npm audit  # Security updates
npm run build  # Verify build
npm run typecheck  # Type safety
```

### Monthly

- Update dependencies
- Review analytics
- Check database size
- Verify backups

---

## Common Deployment Issues

| Issue | Solution |
|-------|----------|
| Build fails | Clear cache: `rm -rf node_modules dist && npm install` |
| 404 errors | Enable SPA fallback in hosting config |
| Auth fails | Check Redirect URLs in Clerk dashboard |
| Slow site | Optimize images, check bundle size |
| Can't connect to DB | Verify Firebase credentials, check Security Rules |
| CSS not loaded | Clear browser cache, check path aliases |
| Environment vars not set | Redeploy after adding variables |
| SSL certificate error | Wait 5-15 minutes for propagation |

---

## Post-Launch Monitoring

### Essential Tools

1. **Error Tracking:** Sentry
   ```bash
   npm install @sentry/react
   # Configure in main.tsx
   ```

2. **Performance:** Google Lighthouse
   - Built into Chrome DevTools
   - Target: Score > 80

3. **Uptime:** Uptime Robot or StatusPage
   - Monitor every 5 minutes
   - Alerts to email/Slack

4. **Analytics:** Google Analytics
   ```bash
   # Track user behavior
   # Measure engagement
   ```

---

## Next Steps

1. ✅ Set up all three services (Firebase, Clerk, Hosting)
2. ✅ Create `.env.production` with all keys
3. ✅ Test build locally: `npm run build && npm run preview`
4. ✅ Choose hosting platform
5. ✅ Deploy using platform's CLI or dashboard
6. ✅ Verify site is live at your domain
7. ✅ Configure DNS if not done already
8. ✅ Set up monitoring
9. ✅ Share with users!

---

## Support & Resources

| Resource | Link |
|----------|------|
| Firebase Docs | https://firebase.google.com/docs |
| Clerk Docs | https://clerk.com/docs |
| Vercel Docs | https://vercel.com/docs |
| Netlify Docs | https://docs.netlify.com |
| React Docs | https://react.dev |
| Vite Docs | https://vitejs.dev |

---

## Emergency Support

Having issues?

1. Check `.env.production` has all required variables
2. Run `npm run build` locally to test
3. Check browser console for errors (F12)
4. Review logs in your hosting platform dashboard
5. Check Firebase/Clerk dashboards for connection issues

**Need help?** Check the PRODUCTION_READINESS_GUIDE.md for more details.

---

**Good luck! 🚀 Your app will be live soon!**
