# SierraEdge AI - Project Management System

A modern, full-stack project management application built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Features

- **User Management** - Admin, Manager, and Member roles with RBAC
- **Project Management** - Create and manage projects with progress tracking
- **Task Management** - Assign tasks, track progress, and manage deadlines
- **Kanban Board** - Visual task management with drag-and-drop
- **Issue Tracking** - Bug tracking and issue management
- **Team Collaboration** - Comments, updates, and activity feeds
- **Document Management** - Upload and organize project documents
- **Reports & Analytics** - Dashboard with insights and metrics
- **Real-time Updates** - Live activity feeds and notifications

## 📋 Prerequisites

- Docker Desktop installed
- Node.js 18+ (for local development)
- Git

## 🛠️ Installation & Setup

### Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd pinnacleAI-DEV-management
```

2. **Start the application**
```bash
docker-compose up -d --build
```

3. **Access the application**
- Application: http://localhost:7855
- Database: localhost:5500

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Run database migrations**
```bash
npm run db:push
```

4. **Start development server**
```bash
npm run dev
```

## 🔐 Default Login Credentials

**Admin Account:**
- Email: `admin@pinnacle.ai`
- Password: `admin123`

## 📁 Project Structure

```
pinnacleAI-DEV-management/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   └── lib/         # Utilities and helpers
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
├── docker-compose.yml   # Docker configuration
├── Dockerfile           # Application container
└── init-complete.sql    # Database initialization
```

## 🗄️ Database Schema

- **users** - User accounts and authentication
- **projects** - Project information
- **tasks** - Task management
- **issues** - Issue tracking
- **activities** - Activity logs
- **comments** - Task comments
- **documents** - File metadata
- **notifications** - User notifications

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `docker-compose up -d` - Start with Docker
- `docker-compose down` - Stop Docker containers
- `docker-compose logs -f app` - View application logs

## 🌐 Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://postgres:root@localhost:5500/project-tracker
SESSION_SECRET=your-secret-key-here
PORT=7855
NODE_ENV=development
```

## 🐳 Docker Commands

```bash
# Start application
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop application
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove all data (reset)
docker-compose down -v
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- Manage users and teams
- Create/edit/delete projects
- View all reports and analytics

### Manager
- Create and manage projects
- Assign tasks to team members
- View team reports
- Manage project documents

### Member
- View assigned tasks
- Update task status and progress
- Add comments and updates
- Upload documents

## 📝 License

MIT License - feel free to use this project for your needs.

## 🤝 Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using React, TypeScript, Node.js, and PostgreSQL
