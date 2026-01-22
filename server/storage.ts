import { randomUUID } from "crypto";
import type {
  TeamMember,
  Project,
  Portfolio,
  Task,
  Activity,
  DashboardStats,
} from "@shared/schema";

// Generate avatar URL
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

// Sample team members
const sampleTeamMembers: TeamMember[] = [
  {
    id: "tm-1",
    name: "John Doe",
    email: "john@pinnacleai.com",
    avatar: avatar("John"),
    role: "admin",
    status: "online",
    workload: 75,
  },
  {
    id: "tm-2",
    name: "Sarah Chen",
    email: "sarah@pinnacleai.com",
    avatar: avatar("Sarah"),
    role: "manager",
    status: "online",
    workload: 60,
  },
  {
    id: "tm-3",
    name: "Michael Brown",
    email: "michael@pinnacleai.com",
    avatar: avatar("Michael"),
    role: "member",
    status: "busy",
    workload: 90,
  },
  {
    id: "tm-4",
    name: "Emily Davis",
    email: "emily@pinnacleai.com",
    avatar: avatar("Emily"),
    role: "member",
    status: "online",
    workload: 45,
  },
  {
    id: "tm-5",
    name: "Alex Johnson",
    email: "alex@pinnacleai.com",
    avatar: avatar("Alex"),
    role: "member",
    status: "away",
    workload: 55,
  },
  {
    id: "tm-6",
    name: "Lisa Wang",
    email: "lisa@pinnacleai.com",
    avatar: avatar("Lisa"),
    role: "manager",
    status: "online",
    workload: 70,
  },
];

// Sample projects
const sampleProjects: Project[] = [
  {
    id: "proj-1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website with new branding and improved UX",
    ownerId: "tm-2",
    ownerName: "Sarah Chen",
    ownerAvatar: avatar("Sarah"),
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    progress: 65,
    status: "on-track",
    priority: "high",
    portfolioId: "pf-1",
    taskCount: 24,
    completedTaskCount: 16,
  },
  {
    id: "proj-2",
    name: "Mobile App Development",
    description: "Native iOS and Android app development for customer engagement",
    ownerId: "tm-3",
    ownerName: "Michael Brown",
    ownerAvatar: avatar("Michael"),
    startDate: "2025-01-15",
    endDate: "2025-06-30",
    progress: 35,
    status: "at-risk",
    priority: "critical",
    portfolioId: "pf-1",
    taskCount: 48,
    completedTaskCount: 17,
  },
  {
    id: "proj-3",
    name: "API Integration",
    description: "Third-party API integrations for payment and analytics services",
    ownerId: "tm-1",
    ownerName: "John Doe",
    ownerAvatar: avatar("John"),
    startDate: "2024-12-01",
    endDate: "2025-02-15",
    progress: 85,
    status: "on-track",
    priority: "high",
    portfolioId: "pf-2",
    taskCount: 18,
    completedTaskCount: 15,
  },
  {
    id: "proj-4",
    name: "Customer Portal",
    description: "Self-service portal for customers to manage their accounts",
    ownerId: "tm-4",
    ownerName: "Emily Davis",
    ownerAvatar: avatar("Emily"),
    startDate: "2025-02-01",
    endDate: "2025-05-31",
    progress: 20,
    status: "on-track",
    priority: "medium",
    portfolioId: "pf-1",
    taskCount: 32,
    completedTaskCount: 6,
  },
  {
    id: "proj-5",
    name: "Data Analytics Dashboard",
    description: "Real-time analytics dashboard for business intelligence",
    ownerId: "tm-6",
    ownerName: "Lisa Wang",
    ownerAvatar: avatar("Lisa"),
    startDate: "2024-11-15",
    endDate: "2025-01-31",
    progress: 100,
    status: "completed",
    priority: "medium",
    portfolioId: "pf-2",
    taskCount: 22,
    completedTaskCount: 22,
  },
  {
    id: "proj-6",
    name: "Security Audit",
    description: "Comprehensive security audit and vulnerability assessment",
    ownerId: "tm-5",
    ownerName: "Alex Johnson",
    ownerAvatar: avatar("Alex"),
    startDate: "2025-01-10",
    endDate: "2025-01-25",
    progress: 40,
    status: "overdue",
    priority: "critical",
    portfolioId: "pf-2",
    taskCount: 12,
    completedTaskCount: 5,
  },
];

