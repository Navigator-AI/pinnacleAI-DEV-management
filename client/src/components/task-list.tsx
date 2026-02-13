import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Filter, MoreHorizontal, Calendar, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { TaskUpdateDialog } from "@/components/task-update-dialog";
import { TaskDialog } from "@/components/create-task-dialog";
import type { Task, TaskWithDetails } from "@shared/schema";

interface TaskListProps {
  tasks: TaskWithDetails[];
  isLoading?: boolean;
  showUserView?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

export function TaskList({ 
  tasks, 
  isLoading, 
  showUserView = false,
  searchQuery: externalSearchQuery,
  onSearchChange,
  hideSearch = false
}: TaskListProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchChange || setInternalSearchQuery;
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(task.status);
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(task.priority);
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters(prev => 
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
    setSearchQuery("");
  };

  const hasActiveFilters = statusFilters.length > 0 || priorityFilters.length > 0 || searchQuery !== "";

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id));
    }
  };

  const handleEditTask = (task: TaskWithDetails) => {
    // This will be handled by the TaskDialog component
  };

  const handleAddSubtask = (taskId: string) => {
    toast({ 
      title: "Add Subtask", 
      description: "Subtask functionality coming soon" 
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Task Deleted",
          description: "Task has been successfully deleted",
        });
        // Invalidate queries to refresh the task list
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete task",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4 space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {!hideSearch && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-tasks"
            />
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              Status
              {statusFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 font-normal">
                  {statusFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilters.includes("todo")}
              onCheckedChange={() => toggleStatusFilter("todo")}
            >
              To Do
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilters.includes("in-progress")}
              onCheckedChange={() => toggleStatusFilter("in-progress")}
            >
              In Progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilters.includes("review")}
              onCheckedChange={() => toggleStatusFilter("review")}
            >
              Review
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilters.includes("done")}
              onCheckedChange={() => toggleStatusFilter("done")}
            >
              Done
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              Priority
              {priorityFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 font-normal">
                  {priorityFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={priorityFilters.includes("low")}
              onCheckedChange={() => togglePriorityFilter("low")}
            >
              Low
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={priorityFilters.includes("medium")}
              onCheckedChange={() => togglePriorityFilter("medium")}
            >
              Medium
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={priorityFilters.includes("high")}
              onCheckedChange={() => togglePriorityFilter("high")}
            >
              High
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={priorityFilters.includes("critical")}
              onCheckedChange={() => togglePriorityFilter("critical")}
            >
              Critical
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-9 gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Task Table */}
      {filteredTasks.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedTasks.length === filteredTasks.length &&
                      filteredTasks.length > 0
                    }
                    onCheckedChange={toggleAllTasks}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={`hover-elevate ${
                    selectedTasks.includes(task.id) ? "bg-accent/50" : ""
                  }`}
                  data-testid={`row-task-${task.id}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                      data-testid={`checkbox-task-${task.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          task.status === "done"
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <Link
                        href={`/tasks/${task.id}`}
                        className={`font-medium hover:underline hover:text-primary ${
                          task.status === "done" ? "line-through text-muted-foreground" : ""
                        }`}
                        data-testid={`text-task-title-${task.id}`}
                      >
                        {task.title}
                      </Link>
                    </div>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <span className="text-xs text-muted-foreground ml-6">
                        {task.subtasks.filter((s: any) => s.completed).length}/{task.subtasks.length} subtasks
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.assignees && task.assignees.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {task.assignees.slice(0, 3).map((assignee, idx) => (
                          <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background" style={{ marginLeft: idx > 0 ? '-8px' : '0' }}>
                            <AvatarImage src={assignee.avatar} />
                            <AvatarFallback className="text-xs">
                              {assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium" style={{ marginLeft: '-8px' }}>
                            +{task.assignees.length - 3}
                          </div>
                        )}
                        {task.assignees.length === 1 && (
                          <span className="text-sm ml-1">{task.assignees[0].name}</span>
                        )}
                      </div>
                    ) : task.assigneeName ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assigneeAvatar} />
                          <AvatarFallback className="text-xs">
                            {task.assigneeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assigneeName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority as any} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status as any} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 w-24">
                        <Progress value={task.progress || 0} className="h-1.5" />
                        <span className="text-xs text-muted-foreground">
                          {task.progress || 0}%
                        </span>
                      </div>
                      {showUserView && (
                        <TaskUpdateDialog task={task} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-task-menu-${task.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <TaskDialog 
                          task={task}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              Edit Task
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem asChild>
                          <TaskUpdateDialog 
                            task={task} 
                            trigger={<div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">Daily Update</div>}
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddSubtask(task.id)}>Add Subtask</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTask(task.id)}>
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No tasks found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchQuery
                ? "Try adjusting your search query"
                : "Start by adding your first task"}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
