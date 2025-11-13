# 🚀 Production Deployment Checklist

## Pre-Deployment (1-2 weeks before)

### Code Quality
- [ ] Run `npm run lint` - all issues fixed
- [ ] Run `npm run typecheck` - no TypeScript errors
- [ ] Code review completed
- [ ] All tests passing (if applicable)
- [ ] No console.logs in production code
- [ ] No commented-out code
- [ ] No TODOs or FIXMEs left

### Security Review
- [ ] All API calls use HTTPS
- [ ] No sensitive data hardcoded in frontend
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] No security vulnerabilities in dependencies
  ```bash
  npm audit
  ```
- [ ] XSS prevention verified
- [ ] CSRF tokens implemented (if needed)

### Performance Testing
```bash
# Build for production
npm run build

# Check bundle size
du -sh dist/

# Verify build output
npm run preview
```

- [ ] Build completes without errors
- [ ] Bundle size < 500KB (gzipped)
- [ ] No warnings in console
- [ ] Page loads in < 3 seconds
- [ ] Lighthouse score > 80
- [ ] Images optimized
- [ ] No unused dependencies

### Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Database Setup (1 week before)

### Firebase Configuration
- [ ] Production Firebase project created
- [ ] Firestore database configured
- [ ] Cloud Storage bucket configured
- [ ] Authentication methods enabled:
  - [ ] Email/Password
  - [ ] Google OAuth
  - [ ] Clerk integration
- [ ] Security rules deployed
- [ ] Database indexes created
- [ ] Backup schedule configured
- [ ] Error logging configured

### Database Indexes
```bash
# Create these indexes in Firestore:
# 1. posts collection: createdAt (descending)
# 2. posts collection: authorId + createdAt
# 3. users collection: username
```

---

## Third-Party Services Setup

### Clerk Authentication
- [ ] Production Clerk project created
- [ ] OAuth configured
- [ ] Clerk API keys obtained
- [ ] Redirect URLs configured:
  - [ ] `https://circlo.app`
  - [ ] `https://circlo.app/auth/callback`
- [ ] Environment variables configured
- [ ] Email templates customized (optional)

### Monitoring & Observability
- [ ] Sentry account created
- [ ] Sentry DSN configured
- [ ] Error notifications enabled
- [ ] Google Analytics configured
- [ ] Uptime monitoring setup (StatusPage.io, Uptimerobot)

---

## Infrastructure Setup

### Domain & DNS
- [ ] Domain registered (e.g., circlo.app)
- [ ] Domain ownership verified
- [ ] DNS records configured:
  - [ ] A records pointing to hosting
  - [ ] MX records (for email)
  - [ ] TXT records (SPF, DKIM)
- [ ] SSL certificate issued
- [ ] Certificate auto-renewal configured

### Hosting Platform

#### If using Vercel:
- [ ] Vercel project created
- [ ] GitHub repository connected
- [ ] Environment variables added:
  - [ ] Firebase API keys
  - [ ] Clerk keys
  - [ ] API base URL
  - [ ] Sentry DSN
- [ ] Custom domain connected
- [ ] Automatic deployments configured
- [ ] Preview deployments enabled

#### If using Netlify:
- [ ] Netlify site created
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Custom domain connected
- [ ] Analytics enabled

#### If using Docker:
- [ ] Docker image built and tested
- [ ] Container registry account (Docker Hub, ECR, GCR)
- [ ] Image pushed to registry
- [ ] Kubernetes manifest files created (if using K8s)
- [ ] Orchestration platform configured (GKE, ECS, etc.)

---

## Environment Variables

### Create in hosting platform (NOT in Git):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_DATABASE_URL
VITE_CLERK_PUBLISHABLE_KEY
VITE_API_BASE_URL
VITE_APP_URL
VITE_APP_ENV=production
VITE_SENTRY_DSN
```

---

## 48 Hours Before Launch

### Final Testing
- [ ] Full end-to-end testing in staging
- [ ] All user flows tested:
  - [ ] Sign up / Login
  - [ ] Create post
  - [ ] Edit post
  - [ ] Delete post
  - [ ] Like/Save post
  - [ ] Follow user
  - [ ] View profile
  - [ ] Settings changes
- [ ] Premium features tested:
  - [ ] Boost post
  - [ ] Reframe
  - [ ] Mood
  - [ ] Collaborator
  - [ ] Remix
- [ ] Mobile testing completed
- [ ] Error handling verified
- [ ] Loading states verified

### Performance Verification
- [ ] Run production build test
- [ ] Response times acceptable
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] No background process issues

### Documentation
- [ ] README updated with production URLs
- [ ] API documentation complete
- [ ] Deployment guide created
- [ ] Troubleshooting guide created
- [ ] Team trained on deployment

### Rollback Plan
- [ ] Rollback procedure documented
- [ ] Previous version backed up
- [ ] Team knows how to rollback
- [ ] Estimated rollback time: _____ minutes

---

## Launch Day

### 2 Hours Before
- [ ] All team members notified
- [ ] Monitoring dashboards open
- [ ] Slack/Discord notifications configured
- [ ] Status page prepared
- [ ] Customer communication drafted

### Deployment
```bash
# 1. Final check
npm run build
npm run lint
npm run typecheck

# 2. Push to main branch
git push origin main

# 3. Monitor CI/CD pipeline
# Verify build successful
# Verify tests passing
# Verify deployment initiated

# 4. Verify production site
# Open https://circlo.app
# Test all critical features
# Check console for errors
```

- [ ] Build completed successfully
- [ ] Deployment completed successfully
- [ ] DNS propagated (may take 24-48 hours)
- [ ] HTTPS working
- [ ] Database accessible
- [ ] Authentication working
- [ ] All core features operational

### Immediate Post-Launch (Next 24 hours)
- [ ] Monitor error logs closely
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Fix any critical bugs immediately
- [ ] Monitor CPU/Memory usage
- [ ] Check database performance
- [ ] Verify backups working

---

## Post-Launch Week

### Daily
- [ ] Review error logs
- [ ] Monitor performance
- [ ] Check user feedback
- [ ] Verify backups
- [ ] Monitor uptime

### Weekly
- [ ] Performance analysis
- [ ] Security audit
- [ ] Analytics review
- [ ] User feedback summary
- [ ] Dependency updates check

---

## Success Criteria

✅ All these must be true:
- [ ] Zero critical errors in production
- [ ] Page load time < 3 seconds
- [ ] 99.9% uptime
- [ ] All user flows working
- [ ] Mobile responsive
- [ ] Database backups automated
- [ ] Error monitoring active
- [ ] Analytics tracking users
- [ ] SSL certificate valid
- [ ] DNS resolving correctly

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Lead Developer | | | |
| DevOps | | | |
| Firebase Support | | | |
| Domain Registrar | | | |
| Hosting Support | | | |

---

## Post-Mortem (After successful launch)

- [ ] Document what went well
- [ ] Document what could be improved
- [ ] Document any incidents
- [ ] Team debrief completed
- [ ] Process improvements identified
- [ ] Update deployment guide based on learnings

---

## Ongoing Maintenance

### Weekly
```bash
npm audit
npm run build
```

### Monthly
- [ ] Security updates
- [ ] Dependency updates
- [ ] Performance review
- [ ] Database cleanup
- [ ] Backup verification
- [ ] Analytics analysis

### Quarterly
- [ ] Full security audit
- [ ] Major dependency updates
- [ ] Feature performance analysis
- [ ] Capacity planning
- [ ] Cost optimization review

---

**Good luck with your launch! 🚀**

Last updated: [Add current date]
Deployment date: ___________
Deployed by: ___________
Review date: ___________