// Sample tasks for project 1
const sampleTasks: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "Design homepage wireframes",
    description: "Create wireframes for the new homepage layout including hero section, features, and footer",
    assigneeId: "tm-4",
    assigneeName: "Emily Davis",
    assigneeAvatar: avatar("Emily"),
    priority: "high",
    status: "done",
    startDate: "2025-01-02",
    dueDate: "2025-01-10",
    progress: 100,
    subtasks: [
      { id: "st-1", title: "Hero section design", completed: true },
      { id: "st-2", title: "Feature section layout", completed: true },
      { id: "st-3", title: "Footer design", completed: true },
    ],
    comments: [
      {
        id: "c-1",
        userId: "tm-2",
        userName: "Sarah Chen",
        userAvatar: avatar("Sarah"),
        content: "Great work on the wireframes!",
        createdAt: "2025-01-10T14:30:00Z",
      },
    ],
    order: 1,
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "Implement responsive navigation",
    description: "Build mobile-first responsive navigation with hamburger menu",
    assigneeId: "tm-3",
    assigneeName: "Michael Brown",
    assigneeAvatar: avatar("Michael"),
    priority: "high",
    status: "in-progress",
    startDate: "2025-01-11",
    dueDate: "2025-01-18",
    progress: 60,
    subtasks: [
      { id: "st-4", title: "Desktop navigation", completed: true },
      { id: "st-5", title: "Mobile hamburger menu", completed: false },
      { id: "st-6", title: "Animation effects", completed: false },
    ],
    comments: [],
    order: 2,
  },
  {
    id: "task-3",
    projectId: "proj-1",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment pipeline",
    assigneeId: "tm-1",
    assigneeName: "John Doe",
    assigneeAvatar: avatar("John"),
    priority: "medium",
    status: "review",
    startDate: "2025-01-08",
    dueDate: "2025-01-15",
    progress: 90,
    subtasks: [],
    comments: [],
    order: 3,
  },
  {
    id: "task-4",
    projectId: "proj-1",
    title: "Create product page templates",
    description: "Design and implement reusable product page templates",
    assigneeId: "tm-4",
    assigneeName: "Emily Davis",
    assigneeAvatar: avatar("Emily"),
    priority: "medium",
    status: "todo",
    startDate: "2025-01-20",
    dueDate: "2025-01-30",
    progress: 0,
    subtasks: [],
    comments: [],
    order: 4,
  },
  {
    id: "task-5",
    projectId: "proj-1",
    title: "Optimize image loading",
    description: "Implement lazy loading and image optimization for faster page loads",
    assigneeId: "tm-5",
    assigneeName: "Alex Johnson",
    assigneeAvatar: avatar("Alex"),
    priority: "low",
    status: "todo",
    startDate: "2025-01-25",
    dueDate: "2025-02-05",
    progress: 0,
    subtasks: [],
    comments: [],
    order: 5,
  },
  {
    id: "task-6",
    projectId: "proj-1",
    title: "Implement contact form",
    description: "Build contact form with validation and email integration",
    assigneeId: "tm-3",
    assigneeName: "Michael Brown",
    assigneeAvatar: avatar("Michael"),
    priority: "medium",
    status: "in-progress",
    startDate: "2025-01-12",
    dueDate: "2025-01-20",
    progress: 40,
    subtasks: [
      { id: "st-7", title: "Form UI", completed: true },
      { id: "st-8", title: "Validation", completed: false },
      { id: "st-9", title: "Email service", completed: false },
    ],
    comments: [],
    order: 6,
  },
  {
    id: "task-7",
    projectId: "proj-2",
    title: "Set up React Native project",
    description: "Initialize React Native project with TypeScript and navigation",
    assigneeId: "tm-3",
    assigneeName: "Michael Brown",
    assigneeAvatar: avatar("Michael"),
    priority: "high",
    status: "done",
    startDate: "2025-01-15",
    dueDate: "2025-01-20",
    progress: 100,
    subtasks: [],
    comments: [],
    order: 1,
  },
  {
    id: "task-8",
    projectId: "proj-2",
    title: "Implement authentication flow",
    description: "Build login, signup, and password recovery screens",
    assigneeId: "tm-5",
    assigneeName: "Alex Johnson",
    assigneeAvatar: avatar("Alex"),
    priority: "critical",
    status: "in-progress",
    startDate: "2025-01-21",
    dueDate: "2025-01-28",
    progress: 50,
    subtasks: [],
    comments: [],
    order: 2,
  },
];

