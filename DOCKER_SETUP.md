# 🐳 Docker Setup Guide - Circlo Social

Run the entire Circlo Social stack (frontend, backend, and MongoDB) with Docker Compose.

## Prerequisites

- Docker 20.10 or later
- Docker Compose V2 (bundled with Docker Desktop)

## Quick Start

### 1. Configure Environment Variables

```bash
# Copy the Docker environment template
cp .env.docker.example .env.docker

# Edit .env.docker with your credentials
nano .env.docker  # or use your preferred editor
```

**Required variables to set:**
- `VITE_CLERK_PUBLISHABLE_KEY` - Get from [Clerk Dashboard](https://dashboard.clerk.com)
- `CLERK_JWT_PUBLIC_KEY` - Get from Clerk Dashboard -> API Keys -> Show JWT public key

### 2. Start the Stack

```bash
# Build and start all services
docker-compose --env-file .env.docker up -d

# View logs
docker-compose logs -f

# Stop viewing logs: Ctrl+C
```

### 3. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api/health
- **MongoDB:** localhost:27017

### 4. Stop the Stack

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

---

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │    MongoDB      │
│   (React)       │─────▶│   (Express)     │─────▶│   (Database)    │
│   Port: 3000    │      │   Port: 4000    │      │   Port: 27017   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Services

### Frontend (circlo-frontend)
- Serves the React application
- Built with Vite
- Runs on port 3000
- Connects to backend at port 4000

### Backend (circlo-backend)
- Express.js API server
- Runs on port 4000
- Connects to MongoDB
- Handles authentication with Clerk

### MongoDB (circlo-mongodb)
- MongoDB database
- Runs on port 27017
- Data persisted in Docker volume

---

## Development with Docker

### Live Development Mode

For development with hot-reload:

```bash
# Start only MongoDB
docker-compose up -d mongodb

# Run backend locally
cd server
npm run dev

# Run frontend locally (in another terminal)
npm run dev
```

This gives you hot-reload while using Docker for MongoDB.

---

## Useful Commands

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute Commands in Containers
```bash
# Access backend shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all
```

---

## Production Deployment with Docker

### 1. Update Environment Variables

Create `.env.docker` with production values:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
VITE_API_URL=https://api.yourdomain.com/api
CLIENT_ORIGIN=https://yourdomain.com
SKIP_AUTH=false
```

### 2. Use External MongoDB (Recommended)

For production, use MongoDB Atlas or a managed database:

```yaml
# In docker-compose.yml, update backend service:
environment:
  - MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/circlo_social
```

Or set in `.env.docker`:
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/circlo_social
```

Then remove the `mongodb` service from docker-compose.yml.

### 3. Deploy

```bash
# Build and start in production mode
docker-compose --env-file .env.docker up -d
```

---

## Troubleshooting

### Port Already in Use

If you get "port is already allocated" error:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :4000

# Kill the process or change ports in docker-compose.yml
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Try restarting MongoDB
docker-compose restart mongodb
```

### Backend Can't Connect to MongoDB

The backend connects to MongoDB using the service name `mongodb` (Docker DNS).

Ensure `MONGO_URI` in backend environment is:
```
mongodb://mongodb:27017/circlo_social
```

Not `localhost` when running in Docker.

### Frontend Can't Reach Backend

1. Check `VITE_API_URL` in `.env.docker`
2. Verify backend is running: `docker-compose ps backend`
3. Test backend health: `curl http://localhost:4000/api/health`
4. Check CORS: Ensure `CLIENT_ORIGIN` includes your frontend URL

### Permission Issues on Linux

If you get permission errors:

```bash
# Run with sudo
sudo docker-compose up -d

# Or add your user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Container Keeps Restarting

```bash
# Check logs for errors
docker-compose logs backend

# Common issues:
# - Missing environment variables
# - MongoDB not ready yet (backend retries automatically)
# - Port conflicts
```

---

## Advanced Configuration

### Custom Ports

Edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Access on port 8080
  
  backend:
    ports:
      - "5000:4000"  # Access on port 5000
```

Don't forget to update `VITE_API_URL` accordingly.

### Resource Limits

Add resource limits to services:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Health Checks

Health checks are already configured for the backend. To add for frontend:

```yaml
services:
  frontend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 3s
      retries: 3
```

---

## Data Persistence

MongoDB data is stored in a Docker volume named `mongodb_data`.

### Backup Database

```bash
# Create backup
docker-compose exec mongodb mongodump --out=/tmp/backup

# Copy backup to host
docker cp circlo-mongodb:/tmp/backup ./mongodb-backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./mongodb-backup circlo-mongodb:/tmp/backup

# Restore
docker-compose exec mongodb mongorestore /tmp/backup
```

---

## Security Best Practices

1. **Never commit `.env.docker`** - It contains secrets
2. **Use strong MongoDB password** in production
3. **Set `SKIP_AUTH=false`** in production
4. **Use HTTPS** in production with a reverse proxy (nginx, Traefik)
5. **Regularly update images**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## Next Steps

- ✅ Configure your Clerk account
- ✅ Set up MongoDB Atlas for production
- ✅ Configure Firebase (if using file uploads)
- ✅ Set up domain and SSL certificate
- ✅ Configure monitoring and logging

For more information:
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Main README](./README.md)

---

**Happy Dockering! 🐳**
