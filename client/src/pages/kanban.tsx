import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanBoard } from "@/components/kanban-board";
import type { Task } from "@shared/schema";

export default function KanbanPage() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Kanban Board</h1>
            <p className="text-sm text-muted-foreground">
              Visualize and manage tasks across all projects
            </p>
          </div>
          <Button data-testid="button-add-task-kanban">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              data-testid="input-search-kanban"
            />
          </div>
          <Button variant="outline" size="sm" data-testid="button-filter-kanban">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <KanbanBoard tasks={tasks || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
