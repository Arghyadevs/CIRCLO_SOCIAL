# Circlo Social - Backend Server

Express + MongoDB + TypeScript backend for Circlo Social platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Clerk account for authentication

### Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - Set `MONGO_URI` to your MongoDB connection string
   - Get Clerk JWT public key from Clerk Dashboard
   - Set `SKIP_AUTH=true` for development (bypasses auth)

4. Start the development server:
```bash
npm run dev
```

Server will run on `http://localhost:4000`

## 📁 Project Structure

```
server/
├── src/
│   ├── index.ts              # Main server file
│   ├── middleware/
│   │   ├── auth.ts           # Clerk JWT authentication
│   │   └── rateLimit.ts      # Rate limiting middleware
│   ├── models/               # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   ├── Comment.ts
│   │   ├── Reaction.ts
│   │   ├── Follow.ts
│   │   └── Message.ts
│   └── routes/               # API route handlers
│       ├── posts.ts
│       ├── profiles.ts
│       ├── comments.ts
│       ├── reactions.ts
│       ├── follows.ts
│       ├── messages.ts
│       ├── notifications.ts
│       └── search.ts
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Posts
- `GET /api/posts` - Get feed posts (paginated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Profiles
- `GET /api/profiles/me` - Get current user profile
- `GET /api/profiles/:clerkId` - Get user profile
- `PATCH /api/profiles/me` - Update profile
- `GET /api/profiles/:clerkId/posts` - Get user's posts

### Comments
- `GET /api/comments?postId=xxx` - Get post comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Reactions
- `POST /api/reactions/toggle` - Toggle like on post
- `GET /api/reactions/check?postId=xxx` - Check if user liked post

### Follows
- `POST /api/follows` - Follow user
- `DELETE /api/follows/:followeeId` - Unfollow user
- `GET /api/follows/followers/:clerkId` - Get followers
- `GET /api/follows/following/:clerkId` - Get following

### Messages
- `GET /api/messages/conversations` - Get conversations list
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message

### Search
- `GET /api/search?q=query&type=users|posts|all` - Search users/posts

### Health
- `GET /api/health` - Health check endpoint

## 🔐 Authentication

The server uses Clerk JWT authentication. All `/api/*` routes (except `/api/health`) require a valid Clerk JWT token in the `Authorization` header:

```
Authorization: Bearer <clerk-jwt-token>
```

For development, set `SKIP_AUTH=true` in `.env` to bypass authentication.

## 🛠️ Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 📊 Database Models

### User
- Clerk ID (unique identifier)
- Username, name, email
- Avatar URL, bio, links
- Verification and privacy flags

### Post
- Author ID, text content
- Media attachments (images/videos)
- Like/comment/share counts
- Visibility settings
- Hashtags and mentions

### Comment
- Post reference
- Author ID, text
- Like count

### Reaction
- Post reference
- User ID, reaction type

### Follow
- Follower/followee relationship

### Message
- From/to user IDs
- Text/media content
- Read status

## 🔒 Security Features

- Rate limiting (100 requests/minute)
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- MongoDB injection prevention
- JWT authentication

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/circlo_social` |
| `CLERK_JWT_PUBLIC_KEY` | Clerk JWT public key (PEM format) | - |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_ORIGIN` | CORS allowed origins (comma-separated) | `*` |
| `SKIP_AUTH` | Skip authentication (dev only) | `false` |

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or connection string is correct
- Check firewall settings for MongoDB port (27017)

### Authentication Errors
- Verify Clerk JWT public key is correctly formatted
- Check that frontend is sending valid JWT tokens
- Use `SKIP_AUTH=true` for development testing

### CORS Errors
- Add frontend URL to `CLIENT_ORIGIN` in `.env`
- Ensure credentials are included in frontend requests