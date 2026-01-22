import { useMemo } from "react";
import { MoreHorizontal, Plus, Calendar, MessageSquare, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge } from "@/components/status-badge";
import type { Task } from "@shared/schema";

interface KanbanBoardProps {
  tasks: Task[];
  isLoading?: boolean;
}

type KanbanColumn = {
  id: Task["status"];
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

function KanbanCard({ task }: { task: Task }) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Card className="hover-elevate mb-3 cursor-pointer" data-testid={`kanban-card-${task.id}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium leading-tight" data-testid={`text-kanban-task-${task.id}`}>
            {task.title}
          </h4>
          <Button variant="ghost" size="icon" className="shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <PriorityBadge priority={task.priority} className="text-xs py-0 h-5" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Due Date */}
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

            {/* Comments Count */}
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {task.comments.length}
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assigneeName && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assigneeAvatar} />
              <AvatarFallback className="text-xs">
                {task.assigneeName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumnComponent({
  column,
  tasks,
  isLoading,
}: {
  column: KanbanColumn;
  tasks: Task[];
  isLoading?: boolean;
}) {
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
          <Button
            variant="ghost"
            size="icon"
            data-testid={`button-add-${column.id}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 rounded-b-md p-2 ${column.bgColor} min-h-[400px] custom-scrollbar overflow-y-auto`}
        data-testid={`column-${column.id}`}
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
          tasks.map((task) => <KanbanCard key={task.id} task={task} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              data-testid={`button-add-first-${column.id}`}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, isLoading }: KanbanBoardProps) {
  const tasksByColumn = useMemo(() => {
    const grouped: Record<Task["status"], Task[]> = {
      todo: [],
      "in-progress": [],
      review: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Sort by order within each column
    Object.keys(grouped).forEach((key) => {
      grouped[key as Task["status"]].sort((a, b) => a.order - b.order);
    });

    return grouped;
  }, [tasks]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          tasks={tasksByColumn[column.id]}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
