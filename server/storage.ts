import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  users,
  projects,
  tasks,
  portfolios,
  activities,
  issues,
  taskUpdates,
  subtasks,
  comments,
  folders,
  documents,
  notifications,
  taskAssignees,
  type User,
  type Project,
  type Task,
  type Portfolio,
  type Activity,
  type IssueTable,
  type ProjectWithDetails,
  type TaskWithDetails,
  type PortfolioWithDetails,
  type ActivityWithDetails,
  type IssueWithDetails,
  type TeamMember,
  type DashboardStats,
  type TaskUpdate,
  type InsertTaskUpdate,
  type SubtaskTable,
  type InsertSubtask,
  type CommentTable,
  type InsertComment,
  type Comment,
  type Folder,
  type InsertFolder,
  type Document,
  type InsertDocument,
  type TaskAssignee,
  type InsertTaskAssignee,
} from "@shared/schema";

// Database connection - PostgreSQL only
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required. Please configure your PostgreSQL database.");
}

let client: any;
let db: any;

try {
  client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  db = drizzle(client);
  console.log("✅ Connected to PostgreSQL database");
} catch (error: any) {
  console.error("❌ Failed to connect to PostgreSQL:", error.message);
  throw new Error("Database connection failed. Please check your DATABASE_URL configuration.");
}

// Generate avatar URL
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

// Initialize default admin if no users exist
async function initializeDefaultAdmin() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'password';
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@sierraedge.ai';

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await db.insert(users).values({
        username: adminUsername,
        password: hashedPassword,
        name: 'Administrator',
        email: adminEmail,
        role: 'admin',
        status: 'online',
        mustChangePassword: true,
        avatar: avatar(adminUsername),
      });

      console.log(`✅ Default admin created: ${adminEmail} (password must be changed on first login)`);
    }
  } catch (error: any) {
    // Table might not exist yet on first run, that's OK
    if (!error.message?.includes('does not exist')) {
      console.error('Error initializing default admin:', error.message);
    }
  }
}

// Run initialization
initializeDefaultAdmin();

export interface IStorage {
  // Auth
  authenticateUser(email: string, password: string): Promise<User | null>;
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  
  // Dashboard
  getDashboardStats(userId?: string): Promise<DashboardStats>;

  // Team
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  updateTeamMember(id: string, updates: Partial<User>): Promise<TeamMember | null>;
  deleteTeamMember(id: string): Promise<boolean>;

  // Projects
  getProjects(userId?: string): Promise<ProjectWithDetails[]>;
  getProject(id: string, userId?: string): Promise<ProjectWithDetails | undefined>;
  createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | null>;
  deleteProject(id: string, userId?: string): Promise<boolean>;

  // Tasks
  getTasks(userId?: string): Promise<TaskWithDetails[]>;
  getTasksByProject(projectId: string, userId?: string): Promise<TaskWithDetails[]>;
  getTask(id: string, userId?: string): Promise<TaskWithDetails | undefined>;
  updateTask(id: string, updates: Partial<Task>, userId?: string): Promise<Task | null>;
  createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  deleteTask(id: string, userId?: string): Promise<boolean>;

  // Task Updates
  getTaskUpdates(taskId: string): Promise<TaskUpdate[]>;
  getAllTaskUpdates(): Promise<any[]>;
  createTaskUpdate(updateData: InsertTaskUpdate): Promise<TaskUpdate>;

  // Portfolios
  getPortfolios(): Promise<PortfolioWithDetails[]>;
  getPortfolio(id: string): Promise<PortfolioWithDetails | undefined>;

  // Activities
  getActivities(userId?: string): Promise<ActivityWithDetails[]>;
  getActivitiesByProject(projectId: string, userId?: string): Promise<ActivityWithDetails[]>;
  createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>;

