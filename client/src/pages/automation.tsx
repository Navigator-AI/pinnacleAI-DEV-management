import { Zap, Plus, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AutomationPage() {
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-automation-title">Automation Studio</h1>
            <p className="text-sm text-muted-foreground">
              Create workflow automations
            </p>
          </div>
          <Button data-testid="button-create-automation">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Zap className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2" data-testid="text-automation-coming-soon">Automation Studio</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Visual workflow builder with trigger nodes, condition branches,
              action nodes, and drag-connect canvas with zoom and snap-to-grid.
            </p>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
