# Followers/Following Feature - Troubleshooting Guide

## 🔍 If Real Data Isn't Loading

### Problem: "No followers yet" message always shows

**Solution 1: Check Backend API**
```bash
# Verify your backend is returning real data
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:4000/api/follows/followers/YOUR_CLERK_ID
```

Expected response:
```json
{
  "followers": [
    {
      "clerkId": "user_123",
      "username": "alice",
      "name": "Alice",
      "avatarUrl": "...",
      "bio": "...",
      "stats": { "followerCount": 10, ... }
    }
  ]
}
```

**Solution 2: Check API Endpoints**
Verify these routes exist in your backend:
- `GET /api/follows/followers/:clerkId` 
- `GET /api/follows/following/:clerkId`
- `POST /api/follows` (with followeeId in body)

---

### Problem: Stats show zero but you have followers

**Likely cause**: Stats not being updated in the user profile

**Solution**:
1. Check your user stats are stored in database:
   ```javascript
   // Should have these fields in user model:
   {
     stats: {
       followerCount: number,
       followingCount: number,
       postCount: number
     }
   }
   ```

2. Verify stats are updated when follows are added/removed

3. Check `user.stats?.followerCount` in UserProfileModal shows real number

---

### Problem: Follow/Unfollow button doesn't update

**Solution 1: Check authentication**
- Verify JWT token is being sent with requests
- Check `authenticatedFetch` is working

**Solution 2: Check toggleFollow endpoint**
```bash
curl -X POST http://localhost:4000/api/follows \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"followeeId": "target_user_id"}'
```

Expected response:
```json
{
  "isFollowing": true  // or false
}
```

---

## 🎯 Testing Checklist

### Test on Your Profile
- [ ] Go to your profile
- [ ] Click followers count
- [ ] Modal opens
- [ ] Data loads (not showing "No followers yet" if you have followers)
- [ ] Can click through followers to their profiles

### Test on Another User's Profile
- [ ] Click a post by another user
- [ ] Their profile modal opens
- [ ] Click their followers count
- [ ] See their REAL followers (not yours)
- [ ] Click one of their followers
- [ ] See that follower's profile
- [ ] Click that follower's followers count
- [ ] See THEIR followers

### Test Follow/Unfollow
- [ ] Open any user's profile modal
- [ ] Click followers/following to see their connections
- [ ] Click "Follow" on someone
- [ ] Button changes to "Following"
- [ ] Click "Following"
- [ ] Button changes back to "Follow"

---

## 🐛 Common Issues

### Issue: "Property 'followers' is not iterable"
**Cause**: API returning wrong data format

**Fix**: Check `followsApi.getFollowers()` is returning array, not object
```typescript
// In api.ts, ensure:
const data = await handleResponse<{ followers: User[] }>(response);
return data.followers || [];  // Returns array
```

---

### Issue: Modal appears but no users show
**Possible causes**:
1. API endpoint returning empty array (check backend)
2. User has no followers/following (add followers first)
3. Data format mismatch (check `User` type matches API response)

**Debug steps**:
```typescript
// In FollowersFollowingModal.tsx, add console logs:
console.log('Fetched followers:', followersList);
console.log('Fetched following:', followingList);
```

Then check browser DevTools Console to see actual data

---

### Issue: Can't see other users' followers/following
**Solution**: Make sure you're clicking on OTHER users' stats in UserProfileModal
- Don't use ProfileSection modal for other users
- UserProfileModal is for viewing ANY user
- Click a post by someone else → their modal opens → click their stats

---

## 🔧 Debugging Tips

### 1. Console Logs
Add temporary logs to see what's happening:

```typescript
// In FollowersFollowingModal.tsx fetchLists():
const fetchLists = async () => {
  try {
    setLoading(true);
    console.log('Fetching for userId:', userId);
    
    const followersList = await followsApi.getFollowers(userId);
    console.log('Followers response:', followersList);
    
    const followingList = await followsApi.getFollowing(userId);
    console.log('Following response:', followingList);
    
    setFollowers(followersList);
    setFollowing(followingList);
    // ...
  }
};
```

### 2. Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Click followers/following stats
4. Check requests to `/follows/followers/` and `/follows/following/`
5. See actual response data
6. Check if 200 status code

### 3. Check User Type
Verify the `User` type matches your API response:
```typescript
// Should have:
interface User {
  clerkId: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  stats?: {
    followerCount: number;
    followingCount: number;
    postCount: number;
  };
}
```

---

## ✅ Verification Steps

Run these checks to confirm everything works:

```bash
# 1. Build succeeds
npm run build

# 2. No TypeScript errors
npm run tsc

# 3. Check API is accessible
curl http://localhost:4000/api/follows/followers/YOUR_ID
```

---

## 📞 Still Not Working?

### Check These Files
1. **API Configuration**
   - `src/utils/api.ts` - followsApi methods
   - Verify endpoints match your backend routes

2. **Components**
   - `src/components/home2/ProfileSection.tsx` - Your profile
   - `src/components/home2/UserProfileModal.tsx` - Other users
   - `src/components/home2/FollowersFollowingModal.tsx` - Modal logic

3. **Authentication**
   - Check JWT token is valid
   - Verify `authenticatedFetch` sends token correctly

4. **Backend**
   - Verify endpoints exist and return correct format
   - Check database has follow relationships
   - Ensure stats are being updated

---

## 🚀 Performance Tips

If loading is slow:

1. **Add pagination** to followers/following lists
```typescript
// Limit results
async getFollowers(clerkId: string, limit = 50): Promise<User[]>
```

2. **Cache followers lists** to reduce API calls
```typescript
const [cache, setCache] = useState<Record<string, User[]>>({});
```

3. **Lazy load profiles** when opening profile modal
```typescript
// Only fetch stats when modal opens, not before
```

---

## 📊 Expected Data Flow

```
User Clicks Stats
     ↓
userId passed to modal
     ↓
Modal mounts, calls fetchLists()
     ↓
authenticatedFetch(/follows/followers/{userId})
     ↓
Backend queries database
     ↓
Returns array of User objects
     ↓
Modal renders list
     ↓
User can interact (follow/unfollow, click profile)
```

If any step fails, check the Network tab in DevTools to see which request failed.

---

## ✨ All Set!

Your followers/following feature should now:
- ✅ Fetch real data from your backend
- ✅ Show followers/following for any user
- ✅ Allow follow/unfollow
- ✅ Support profile navigation
- ✅ Update instantly

Good luck! 🎉
