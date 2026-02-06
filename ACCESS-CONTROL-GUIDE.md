# Pinnacle AI Project Tracker - Access Control Guide

## 🔐 Role-Based Access Control Implementation

Your application now has strict role-based access controls as requested:

## 👨‍💼 **ADMIN ACCESS (girish.desai@pinnacle.ai)**

### ✅ **What Admin CAN Do:**
1. **Add Projects** - Create new projects and assign them to team members
2. **Create Tasks** - Add tasks to projects and assign them to specific members
3. **Add Team Members** - Add new employees to the system (saves to database)
4. **View All Data** - See all projects, tasks, issues, and team activities
5. **View Daily Updates** - See all daily progress updates from all team members
6. **Delete Tasks/Projects** - Remove tasks and projects when needed
7. **Manage Team** - Update team member information

### ❌ **What Admin CANNOT Do:**
- **Update Task Progress** - Only members can update their own task progress
- **Add Daily Updates** - Only members can add daily work updates

### 📊 **Admin Dashboard Features:**
- View all projects across the organization
- See task assignments and progress from all team members
- Monitor daily updates from employees
- Track team performance and project status
- Access comprehensive reports and analytics

---

## 👥 **MEMBER ACCESS (dinesh, yaswanth, raviteja, eswar)**

### ✅ **What Members CAN Do:**
1. **View Assigned Projects** - See only projects they are assigned to
2. **View Assigned Tasks** - See only tasks assigned to them
3. **Update Task Progress** - Update progress on their own assigned tasks
4. **Add Daily Updates** - Add daily work progress updates
5. **Add Comments** - Comment on their assigned tasks
6. **Upload Documents** - Upload files to project folders
7. **View Project Details** - See project descriptions and requirements

### ❌ **What Members CANNOT Do:**
- **Create Projects** - Only admin can create projects
- **Create Tasks** - Only admin can create and assign tasks
- **Update Other's Tasks** - Can only update their own assigned tasks
- **Delete Tasks/Projects** - Only admin can delete
- **Add Team Members** - Only admin can add new employees
- **View Other's Tasks** - Can only see their own assigned tasks

### 📱 **Member Dashboard Features:**
- Personal task dashboard showing only assigned tasks
- Daily update interface for progress reporting
- Project view showing their role and responsibilities
- Comment system for task collaboration
- File upload for project deliverables

---

## 🔄 **Daily Update Workflow**

### **For Members:**
1. Login with member credentials
2. View assigned tasks on dashboard
3. Click on a task to add daily update
4. Enter what was accomplished that day
5. Update progress percentage if applicable
6. Submit update (saves to database)

### **For Admin:**
1. Login with admin credentials
2. Access "Daily Updates" section
3. View all updates from all team members
4. See updates organized by:
   - Team member name
   - Project name
   - Task title
   - Date and progress

---

## 💾 **Database Storage**

### **Team Members Table:**
When admin adds a team member, it saves to `users` table with:
- ID (auto-generated)
- Username
- Password (encrypted)
- Name
- Email
- Role (member/admin)
- Status (online/offline)
- Created/Updated timestamps

### **Task Updates Table:**
When members add daily updates, it saves to `task_updates` table with:
- Update ID
- Task ID (which task)
- User ID (which member)
- Content (what they did)
- Progress percentage
- Timestamp

---

## 🚀 **How to Use the System**

### **Admin Workflow:**
1. **Login**: girish.desai@pinnacle.ai / admin123
2. **Add Team Members**: Go to Team → Add Member
3. **Create Projects**: Go to Projects → Create Project
4. **Assign Tasks**: Create tasks and assign to team members
5. **Monitor Progress**: View daily updates from team

### **Member Workflow:**
1. **Login**: Use your assigned credentials (password: user123)
2. **View Tasks**: See your assigned tasks on dashboard
3. **Daily Updates**: Click task → Add Update → Enter progress
4. **Collaborate**: Add comments and upload files

---

## 🔒 **Security Features**

- **Authentication Required**: All endpoints require login
- **Role-Based Permissions**: Strict separation between admin and member access
- **Task Assignment Validation**: Members can only update their assigned tasks
- **Database Constraints**: Foreign key relationships ensure data integrity
- **Session Management**: Secure session handling with timeouts

---

## 📊 **API Endpoints Summary**

### **Admin Only:**
- `POST /api/projects` - Create projects
- `POST /api/tasks` - Create and assign tasks
- `POST /api/team` - Add team members
- `DELETE /api/tasks/:id` - Delete tasks
- `GET /api/admin/task-updates` - View all daily updates

### **Members Only:**
- `PUT /api/tasks/:id` - Update assigned task progress
- `POST /api/tasks/:id/updates` - Add daily updates

### **Both Admin & Members:**
- `GET /api/tasks` - View tasks (filtered by role)
- `GET /api/projects` - View projects (filtered by role)
- `GET /api/activities` - View activities (filtered by role)

---

## ✅ **Implementation Complete**

Your system now works exactly as requested:

1. **Admin** can add projects, assign tasks, add team members, and view all daily updates
2. **Members** can only update their assigned tasks and add daily progress updates
3. **Database** properly stores all team members and daily updates
4. **Access Control** is strictly enforced at API and database level
5. **UI** shows appropriate features based on user role

The application is ready for production use with proper role-based access control!