import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, FolderKanban, TrendingUp, Users, Download, Plus, MessageSquare } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TeamsNotificationDialog } from "@/components/teams-notification-dialog";

const reportTypes = [
  {
    id: "task-completion-trend",
    title: "Task Completion Trend",
    description: "Track completed work across the last 14 days",
    icon: TrendingUp,
    color: "text-cyan-500",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    targetId: "task-completion-trend-chart",
  },
  {
    id: "project-workload",
    title: "Project Workload",
    description: "Compare completed, active, and remaining tasks by project",
    icon: FolderKanban,
    color: "text-sky-500",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
    targetId: "project-workload-chart",
  },
];

interface ReportStats {
  projectHealth: number;
  taskCompletion: number;
  totalTasks: number;
  teamEfficiency: number;
  totalProjects: number;
  totalTeamMembers: number;
}

interface TaskTrendPoint {
  date: string;
  label: string;
  completed: number;
  cumulativeCompleted: number;
}

interface ProjectWorkloadPoint {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  remainingTasks: number;
  completionRate: number;
  workloadPercent: number;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<ReportStats>({
    queryKey: ["/api/reports/stats"],
  });

  const { data: taskTrend = [], isLoading: taskTrendLoading } = useQuery<TaskTrendPoint[]>({
    queryKey: ["/api/reports/task-completion-trend"],
  });

  const { data: workload = [], isLoading: workloadLoading } = useQuery<ProjectWorkloadPoint[]>({
    queryKey: ["/api/reports/workload-distribution"],
  });

  const handleExportReport = () => {
    toast({
      title: "Export Report",
      description: "Report export functionality coming soon",
    });
  };

  const handleCreateCustomReport = () => {
    toast({
      title: "Custom Report",
      description: "Custom report builder coming soon",
    });
  };

  const handleViewReport = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    toast({
      title: "Report not ready",
      description: "The selected report section could not be found.",
      variant: "destructive",
    });
  };

  const tooltipStyle = {
    backgroundColor: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "16px",
    boxShadow: "0 24px 60px -32px rgba(2, 6, 23, 0.55)",
  } as const;

  const taskTrendData = Array.isArray(taskTrend) ? taskTrend : [];
  const workloadData = Array.isArray(workload) ? workload : [];
  const hasProjectWorkload = workloadData.some((project) => project.totalTasks > 0);

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Live insights into projects, completion, and project workload
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-export-report" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              data-testid="button-teams-notification"
              onClick={() => setTeamsDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Teams
            </Button>
            <Button data-testid="button-create-report" onClick={handleCreateCustomReport}>
              <Plus className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Projects Health</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? "..." : `${stats?.projectHealth || 0}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalProjects || 0} total projects
                  </p>
                </div>
                <div className="rounded-2xl bg-cyan-100/70 dark:bg-cyan-900/30 p-2">
                  <TrendingUp className="h-5 w-5 text-cyan-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Task Completion</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? "..." : `${stats?.taskCompletion || 0}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalTasks || 0} total tasks
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-100/70 dark:bg-emerald-900/30 p-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team Efficiency</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? "..." : `${stats?.teamEfficiency || 0}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalTeamMembers || 0} team members
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-100/70 dark:bg-amber-900/30 p-2">
                  <Users className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Types */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Reports</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reportTypes.map((report) => (
              <Card
                key={report.id}
                className="hover-elevate group cursor-pointer"
                data-testid={`card-report-${report.id}`}
                onClick={() => handleViewReport(report.targetId)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl ${report.bgColor} p-3 shadow-sm`}>
                      <report.icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(report.targetId);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card id="task-completion-trend-chart" className="hover-elevate overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Task Completion Trend</CardTitle>
                <CardDescription>Completed work across the last 14 days</CardDescription>
              </div>
              <Badge variant="secondary">14 days</Badge>
            </CardHeader>
            <CardContent>
              {taskTrendLoading ? (
                <div className="h-72 rounded-xl border border-dashed border-border/70 bg-background/60 animate-pulse" />
              ) : taskTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={taskTrendData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed Today"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeCompleted"
                      name="Cumulative Completed"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="6 6"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/60">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No completion data available</p>
                    <p className="text-xs text-muted-foreground">Create or complete tasks to populate this chart.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card id="project-workload-chart" className="hover-elevate overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Project Workload</CardTitle>
                <CardDescription>Task distribution by project</CardDescription>
              </div>
              <Badge variant="secondary">Current</Badge>
            </CardHeader>
            <CardContent>
              {workloadLoading ? (
                <div className="h-80 rounded-xl border border-dashed border-border/70 bg-background/60 animate-pulse" />
              ) : hasProjectWorkload ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={workloadData}
                    layout="vertical"
                    margin={{ top: 8, right: 20, left: 12, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={110}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Bar dataKey="completedTasks" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="inProgressTasks" name="In Progress" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="remainingTasks" name="Remaining" stackId="a" fill="#94a3b8" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/60">
                  <div className="text-center">
                    <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No workload data available</p>
                    <p className="text-xs text-muted-foreground">Assign tasks to projects to build this chart.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TeamsNotificationDialog
        open={teamsDialogOpen}
        onOpenChange={setTeamsDialogOpen}
      />
    </div>
  );
}
