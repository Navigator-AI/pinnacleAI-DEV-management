import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  teamsUsername: text("teams_username"),
  avatar: text("avatar"),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("online"),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ProjectStatus = "on-track" | "at-risk" | "overdue" | "completed";
export type PriorityType = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

// Projects table
export const projects = pgTable("projects", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").references(() => users.id),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  progress: integer("progress").default(0),
  status: text("status").notNull().default("on-track"),
  priority: text("priority").notNull().default("medium"),
  portfolioId: text("portfolio_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text("project_id").references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: text("assignee_id").references(() => users.id), // Primary assignee (kept for backwards compatibility)
  createdBy: text("created_by").references(() => users.id), // Who created the task
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("todo"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  progress: integer("progress").default(0),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Assignees junction table (for multiple assignees)
export const taskAssignees = pgTable("task_assignees", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  taskId: text("task_id").references(() => tasks.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: text("assigned_by").references(() => users.id),
});

// Portfolios table
export const portfolios = pgTable("portfolios", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text("project_id").references(() => projects.id),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  target: text("target").notNull(),
  targetType: text("target_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Issues table
export const issues = pgTable("issues", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text("project_id").references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("bug"), // bug, feature, improvement, task
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  status: text("status").notNull().default("open"), // open, in-progress, resolved, closed
  assigneeId: text("assignee_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task Updates table (Daily Updates)
export const taskUpdates = pgTable("task_updates", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  taskId: text("task_id").references(() => tasks.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  progress: integer("progress"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subtasks table
export const subtasks = pgTable("subtasks", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  taskId: text("task_id").references(() => tasks.id).notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  taskId: text("task_id").references(() => tasks.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskUpdateSchema = createInsertSchema(taskUpdates).pick({
  taskId: true,
  userId: true,
  content: true,
  progress: true,
});

export const insertSubtaskSchema = createInsertSchema(subtasks);
export const insertCommentSchema = createInsertSchema(comments);

export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertTaskUpdate = z.infer<typeof insertTaskUpdateSchema>;

export type SubtaskTable = typeof subtasks.$inferSelect;
export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;

export type CommentTable = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  teamsUsername: true,
  avatar: true,
  role: true,
  status: true,
});

export const insertTaskAssigneeSchema = createInsertSchema(taskAssignees);
export type TaskAssignee = typeof taskAssignees.$inferSelect;
export type InsertTaskAssignee = z.infer<typeof insertTaskAssigneeSchema>;

export const insertProjectSchema = createInsertSchema(projects);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertPortfolioSchema = createInsertSchema(portfolios);
export const insertActivitySchema = createInsertSchema(activities);
export const insertIssueSchema = createInsertSchema(issues);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type IssueTable = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Issue update schema
export const issueUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["bug", "feature", "improvement", "task"]).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export type IssueUpdateRequest = z.infer<typeof issueUpdateSchema>;

// Task update schema
export const taskUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
  status: z.enum(["todo", "in-progress", "review", "done"]).optional(),
  assigneeId: z.string().nullable().optional(), // Primary assignee
  assigneeIds: z.array(z.string()).optional(), // Multiple assignees
  projectId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
});

export type TaskUpdateRequest = z.infer<typeof taskUpdateSchema>;

// Task create schema with RBAC fields
export const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["todo", "in-progress", "review", "done"]).default("todo"),
  assigneeId: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  projectId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
});

export type TaskCreateRequest = z.infer<typeof taskCreateSchema>;

// Team members (simplified for in-memory)
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  teamsUsername?: string;
  avatar?: string;
  role: "admin" | "manager" | "member";
  status: "online" | "away" | "busy" | "offline";
  workload: number; // 0-100 percentage
}

// Extended Project interface for API responses
export interface ProjectWithDetails extends Project {
  ownerName: string;
  ownerAvatar?: string;
  taskCount: number;
  completedTaskCount: number;
}

// Extended Task interface for API responses
export interface TaskWithDetails extends Task {
  assigneeName?: string;
  assigneeAvatar?: string;
  assignees?: { id: string; name: string; avatar?: string }[]; // Multiple assignees
  projectName?: string;
  createdByName?: string;
  subtasks: Subtask[];
  comments: Comment[];
  lastUpdateAt?: string | Date | null;
}

// Portfolios with details
export interface PortfolioWithDetails extends Portfolio {
  projectCount: number;
  completionPercentage: number;
  riskIndicator: "low" | "medium" | "high";
  ownerIds: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

// Extended Issue interface for API responses
export interface IssueWithDetails extends IssueTable {
  assigneeName?: string;
  assigneeAvatar?: string;
  projectName?: string;
}

// Extended Activity interface for API responses
export interface ActivityWithDetails extends Activity {
  userName: string;
  userAvatar?: string;
}

// Timesheet entry
export interface TimesheetEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  approved: boolean;
}

// Folders table
export const folders = pgTable("folders", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text("project_id").references(() => projects.id).notNull(),
  parentId: text("parent_id"),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text("project_id").references(() => projects.id).notNull(),
  folderId: text("folder_id").references(() => folders.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  uploadedBy: text("uploaded_by").references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  version: integer("version").default(1),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFolderSchema = createInsertSchema(folders);
export const insertDocumentSchema = createInsertSchema(documents);

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Dashboard widget data
export interface DashboardStats {
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingMilestones: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
