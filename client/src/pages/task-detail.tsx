import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  ListTodo,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import type { TaskWithDetails, TeamMember, Project } from "@shared/schema";

export default function TaskDetailPage() {
  const [, params] = useRoute("/tasks/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const taskId = params?.id;

  // Get user info
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userRole = user.role || "member";
  const canEdit = userRole === "admin" || userRole === "manager";

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    dueDate: "",
    assigneeId: "",
    projectId: "",
  });
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const { data: task, isLoading } = useQuery<TaskWithDetails>({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId,
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        assigneeId: task.assigneeId || "",
        projectId: task.projectId || "",
      });
      // Initialize selectedAssignees from task.assignees (multiple) or fallback to single assigneeId
      if (task.assignees && task.assignees.length > 0) {
        setSelectedAssignees(task.assignees.map(a => a.id));
      } else if (task.assigneeId) {
        setSelectedAssignees([task.assigneeId]);
      } else {
        setSelectedAssignees([]);
      }
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditing(false);
      toast({ title: "Task updated", description: "Changes saved successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const addSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to add subtask");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setNewSubtask("");
      toast({ title: "Subtask added" });
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await fetch(`/api/subtasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed }),
      });
      if (!response.ok) throw new Error("Failed to update subtask");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/subtasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete subtask");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      toast({ title: "Subtask deleted" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setNewComment("");
      toast({ title: "Comment added" });
    },
  });

  const handleSave = () => {
    const updates: any = {
      ...editData,
      dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null,
      assigneeId: selectedAssignees[0] || null,
      assigneeIds: selectedAssignees,
    };
    updateTaskMutation.mutate(updates);
  };

  const toggleAssignee = (memberId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Task not found</h1>
        <Button onClick={() => setLocation("/tasks")} className="mt-4">
          Back to Tasks
        </Button>
      </div>
    );
  }

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/tasks")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="text-xl font-semibold"
              />
            ) : (
              <h1 className="text-xl font-semibold">{task.title}</h1>
            )}
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={task.status as any} />
              <PriorityBadge priority={task.priority as any} />
              {task.projectName && (
                <Badge variant="outline">{task.projectName}</Badge>
              )}
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({ ...editData, description: e.target.value })
                      }
                      rows={8}
                      placeholder="Supports markdown formatting..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports Markdown: **bold**, *italic*, `code`, - lists, etc.
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {task.description ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {task.description}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">No description</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subtasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListTodo className="h-5 w-5" />
                    Subtasks
                    {totalSubtasks > 0 && (
                      <Badge variant="secondary">
                        {completedSubtasks}/{totalSubtasks}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.subtasks?.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={(checked) =>
                          toggleSubtaskMutation.mutate({
                            id: subtask.id,
                            completed: !!checked,
                          })
                        }
                      />
                      <span
                        className={`flex-1 ${
                          subtask.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {subtask.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <Input
                      placeholder="Add a subtask..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSubtask.trim()) {
                          addSubtaskMutation.mutate(newSubtask.trim());
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={() => {
                        if (newSubtask.trim()) {
                          addSubtaskMutation.mutate(newSubtask.trim());
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                  {task.comments && task.comments.length > 0 && (
                    <Badge variant="secondary">{task.comments.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {task.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback>
                          {comment.userName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {comment.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!task.comments || task.comments.length === 0) && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No comments yet
                    </p>
                  )}
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Write a comment... (supports markdown)"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <Button
                        size="icon"
                        onClick={() => {
                          if (newComment.trim()) {
                            addCommentMutation.mutate(newComment.trim());
                          }
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  {isEditing ? (
                    <Select
                      value={editData.status}
                      onValueChange={(value) =>
                        setEditData({ ...editData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusBadge status={task.status as any} />
                  )}
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-muted-foreground text-xs">Priority</Label>
                  {isEditing ? (
                    <Select
                      value={editData.priority}
                      onValueChange={(value) =>
                        setEditData({ ...editData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <PriorityBadge priority={task.priority as any} />
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due Date
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.dueDate}
                      onChange={(e) =>
                        setEditData({ ...editData, dueDate: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"}
                    </p>
                  )}
                </div>

                {/* Project */}
                <div>
                  <Label className="text-muted-foreground text-xs">Project</Label>
                  {isEditing ? (
                    <Select
                      value={editData.projectId}
                      onValueChange={(value) =>
                        setEditData({ ...editData, projectId: value })
                      }
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
                  ) : (
                    <p className="text-sm">{task.projectName || "No project"}</p>
                  )}
                </div>

                {/* Created */}
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created
                  </Label>
                  <p className="text-sm">
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Assignees */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assignees
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    {teamMembers?.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 ${
                          selectedAssignees.includes(member.id) ? "bg-muted" : ""
                        }`}
                        onClick={() => toggleAssignee(member.id)}
                      >
                        <Checkbox
                          checked={selectedAssignees.includes(member.id)}
                          onCheckedChange={() => toggleAssignee(member.id)}
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {task.assignees && task.assignees.length > 0 ? (
                      task.assignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback>
                              {assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignee.name}</span>
                        </div>
                      ))
                    ) : task.assigneeName ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={task.assigneeAvatar} />
                          <AvatarFallback>
                            {task.assigneeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assigneeName}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
