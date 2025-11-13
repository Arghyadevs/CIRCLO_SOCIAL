# 🎬 Reels Autoplay - Quick Start Guide

## ⚡ 30-Second Setup

Your Reels autoplay is **already working**! Here's how to use it:

---

## 🚀 Try It Now

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Sign in** to your account

3. **Click the Video icon** in the left sidebar (should show 🎥)

4. **Scroll up/down** - Videos autoplay when visible!

5. **Click the Mute button** (bottom-right) to toggle sound

---

## ✨ What You Get

### ✅ Autoplay
- Videos automatically play when 50%+ visible
- Videos automatically pause when scrolled away
- No manual setup needed

### ✅ Sound Control  
- Global mute/unmute button
- Mute state persists while scrolling
- Respects browser autoplay policies

### ✅ Modern UI
- TikTok/Instagram Reels style
- Full-screen video experience
- Author info at bottom
- Action buttons on right
- Progress indicator

### ✅ Mobile Ready
- Snap scroll on mobile
- Touch-friendly buttons
- Full responsive design

---

## 🎮 Controls

| Action | How |
|--------|-----|
| **Next reel** | Scroll down |
| **Previous reel** | Scroll up |
| **Mute/Unmute** | Click mute button (bottom-right) |
| **Like** | Click heart icon (right side) |
| **Comment** | Click chat icon (right side) |
| **Share** | Click share icon (right side) |
| **View profile** | Click author avatar |
| **Follow user** | Click "Follow" button |

---

## 🔧 Common Customizations

### Change Autoplay Threshold

**File:** `src/components/home2/ReelsSection.tsx`

**Line ~32:**
```typescript
// Current: Play when 50% visible
{ threshold: [0.5] }

// More aggressive (play at 25%)
{ threshold: [0.25] }

// More conservative (play at 75%)
{ threshold: [0.75] }
```

### Load More Videos

**Line ~60:**
```typescript
// Current: 20 videos
const data = await postsApi.getFeed(1, 20);

// More videos:
const data = await postsApi.getFeed(1, 50);
```

### Move Mute Button

**Line ~91:**
```typescript
// Current: bottom-right
className="fixed bottom-8 right-8 z-50..."

// Top-right:
className="fixed top-8 right-8 z-50..."

// Bottom-left:
className="fixed bottom-8 left-8 z-50..."
```

---

## 📱 Mobile Experience

- ✅ Full-screen videos
- ✅ Smooth snap scrolling
- ✅ Touch-friendly controls
- ✅ Portrait orientation
- ✅ Optimized performance

---

## 🐛 Troubleshooting

### "Videos not autoplaying"
→ Try clicking the play button overlay

### "No videos showing"  
→ Make sure you have posts with video media in database

### "Mute button not working"
→ Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

### "Scroll is laggy"
→ Use smaller/compressed video files

---

## 📂 File Location

```
src/components/home2/ReelsSection.tsx
```

---

## 🎓 How It Works (Simple Version)

```
1. User scrolls
   ↓
2. Browser detects video position
   ↓
3. Video is 50%+ visible?
   ↓
4. YES → Play video
   NO → Pause video
```

That's it! No external libraries, just native browser power.

---

## 🚀 Next Steps (Optional)

Want to add more features? Here are some ideas:

1. **Double-tap to like** - Tap video twice to like
2. **Swipe gestures** - Swipe left/right for prev/next
3. **Comments panel** - Show comments overlay
4. **Share overlay** - Share directly from reels
5. **Analytics** - Track watch time
6. **Infinite scroll** - Load more reels automatically

---

## 📚 Documentation Files

For more details, see:

- `REELS_IMPLEMENTATION.md` - Full technical details
- `AUTOPLAY_OPTIONS_EXPLAINED.md` - Why Option 1 was chosen
- `REELS_AUTOPLAY_SETUP.md` - Advanced customization

---

## ✅ You're All Set!

Your reels section is **production-ready** with:

- ✅ Autoplay on scroll
- ✅ Sound control
- ✅ Modern UI
- ✅ Mobile optimized
- ✅ Zero external dependencies
- ✅ High performance

**Status:** 🟢 Ready to Use

---

## 💬 Need Help?

- Check the documentation files above
- See `REELS_AUTOPLAY_SETUP.md` for troubleshooting
- Review code comments in `ReelsSection.tsx`

---

**Happy scrolling! 🎬**
