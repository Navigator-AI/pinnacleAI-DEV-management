# Pinnacle AI Project Tracker

A comprehensive, fully-functional project management system built with modern web technologies. This application provides real-world project tracking capabilities with a professional interface and robust backend.

## 🚀 Features

### Core Project Management
- **Project Creation & Management**: Create, edit, and delete projects with detailed information
- **Task Management**: Full CRUD operations for tasks with assignees, priorities, and due dates
- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Progress Tracking**: Real-time progress updates and completion tracking
- **Portfolio Management**: Organize projects into portfolios for better oversight

### Team Collaboration
- **User Management**: Admin can manage team members and roles
- **Task Assignment**: Assign tasks to specific team members
- **Comments System**: Team members can comment on tasks for collaboration
- **Activity Feed**: Real-time activity tracking across projects
- **Team Dashboard**: Overview of team workload and status

### Advanced Features
- **Issue Tracking**: Bug reports and feature requests with severity levels
- **Document Management**: File upload and organization with folder structure
- **Daily Updates**: Task progress updates with timeline tracking
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Search & Filtering**: Advanced search and filtering across all entities

### Security & Authentication
- **Secure Login**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access**: Admin and member roles with appropriate permissions
- **Session Management**: Secure session handling with configurable timeouts
- **Data Protection**: SQL injection prevention and input validation

### User Interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface built with React and Tailwind CSS
- **Dark/Light Mode**: Theme switching for user preference
- **Intuitive Navigation**: Easy-to-use sidebar navigation and breadcrumbs

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Query** for data fetching
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **Passport.js** for authentication
- **Multer** for file uploads

### Infrastructure
- **Docker** containerization
- **Docker Compose** for orchestration
- **Vite** for development and building
- **ESBuild** for fast compilation

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Git** for cloning the repository
- **8GB RAM** minimum recommended
- **2GB free disk space**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Pinnacle-AI-project-tracker/Pinnacle-AI
```

### 2. Deploy with One Command
```bash
# Windows
deploy-complete.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### 3. Access the Application
Open your browser and navigate to: **http://localhost:7855**

## 👥 Login Credentials

### Admin Account
- **Email**: girish.desai@pinnacle.ai
- **Password**: admin123
- **Permissions**: Full access to all features

### Team Members
- **Email**: dinesh@pinnacle.ai | **Password**: user123
- **Email**: yaswanth@pinnacle.ai | **Password**: user123
- **Email**: raviteja@pinnacle.ai | **Password**: user123
- **Email**: eswar@pinnacle.ai | **Password**: user123
- **Permissions**: Access to assigned tasks and projects

## 📊 Sample Data Included

The application comes pre-loaded with realistic sample data:

### Projects
1. **AI Chatbot Development** - High priority AI project
2. **E-commerce Platform** - Web application development
3. **Mobile Banking App** - Critical mobile application
4. **Data Analytics Dashboard** - Business intelligence project
5. **IoT Monitoring System** - Industrial monitoring solution

### Tasks
- **20+ realistic tasks** across different projects
- Various statuses: Todo, In Progress, Review, Done
- Different priorities: Low, Medium, High, Critical
- Assigned to different team members

### Additional Data
- **Issues and bug reports** with severity levels
- **Comments and discussions** on tasks
- **Activity timeline** showing project history
- **Document folders** for file organization
- **Task updates** with progress tracking

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your database configuration
```

### 2. Database Setup
```bash
# Start PostgreSQL
docker run -d --name pinnacle-db \
  -e POSTGRES_DB=project-tracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=root \
  -p 5500:5432 \
  postgres:15-alpine

# Initialize database
npm run db:init
```

### 3. Application Setup
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the application
npm start
```

## 🐳 Docker Commands

### Basic Operations
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart
```

### Database Operations
```bash
# Access database
docker compose exec postgres psql -U postgres -d project-tracker

# Backup database
docker compose exec postgres pg_dump -U postgres project-tracker > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres project-tracker < backup.sql
```

### Development
```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run database migrations
npm run db:migrate
```

## 📱 Application Usage

### For Administrators
1. **Login** with admin credentials
2. **Create Projects** from the Projects page
3. **Add Team Members** from the Team page
4. **Create Tasks** and assign to team members
5. **Monitor Progress** through dashboards and reports
6. **Manage Issues** and track resolutions

### For Team Members
1. **Login** with member credentials
2. **View Assigned Tasks** on the dashboard
3. **Update Task Progress** and add comments
4. **Create Issues** when problems arise
5. **Upload Documents** to project folders
6. **Collaborate** through comments and updates

### Key Workflows
1. **Project Creation**: Admin creates project → Assigns team members → Creates tasks
2. **Task Management**: Team members update progress → Add comments → Complete tasks
3. **Issue Resolution**: Report issue → Assign to team member → Track to resolution
4. **Document Sharing**: Upload files → Organize in folders → Share with team

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Session-based tokens
- **Role-Based Access**: Granular permissions
- **Secure File Upload**: Type and size validation

## 📈 Performance Features

- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Query result caching
- **Lazy Loading**: On-demand data loading
- **Compression**: Gzip compression for responses
- **CDN Ready**: Static asset optimization

## 🛠 Customization

### Adding New Features
1. **Database Schema**: Update `shared/schema.ts`
2. **API Routes**: Add routes in `server/routes.ts`
3. **Storage Layer**: Implement in `server/storage.ts`
4. **Frontend Components**: Create in `client/src/components/`
5. **Pages**: Add to `client/src/pages/`

### Configuration
- **Database**: Update `DATABASE_URL` in environment
- **Session**: Configure `SESSION_SECRET`
- **Ports**: Modify in `docker-compose.yml`
- **File Upload**: Adjust limits in `server/routes.ts`

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 7855
netstat -ano | findstr :7855
# Kill the process
taskkill /PID <process_id> /F
```

**Database Connection Issues**
```bash
# Check database status
docker compose ps postgres
# Restart database
docker compose restart postgres
```

**Build Failures**
```bash
# Clean build
docker compose down
docker system prune -f
docker compose up --build
```

### Logs and Debugging
```bash
# Application logs
docker compose logs app

# Database logs
docker compose logs postgres

# All logs
docker compose logs
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs for errors
3. Ensure all prerequisites are met
4. Verify network connectivity

## 🔄 Updates and Maintenance

### Regular Maintenance
- **Database Backups**: Schedule regular backups
- **Log Rotation**: Monitor and rotate logs
- **Security Updates**: Keep dependencies updated
- **Performance Monitoring**: Monitor resource usage

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose up --build -d
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Pinnacle AI Project Tracker** - A complete, production-ready project management solution.