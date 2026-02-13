import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { loginSchema, taskUpdateSchema, issueUpdateSchema, insertUserSchema, insertTaskUpdateSchema, insertSubtaskSchema, insertCommentSchema, insertFolderSchema, insertDocumentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "data", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

// Middleware to check if user is admin or manager
const requireAdminOrManager = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'manager')) {
    return next();
  }
  res.status(403).json({ error: "Admin or Manager access required" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'pinnacle-ai-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
  }));

  // Passport configuration
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await storage.authenticateUser(email, password);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid credentials' });
        }
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const member = await storage.getTeamMember(id);
      if (member) {
        // Convert TeamMember to User-like object
        const user = {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar
        };
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.post('/api/auth/login', (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          console.error('Authentication error:', err);
          return res.status(500).json({ error: 'Authentication error' });
        }
        if (!user) {
          // console.log('Login failed for:', email, info?.message);
          return res.status(401).json({ error: info?.message || 'Invalid credentials' });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Login error' });
          }

          // console.log('Login successful for:', user.email);
          // Return user info without password
          const { password: _, ...userInfo } = user;
          res.json({
            success: true,
            user: userInfo,
            mustChangePassword: user.mustChangePassword || false,
            message: 'Login successful'
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error('Login route error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout error' });
      }
      res.json({ success: true, message: 'Logout successful' });
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const { password: _, ...userInfo } = req.user as any;
    res.json({ user: userInfo });
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection
      const dbCheck = await storage.getTeamMembers();
      
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        database: "connected",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        users: dbCheck.length
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed"
      });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });

  // User profile routes
  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req.user as any)?.id;
      const requestedUserId = req.params.id;
      
      // Users can only access their own profile unless they're admin
      if (currentUserId !== requestedUserId && (req.user as any)?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const user = await storage.getTeamMember(requestedUserId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req.user as any)?.id;
      const requestedUserId = req.params.id;
      
      // Users can only update their own profile unless they're admin
      if (currentUserId !== requestedUserId && (req.user as any)?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { name, email } = req.body;
      const updates = { name, email };
      
      const user = await storage.updateTeamMember(requestedUserId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.put("/api/users/:id/password", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req.user as any)?.id;
      const requestedUserId = req.params.id;

      // Users can only change their own password
      if (currentUserId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      // Verify current password
      const user = await storage.authenticateUser((req.user as any).email, currentPassword);
      if (!user) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Update password
      const updatedUser = await storage.updateTeamMember(requestedUserId, { password: newPassword });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  // Force password change endpoint (for first login)
  app.post("/api/auth/force-change-password", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      // Update password and clear mustChangePassword flag
      const updatedUser = await storage.updateTeamMember(userId, {
        password: newPassword,
        mustChangePassword: false
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error('Force change password error:', error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Team routes - Admin can add team members
  app.get("/api/team", requireAuth, async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to get team members" });
    }
  });

  app.get("/api/team/:id", requireAuth, async (req, res) => {
    try {
      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to get team member" });
    }
  });

  // Admin can add team members - saves to database
  app.post("/api/team", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('Adding team member:', req.body);
      
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser({
        ...userData,
        avatar: userData.avatar ?? null,
        role: userData.role ?? "member",
        status: userData.status ?? "online",
        mustChangePassword: true, // Force password change on first login
      });
      
      console.log('Team member added to database:', user.id);
      const { password: _, ...userInfo } = user;
      res.status(201).json(userInfo);
    } catch (error) {
      console.error('Add team member error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create team member" });
      }
    }
  });

  app.put("/api/team/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/team/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTeamMember(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  // Projects
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const project = await storage.getProject(req.params.id, userId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  app.get("/api/projects/:id/tasks", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const tasks = await storage.getTasksByProject(req.params.id, userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get project tasks" });
    }
  });

  app.get("/api/projects/:id/issues", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const issues = await storage.getIssuesByProject(req.params.id, userId);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: "Failed to get project issues" });
    }
  });

  // Admin-only project creation
  app.post("/api/projects", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('Project creation request:', {
        user: (req.user as any)?.email,
        role: (req.user as any)?.role,
        body: req.body
      });
      
      const project = await storage.createProject(req.body);
      console.log('Project created successfully:', project.id);
      res.status(201).json(project);
    } catch (error) {
      console.error('Project creation error:', error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Admin or Manager can update projects
  app.put("/api/projects/:id", requireAuth, requireAdminOrManager, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const success = await storage.deleteProject(req.params.id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Project not found or access denied" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Test task creation with current user assignment
  app.post("/api/test/create-user-task", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const testTask = {
        title: "My Test Task " + Date.now(),
        description: "Test task assigned to current user",
        priority: "medium",
        status: "todo",
        progress: 0,
        assigneeId: userId // Assign to current user
      };
      
      console.log('Creating test task for user:', userId);
      const newTask = await storage.createTask(testTask);
      console.log('Test task created:', newTask);
      res.json({ success: true, task: newTask });
    } catch (error) {
      console.error("Test create user task error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test endpoint to check database
  app.get("/api/test/tasks", async (req, res) => {
    try {
      console.log("Test endpoint called");
      const allTasks = await storage.getTasks();
      console.log("Test endpoint - tasks found:", allTasks.length);
      res.json({ 
        success: true, 
        count: allTasks.length, 
        tasks: allTasks 
      });
    } catch (error) {
      console.error("Test endpoint error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test task creation
  app.post("/api/test/create-task", async (req, res) => {
    try {
      const testTask = {
        title: "Test Task " + Date.now(),
        description: "Test description",
        priority: "medium",
        status: "todo",
        progress: 0
      };
      
      const newTask = await storage.createTask(testTask);
      res.json({ success: true, task: newTask });
    } catch (error) {
      console.error("Test create error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Tasks
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      console.log('GET /api/tasks - User:', (req.user as any)?.email, 'Role:', (req.user as any)?.role);
      const userId = (req.user as any)?.id;
      const tasks = await storage.getTasks(userId);
      console.log('Returning tasks count:', tasks.length);
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: "Failed to get tasks" });
    }
  });

  app.get("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const task = await storage.getTask(req.params.id, userId);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to get task" });
    }
  });

  // Task updates - RBAC based permissions
  // Admin/Manager: can update any task
  // Member: can only update status/progress of their own assigned tasks
  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;

      const updates = taskUpdateSchema.parse(req.body);

      // Get current task to check permissions
      const currentTask = await storage.getTask(req.params.id, userId);
      if (!currentTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Members can only update status and progress of their own tasks
      if (userRole === 'member') {
        // Check if user is assigned to this task
        const isAssigned = currentTask.assigneeId === userId;
        if (!isAssigned) {
          return res.status(403).json({ error: "You can only update tasks assigned to you" });
        }

        // Members can only update status and progress
        const allowedUpdates: any = {};
        if (updates.status) allowedUpdates.status = updates.status;
        if (updates.progress !== undefined) allowedUpdates.progress = updates.progress;

        const task = await storage.updateTask(req.params.id, allowedUpdates, userId);
        if (!task) {
          return res.status(404).json({ error: "Task not found" });
        }

        await storage.createActivity({
          projectId: task.projectId,
          userId: userId,
          action: 'updated status of',
          target: task.title,
          targetType: 'task'
        });

        return res.json(task);
      }

      // Admin and Manager can update everything
      const assigneeIds = updates.assigneeIds;
      const storageUpdates = {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : updates.dueDate
      };

      // Remove assigneeIds from storage updates as it's not a direct column
      delete storageUpdates.assigneeIds;

      const task = await storage.updateTask(req.params.id, storageUpdates as any);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Handle multiple assignees if provided
      if (assigneeIds !== undefined) {
        await storage.setTaskAssignees(task.id, assigneeIds, userId);
      }

      await storage.createActivity({
        projectId: task.projectId,
        userId: userId,
        action: 'updated',
        target: task.title,
        targetType: 'task'
      });

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update task" });
      }
    }
  });

  // Only Admin can delete tasks
  app.delete("/api/tasks/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;

      console.log('Delete task request:', {
        taskId: req.params.id,
        userId: userId,
        userRole: 'admin'
      });

      const success = await storage.deleteTask(req.params.id, userId);

      if (!success) {
        console.log('Task deletion failed - not found');
        return res.status(404).json({ error: "Task not found" });
      }

      console.log('Task deleted successfully');
      res.json({ success: true });
    } catch (error) {
      console.error('Delete task route error:', error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Task creation - Admin, Manager, and Members can create tasks
  // Admin/Manager: can assign to anyone, link to projects, set deadlines
  // Member: can only create tasks for themselves
  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;

      console.log('Task creation request:', {
        user: (req.user as any)?.email,
        role: userRole,
        body: req.body
      });

      let taskData = { ...req.body, createdBy: userId };
      const assigneeIds = req.body.assigneeIds || [];

      // Members can only create tasks assigned to themselves
      if (userRole === 'member') {
        taskData.assigneeId = userId;
        // Members cannot set project links or deadlines - only admin/manager can
        delete taskData.projectId;
        delete taskData.dueDate;
      }

      // Remove assigneeIds from taskData as it's not a column in tasks table
      delete taskData.assigneeIds;

      const task = await storage.createTask(taskData);

      // Handle multiple assignees
      if (assigneeIds.length > 0 && (userRole === 'admin' || userRole === 'manager')) {
        await storage.setTaskAssignees(task.id, assigneeIds, userId);
      } else if (userRole === 'member') {
        // Members are automatically assigned to their own tasks
        await storage.setTaskAssignees(task.id, [userId], userId);
      }

      // Create activity log
      if (task.projectId) {
        await storage.createActivity({
          projectId: task.projectId,
          userId: userId,
          action: 'created',
          target: task.title,
          targetType: 'task'
        });
      }

      console.log('Task created successfully:', task.id);
      res.status(201).json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // Portfolios (admin only)
  app.get("/api/portfolios", requireAuth, requireAdmin, async (req, res) => {
    try {
      const portfolios = await storage.getPortfolios();
      res.json(portfolios);
    } catch (error) {
      res.status(500).json({ error: "Failed to get portfolios" });
    }
  });

  app.get("/api/portfolios/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to get portfolio" });
    }
  });

  // Issues
  app.get("/api/issues", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const issues = await storage.getIssues(userId);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: "Failed to get issues" });
    }
  });

  app.get("/api/issues/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const issue = await storage.getIssue(req.params.id, userId);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to get issue" });
    }
  });

  app.post("/api/issues", requireAuth, async (req, res) => {
    try {
      const issue = await storage.createIssue(req.body);
      
      // Create activity log
      await storage.createActivity({
        projectId: issue.projectId,
        userId: (req.user as any)?.id,
        action: 'created',
        target: issue.title,
        targetType: 'issue'
      });
      
      res.status(201).json(issue);
    } catch (error) {
      res.status(500).json({ error: "Failed to create issue" });
    }
  });

  app.put("/api/issues/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const updates = issueUpdateSchema.parse(req.body);
      const issue = await storage.updateIssue(req.params.id, updates, userId);
      
      if (!issue) {
        return res.status(404).json({ error: "Issue not found or access denied" });
      }
      
      // Create activity log
      await storage.createActivity({
        projectId: issue.projectId,
        userId: userId,
        action: 'updated',
        target: issue.title,
        targetType: 'issue'
      });
      
      res.json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update issue" });
      }
    }
  });

  app.delete("/api/issues/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const success = await storage.deleteIssue(req.params.id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Issue not found or access denied" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete issue" });
    }
  });

  // Task Updates
  app.get("/api/tasks/:id/updates", requireAuth, async (req, res) => {
    try {
      const updates = await storage.getTaskUpdates(req.params.id);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ error: "Failed to get task updates" });
    }
  });

  // Daily task updates (members only)
  app.post("/api/tasks/:id/updates", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      
      // Only members can add daily updates
      if (userRole !== 'member') {
        return res.status(403).json({ error: "Only team members can add daily updates" });
      }
      
      // Check if task is assigned to this user
      const task = await storage.getTask(req.params.id, userId);
      if (!task) {
        return res.status(404).json({ error: "Task not found or not assigned to you" });
      }
      
      const updateData = insertTaskUpdateSchema.parse({
        ...req.body,
        taskId: req.params.id,
        userId: userId
      });
      
      const update = await storage.createTaskUpdate(updateData);
      
      // Create activity log
      await storage.createActivity({
        projectId: task.projectId,
        userId: userId,
        action: 'added an update to',
        target: task.title,
        targetType: 'task'
      });
      
      res.status(201).json(update);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create task update" });
      }
    }
  });

  // Admin can view all task updates from all members
  app.get("/api/admin/task-updates", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log('Admin requesting all task updates');
      const allUpdates = await storage.getAllTaskUpdates();
      res.json(allUpdates);
    } catch (error) {
      console.error('Get all task updates error:', error);
      res.status(500).json({ error: "Failed to get task updates" });
    }
  });

  // Activities
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get activities" });
    }
  });

  app.get("/api/projects/:id/activities", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const activities = await storage.getActivitiesByProject(req.params.id, userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get project activities" });
    }
  });

  // Notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const success = await storage.markNotificationAsRead(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // Subtasks
  app.get("/api/tasks/:id/subtasks", requireAuth, async (req, res) => {
    try {
      const subtasks = await storage.getSubtasks(req.params.id);
      res.json(subtasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get subtasks" });
    }
  });

  // Task Assignees management
  app.put("/api/tasks/:id/assignees", requireAuth, requireAdminOrManager, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const { assigneeIds } = req.body;

      if (!Array.isArray(assigneeIds)) {
        return res.status(400).json({ error: "assigneeIds must be an array" });
      }

      await storage.setTaskAssignees(req.params.id, assigneeIds, userId);

      // Fetch updated task with assignees
      const task = await storage.getTask(req.params.id);
      res.json(task);
    } catch (error) {
      console.error('Set task assignees error:', error);
      res.status(500).json({ error: "Failed to update task assignees" });
    }
  });

  app.post("/api/tasks/:id/subtasks", requireAuth, async (req, res) => {
    try {
      const subtaskData = insertSubtaskSchema.parse({
        ...req.body,
        taskId: req.params.id
      });
      const subtask = await storage.createSubtask(subtaskData);
      res.status(201).json(subtask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create subtask" });
      }
    }
  });

  app.put("/api/subtasks/:id", requireAuth, async (req, res) => {
    try {
      const subtask = await storage.updateSubtask(req.params.id, req.body);
      if (!subtask) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      res.json(subtask);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subtask" });
    }
  });

  app.delete("/api/subtasks/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteSubtask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Subtask not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subtask" });
    }
  });

  // Comments
  app.get("/api/tasks/:id/comments", requireAuth, async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to get comments" });
    }
  });

  app.post("/api/tasks/:id/comments", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        taskId: req.params.id,
        userId: userId
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create comment" });
      }
    }
  });

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteComment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Reports & Analytics
  app.get("/api/reports/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      
      // Get all projects, tasks, and team members
      const projects = await storage.getProjects(userId);
      const tasks = await storage.getTasks(userId);
      const teamMembers = await storage.getTeamMembers();
      
      // Calculate project health (percentage of projects on track)
      const onTrackProjects = projects.filter(p => p.status === 'active').length;
      const projectHealth = projects.length > 0 ? Math.round((onTrackProjects / projects.length) * 100) : 0;
      
      // Calculate task completion
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      
      // Calculate team efficiency (tasks completed vs total tasks)
      const teamEfficiency = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      
      res.json({
        projectHealth,
        taskCompletion: completedTasks,
        totalTasks: tasks.length,
        teamEfficiency,
        totalProjects: projects.length,
        totalTeamMembers: teamMembers.length
      });
    } catch (error) {
      console.error('Get reports stats error:', error);
      res.status(500).json({ error: "Failed to get reports stats" });
    }
  });

  app.get("/api/reports/task-completion-trend", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const tasks = await storage.getTasks(userId);
      
      // Group tasks by status
      const statusCounts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length
      };
      
      res.json(statusCounts);
    } catch (error) {
      console.error('Get task completion trend error:', error);
      res.status(500).json({ error: "Failed to get task completion trend" });
    }
  });

  app.get("/api/reports/workload-distribution", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const tasks = await storage.getTasks(userId);
      const teamMembers = await storage.getTeamMembers();
      
      // Calculate workload per team member
      const workloadMap = new Map();
      
      teamMembers.forEach(member => {
        workloadMap.set(member.id, {
          name: member.name,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0
        });
      });
      
      tasks.forEach(task => {
        if (task.assigneeId && workloadMap.has(task.assigneeId)) {
          const workload = workloadMap.get(task.assigneeId);
          workload.totalTasks++;
          if (task.status === 'done') workload.completedTasks++;
          if (task.status === 'in-progress') workload.inProgressTasks++;
        }
      });
      
      const workloadData = Array.from(workloadMap.values());
      res.json(workloadData);
    } catch (error) {
      console.error('Get workload distribution error:', error);
      res.status(500).json({ error: "Failed to get workload distribution" });
    }
  });

  // Folders & Documents
  app.get("/api/projects/:id/folders", requireAuth, async (req, res) => {
    try {
      const folders = await storage.getFolders(req.params.id);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to get folders" });
    }
  });

  app.post("/api/projects/:id/folders", requireAuth, async (req, res) => {
    try {
      const folderData = insertFolderSchema.parse({
        ...req.body,
        projectId: req.params.id
      });
      const folder = await storage.createFolder(folderData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create folder" });
      }
    }
  });

  app.get("/api/projects/:id/documents", requireAuth, async (req, res) => {
    try {
      const folderId = req.query.folderId as string | undefined;
      const documents = await storage.getDocuments(req.params.id, folderId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to get documents" });
    }
  });

  app.post("/api/projects/:id/documents", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = (req.user as any)?.id;
      const folderId = req.body.folderId === "null" || !req.body.folderId ? null : req.body.folderId;

      const documentData = {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: req.file.filename,
        projectId: req.params.id,
        folderId: folderId,
        uploadedBy: userId,
        version: 1
      };

      const document = await storage.createDocument(documentData as any);
      res.status(201).json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/documents/:id/download", requireAuth, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const filePath = path.join(uploadDir, document.url);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on server" });
      }

      res.download(filePath, document.name);
    } catch (error) {
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const success = await storage.deleteDocument(req.params.id);
      if (success) {
        const filePath = path.join(uploadDir, document.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  return httpServer;
}
