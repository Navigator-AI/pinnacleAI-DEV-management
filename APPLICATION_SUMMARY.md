# Task Management & Project Tracking Platform

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Core Features](#core-features)
4. [Database Schema](#database-schema)
5. [How Everything Works](#how-everything-works)
6. [Key Technologies](#key-technologies--why)
7. [File Structure](#file-structure)
8. [Current Features Implemented](#current-features-implemented)
9. [Security Features](#security-features)
10. [Getting Started](#getting-started)
11. [API Endpoints](#api-endpoints)
12. [Environment Variables](#environment-variables)

---

## Project Overview

Your application is a **full-stack Task Management & Project Tracking Platform** designed for teams to collaborate on projects, manage tasks, track progress, and communicate updates in real-time.

**Key Purpose:**
- Enable team collaboration on projects
- Manage and track tasks efficiently
- Real-time communication and updates
- Secure authentication and password management
- Calendar-based event scheduling
- Activity logging and audit trails

---

## Architecture & Tech Stack

### Frontend (Client)
```
Framework:           React 18.3.1
Language:            TypeScript
Styling:             Tailwind CSS + Custom CSS Animations
UI Components:       Radix UI (accessible component library)
State Management:    TanStack React Query (data fetching & caching)
Routing:             Wouter (lightweight router)
Form Handling:       React Hook Form + Zod validation
Icons:               Lucide React
Build Tool:          Vite
```

### Backend (Server)
```
Runtime:             Node.js
Framework:           Express.js 5.0.1
Language:            TypeScript
Database:            PostgreSQL
ORM:                 Drizzle ORM (type-safe database queries)
Authentication:      Passport.js (local strategy)
Session Management:  Express-session with PostgreSQL store
Email Service:       Nodemailer (SMTP/Gmail support)
Real-time:           WebSocket (ws library)
File Upload:         Multer
```

### Database
```
Type:                PostgreSQL
Migrations:          Drizzle Kit
Schema:              Type-safe with Zod validation
Session Store:       PostgreSQL
```

### Deployment
```
Containerization:    Docker & Docker Compose
Environments:        Development & Production configs
Port:                7855 (default)
```

---

## Core Features

### 1. Authentication System
**Login Flow:**
- Username/password authentication via Passport.js
- Secure session management with PostgreSQL store
- Session persistence across requests
- Automatic session cleanup

**Password Reset (3-Step Process):**
- Step 1: User enters email address
- Step 2: System generates 6-digit code (15-minute expiry)
- Step 3: User verifies code and creates new password
- Token marked as used (one-time use only)

**Email Integration:**
- Nodemailer for sending reset codes
- Support for Gmail and custom SMTP providers
- Fallback to console logging for development
- HTML email templates

### 2. Task Management
**Task Operations:**
- Create new tasks with details and descriptions
- Assign tasks to team members
- Set priorities and deadlines
- Track task status (pending, in-progress, completed)
- Add multiple updates/comments to tasks

**Task Updates:**
- Team members can add updates to tasks
- Edit own updates if mistakes made
- Delete updates (with permissions)
- Real-time update notifications
- Activity timestamps

**Task Tracking:**
- Monitor task progress
- View task history
- Track completion status
- See all team contributions

### 3. Project Management
**Project Operations:**
- Create and organize projects
- Add project descriptions and details
- Set project timelines
- Manage project members

**Team Collaboration:**
- Invite team members to projects
- Role-based access control
- Different permission levels
- Activity logging for all changes

**Project Dashboard:**
- Overview of all projects
- Task statistics
- Team member list
- Recent activity feed

### 4. Calendar Integration
**Event Management:**
- Schedule project events and milestones
- Set event dates and times
- Add event descriptions
- Recurring event support

**Calendar View:**
- Visual representation of deadlines
- Event notifications
- Calendar filtering
- Export capabilities

### 5. Real-time Features
**WebSocket Support:**
- Live task updates across team
- Instant notifications
- Real-time member presence
- Live collaboration indicators

**Activity Streaming:**
- See team activity in real-time
- Live update feeds
- Instant notifications
- Activity timestamps

### 6. User Interface
**Design:**
- Responsive design (desktop, tablet, mobile)
- Modern dark theme with gradient backgrounds
- Purple and slate color scheme
- Smooth CSS animations

**Animations:**
- Page load fade-in effects
- Slide animations for content
- Button hover effects with glow
- Input focus animations
- Smooth transitions

**Accessibility:**
- Respects prefers-reduced-motion
- Keyboard navigation support
- ARIA labels
- High contrast support

---

## Database Schema

### Tables Overview

**users**
```
- id (text, primary key)
- name (string)
- email (string, unique)
- password (string, hashed)
- role (string)
- created_at (timestamp)
- updated_at (timestamp)
```

**projects**
```
- id (uuid, primary key)
- name (string)
- description (text)
- owner_id (text, foreign key → users)
- created_at (timestamp)
- updated_at (timestamp)
```

**tasks**
```
- id (uuid, primary key)
- project_id (uuid, foreign key → projects)
- title (string)
- description (text)
- status (enum: pending, in-progress, completed)
- priority (enum: low, medium, high)
- assigned_to (text, foreign key → users)
- created_by (text, foreign key → users)
- created_at (timestamp)
- updated_at (timestamp)
```

**task_updates**
```
- id (uuid, primary key)
- task_id (uuid, foreign key → tasks)
- user_id (text, foreign key → users)
- content (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**project_members**
```
- id (uuid, primary key)
- project_id (uuid, foreign key → projects)
- user_id (text, foreign key → users)
- role (enum: member, admin)
- joined_at (timestamp)
```

**calendar_events**
```
- id (uuid, primary key)
- project_id (uuid, foreign key → projects)
- title (string)
- description (text)
- start_date (timestamp)
- end_date (timestamp)
- created_by (text, foreign key → users)
- created_at (timestamp)
```

**password_reset_tokens**
```
- id (uuid, primary key)
- user_id (text, foreign key → users)
- token (string, unique)
- expires_at (timestamp)
- used (boolean)
- created_at (timestamp)
```

**sessions**
```
- sid (string, primary key)
- sess (json)
- expire (timestamp)
```

---

## How Everything Works

### User Authentication Flow

```
1. USER VISITS APPLICATION
   ↓
2. REDIRECTED TO LOGIN PAGE
   - Clean, modern UI with animations
   - Username and password fields
   - "Forgot Password?" link
   ↓
3. USER ENTERS CREDENTIALS
   - Frontend validates input
   - Sends POST request to /api/auth/login
   ↓
4. BACKEND AUTHENTICATION
   - Passport.js validates credentials
   - Compares password with bcrypt hash
   - Creates session in PostgreSQL
   ↓
5. SESSION CREATED
   - Session ID stored in cookie
   - User data cached in memory
   - Session persists across requests
   ↓
6. USER REDIRECTED TO DASHBOARD
   - All protected routes now accessible
   - Real-time WebSocket connection established
   ↓
7. USER LOGGED OUT
   - Session destroyed
   - Redirected to login page
```

### Password Reset Flow

```
1. USER CLICKS "FORGOT PASSWORD?"
   ↓
2. DIALOG OPENS - STEP 1: EMAIL
   - User enters email address
   - Frontend validates email format
   ↓
3. BACKEND PROCESSES EMAIL
   - Checks if user exists
   - Generates random 6-digit code
   - Creates password_reset_token record
   - Sets expiry to 15 minutes
   - Sends email via Nodemailer
   ↓
4. USER RECEIVES EMAIL
   - Email contains 6-digit code
   - Code valid for 15 minutes only
   ↓
5. DIALOG OPENS - STEP 2: CODE VERIFICATION
   - User enters 6-digit code
   - Frontend validates format
   ↓
6. BACKEND VERIFIES CODE
   - Checks if token exists
   - Verifies not expired
   - Verifies not already used
   ↓
7. DIALOG OPENS - STEP 3: NEW PASSWORD
   - User enters new password
   - User confirms password
   - Frontend validates (min 6 chars, match)
   ↓
8. BACKEND UPDATES PASSWORD
   - Hashes new password with bcrypt
   - Updates user record
   - Marks token as used
   - Deletes expired tokens
   ↓
9. SUCCESS MESSAGE
   - User can now login with new password
   - Redirected to login page
```

### Task Management Flow

```
1. USER CREATES TASK
   - Fills task form (title, description, priority)
   - Selects project
   - Assigns to team member
   ↓
2. TASK STORED IN DATABASE
   - Task record created
   - Activity logged
   ↓
3. TEAM MEMBERS NOTIFIED
   - WebSocket broadcasts task creation
   - All connected users see new task
   - Real-time dashboard update
   ↓
4. MEMBER ADDS UPDATE
   - Clicks "Add Update" button
   - Types update content
   - Submits update
   ↓
5. UPDATE STORED
   - Update record created in database
   - Linked to task and user
   - Timestamp recorded
   ↓
6. REAL-TIME BROADCAST
   - WebSocket sends update to all team members
   - Update appears instantly on their screens
   - Notification sent
   ↓
7. MEMBER EDITS UPDATE
   - Clicks pencil icon on their update
   - Inline editing enabled
   - Saves changes
   ↓
8. UPDATE MODIFIED
   - Database record updated
   - Updated timestamp changed
   - WebSocket broadcasts change
   ↓
9. TASK COMPLETION
   - Status changed to "completed"
   - Activity logged
   - Team notified
```

### Real-time Collaboration Flow

```
1. MULTIPLE USERS CONNECTED
   - Each user has WebSocket connection
   - Server maintains connection pool
   ↓
2. USER A MAKES CHANGE
   - Creates task, adds update, etc.
   - Change sent to backend
   ↓
3. BACKEND PROCESSES CHANGE
   - Updates database
   - Broadcasts to all connected clients
   ↓
4. ALL OTHER USERS RECEIVE UPDATE
   - WebSocket message received
   - UI updates in real-time
   - No page refresh needed
   ↓
5. ACTIVITY LOGGED
   - Change recorded with timestamp
   - User information stored
   - Audit trail maintained
```

---

## Key Technologies & Why

| Technology | Purpose | Why Used |
|-----------|---------|----------|
| **React** | Frontend UI framework | Component-based, efficient rendering |
| **TypeScript** | Type safety | Catch errors at compile time |
| **Tailwind CSS** | Styling | Rapid UI development, consistent design |
| **Radix UI** | Component library | Accessible, unstyled components |
| **TanStack Query** | Data fetching | Automatic caching, synchronization |
| **Drizzle ORM** | Database queries | Type-safe, SQL-like syntax |
| **PostgreSQL** | Database | Reliable, ACID compliant, scalable |
| **Express.js** | Backend framework | Lightweight, flexible, widely used |
| **Passport.js** | Authentication | Industry standard, multiple strategies |
| **WebSocket** | Real-time | Low latency, bidirectional communication |
| **Nodemailer** | Email sending | Simple, reliable email delivery |
| **Docker** | Containerization | Consistent environments, easy deployment |
| **Zod** | Validation | Runtime type checking, schema validation |

---

## File Structure

```
project-root/
│
├── client/                          # Frontend React Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── pages/
│   │   │   ├── login.tsx           # Login page with animations
│   │   │   ├── login.css           # Login animations
│   │   │   ├── dashboard.tsx       # Main dashboard
│   │   │   ├── projects.tsx        # Projects page
│   │   │   ├── tasks.tsx           # Tasks page
│   │   │   └── calendar.tsx        # Calendar page
│   │   ├── components/
│   │   │   ├── ui/                 # Radix UI components
│   │   │   ├── task-update-dialog.tsx  # Task update component
│   │   │   ├── project-card.tsx    # Project card component
│   │   │   └── ...
│   │   ├── animations/
│   │   │   └── login-character.json # Animation data
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── server/                          # Backend Express Application
│   ├── routes.ts                   # API endpoints
│   ├── storage.ts                  # Database queries
│   ├── email-service.ts            # Email handling
│   ├── daily-teams-report.ts       # Scheduled reports
│   ├── init-db.ts                  # Database initialization
│   ├── index.ts                    # Server entry point
│   ├── vite.ts                     # Vite integration
│   └── static.ts                   # Static file serving
│
├── shared/
│   └── schema.ts                   # Database schema definitions
│
├── migrations/                      # Database migrations
│   ├── 0000_slippery_layla_miller.sql
│   ├── 0001_add_calendar_events.sql
│   └── 0002_add_password_reset_tokens.sql
│
├── scripts/
│   ├── setup-db.ts                 # Database setup script
│   └── ensure-stack-up.sh          # Stack verification
│
├── data/
│   └── uploads/                    # File uploads directory
│
├── docker-compose.yml              # Docker configuration
├── Dockerfile                      # Docker image definition
├── package.json                    # Root dependencies
├── tsconfig.json                   # TypeScript configuration
├── drizzle.config.ts               # Drizzle ORM configuration
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── components.json                 # Component configuration
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── .dockerignore                   # Docker ignore file
├── .gitignore                      # Git ignore file
└── README.md                       # This file
```

---

## Current Features Implemented

### ✅ Authentication & Security
- [x] User login with username/password
- [x] User logout
- [x] Session management with PostgreSQL store
- [x] Password hashing with bcrypt
- [x] 3-step password reset flow
- [x] 6-digit verification codes
- [x] 15-minute token expiry
- [x] One-time use tokens
- [x] Email verification via Nodemailer

### ✅ Task Management
- [x] Create tasks
- [x] Edit tasks
- [x] Delete tasks
- [x] Assign tasks to team members
- [x] Set task priority (low, medium, high)
- [x] Track task status (pending, in-progress, completed)
- [x] Add task descriptions
- [x] View task details

### ✅ Task Updates & Collaboration
- [x] Add updates/comments to tasks
- [x] Edit own updates
- [x] Delete updates (with permissions)
- [x] View update history
- [x] Real-time update notifications
- [x] Activity timestamps
- [x] User attribution

### ✅ Project Management
- [x] Create projects
- [x] Edit project details
- [x] Delete projects
- [x] Add project descriptions
- [x] Manage project members
- [x] Role-based access (member, admin)
- [x] Project dashboard
- [x] Activity logging

### ✅ Calendar Integration
- [x] Create calendar events
- [x] Schedule project milestones
- [x] View calendar
- [x] Event notifications
- [x] Event descriptions

### ✅ Real-time Features
- [x] WebSocket connections
- [x] Real-time task updates
- [x] Live member presence
- [x] Instant notifications
- [x] Activity streaming

### ✅ User Interface
- [x] Responsive design
- [x] Dark theme with gradients
- [x] CSS animations
- [x] Button hover effects
- [x] Input focus animations
- [x] Smooth transitions
- [x] Accessibility features

### ✅ Email Features
- [x] Password reset emails
- [x] SMTP configuration
- [x] Gmail support
- [x] HTML email templates
- [x] Console logging fallback

### ✅ Deployment
- [x] Docker containerization
- [x] Docker Compose setup
- [x] Environment configuration
- [x] Database migrations
- [x] Health checks

---

## Security Features

### Authentication Security
```
- Password Hashing: bcrypt with salt rounds
- Session Management: Secure session store in PostgreSQL
- CSRF Protection: Built into Express
- SQL Injection Prevention: Drizzle ORM parameterized queries
- XSS Protection: React automatic escaping
```

### Password Reset Security
```
- Token Expiry: 15 minutes maximum
- One-time Use: Tokens marked as used after consumption
- Random Generation: Cryptographically secure 6-digit codes
- Email Verification: Code sent to registered email only
- Rate Limiting: Can be added for brute force protection
```

### Data Protection
```
- Environment Variables: Sensitive data in .env files
- No Credentials in Code: All secrets externalized
- HTTPS Ready: Can be deployed with SSL/TLS
- Session Timeout: Automatic session cleanup
- Activity Logging: All changes tracked and auditable
```

### Access Control
```
- Role-based Access: Member vs Admin roles
- User Permissions: Can only edit own updates
- Project Isolation: Users only see assigned projects
- Member Verification: Only project members can access
```

---

## Getting Started

### Prerequisites
```
- Node.js 18+ or 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- npm or yarn
```

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd project-directory
```

**2. Install Dependencies**
```bash
npm install
```

**3. Setup Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

**4. Start with Docker**
```bash
docker-compose up -d --build
```

**5. Access Application**
```
Frontend: http://localhost:7855
API: http://localhost:7855/api
```

### Development

**Start Development Server**
```bash
npm run dev
```

**Build for Production**
```bash
npm run build
```

**Database Migrations**
```bash
npm run db:migrate
npm run db:push
```

**View Database**
```bash
npm run db:studio
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/verify-reset-code  - Verify reset code
POST   /api/auth/reset-password     - Reset password
GET    /api/auth/me                 - Get current user
```

### Projects
```
GET    /api/projects                - List all projects
POST   /api/projects                - Create project
GET    /api/projects/:id            - Get project details
PUT    /api/projects/:id            - Update project
DELETE /api/projects/:id            - Delete project
GET    /api/projects/:id/members    - Get project members
POST   /api/projects/:id/members    - Add project member
```

### Tasks
```
GET    /api/tasks                   - List all tasks
POST   /api/tasks                   - Create task
GET    /api/tasks/:id               - Get task details
PUT    /api/tasks/:id               - Update task
DELETE /api/tasks/:id               - Delete task
GET    /api/tasks/:id/updates       - Get task updates
POST   /api/tasks/:id/updates       - Add task update
PUT    /api/tasks/:id/updates/:updateId - Edit update
DELETE /api/tasks/:id/updates/:updateId - Delete update
```

### Calendar
```
GET    /api/calendar/events         - List events
POST   /api/calendar/events         - Create event
GET    /api/calendar/events/:id     - Get event details
PUT    /api/calendar/events/:id     - Update event
DELETE /api/calendar/events/:id     - Delete event
```

### Health
```
GET    /api/health                  - Health check
```

---

## Environment Variables

### Required Variables
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/project-tracker

# Session
SESSION_SECRET=your-secret-key-here

# Email (Optional - falls back to console)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=7855
NODE_ENV=development
```

### Optional Variables
```
# SMTP Configuration
SMTP_FROM=noreply@example.com
SMTP_SECURE=true

# Application
APP_NAME=Task Management
APP_URL=http://localhost:7855

# Logging
LOG_LEVEL=info
```

---

## Docker Commands

### Build and Run
```bash
# Build image
docker build -t pinnacle-ai .

# Run with Docker Compose
docker-compose up -d --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres
```

### Database Management
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres project-tracker > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres project-tracker < backup.sql

# Access database shell
docker-compose exec postgres psql -U postgres -d project-tracker
```

---

## Troubleshooting

### Common Issues

**Issue: Port 7855 already in use**
```bash
# Change port in docker-compose.yml or .env
# Or kill process using port
lsof -ti:7855 | xargs kill -9
```

**Issue: Database connection failed**
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

**Issue: Email not sending**
```bash
# Check email credentials in .env
# Verify SMTP settings
# Check console logs for fallback messages
# Enable "Less secure app access" for Gmail
```

**Issue: WebSocket connection failed**
```bash
# Check firewall settings
# Verify WebSocket port is open
# Check browser console for errors
# Restart application
```

---

## Performance Optimization

### Frontend
- React Query caching reduces API calls
- Lazy loading for components
- Code splitting with Vite
- CSS animations use GPU acceleration
- Responsive images

### Backend
- Database connection pooling
- Query optimization with Drizzle ORM
- Session caching
- WebSocket connection management
- Gzip compression

### Database
- Indexed columns for fast queries
- Proper foreign key relationships
- Query optimization
- Regular maintenance

---

## Future Enhancements

### Planned Features
- [ ] User notifications system
- [ ] File attachments on tasks
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Advanced filtering and search
- [ ] Task dependencies
- [ ] Time tracking
- [ ] Reporting and analytics
- [ ] Mobile app
- [ ] API documentation (Swagger)
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, GitHub)
- [ ] Team invitations via email
- [ ] Custom workflows
- [ ] Webhooks

---

## Contributing

### Development Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Code review
6. Merge to main

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component documentation
- Unit tests for utilities

---

## License

This project is licensed under the MIT License.

---

## Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review troubleshooting section
3. Check application logs
4. Contact development team

---

## Version History

### v1.0.0 (Current)
- Initial release
- Core task management
- User authentication
- Password reset
- Real-time updates
- Calendar integration
- Task update editing

---

## Additional Resources

### Documentation
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

### Tools
- [Docker Documentation](https://docs.docker.com)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Last Updated:** 2026-03-12
**Maintained By:** Development Team
**Status:** Active Development
