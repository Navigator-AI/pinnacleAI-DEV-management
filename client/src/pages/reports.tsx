import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
    id: "workload-distribution",
    title: "Workload Distribution",
    description: "View team member workload balance",
    icon: Users,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
];

export default function ReportsPage() {
  const { toast } = useToast();

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

  const handleViewReport = (reportTitle: string) => {
    // Create a simple report view
    const reportWindow = window.open('', '_blank', 'width=800,height=600');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head><title>${reportTitle} Report</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>${reportTitle}</h1>
            <p>Report data will be displayed here.</p>
            <p>This is a placeholder for the ${reportTitle} report.</p>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };
  return (
    <div className="h-full overflow-y-auto">
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
            <Button variant="outline" data-testid="button-export-report" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Projects Health</p>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-xs text-muted-foreground">No projects available</p>
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
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">No tasks completed</p>
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
                  <p className="text-sm text-muted-foreground">Team Efficiency</p>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-xs text-muted-foreground">No data available</p>
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
                onClick={() => handleViewReport(report.title)}
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
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleViewReport(report.title);
                    }}>
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
