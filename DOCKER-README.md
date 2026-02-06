# 🐳 Pinnacle AI Project Tracker - Docker Deployment

## Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### 1. Deploy with One Command

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. Manual Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Access Your Application

- **Application**: http://localhost:7855
- **Database**: localhost:5500

## 📋 Default Login Credentials

- **Admin**: admin@pinnacleai.com / admin123
- **User**: user@pinnacleai.com / user123

## 🛠️ Docker Commands

```bash
# Build only
npm run docker:build

# Start services
npm run docker:run

# Stop services
npm run docker:stop

# View logs
npm run docker:logs

# Deploy (build + start)
npm run docker:deploy
```

## 🗄️ Database

- **Type**: PostgreSQL 15
- **Host**: localhost
- **Port**: 5500
- **Database**: project-tracker
- **Username**: postgres
- **Password**: root

## 📁 Docker Structure

```
├── Dockerfile              # Main application container
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore           # Files to exclude from build
├── init.sql                # Database initialization
├── .env.docker             # Docker environment variables
├── deploy.sh               # Linux/Mac deployment script
└── deploy.bat              # Windows deployment script
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Stop existing containers
docker-compose down

# Check what's using the port
netstat -ano | findstr :7855
netstat -ano | findstr :5500
```

### Database Connection Issues
```bash
# Restart database container
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

### Application Not Starting
```bash
# Check application logs
docker-compose logs app

# Rebuild containers
docker-compose up --build --force-recreate
```

## 🚀 Production Deployment

For production, update the environment variables in `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=postgresql://your-prod-user:your-prod-password@postgres:5432/project-tracker
  - SESSION_SECRET=your-super-secure-session-secret
  - NODE_ENV=production
```