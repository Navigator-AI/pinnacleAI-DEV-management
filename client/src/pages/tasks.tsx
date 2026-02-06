import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, LayoutGrid, List, Calendar as CalendarIcon, CheckSquare, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/task-list";
import { KanbanBoard } from "@/components/kanban-board";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Task, TaskWithDetails } from "@shared/schema";

interface TasksPageProps {
  userRole?: string;
}

export default function TasksPage({ userRole }: TasksPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list");
  const { toast } = useToast();

  // Get user info from sessionStorage (matches App.tsx storage)
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const { data: tasks, isLoading, error } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    enabled: Boolean(user?.id),
  });

  console.log('Tasks query result:', { tasks, isLoading, error, userExists: Boolean(user?.id) });

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
    overdue: tasks?.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length || 0,
  };

  // User-specific view for non-admin users
  if (!isAdmin) {
    return (
      <div className="h-full overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-semibold">My Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Track your assigned tasks and daily progress
              </p>
            </div>

            {/* User Task Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{taskStats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{taskStats.inProgress}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">{taskStats.overdue}</p>
                      <p className="text-xs text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{taskStats.done}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <TaskList 
            tasks={filteredTasks} 
            isLoading={isLoading} 
            showUserView={true} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hideSearch={true}
          />
        </div>
      </div>
    );
  }

  // Admin view - full task management
  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Manage all tasks across your projects
            </p>
          </div>
          {isAdmin && <CreateTaskDialog />}
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
          <Button variant="outline" size="sm" data-testid="button-filter-tasks-global" onClick={() => {
            toast({ 
              title: "Filters", 
              description: "Advanced filtering options coming soon" 
            });
          }}>
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
          <TaskList 
            tasks={filteredTasks} 
            isLoading={isLoading} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hideSearch={true}
          />
        )}
        {activeView === "kanban" && (
          <KanbanBoard 
            tasks={filteredTasks} 
            isLoading={isLoading} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hideSearch={true}
          />
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
