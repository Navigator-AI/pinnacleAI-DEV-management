# Pinnacle AI Project Tracker - Deployment Guide

## 🚀 Quick Deployment

### Windows Users
```bash
deploy.bat
```

### Linux/Mac Users
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Manual Deployment Steps

1. **Start the application:**
   ```bash
   docker-compose up --build -d
   ```

2. **Setup database (if needed):**
   ```bash
   docker cp migrations/0000_slippery_layla_miller.sql pinnacle-ai-db:/tmp/migration.sql
   docker cp sample-data.sql pinnacle-ai-db:/tmp/sample-data.sql
   docker-compose exec postgres psql -U postgres -d project-tracker -f /tmp/migration.sql
   docker-compose exec postgres psql -U postgres -d project-tracker -f /tmp/sample-data.sql
   ```

## 🌐 Access the Application

- **URL:** http://localhost:7855
- **Admin:** admin@pinnacle.ai / admin123
- **Manager:** jane@pinnacle.ai / user123
- **Member:** john@pinnacle.ai / user123

## ✅ Features Working

- ✅ User Authentication & Authorization
- ✅ Project Management (Create, Read, Update, Delete)
- ✅ Task Management (Create, Read, Update, Delete)
- ✅ Team Member Management
- ✅ Dashboard with Statistics
- ✅ Kanban Board View
- ✅ Task Assignment & Progress Tracking
- ✅ Activity Logging
- ✅ Issue Tracking
- ✅ Proper Database Relationships & Cascading Deletes

## 🔧 Troubleshooting

### If containers won't start:
```bash
docker-compose down -v
docker-compose up --build -d
```

### If database issues:
```bash
docker-compose exec postgres psql -U postgres -d project-tracker -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

### View logs:
```bash
docker-compose logs app
docker-compose logs postgres
```

## 🏗️ Architecture

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Passport.js with sessions
- **Containerization:** Docker + Docker Compose

## 📊 Database Schema

- **users** - User accounts and authentication
- **projects** - Project management
- **tasks** - Task tracking and assignment
- **task_updates** - Daily task progress updates
- **activities** - Activity logging
- **issues** - Issue tracking
- **portfolios** - Project portfolios

## 🔐 Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based access control (Admin, Manager, Member)
- SQL injection protection with parameterized queries
- CORS protection

## 🚀 Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Use a production PostgreSQL database
3. Set `NODE_ENV=production`
4. Configure proper SSL certificates
5. Use a reverse proxy (nginx)
6. Set up monitoring and logging

## 📝 Environment Variables

```env
DATABASE_URL=postgresql://postgres:root@postgres:5432/project-tracker
SESSION_SECRET=your-secret-key-here
PORT=7855
NODE_ENV=production
```

## 🎯 Ready for Manager Review

The application is now fully functional and ready for deployment. All CRUD operations work correctly with proper error handling and database relationship management.