// Sample portfolios
const samplePortfolios: Portfolio[] = [
  {
    id: "pf-1",
    name: "Digital Transformation",
    description: "Initiatives to modernize our digital presence and customer experience",
    projectCount: 3,
    completionPercentage: 40,
    riskIndicator: "medium",
    ownerIds: ["tm-1", "tm-2"],
  },
  {
    id: "pf-2",
    name: "Infrastructure & Security",
    description: "Backend infrastructure improvements and security enhancements",
    projectCount: 3,
    completionPercentage: 75,
    riskIndicator: "low",
    ownerIds: ["tm-1", "tm-6"],
  },
];

// Sample activities
const sampleActivities: Activity[] = [
  {
    id: "act-1",
    projectId: "proj-1",
    userId: "tm-4",
    userName: "Emily Davis",
    userAvatar: avatar("Emily"),
    action: "completed task",
    target: "Design homepage wireframes",
    targetType: "task",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-2",
    projectId: "proj-2",
    userId: "tm-3",
    userName: "Michael Brown",
    userAvatar: avatar("Michael"),
    action: "started working on",
    target: "Mobile App Development",
    targetType: "project",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-3",
    projectId: "proj-1",
    userId: "tm-2",
    userName: "Sarah Chen",
    userAvatar: avatar("Sarah"),
    action: "commented on",
    target: "Design homepage wireframes",
    targetType: "comment",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-4",
    projectId: "proj-3",
    userId: "tm-1",
    userName: "John Doe",
    userAvatar: avatar("John"),
    action: "uploaded file to",
    target: "API Integration",
    targetType: "file",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-5",
    projectId: "proj-6",
    userId: "tm-5",
    userName: "Alex Johnson",
    userAvatar: avatar("Alex"),
    action: "reported issue in",
    target: "Security Audit",
    targetType: "issue",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-6",
    projectId: "proj-1",
    userId: "tm-3",
    userName: "Michael Brown",
    userAvatar: avatar("Michael"),
    action: "updated progress on",
    target: "Implement responsive navigation",
    targetType: "task",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export interface IStorage {
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;

  // Team
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;

  // Portfolios
  getPortfolios(): Promise<Portfolio[]>;
  getPortfolio(id: string): Promise<Portfolio | undefined>;

  // Activities
  getActivities(): Promise<Activity[]>;
  getActivitiesByProject(projectId: string): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private teamMembers: Map<string, TeamMember>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private portfolios: Map<string, Portfolio>;
  private activities: Activity[];

  constructor() {
    this.teamMembers = new Map(sampleTeamMembers.map((m) => [m.id, m]));
    this.projects = new Map(sampleProjects.map((p) => [p.id, p]));
    this.tasks = new Map(sampleTasks.map((t) => [t.id, t]));
    this.portfolios = new Map(samplePortfolios.map((p) => [p.id, p]));
    this.activities = [...sampleActivities];
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const projects = Array.from(this.projects.values());
    const tasks = Array.from(this.tasks.values());
    const now = new Date();

    return {
      activeProjects: projects.filter((p) => p.status !== "completed").length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "done").length,
      overdueTasks: tasks.filter(
        (t) => new Date(t.dueDate) < now && t.status !== "done"
      ).length,
      upcomingMilestones: 4,
    };
  }

  // Team
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (t) => t.projectId === projectId
    );
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  // Portfolios
  async getPortfolios(): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values());
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return this.activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActivitiesByProject(projectId: string): Promise<Activity[]> {
    return this.activities
      .filter((a) => a.projectId === projectId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export const storage = new MemStorage();
