import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskDialog } from "@/components/create-task-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Task, TaskWithDetails } from "@shared/schema";

export default function KanbanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Get user info from sessionStorage (matches App.tsx storage)
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  
  const { data: tasks, isLoading } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    enabled: Boolean(user?.id),
  });

  const filteredTasks = tasks?.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleFilterClick = () => {
    toast({
      title: "Filters",
      description: "Advanced filtering options coming soon",
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Kanban Board</h1>
            <p className="text-sm text-muted-foreground">
              Visualize and manage tasks across all projects
            </p>
          </div>
          <TaskDialog 
            trigger={
              <Button data-testid="button-add-task-kanban">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            }
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              data-testid="input-search-kanban"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" data-testid="button-filter-kanban" onClick={handleFilterClick}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <KanbanBoard tasks={filteredTasks} isLoading={isLoading} />
      </div>
    </div>
  );
}
