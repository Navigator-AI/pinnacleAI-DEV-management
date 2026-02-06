import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { ProgressRing } from "@/components/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskUpdateDialog } from "@/components/task-update-dialog";
import type { DashboardStats, Project, Activity, TeamMember, TaskWithDetails } from "@shared/schema";

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold">{value}</span>
            {change && (
              <div className="flex items-center gap-1">
                {changeType === "positive" ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${
                    changeType === "positive" ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-md bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium truncate" data-testid={`text-project-name-${project.id}`}>
                {project.name}
              </h4>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {project.description}
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={project.ownerAvatar} />
                <AvatarFallback className="text-xs">
                  {project.ownerName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {project.ownerName || 'Unknown'}
              </span>
              <span className="text-xs text-muted-foreground">
                Due {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No date'}
              </span>
            </div>
          </div>
          <ProgressRing progress={project.progress || 0} size={48} />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getActionColor = () => {
    switch (activity.targetType) {
      case "task":
        return "text-blue-500";
      case "project":
        return "text-emerald-500";
      case "comment":
        return "text-purple-500";
      case "file":
        return "text-amber-500";
      case "issue":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Avatar className="h-8 w-8">
        <AvatarImage src={activity.userAvatar} />
        <AvatarFallback className="text-xs">{activity.userName?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.userName || 'Unknown'}</span>{" "}
          <span className="text-muted-foreground">{activity.action || 'performed an action'}</span>{" "}
          <span className={getActionColor()}>{activity.target || 'something'}</span>
        </p>
        <span className="text-xs text-muted-foreground">
          {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Recently'}
        </span>
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: any }) {
  const statusColor: { [key: string]: string } = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
    offline: "bg-slate-400",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-md hover-elevate">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar} />
          <AvatarFallback>{member.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${statusColor[member.status] || statusColor.offline}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.name || 'Unknown'}</p>
        <p className="text-xs text-muted-foreground capitalize">{member.role || 'member'}</p>
      </div>
      <div className="w-16">
        <Progress value={member.workload || 0} className="h-1.5" />
        <span className="text-xs text-muted-foreground">{member.workload || 0}%</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  // Get user info from sessionStorage (matches App.tsx storage)
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: Boolean(user?.id),
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    enabled: Boolean(user?.id),
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    enabled: Boolean(user?.id),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    enabled: Boolean(user?.id),
  });

  const { data: teamMembers, isLoading: teamLoading } = useQuery<any[]>({
    queryKey: ["/api/team"],
    enabled: Boolean(user?.id),
  });

  const tasksNeedingUpdate = tasks?.filter(task => {
    if (task.status === 'done') return false;
    if (!task.lastUpdateAt) return true;
    
    const lastUpdate = new Date(task.lastUpdateAt);
    const today = new Date();
    return lastUpdate.toDateString() !== today.toDateString();
  }) || [];

  const recentProjects = projects?.slice(0, 4) || [];
  const recentActivities = activities?.slice(0, 6) || [];
  const topMembers = teamMembers?.slice(0, 5) || [];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold" data-testid="text-welcome">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening across your projects
        </p>
      </div>

      {/* Daily Updates Section (for non-admins) */}
      {user?.role !== 'admin' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Daily Updates Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : tasksNeedingUpdate.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                  You have {tasksNeedingUpdate.length} tasks that need a progress update today.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tasksNeedingUpdate.map(task => (
                    <Card key={task.id} className="bg-card">
                      <CardContent className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.progress}% complete
                          </p>
                        </div>
                        <TaskUpdateDialog 
                          task={task} 
                          trigger={
                            <Button size="sm" variant="outline" className="h-8">
                              Update
                            </Button>
                          } 
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                All your tasks are up to date. Great job!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
        ) : (
          <>
            <StatCard
              title="Active Projects"
              value={stats?.activeProjects || 0}
              icon={FolderKanban}
            />
            <StatCard
              title="Total Tasks"
              value={stats?.totalTasks || 0}
              icon={CheckSquare}
            />
            <StatCard
              title="Overdue Tasks"
              value={stats?.overdueTasks || 0}
              icon={AlertTriangle}
            />
            <StatCard
              title="Upcoming Milestones"
              value={stats?.upcomingMilestones || 0}
              icon={Calendar}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">
              Active Projects
            </CardTitle>
            <Badge variant="secondary" className="font-normal">
              {recentProjects.length} projects
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectsLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No active projects
              </p>
            )}
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">
              Team Workload
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            {teamLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : topMembers.length > 0 ? (
              topMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No team members
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* Task Status Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">
              Task Status
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : tasks && tasks.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-400" />
                    <span className="text-sm">To Do</span>
                  </div>
                  <span className="text-sm font-medium">
                    {tasks.filter(t => t.status === 'todo').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="text-sm font-medium">
                    {tasks.filter(t => t.status === 'in-progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Review</span>
                  </div>
                  <span className="text-sm font-medium">
                    {tasks.filter(t => t.status === 'review').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm">Done</span>
                  </div>
                  <span className="text-sm font-medium">
                    {tasks.filter(t => t.status === 'done').length}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold text-emerald-500">
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0} 
                    className="mt-2 h-2" 
                  />
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No tasks available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
