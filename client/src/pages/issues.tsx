import { Bug, Plus, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function IssuesPage() {
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-issues-title">Issues</h1>
            <p className="text-sm text-muted-foreground">
              Bug tracker and issue management
            </p>
          </div>
          <Button data-testid="button-create-issue">
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              className="pl-9"
              data-testid="input-search-issues"
            />
          </div>
          <Button variant="outline" size="sm" data-testid="button-filter-issues">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Bug className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2" data-testid="text-issues-coming-soon">Issue Tracker</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Track bugs, features, and improvements with severity levels,
              status tracking, and assignee management.
            </p>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