  // Issues
  getIssues(userId?: string): Promise<IssueWithDetails[]>;
  getIssuesByProject(projectId: string, userId?: string): Promise<IssueWithDetails[]>;
  getIssue(id: string, userId?: string): Promise<IssueWithDetails | undefined>;
  createIssue(issueData: Omit<IssueTable, 'id' | 'createdAt' | 'updatedAt'>): Promise<IssueTable>;
  updateIssue(id: string, updates: Partial<IssueTable>, userId?: string): Promise<IssueTable | null>;
  deleteIssue(id: string, userId?: string): Promise<boolean>;

  // Subtasks
  getSubtasks(taskId: string): Promise<SubtaskTable[]>;
  createSubtask(subtaskData: InsertSubtask): Promise<SubtaskTable>;
  updateSubtask(id: string, updates: Partial<SubtaskTable>): Promise<SubtaskTable | null>;
  deleteSubtask(id: string): Promise<boolean>;

  // Comments
  getComments(taskId: string): Promise<Comment[]>;
  createComment(commentData: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;

  // Documents & Folders
  getFolders(projectId: string): Promise<Folder[]>;
  createFolder(folderData: InsertFolder): Promise<Folder>;
  getDocuments(projectId: string, folderId?: string): Promise<Document[]>;
  createDocument(documentData: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Notifications
  getNotifications(userId: string): Promise<any[]>;
  markNotificationAsRead(id: string, userId: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;

  // Task Assignees
  addTaskAssignee(taskId: string, userId: string, assignedBy?: string): Promise<TaskAssignee>;
  removeTaskAssignee(taskId: string, userId: string): Promise<boolean>;
  setTaskAssignees(taskId: string, userIds: string[], assignedBy?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) return null;
      
      const isValid = await bcrypt.compare(password, user[0].password);
      if (!isValid) return null;
      
      return user[0];
    } catch (error) {
      console.error('Auth error:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();
    return newUser[0];
  }

  // Dashboard
  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    try {
      let projectsQuery = db.select().from(projects);
      let tasksQuery = db.select().from(tasks);
      
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          // For non-admin users, only show their assigned tasks and projects
          projectsQuery = projectsQuery.where(eq(projects.ownerId, userId));
          tasksQuery = tasksQuery.where(eq(tasks.assigneeId, userId));
        }
      }
      
      const allProjects = await projectsQuery;
      const allTasks = await tasksQuery;
      const now = new Date();

      return {
        activeProjects: allProjects.filter((p: Project) => p.status !== "completed").length,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter((t: Task) => t.status === "done").length,
        overdueTasks: allTasks.filter(
          (t: Task) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
        ).length,
        upcomingMilestones: 0,
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        upcomingMilestones: 0,
      };
    }
  }

