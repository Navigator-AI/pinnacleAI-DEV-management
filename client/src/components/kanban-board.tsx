import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Calendar, MessageSquare, Paperclip, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { TaskDialog } from "@/components/create-task-dialog";
import { useQueryClient } from "@tanstack/react-query";
import type { Task, TaskWithDetails, PriorityType, TaskStatus } from "@shared/schema";

interface KanbanBoardProps {
  tasks: TaskWithDetails[];
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

type KanbanColumn = {
  id: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
};

const columns: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-900/50",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "review",
    title: "Review",
    color: "bg-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

function KanbanCard({ task, onStatusChange }: { task: TaskWithDetails; onStatusChange: (taskId: string, newStatus: TaskStatus) => void }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleStatusClick = (newStatus: TaskStatus) => {
    if (newStatus !== task.status) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <TaskDialog
      task={task}
      trigger={
        <Card 
          className="hover-elevate mb-3 cursor-pointer" 
          data-testid={`kanban-card-${task.id}`}
          draggable
          onDragStart={handleDragStart}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium leading-tight" data-testid={`text-kanban-task-${task.id}`}>
                {task.title}
              </h4>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-3">
              <PriorityBadge priority={task.priority as PriorityType} className="text-xs py-0 h-5" />
              {/* Quick status change buttons */}
              <div className="flex gap-1 ml-auto">
                {task.status !== 'todo' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStatusClick('todo'); }}
                    className="w-2 h-2 rounded-full bg-slate-400 hover:bg-slate-500"
                    title="Move to To Do"
                  />
                )}
                {task.status !== 'in-progress' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStatusClick('in-progress'); }}
                    className="w-2 h-2 rounded-full bg-blue-400 hover:bg-blue-500"
                    title="Move to In Progress"
                  />
                )}
                {task.status !== 'review' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStatusClick('review'); }}
                    className="w-2 h-2 rounded-full bg-purple-400 hover:bg-purple-500"
                    title="Move to Review"
                  />
                )}
                {task.status !== 'done' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStatusClick('done'); }}
                    className="w-2 h-2 rounded-full bg-green-400 hover:bg-green-500"
                    title="Move to Done"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Due Date */}
                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isOverdue ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}

                {/* Comments Count */}
                {task.comments && task.comments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {task.comments.length}
                  </div>
                )}

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                  </div>
                )}
              </div>

              {/* Assignees */}
              {task.assignees && task.assignees.length > 0 ? (
                <div className="flex items-center -space-x-2">
                  {task.assignees.slice(0, 2).map((assignee) => (
                    <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback className="text-xs">
                        {assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignees.length > 2 && (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                      +{task.assignees.length - 2}
                    </div>
                  )}
                </div>
              ) : task.assigneeName ? (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assigneeAvatar} />
                  <AvatarFallback className="text-xs">
                    {task.assigneeName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}

function KanbanColumnComponent({
  column,
  tasks,
  isLoading,
  onStatusChange,
}: {
  column: KanbanColumn;
  tasks: TaskWithDetails[];
  isLoading?: boolean;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, column.id);
    }
  };

  const handleAddTask = () => {
    // This will be handled by the TaskDialog component
  };
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      <div className={`rounded-t-md px-3 py-2 ${column.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${column.color}`} />
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
              {tasks.length}
            </span>
          </div>
          <TaskDialog 
            trigger={
              <Button
                variant="ghost"
                size="icon"
                data-testid={`button-add-${column.id}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>

      <div
        className={`flex-1 rounded-b-md p-2 ${column.bgColor} min-h-[400px] custom-scrollbar overflow-y-auto`}
        data-testid={`column-${column.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="mb-3">
                <CardContent className="p-3">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
        ) : tasks.length > 0 ? (
          tasks.map((task) => <KanbanCard key={task.id} task={task} onStatusChange={onStatusChange} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks</p>
            <TaskDialog 
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  data-testid={`button-add-first-${column.id}`}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  tasks,
  isLoading,
  searchQuery: externalSearchQuery,
  onSearchChange,
  hideSearch = false
}: KanbanBoardProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchChange || setInternalSearchQuery;
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user info for RBAC
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userRole = user.role || 'member';
  const userId = user.id;
  const canUpdateAnyTask = userRole === 'admin' || userRole === 'manager';

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Find the task to check permissions
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Members can only update their own tasks
    if (!canUpdateAnyTask && task.assigneeId !== userId) {
      toast({
        title: "Access Denied",
        description: "You can only update tasks assigned to you",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Task Updated",
          description: `Task moved to ${newStatus.replace('-', ' ')}`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update task status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(task.priority);
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilters]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, TaskWithDetails[]> = {
      todo: [],
      "in-progress": [],
      review: [],
      done: [],
    };

    filteredTasks.forEach((task) => {
      if (grouped[task.status as TaskStatus]) {
        grouped[task.status as TaskStatus].push(task);
      }
    });

    // Sort by order within each column
    Object.keys(grouped).forEach((key) => {
      grouped[key as TaskStatus].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return grouped;
  }, [filteredTasks]);

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters(prev => 
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setPriorityFilters([]);
    setSearchQuery("");
  };

  const hasActiveFilters = priorityFilters.length > 0 || searchQuery !== "";

  return (
    <div className="space-y-4">
      {/* Removed duplicate search and priority filters - using only top search bar */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id]}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
