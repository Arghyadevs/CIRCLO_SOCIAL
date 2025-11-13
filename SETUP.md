# 🚀 Circlo Social - Setup Guide

Complete setup instructions for getting Circlo Social running on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Clerk Account** - [Sign up](https://clerk.com/)

## 🔧 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd CIRCLO_SOCIAL
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   # MongoDB runs as a service automatically
   ```
3. Verify MongoDB is running:
   ```bash
   mongosh
   # Should connect to mongodb://127.0.0.1:27017
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get connection string from "Connect" → "Connect your application"
4. Whitelist your IP address
5. Create database user with password

### 4. Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Get your **Publishable Key**:
   - Dashboard → API Keys → Copy "Publishable key"
4. Get your **JWT Public Key**:
   - Dashboard → API Keys → "Show JWT public key" → Copy the PEM format key

### 5. Configure Environment Variables

#### Frontend Environment (.env in root)
Create `.env` file in the project root:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_API_URL=http://localhost:4000/api
```

#### Backend Environment (server/.env)
Create `server/.env` file:

```env
# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/circlo_social
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/circlo_social

# Clerk JWT Public Key (paste the entire PEM key)
CLERK_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
(paste your full key here)
...
-----END PUBLIC KEY-----"

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS - Frontend URL
CLIENT_ORIGIN=http://localhost:5173

# Development Mode - Skip auth for testing (set to false in production)
SKIP_AUTH=true
```

**Important Notes:**
- Replace `YOUR_CLERK_PUBLIC_KEY_HERE` with your actual Clerk JWT public key
- Keep the quotes around the public key
- Include the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` lines
- For production, set `SKIP_AUTH=false`

### 6. Verify Setup

Check that all configuration files are in place:

```bash
# Check frontend .env
cat .env

# Check backend .env
cat server/.env

# Verify MongoDB connection
mongosh --eval "db.version()"
```

## 🎯 Running the Application

### Option 1: Run Both Services Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
You should see:
```
Server listening on http://localhost:4000
MongoDB connected
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```
You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Option 2: Run with Concurrently (Single Terminal)

First install concurrently:
```bash
npm install -D concurrently
```

Then run both:
```bash
npm run dev:all
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Circlo Social landing page!

## 🧪 Testing the Setup

### 1. Test Backend API
```bash
curl http://localhost:4000/api/health
```
Expected response:
```json
{"ok":true,"service":"circlo-social","ts":1234567890}
```

### 2. Test Frontend
- Visit `http://localhost:5173`
- Click "Sign In" or "Sign Up"
- Complete Clerk authentication
- You should be redirected to the home dashboard

### 3. Test Database Connection
```bash
mongosh circlo_social --eval "db.stats()"
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: connect ECONNREFUSED`
- **Solution:** Ensure MongoDB is running
  ```bash
  # Check if MongoDB is running
  ps aux | grep mongod
  
  # Start MongoDB
  brew services start mongodb-community  # macOS
  sudo systemctl start mongod            # Linux
  ```

**Error:** `Authentication failed`
- **Solution:** Check MongoDB Atlas credentials and IP whitelist

### Clerk Authentication Issues

**Error:** `Missing publishable key`
- **Solution:** Verify `VITE_CLERK_PUBLISHABLE_KEY` in `.env`
- Ensure the key starts with `pk_test_` or `pk_live_`

**Error:** `Invalid token` on API calls
- **Solution:** 
  1. Set `SKIP_AUTH=true` in `server/.env` for development
  2. Or verify `CLERK_JWT_PUBLIC_KEY` is correctly formatted

### Port Already in Use

**Error:** `Port 4000 is already in use`
```bash
# Find and kill process using port 4000
lsof -ti:4000 | xargs kill -9

# Or change port in server/.env
PORT=4001
```

**Error:** `Port 5173 is already in use`
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Build Errors

**Error:** `Cannot find module 'express'`
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Cannot find module '@/lib/api'`
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`
- **Solution:** Add frontend URL to `CLIENT_ORIGIN` in `server/.env`
  ```env
  CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000
  ```

## 📚 Next Steps

After successful setup:

1. **Explore the API** - Check `server/README.md` for API documentation
2. **Create Test Data** - Sign up and create some posts
3. **Customize** - Modify components in `src/components/`
4. **Deploy** - See deployment section in main README.md

## 🔐 Security Notes

- Never commit `.env` files to version control
- Use `SKIP_AUTH=false` in production
- Rotate Clerk keys regularly
- Use MongoDB Atlas for production (not local MongoDB)
- Enable MongoDB authentication in production

## 💡 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database GUI**: Use [MongoDB Compass](https://www.mongodb.com/products/compass) to view data
3. **API Testing**: Use [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/)
4. **Debugging**: Check browser console and terminal logs

## 📞 Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review error messages carefully
3. Check MongoDB and server logs
4. Verify all environment variables
5. Open an issue on GitHub

---

Happy coding! 🎉