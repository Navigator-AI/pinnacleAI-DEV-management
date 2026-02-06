import { useState } from "react";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Bug, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MoreHorizontal,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldQuestion,
  Shield,
  Zap,
  TrendingUp,
  CheckSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IssueWithDetails } from "@shared/schema";
import { IssueDialog } from "./issue-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface IssueListProps {
  issues: IssueWithDetails[];
  isLoading?: boolean;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function IssueList({ issues, isLoading }: IssueListProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssueWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdateSeverity = async (id: string, severity: string) => {
    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ severity }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      }
    } catch (error) {
      console.error("Error updating severity:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "closed":
        return <Shield className="h-4 w-4 text-slate-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive" className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1"><ShieldQuestion className="h-3 w-3" /> Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="flex items-center gap-1"><Shield className="h-3 w-3" /> Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "feature":
        return <Zap className="h-4 w-4 text-amber-500" />;
      case "improvement":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-slate-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;

    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Issue deleted",
          description: "The issue has been successfully deleted.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete issue",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      toast({
        title: "Error",
        description: "Failed to delete issue",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse bg-muted rounded-md" />
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-md">
        <Bug className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No issues found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          No issues match your current filters or search query.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(issue.type || 'bug')}
                    <span className="capitalize text-xs font-medium">{issue.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <Link
                      href={`/issues/${issue.id}`}
                      className="hover:underline hover:text-primary"
                      data-testid={`text-issue-title-${issue.id}`}
                    >
                      {issue.title}
                    </Link>
                    <div className="text-xs text-muted-foreground font-normal line-clamp-1">
                      {issue.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{issue.projectName || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{issue.assigneeName || 'Unassigned'}</span>
                </TableCell>
                <TableCell>
                  <Select 
                    value={issue.severity || 'medium'} 
                    onValueChange={(value) => handleUpdateSeverity(issue.id, value)}
                  >
                    <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted p-0 focus:ring-0">
                      <div className="flex items-center">
                        {getSeverityBadge(issue.severity || 'medium')}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select 
                    value={issue.status || 'open'} 
                    onValueChange={(value) => handleUpdateStatus(issue.id, value)}
                  >
                    <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted p-0 focus:ring-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status || 'open')}
                        <span className="capitalize text-sm">{issue.status?.replace('-', ' ')}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedIssue(issue);
                        setIsEditDialogOpen(true);
                      }}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(issue.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <IssueDialog 
        issue={selectedIssue || undefined}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
