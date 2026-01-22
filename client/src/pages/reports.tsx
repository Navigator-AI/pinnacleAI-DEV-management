import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const reportTypes = [
  {
    id: "task-completion",
    title: "Task Completion Trends",
    description: "Track task completion rates over time",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    id: "planned-actual",
    title: "Planned vs Actual",
    description: "Compare planned timelines with actual progress",
    icon: BarChart3,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "time-utilization",
    title: "Time Utilization",
    description: "Analyze how time is spent across projects",
    icon: Clock,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "workload-distribution",
    title: "Workload Distribution",
    description: "View team member workload balance",
    icon: Users,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
];

export default function ReportsPage() {
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Insights and metrics for your projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-export-report">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button data-testid="button-create-report">
              <Plus className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Projects Health</p>
                  <p className="text-2xl font-bold">87%</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3" />
                    +5% from last month
                  </div>
                </div>
                <div className="rounded-md bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Task Completion</p>
                  <p className="text-2xl font-bold">156</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3" />
                    +23 this week
                  </div>
                </div>
                <div className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 p-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hours Logged</p>
                  <p className="text-2xl font-bold">342h</p>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <ArrowDownRight className="h-3 w-3" />
                    -8% from last week
                  </div>
                </div>
                <div className="rounded-md bg-purple-100 dark:bg-purple-900/30 p-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team Efficiency</p>
                  <p className="text-2xl font-bold">92%</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3" />
                    +3% improvement
                  </div>
                </div>
                <div className="rounded-md bg-amber-100 dark:bg-amber-900/30 p-2">
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
                className="hover-elevate cursor-pointer"
                data-testid={`card-report-${report.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-md ${report.bgColor} p-3`}>
                      <report.icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-base font-semibold">
                Task Completion Trend
              </CardTitle>
              <Badge variant="secondary">Last 30 days</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Chart visualization</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-base font-semibold">
                Team Workload
              </CardTitle>
              <Badge variant="secondary">Current</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-md">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Workload heatmap</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
