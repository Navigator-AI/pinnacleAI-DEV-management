import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ListTodo, MessageSquare, Info, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubtaskList } from "./subtask-list";
import { CommentSection } from "./comment-section";
import type { Project, TeamMember, Task, TaskWithDetails } from "@shared/schema";

interface TaskDialogProps {
  task?: Task | TaskWithDetails;
  projectId?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskDialog({ task, projectId, onSuccess, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: TaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  // Get user info from sessionStorage (matches App.tsx storage)
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userRole = user.role || 'member';
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const canAssignUsers = isAdmin || isManager;
  const canLinkToProject = isAdmin || isManager;
  const canSetDeadline = isAdmin || isManager;
  const canEditAllFields = isAdmin || isManager;
  
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    projectId: projectId || "",
    assigneeId: "",
    dueDate: "",
    progress: 0,
  });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const taskWithDetails = task as TaskWithDetails;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: (task.status as any) || "todo",
        projectId: task.projectId || projectId || "",
        assigneeId: task.assigneeId || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        progress: task.progress || 0,
      });
      // Initialize selectedAssignees from task.assignees (multiple) or fallback to single assigneeId
      const twd = task as TaskWithDetails;
      if (twd.assignees && twd.assignees.length > 0) {
        setSelectedAssignees(twd.assignees.map(a => a.id));
      } else if (task.assigneeId) {
        setSelectedAssignees([task.assigneeId]);
      } else {
        setSelectedAssignees([]);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        projectId: projectId || "",
        assigneeId: "",
        dueDate: "",
        progress: 0,
      });
      setSelectedAssignees([]);
    }
  }, [task, projectId, open]);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: open,
  });

  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
    enabled: open && canAssignUsers,
  });

  const toggleAssignee = (memberId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        projectId: formData.projectId || null,
        assigneeId: selectedAssignees[0] || formData.assigneeId || null,
        assigneeIds: selectedAssignees,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      if (!task) {
        (payload as any).startDate = new Date().toISOString();
      }

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
          title: `Task ${task ? 'updated' : 'created'}`,
          description: `The task has been successfully ${task ? 'updated' : 'created'}.`,
        });

        // Force page reload to ensure UI updates
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        }, 500);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: `Failed to ${task ? 'update' : 'create'} task: ${error.error || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${task ? 'updating' : 'creating'} task:`, error);
      toast({
        title: "Error",
        description: `Failed to ${task ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && !controlledOpen && (
        <DialogTrigger asChild>
          <Button data-testid="button-create-task">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className={task ? "sm:max-w-[700px] max-h-[90vh] overflow-y-auto" : "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle>{task ? 'Task Details' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'View and update task details, subtasks, and comments.' : 'Add a new task to your project.'}
          </DialogDescription>
        </DialogHeader>

        {task ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="subtasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Subtasks ({taskWithDetails.subtasks?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({taskWithDetails.comments?.length || 0})
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <TabsContent value="details">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Task Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter task description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {canAssignUsers && (
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Assignees
                        </Label>
                        {isLoadingTeam ? (
                          <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
                            Loading team members...
                          </div>
                        ) : !teamMembers || teamMembers.length === 0 ? (
                          <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
                            No team members available.
                          </div>
                        ) : (
                          <>
                            <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
                              {teamMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className={`flex items-center gap-3 p-2 rounded-md ${
                                    selectedAssignees.includes(member.id) ? "bg-muted" : ""
                                  }`}
                                >
                                  <Checkbox
                                    checked={selectedAssignees.includes(member.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedAssignees([...selectedAssignees, member.id]);
                                      } else {
                                        setSelectedAssignees(selectedAssignees.filter(id => id !== member.id));
                                      }
                                    }}
                                  />
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{member.name}</span>
                                </div>
                              ))}
                            </div>
                            {selectedAssignees.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {selectedAssignees.length} assignee{selectedAssignees.length > 1 ? 's' : ''} selected
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <Label htmlFor="progress">Progress ({formData.progress}%)</Label>
                      </div>
                      <Input
                        id="progress"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="subtasks">
                <SubtaskList taskId={task.id} subtasks={taskWithDetails.subtasks || []} />
              </TabsContent>
              
              <TabsContent value="comments">
                <CommentSection taskId={task.id} comments={taskWithDetails.comments || []} />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Project selection - only for Admin/Manager */}
              {!projectId && canLinkToProject && (
                <div className="grid gap-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project (optional)" />
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
              {/* Assignee selection - only for Admin/Manager */}
              {canAssignUsers && (
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assignees
                  </Label>
                  {isLoadingTeam ? (
                    <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
                      Loading team members...
                    </div>
                  ) : !teamMembers || teamMembers.length === 0 ? (
                    <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
                      No team members available. Please add team members first.
                    </div>
                  ) : (
                    <>
                      <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
                        {teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className={`flex items-center gap-3 p-2 rounded-md ${
                              selectedAssignees.includes(member.id) ? "bg-muted" : ""
                            }`}
                          >
                            <Checkbox
                              checked={selectedAssignees.includes(member.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAssignees([...selectedAssignees, member.id]);
                                } else {
                                  setSelectedAssignees(selectedAssignees.filter(id => id !== member.id));
                                }
                              }}
                            />
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                          </div>
                        ))}
                      </div>
                      {selectedAssignees.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {selectedAssignees.length} assignee{selectedAssignees.length > 1 ? 's' : ''} selected
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* Due date - only for Admin/Manager */}
              {canSetDeadline && (
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              )}
              {/* Info message for members */}
              {!canAssignUsers && (
                <p className="text-sm text-muted-foreground">
                  This task will be assigned to you automatically.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Keep the old name for backward compatibility during refactor
export const CreateTaskDialog = TaskDialog;