  // Team
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const allUsers = await db.select().from(users);
      return allUsers.map((user: User) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || avatar(user.name),
        role: user.role as "admin" | "manager" | "member",
        status: user.status as "online" | "away" | "busy" | "offline",
        workload: 0,
      }));
    } catch (error) {
      console.error('Team members error:', error);
      return [];
    }
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    try {
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (user.length === 0) return undefined;
      
      return {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        avatar: user[0].avatar || avatar(user[0].name),
        role: user[0].role as "admin" | "manager" | "member",
        status: user[0].status as "online" | "away" | "busy" | "offline",
        workload: 0,
      };
    } catch (error) {
      console.error('Team member error:', error);
      return undefined;
    }
  }

  async updateTeamMember(id: string, updates: Partial<User>): Promise<TeamMember | null> {
    try {
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      
      const updated = await db.update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
        
      if (updated.length === 0) return null;
      
      const user = updated[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || avatar(user.name),
        role: user.role as "admin" | "manager" | "member",
        status: user.status as "online" | "away" | "busy" | "offline",
        workload: 0,
      };
    } catch (error) {
      console.error('Update team member error:', error);
      return null;
    }
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    try {
      // Delete in correct order to handle foreign key constraints
      await db.delete(taskUpdates).where(eq(taskUpdates.userId, id));
      await db.delete(activities).where(eq(activities.userId, id));
      
      // Update tasks and projects to remove references
      await db.update(tasks).set({ assigneeId: null }).where(eq(tasks.assigneeId, id));
      await db.update(projects).set({ ownerId: null }).where(eq(projects.ownerId, id));
      await db.update(issues).set({ assigneeId: null }).where(eq(issues.assigneeId, id));
      
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Delete team member error:', error);
      return false;
    }
  }

  // Projects
  async getProjects(userId?: string): Promise<ProjectWithDetails[]> {
    try {
      let query = db.select({
        project: projects,
        owner: users,
      }).from(projects).leftJoin(users, eq(projects.ownerId, users.id));
      
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(eq(projects.ownerId, userId));
        }
      }
      
      const result = await query;
      
      const projectsWithDetails = await Promise.all(
        result.map(async ({ project, owner }: { project: Project, owner: User | null }) => {
          const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, project.id));
          const completedTasks = projectTasks.filter((t: Task) => t.status === 'done');
          
          return {
            ...project,
            ownerName: owner?.name || 'Unknown',
            ownerAvatar: owner?.avatar || avatar(owner?.name || 'Unknown'),
            taskCount: projectTasks.length,
            completedTaskCount: completedTasks.length,
          };
        })
      );
      
      return projectsWithDetails;
    } catch (error) {
      console.error('Projects error:', error);
      return [];
    }
  }

  async getProject(id: string, userId?: string): Promise<ProjectWithDetails | undefined> {
    try {
      let query = db.select({
        project: projects,
        owner: users,
      }).from(projects).leftJoin(users, eq(projects.ownerId, users.id)).where(eq(projects.id, id));
      
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(and(eq(projects.id, id), eq(projects.ownerId, userId)));
        }
      }
      
      const result = await query.limit(1);
      if (result.length === 0) return undefined;
      
      const { project, owner } = result[0];
      const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, project.id));
      const completedTasks = projectTasks.filter((t: Task) => t.status === 'done');
      
      return {
        ...project,
        ownerName: owner?.name || 'Unknown',
        ownerAvatar: owner?.avatar || avatar(owner?.name || 'Unknown'),
        taskCount: projectTasks.length,
        completedTaskCount: completedTasks.length,
      };
    } catch (error) {
      console.error('Project error:', error);
      return undefined;
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    // Convert date strings to Date objects
    const processedData = {
      ...projectData,
      startDate: projectData.startDate ? new Date(projectData.startDate) : null,
      endDate: projectData.endDate ? new Date(projectData.endDate) : null,
    };
    
    console.log('Processed project data:', processedData);
    const newProject = await db.insert(projects).values(processedData).returning();
    return newProject[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      // Convert date strings to Date objects if present
      const processedUpdates = {
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : updates.startDate,
        endDate: updates.endDate ? new Date(updates.endDate) : updates.endDate,
        updatedAt: new Date()
      };
      
      const updated = await db.update(projects).set(processedUpdates).where(eq(projects.id, id)).returning();
      return updated.length > 0 ? updated[0] : null;
    } catch (error) {
      console.error('Update project error:', error);
      return null;
    }
  }

  async deleteProject(id: string, userId?: string): Promise<boolean> {
    try {
      // Check permissions first
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          const project = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.ownerId, userId))).limit(1);
          if (project.length === 0) {
            return false;
          }
        }
      }
      
      // Get all tasks for this project
      const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, id));
      
      // Delete task updates for all project tasks
      for (const task of projectTasks) {
        await db.delete(taskUpdates).where(eq(taskUpdates.taskId, task.id));
      }
      
      // Delete all project-related records in correct order
      await db.delete(tasks).where(eq(tasks.projectId, id));
      await db.delete(issues).where(eq(issues.projectId, id));
      await db.delete(activities).where(eq(activities.projectId, id));
      const result = await db.delete(projects).where(eq(projects.id, id)).returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Delete project error:', error);
      return false;
    }
  }

  // Tasks
  async getTasks(userId?: string): Promise<TaskWithDetails[]> {
    try {
      console.log('Getting tasks for userId:', userId);

      // Query tasks with project join
      const result = await db.select({
        task: tasks,
        project: projects,
      }).from(tasks).leftJoin(projects, eq(tasks.projectId, projects.id));
      console.log('Raw tasks from DB:', result.length);

      if (result.length === 0) {
        console.log('No tasks found in database');
        return [];
      }

      const tasksWithDetails = await Promise.all(result.map(async ({ task, project }: { task: Task, project: Project | null }) => {
        // Get primary assignee info if exists
        let assignee = null;
        if (task.assigneeId) {
          const assigneeResult = await db.select().from(users).where(eq(users.id, task.assigneeId)).limit(1);
          assignee = assigneeResult[0] || null;
        }

        // Get all assignees from junction table
        const assigneeRecords = await db.select({
          assignee: taskAssignees,
          user: users,
        }).from(taskAssignees)
          .leftJoin(users, eq(taskAssignees.userId, users.id))
          .where(eq(taskAssignees.taskId, task.id));

        const assignees = assigneeRecords.map(({ user }: { user: User | null }) => user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar || avatar(user.name),
        } : null).filter(Boolean);

        // Get subtasks and comments
        const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, task.id));
        const taskComments = await this.getComments(task.id);

        return {
          ...task,
          assigneeName: assignee?.name,
          assigneeAvatar: assignee?.avatar || (assignee?.name ? avatar(assignee.name) : undefined),
          assignees: assignees as { id: string; name: string; avatar?: string }[],
          projectName: project?.name,
          subtasks: taskSubtasks,
          comments: taskComments,
          lastUpdateAt: undefined,
        };
      }));

      // Apply filtering after getting all tasks
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          console.log('Filtering for non-admin user:', userId);
          const filtered = tasksWithDetails.filter(task =>
            task.assigneeId === userId ||
            task.assignees?.some((a: { id: string }) => a.id === userId)
          );
          console.log('Filtered tasks:', filtered.length);
          return filtered;
        }
      }

      console.log('Returning all tasks:', tasksWithDetails.length);
      return tasksWithDetails;
    } catch (error) {
      console.error('Tasks error:', error);
      return [];
    }
  }

  async getTasksByProject(projectId: string, userId?: string): Promise<TaskWithDetails[]> {
    try {
      let query = db.select({
        task: tasks,
        assignee: users,
        project: projects,
      }).from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(eq(tasks.projectId, projectId));

      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(and(eq(tasks.projectId, projectId), eq(tasks.assigneeId, userId)));
        }
      }

      const result = await query;

      return Promise.all(result.map(async ({ task, assignee, project }: { task: Task, assignee: User | null, project: Project | null }) => {
        const updates = await db.select().from(taskUpdates)
          .where(eq(taskUpdates.taskId, task.id))
          .orderBy(desc(taskUpdates.createdAt))
          .limit(1);

        const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, task.id));
        const taskComments = await this.getComments(task.id);

        // Get all assignees from junction table
        const assigneeRecords = await db.select({
          assignee: taskAssignees,
          user: users,
        }).from(taskAssignees)
          .leftJoin(users, eq(taskAssignees.userId, users.id))
          .where(eq(taskAssignees.taskId, task.id));

        const assignees = assigneeRecords.map(({ user }: { user: User | null }) => user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar || avatar(user.name),
        } : null).filter(Boolean);

        return {
          ...task,
          assigneeName: assignee?.name,
          assigneeAvatar: assignee?.avatar || (assignee?.name ? avatar(assignee.name) : undefined),
          assignees: assignees as { id: string; name: string; avatar?: string }[],
          projectName: project?.name,
          subtasks: taskSubtasks,
          comments: taskComments,
          lastUpdateAt: updates.length > 0 ? updates[0].createdAt : undefined,
        };
      }));
    } catch (error) {
      console.error('Project tasks error:', error);
      return [];
    }
  }

  async getTask(id: string, userId?: string): Promise<TaskWithDetails | undefined> {
    try {
      let query = db.select({
        task: tasks,
        assignee: users,
        project: projects,
      }).from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(eq(tasks.id, id));

      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(and(eq(tasks.id, id), eq(tasks.assigneeId, userId)));
        }
      }

      const result = await query.limit(1);
      if (result.length === 0) return undefined;

      const { task, assignee, project } = result[0];
      const updates = await db.select().from(taskUpdates)
        .where(eq(taskUpdates.taskId, task.id))
        .orderBy(desc(taskUpdates.createdAt))
        .limit(1);

      const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, id));
      const taskComments = await this.getComments(id);

      // Get all assignees from junction table
      const assigneeRecords = await db.select({
        assignee: taskAssignees,
        user: users,
      }).from(taskAssignees)
        .leftJoin(users, eq(taskAssignees.userId, users.id))
        .where(eq(taskAssignees.taskId, task.id));

      const assignees = assigneeRecords.map(({ user }: { user: User | null }) => user ? {
        id: user.id,
        name: user.name,
        avatar: user.avatar || avatar(user.name),
      } : null).filter(Boolean);

      return {
        ...task,
        assigneeName: assignee?.name,
        assigneeAvatar: assignee?.avatar || (assignee?.name ? avatar(assignee.name) : undefined),
        assignees: assignees as { id: string; name: string; avatar?: string }[],
        projectName: project?.name,
        subtasks: taskSubtasks,
        comments: taskComments,
        lastUpdateAt: updates.length > 0 ? updates[0].createdAt : undefined,
      };
    } catch (error) {
      console.error('Task error:', error);
      return undefined;
    }
  }

  async updateTask(id: string, updates: Partial<Task>, userId?: string): Promise<Task | null> {
    try {
      // Convert date strings to Date objects if present
      const processedUpdates = {
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : updates.startDate,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : updates.dueDate,
        updatedAt: new Date()
      };
      
      // For members, they can only update their assigned tasks
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role === 'member') {
          // Members can only update their assigned tasks
          const updated = await db.update(tasks)
            .set(processedUpdates)
            .where(and(eq(tasks.id, id), eq(tasks.assigneeId, userId)))
            .returning();
          return updated.length > 0 ? updated[0] : null;
        }
      }
      
      // Admin can update any task
      const updated = await db.update(tasks).set(processedUpdates).where(eq(tasks.id, id)).returning();
      return updated.length > 0 ? updated[0] : null;
    } catch (error) {
      console.error('Update task error:', error);
      return null;
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      // Convert date strings to Date objects
      const processedData = {
        ...taskData,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      };
      
      console.log('Creating task with data:', processedData);
      const newTask = await db.insert(tasks).values(processedData).returning();
      console.log('Task created successfully:', newTask[0]);
      return newTask[0];
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  async deleteTask(id: string, userId?: string): Promise<boolean> {
    try {
      // Only admin can delete tasks
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length === 0 || user[0].role !== 'admin') {
          return false;
        }
      }
      
      // Delete in correct order to handle foreign key constraints
      await db.delete(taskUpdates).where(eq(taskUpdates.taskId, id));
      await db.delete(activities).where(and(eq(activities.targetType, 'task'), eq(activities.target, id)));
      const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Delete task error:', error);
      return false;
    }
  }

  // Task Updates
  async getTaskUpdates(taskId: string): Promise<TaskUpdate[]> {
    try {
      return await db.select().from(taskUpdates).where(eq(taskUpdates.taskId, taskId)).orderBy(desc(taskUpdates.createdAt));
    } catch (error) {
      console.error('Get task updates error:', error);
      return [];
    }
  }

  async getAllTaskUpdates(): Promise<any[]> {
    try {
      const result = await db.select({
        update: taskUpdates,
        task: tasks,
        user: users,
        project: projects
      })
      .from(taskUpdates)
      .leftJoin(tasks, eq(taskUpdates.taskId, tasks.id))
      .leftJoin(users, eq(taskUpdates.userId, users.id))
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .orderBy(desc(taskUpdates.createdAt));
      
      return result.map(({ update, task, user, project }: { update: TaskUpdate, task: Task | null, user: User | null, project: Project | null }) => ({
        ...update,
        taskTitle: task?.title,
        userName: user?.name,
        userEmail: user?.email,
        projectName: project?.name
      }));
    } catch (error) {
      console.error('Get all task updates error:', error);
      return [];
    }
  }

  async createTaskUpdate(updateData: InsertTaskUpdate): Promise<TaskUpdate> {
    try {
      const newUpdate = await db.insert(taskUpdates).values(updateData).returning();
      
      // Also update task progress if provided
      if (updateData.progress !== undefined && updateData.progress !== null) {
        await db.update(tasks)
          .set({ progress: updateData.progress, updatedAt: new Date() })
          .where(eq(tasks.id, updateData.taskId));
      }
      
      return newUpdate[0];
    } catch (error) {
      console.error('Create task update error:', error);
      throw error;
    }
  }

  // Portfolios
  async getPortfolios(): Promise<PortfolioWithDetails[]> {
    try {
      const allPortfolios = await db.select().from(portfolios);
      
      const portfoliosWithDetails = await Promise.all(
        allPortfolios.map(async (portfolio: Portfolio) => {
          const portfolioProjects = await db.select().from(projects).where(eq(projects.portfolioId, portfolio.id));
          const totalTasks = await Promise.all(
            portfolioProjects.map((p: Project) => db.select().from(tasks).where(eq(tasks.projectId, p.id)))
          );
          const allTasks = totalTasks.flat();
          const completedTasks = allTasks.filter((t: Task) => t.status === 'done');
          
          return {
            ...portfolio,
            projectCount: portfolioProjects.length,
            completionPercentage: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
            riskIndicator: 'low' as const,
            ownerIds: portfolioProjects.map((p: Project) => p.ownerId).filter(Boolean) as string[],
          };
        })
      );
      
      return portfoliosWithDetails;
    } catch (error) {
      console.error('Portfolios error:', error);
      return [];
    }
  }

  async getPortfolio(id: string): Promise<PortfolioWithDetails | undefined> {
    try {
      const portfolio = await db.select().from(portfolios).where(eq(portfolios.id, id)).limit(1);
      if (portfolio.length === 0) return undefined;
      
      const portfolioProjects = await db.select().from(projects).where(eq(projects.portfolioId, id));
      const totalTasks = await Promise.all(
        portfolioProjects.map((p: Project) => db.select().from(tasks).where(eq(tasks.projectId, p.id)))
      );
      const allTasks = totalTasks.flat();
      const completedTasks = allTasks.filter((t: Task) => t.status === 'done');
      
      return {
        ...portfolio[0],
        projectCount: portfolioProjects.length,
        completionPercentage: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
        riskIndicator: 'low' as const,
        ownerIds: portfolioProjects.map((p: Project) => p.ownerId).filter(Boolean) as string[],
      };
    } catch (error) {
      console.error('Portfolio error:', error);
      return undefined;
    }
  }

  // Activities
  async getActivities(userId?: string): Promise<ActivityWithDetails[]> {
    try {
      let query = db.select({
        activity: activities,
        user: users,
      }).from(activities).leftJoin(users, eq(activities.userId, users.id)).orderBy(desc(activities.createdAt));
      
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(eq(activities.userId, userId));
        }
      }
      
      const result = await query;
      
      return result.map(({ activity, user }: { activity: Activity, user: User | null }) => ({
        ...activity,
        userName: user?.name || 'Unknown',
        userAvatar: user?.avatar || (user?.name ? avatar(user.name) : undefined),
      }));
    } catch (error) {
      console.error('Activities error:', error);
      return [];
    }
  }

  async getActivitiesByProject(projectId: string, userId?: string): Promise<ActivityWithDetails[]> {
    try {
      let query = db.select({
        activity: activities,
        user: users,
      }).from(activities).leftJoin(users, eq(activities.userId, users.id))
        .where(eq(activities.projectId, projectId))
        .orderBy(desc(activities.createdAt));
      
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(and(eq(activities.projectId, projectId), eq(activities.userId, userId)));
        }
      }
      
      const result = await query;
      
      return result.map(({ activity, user }: { activity: Activity, user: User | null }) => ({
        ...activity,
        userName: user?.name || 'Unknown',
        userAvatar: user?.avatar || (user?.name ? avatar(user.name) : undefined),
      }));
    } catch (error) {
      console.error('Project activities error:', error);
      return [];
    }
  }

  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    const newActivity = await db.insert(activities).values(activityData).returning();
    return newActivity[0];
  }

  // Issues
  async getIssues(userId?: string): Promise<IssueWithDetails[]> {
    try {
      let query = db.select({
        issue: issues,
        assignee: users,
        project: projects,
      }).from(issues)
        .leftJoin(users, eq(issues.assigneeId, users.id))
        .leftJoin(projects, eq(issues.projectId, projects.id));

      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(eq(issues.assigneeId, userId));
        }
      }

      const result = await query;

      return result.map(({ issue, assignee, project }: { issue: IssueTable, assignee: User | null, project: Project | null }) => ({
        ...issue,
        assigneeName: assignee?.name,
        assigneeAvatar: assignee?.avatar || (assignee?.name ? avatar(assignee.name) : undefined),
        projectName: project?.name,
      }));
    } catch (error) {
      console.error('Issues error:', error);
      return [];
    }
  }

  async getIssuesByProject(projectId: string, userId?: string): Promise<IssueWithDetails[]> {
    try {
      let query = db.select({
        issue: issues,
        assignee: users,
        project: projects,
      }).from(issues)
        .leftJoin(users, eq(issues.assigneeId, users.id))
        .leftJoin(projects, eq(issues.projectId, projects.id))
        .where(eq(issues.projectId, projectId));

      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(and(eq(issues.projectId, projectId), eq(issues.assigneeId, userId)));
        }
      }

      const result = await query;

      return result.map(({ issue, assignee, project }: { issue: IssueTable, assignee: User | null, project: Project | null }) => ({
        ...issue,
        assigneeName: assignee?.name,
        assigneeAvatar: assignee?.avatar || (assignee?.name ? avatar(assignee.name) : undefined),
        projectName: project?.name,
      }));
    } catch (error) {
      console.error('Project issues error:', error);
      return [];
    }
  }

  async getIssue(id: string, userId?: string): Promise<IssueWithDetails | undefined> {
    try {
      let query = db.select({
        issue: issues,
        assignee: users,
        project: projects,
      }).from(issues)
        .leftJoin(users, eq(issues.assigneeId, users.id))
        .leftJoin(projects, eq(issues.projectId, projects.id))
        .where(eq(issues.id, id));

      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(and(eq(issues.id, id), eq(issues.assigneeId, userId)));
        }
      }

      const result = await query.limit(1);
      if (result.length === 0) return undefined;

      const { issue, assignee, project } = result[0];

      return {
        ...issue,
        assigneeName: assignee?.name,
        assigneeAvatar: assignee?.avatar || (assignee?.name ? avatar(assignee.name) : undefined),
        projectName: project?.name,
      };
    } catch (error) {
      console.error('Issue error:', error);
      return undefined;
    }
  }

  async createIssue(issueData: Omit<IssueTable, 'id' | 'createdAt' | 'updatedAt'>): Promise<IssueTable> {
    const newIssue = await db.insert(issues).values(issueData).returning();
    return newIssue[0];
  }

  async updateIssue(id: string, updates: Partial<IssueTable>, userId?: string): Promise<IssueTable | null> {
    try {
      let query = db.update(issues).set({ ...updates, updatedAt: new Date() }).where(eq(issues.id, id));

      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          query = query.where(and(eq(issues.id, id), eq(issues.assigneeId, userId)));
        }
      }

      const updated = await query.returning();
      return updated.length > 0 ? updated[0] : null;
    } catch (error) {
      console.error('Update issue error:', error);
      return null;
    }
  }

  async deleteIssue(id: string, userId?: string): Promise<boolean> {
    try {
      // Check permissions first
      if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user.length > 0 && user[0].role !== 'admin') {
          const issue = await db.select().from(issues).where(and(eq(issues.id, id), eq(issues.assigneeId, userId))).limit(1);
          if (issue.length === 0) {
            return false;
          }
        }
      }
      
      // Delete related activities first
      await db.delete(activities).where(and(eq(activities.targetType, 'issue'), eq(activities.target, id)));
      const result = await db.delete(issues).where(eq(issues.id, id)).returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Delete issue error:', error);
      return false;
    }
  }

  // Subtasks
  async getSubtasks(taskId: string): Promise<SubtaskTable[]> {
    try {
      return await db.select().from(subtasks).where(eq(subtasks.taskId, taskId)).orderBy(subtasks.createdAt);
    } catch (error) {
      console.error('Get subtasks error:', error);
      return [];
    }
  }

  async createSubtask(subtaskData: InsertSubtask): Promise<SubtaskTable> {
    const newSubtask = await db.insert(subtasks).values(subtaskData).returning();
    return newSubtask[0];
  }

  async updateSubtask(id: string, updates: Partial<SubtaskTable>): Promise<SubtaskTable | null> {
    const updated = await db.update(subtasks).set(updates).where(eq(subtasks.id, id)).returning();
    return updated.length > 0 ? updated[0] : null;
  }

  async deleteSubtask(id: string): Promise<boolean> {
    const result = await db.delete(subtasks).where(eq(subtasks.id, id)).returning();
    return result.length > 0;
  }

  // Comments
  async getComments(taskId: string): Promise<Comment[]> {
    try {
      const result = await db.select({
        comment: comments,
        user: users,
      }).from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.taskId, taskId))
        .orderBy(comments.createdAt);

      return result.map(({ comment, user }: { comment: CommentTable, user: User | null }) => ({
        id: comment.id,
        userId: comment.userId,
        userName: user?.name || 'Unknown',
        userAvatar: user?.avatar || (user?.name ? avatar(user.name) : undefined),
        content: comment.content,
        createdAt: comment.createdAt?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Get comments error:', error);
      return [];
    }
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const newComment = await db.insert(comments).values(commentData).returning();
    const user = await db.select().from(users).where(eq(users.id, commentData.userId)).limit(1);
    
    return {
      id: newComment[0].id,
      userId: newComment[0].userId,
      userName: user[0]?.name || 'Unknown',
      userAvatar: user[0]?.avatar || (user[0]?.name ? avatar(user[0].name) : undefined),
      content: newComment[0].content,
      createdAt: newComment[0].createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  // Documents & Folders
  async getFolders(projectId: string): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.projectId, projectId));
  }

  async createFolder(folderData: InsertFolder): Promise<Folder> {
    const newFolder = await db.insert(folders).values(folderData).returning();
    return newFolder[0];
  }

  async getDocuments(projectId: string, folderId?: string): Promise<Document[]> {
    let query = db.select().from(documents).where(eq(documents.projectId, projectId));
    if (folderId) {
      query = query.where(eq(documents.folderId, folderId));
    } else {
      query = query.where(isNull(documents.folderId));
    }
    return await query;
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const newDoc = await db.insert(documents).values(documentData).returning();
    return newDoc[0];
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  // Notifications
  async getNotifications(userId: string): Promise<any[]> {
    try {
      const result = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
      return result;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db.update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId));
      return true;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return false;
    }
  }

  // Task Assignees
  async addTaskAssignee(taskId: string, userId: string, assignedBy?: string): Promise<TaskAssignee> {
    const newAssignee = await db.insert(taskAssignees).values({
      taskId,
      userId,
      assignedBy: assignedBy || null,
    }).returning();
    return newAssignee[0];
  }

  async removeTaskAssignee(taskId: string, userId: string): Promise<boolean> {
    const result = await db.delete(taskAssignees)
      .where(and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async setTaskAssignees(taskId: string, userIds: string[], assignedBy?: string): Promise<void> {
    try {
      // Remove all existing assignees
      await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));

      // Add new assignees
      if (userIds.length > 0) {
        const assigneeRecords = userIds.map(userId => ({
          taskId,
          userId,
          assignedBy: assignedBy || null,
        }));
        await db.insert(taskAssignees).values(assigneeRecords);
      }
    } catch (error) {
      console.error('Set task assignees error:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
