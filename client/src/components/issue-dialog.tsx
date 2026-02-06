import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Project, TeamMember, IssueTable } from "@shared/schema";

interface IssueDialogProps {
  issue?: IssueTable;
  projectId?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IssueDialog({ issue, projectId, onSuccess, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: IssueDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "bug",
    severity: "medium",
    status: "open",
    projectId: projectId || "",
    assigneeId: "",
  });

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title || "",
        description: issue.description || "",
        type: (issue.type as any) || "bug",
        severity: (issue.severity as any) || "medium",
        status: (issue.status as any) || "open",
        projectId: issue.projectId || projectId || "",
        assigneeId: issue.assigneeId || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        type: "bug",
        severity: "medium",
        status: "open",
        projectId: projectId || "",
        assigneeId: "",
      });
    }
  }, [issue, projectId, open]);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: open,
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = issue ? `/api/issues/${issue.id}` : '/api/issues';
      const method = issue ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        projectId: formData.projectId || null,
        assigneeId: formData.assigneeId || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setOpen(false);
        
        toast({
          title: `Issue ${issue ? 'updated' : 'created'}`,
          description: `The issue has been successfully ${issue ? 'updated' : 'created'}.`,
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
        queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: `Failed to ${issue ? 'update' : 'create'} issue: ${error.error || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${issue ? 'updating' : 'creating'} issue:`, error);
      toast({
        title: "Error",
        description: `Failed to ${issue ? 'update' : 'create'} issue. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button data-testid="button-create-issue">
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{issue ? 'Edit Issue' : 'Create New Issue'}</DialogTitle>
          <DialogDescription>
            {issue ? 'Update the details of the issue.' : 'Add a new bug, feature request, or improvement.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter issue title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter issue description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!projectId && (
                <div className="grid gap-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{issue ? 'Save Changes' : 'Create Issue'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const CreateIssueDialog = IssueDialog;
