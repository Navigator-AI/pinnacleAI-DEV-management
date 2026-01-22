import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, LayoutGrid, List, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/task-list";
import { KanbanBoard } from "@/components/kanban-board";
import type { Task } from "@shared/schema";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks =
    tasks?.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const taskStats = {
    total: tasks?.length || 0,
    todo: tasks?.filter((t) => t.status === "todo").length || 0,
    inProgress: tasks?.filter((t) => t.status === "in-progress").length || 0,
    review: tasks?.filter((t) => t.status === "review").length || 0,
    done: tasks?.filter((t) => t.status === "done").length || 0,
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Manage all tasks across your projects
            </p>
          </div>
          <Button data-testid="button-add-task-global">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">{taskStats.total}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-muted-foreground">To Do:</span>{" "}
            <span className="font-medium">{taskStats.todo}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">In Progress:</span>{" "}
            <span className="font-medium">{taskStats.inProgress}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Review:</span>{" "}
            <span className="font-medium">{taskStats.review}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Done:</span>{" "}
            <span className="font-medium">{taskStats.done}</span>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-tasks-global"
            />
          </div>
          <Button variant="outline" size="sm" data-testid="button-filter-tasks-global">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="flex rounded-md border border-border">
            <Button
              variant={activeView === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setActiveView("list")}
              data-testid="button-view-list-tasks"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === "kanban" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none border-x border-border"
              onClick={() => setActiveView("kanban")}
              data-testid="button-view-kanban-tasks"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === "calendar" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setActiveView("calendar")}
              data-testid="button-view-calendar-tasks"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === "list" && (
          <TaskList tasks={filteredTasks} isLoading={isLoading} />
        )}
        {activeView === "kanban" && (
          <KanbanBoard tasks={filteredTasks} isLoading={isLoading} />
        )}
        {activeView === "calendar" && (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-md">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Calendar View</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Calendar view for tasks is coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
