import { Clock, Play, Pause, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TimesheetsPage() {
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-timesheets-title">Timesheets</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage time entries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-export-timesheet">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button data-testid="button-start-timer">
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2" data-testid="text-timesheets-coming-soon">Timesheets</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Weekly grid layout with timer start/stop, manual entry,
              billable vs non-billable tracking, and approval workflow.
            </p>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
