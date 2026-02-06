import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bug, Plus, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IssueList } from "@/components/issue-list";
import { IssueDialog } from "@/components/issue-dialog";
import { IssueWithDetails } from "@shared/schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: issues, isLoading } = useQuery<IssueWithDetails[]>({
    queryKey: ["/api/issues"],
  });

  const filteredIssues = issues?.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || issue.type === filterType;
    const matchesSeverity = filterSeverity === "all" || issue.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  }) || [];

  const issueStats = {
    total: issues?.length || 0,
    open: issues?.filter(i => i.status === 'open').length || 0,
    inProgress: issues?.filter(i => i.status === 'in-progress').length || 0,
    resolved: issues?.filter(i => i.status === 'resolved').length || 0,
    critical: issues?.filter(i => i.severity === 'critical').length || 0,
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-issues-title">Issues</h1>
            <p className="text-sm text-muted-foreground">
              Bug tracker and issue management
            </p>
          </div>
          <Button 
            data-testid="button-create-issue"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">{issueStats.total}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Open:</span>{" "}
            <span className="font-medium">{issueStats.open}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">In Progress:</span>{" "}
            <span className="font-medium">{issueStats.inProgress}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Resolved:</span>{" "}
            <span className="font-medium">{issueStats.resolved}</span>
          </div>
          {issueStats.critical > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-red-600 font-medium">Critical:</span>{" "}
                <span className="font-bold text-red-600">{issueStats.critical}</span>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-issues"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {(filterType !== "all" || filterSeverity !== "all" || filterStatus !== "all" || searchQuery !== "") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setFilterType("all");
                setFilterSeverity("all");
                setFilterStatus("all");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <IssueList issues={filteredIssues} isLoading={isLoading} />
      </div>

      <IssueDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
