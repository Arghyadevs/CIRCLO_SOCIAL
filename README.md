# 🌀 Circlo Social

A modern, full-stack social media platform built with React, TypeScript, Express, and MongoDB.

## ✨ Features

- 🔐 **Authentication** - Secure auth with Clerk
- 📱 **Posts & Feed** - Create, edit, and share posts with media
- 💬 **Comments** - Engage with posts through comments
- ❤️ **Reactions** - Like and react to content
- 👥 **Follow System** - Follow users and build your network
- 💌 **Messaging** - Direct messages between users
- 🔍 **Search** - Find users and posts
- 📊 **Profiles** - Customizable user profiles
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Real-time Updates** - Fast and responsive user experience

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Clerk** - Authentication
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **TypeScript** - Type safety
- **Zod** - Validation
- **JWT** - Token authentication
- **Helmet** - Security headers
- **Morgan** - Logging

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Clerk account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CIRCLO_SOCIAL
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Configure environment variables**

Create `.env` in root:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
```

Create `server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/circlo_social
CLERK_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_CLERK_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
SKIP_AUTH=true
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
CIRCLO_SOCIAL/
├── Public/                  # Static assets
├── src/                     # Frontend source
│   ├── components/          # React components
│   │   ├── home2/          # Dashboard components
│   │   │   ├── common/     # Shared components
│   │   │   ├── FeedSection.tsx
│   │   │   ├── ProfileSection.tsx
│   │   │   └── ...
│   │   ├── Landing.tsx
│   │   ├── Home.tsx
│   │   └── ...
│   ├── lib/                # Utilities
│   │   └── api.ts          # API client
│   └── App.tsx             # Main app component
├── server/                 # Backend source
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── index.ts        # Server entry
│   └── package.json
├── package.json
└── README.md
```

## 🔌 API Documentation

See [server/README.md](server/README.md) for detailed API documentation.

### Quick Reference

**Base URL:** `http://localhost:3000/api`

**Authentication:** All endpoints (except `/health`) require Clerk JWT token:
```
Authorization: Bearer <token>
```

**Key Endpoints:**
- `GET /posts` - Get feed
- `POST /posts` - Create post
- `GET /profiles/me` - Get current user
- `POST /comments` - Add comment
- `POST /reactions/toggle` - Like/unlike
- `POST /follows` - Follow user
- `GET /search` - Search

## 🎨 Frontend Features

### Components

- **Landing Page** - Marketing page with features
- **Home Dashboard** - Main app interface with tabs:
  - Feed - Post timeline
  - Search - Find users/posts
  - Explore - Trending content
  - Reels - Video content
  - Create - New post form
  - Messages - Direct messaging
  - Notifications - Activity feed
  - Profile - User profile

### API Integration

The frontend uses a centralized API client (`src/lib/api.ts`) for all backend communication:

```typescript
import { api } from '@/lib/api';

// Example usage
const posts = await api.getPosts(1, 20);
const profile = await api.getMyProfile();
await api.createPost({ text: 'Hello Circlo!' });
```

## 🔐 Authentication Flow

1. User signs in via Clerk
2. Clerk issues JWT token
3. Frontend includes token in API requests
4. Backend verifies token and extracts user ID
5. User profile auto-created on first API call

## 🛠️ Development

### Frontend Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Type checking
npm run lint         # Lint code
```

### Backend Development
```bash
cd server
npm run dev          # Start with auto-reload
npm run build        # Compile TypeScript
npm start            # Run compiled code
```

## 📊 Database Schema

### Collections

- **users** - User profiles
- **posts** - User posts with media
- **comments** - Post comments
- **reactions** - Likes on posts
- **follows** - Follow relationships
- **messages** - Direct messages

See model files in `server/src/models/` for detailed schemas.

## 🔒 Security

- Rate limiting (100 req/min)
- CORS protection
- Helmet security headers
- Input validation with Zod
- MongoDB injection prevention
- JWT authentication
- Password hashing (if using local auth)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variables

### Backend (Railway/Render/Heroku)
1. Set environment variables
2. Deploy from `server` directory
3. Ensure MongoDB connection

### Database (MongoDB Atlas)
1. Create cluster
2. Get connection string
3. Update `MONGO_URI`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) - Authentication
- [MongoDB](https://mongodb.com) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide](https://lucide.dev) - Icons

## 📧 Support

For support, email support@circlo.social or open an issue.

---

Made with ❤️ by the Circlo team