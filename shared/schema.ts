import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("online"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Team members (simplified for in-memory)
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "manager" | "member";
  status: "online" | "away" | "busy" | "offline";
  workload: number; // 0-100 percentage
}

// Projects
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  status: "on-track" | "at-risk" | "overdue" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  portfolioId?: string;
  taskCount: number;
  completedTaskCount: number;
}

// Portfolios
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  completionPercentage: number;
  riskIndicator: "low" | "medium" | "high";
  ownerIds: string[];
}

// Tasks
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in-progress" | "review" | "done";
  startDate: string;
  dueDate: string;
  progress: number; // 0-100
  subtasks: Subtask[];
  comments: Comment[];
  order: number;
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

// Issues
export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: "bug" | "feature" | "improvement" | "task";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: string;
}

// Activity
export interface Activity {
  id: string;
  projectId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  target: string;
  targetType: "task" | "project" | "comment" | "file" | "issue";
  createdAt: string;
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

// Document
export interface Document {
  id: string;
  projectId: string;
  folderId?: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}

// Folder
export interface Folder {
  id: string;
  projectId: string;
  parentId?: string;
  name: string;
}

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
