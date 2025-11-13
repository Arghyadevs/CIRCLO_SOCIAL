# 📡 Circlo Social API Reference

Quick reference guide for all API endpoints.

## Base URL
```
http://localhost:4000/api
```

## Authentication

All endpoints (except `/health`) require Clerk JWT token:

```http
Authorization: Bearer <clerk-jwt-token>
```

For development, set `SKIP_AUTH=true` in `server/.env` to bypass authentication.

---

## 📝 Posts

### Get Feed Posts
```http
GET /posts?page=1&limit=20
```

**Response:**
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get Single Post
```http
GET /posts/:id
```

### Create Post
```http
POST /posts
Content-Type: application/json

{
  "text": "Hello Circlo!",
  "media": [
    {
      "url": "https://example.com/image.jpg",
      "type": "image"
    }
  ]
}
```

### Update Post
```http
PATCH /posts/:id
Content-Type: application/json

{
  "text": "Updated text"
}
```

### Delete Post
```http
DELETE /posts/:id
```

---

## 👤 Profiles

### Get Current User Profile
```http
GET /profiles/me
```

**Response:**
```json
{
  "clerkId": "user_123",
  "username": "johndoe",
  "name": "John Doe",
  "bio": "Software developer",
  "avatarUrl": "https://...",
  "stats": {
    "postCount": 42,
    "followerCount": 100,
    "followingCount": 50
  }
}
```

### Get User Profile
```http
GET /profiles/:clerkId
```

### Update Profile
```http
PATCH /profiles/me
Content-Type: application/json

{
  "username": "newusername",
  "name": "New Name",
  "bio": "Updated bio",
  "avatarUrl": "https://...",
  "links": ["https://example.com"]
}
```

### Get User's Posts
```http
GET /profiles/:clerkId/posts?page=1&limit=20
```

---

## 💬 Comments

### Get Post Comments
```http
GET /comments?postId=<post-id>
```

### Create Comment
```http
POST /comments
Content-Type: application/json

{
  "postId": "507f1f77bcf86cd799439011",
  "text": "Great post!"
}
```

### Delete Comment
```http
DELETE /comments/:id
```

---

## ❤️ Reactions

### Toggle Like
```http
POST /reactions/toggle
Content-Type: application/json

{
  "postId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "liked": true
}
```

### Check Like Status
```http
GET /reactions/check?postId=<post-id>
```

**Response:**
```json
{
  "liked": false
}
```

---

## 👥 Follows

### Follow User
```http
POST /follows
Content-Type: application/json

{
  "followeeId": "user_123"
}
```

### Unfollow User
```http
DELETE /follows/:followeeId
```

### Get Followers
```http
GET /follows/followers/:clerkId
```

**Response:**
```json
[
  {
    "followerId": "user_123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Following
```http
GET /follows/following/:clerkId
```

---

## 💌 Messages

### Get Conversations
```http
GET /messages/conversations
```

**Response:**
```json
[
  {
    "_id": "user_456",
    "lastMessage": {
      "fromId": "user_123",
      "toId": "user_456",
      "text": "Hey!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

### Get Messages with User
```http
GET /messages/:userId
```

### Send Message
```http
POST /messages
Content-Type: application/json

{
  "toId": "user_456",
  "text": "Hello!"
}
```

Or with media:
```json
{
  "toId": "user_456",
  "mediaUrl": "https://example.com/image.jpg"
}
```

### Delete Message
```http
DELETE /messages/:id
```

---

## 🔍 Search

### Search Users and Posts
```http
GET /search?q=<query>&type=<users|posts|all>
```

**Examples:**
```http
GET /search?q=john&type=users
GET /search?q=react&type=posts
GET /search?q=javascript&type=all
```

**Response:**
```json
{
  "users": [...],
  "posts": [...]
}
```

---

## 🔔 Notifications

### Get Notifications
```http
GET /notifications
```

**Response:**
```json
{
  "notifications": []
}
```

*Note: Notification system is a placeholder for future implementation*

---

## 🏥 Health Check

### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "ok": true,
  "service": "circlo-social",
  "ts": 1234567890
}
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### Validation Errors

```json
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["text"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

---

## 📊 Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Response when exceeded:**
  ```json
  {
    "error": "Too many requests, please try again later"
  }
  ```

---

## 🔧 Frontend Usage

Using the API client (`src/lib/api.ts`):

```typescript
import { api } from '@/lib/api';

// Get posts
const { posts, pagination } = await api.getPosts(1, 20);

// Create post
await api.createPost({
  text: 'Hello Circlo!',
  media: [{ url: 'https://...', type: 'image' }]
});

// Get profile
const profile = await api.getMyProfile();

// Toggle like
const { liked } = await api.toggleLike(postId);

// Follow user
await api.followUser(userId);

// Search
const results = await api.search('react', 'all');
```

---

## 🧪 Testing with cURL

### Create a Post
```bash
curl -X POST http://localhost:4000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"Hello from cURL!"}'
```

### Get Posts
```bash
curl http://localhost:4000/api/posts?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Toggle Like
```bash
curl -X POST http://localhost:4000/api/reactions/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"postId":"507f1f77bcf86cd799439011"}'
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- MongoDB ObjectIds are 24-character hex strings
- Clerk user IDs start with `user_`
- Set `SKIP_AUTH=true` in development to bypass authentication
- All text fields support UTF-8 characters
- Media URLs must be valid HTTPS URLs

---

For more details, see [server/README.md](server/README.md)