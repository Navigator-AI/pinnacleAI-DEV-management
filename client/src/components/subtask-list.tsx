import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subtask } from "@shared/schema";

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
}

export function SubtaskList({ taskId, subtasks }: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", `/api/tasks/${taskId}/subtasks`, { title });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setNewSubtaskTitle("");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/subtasks/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subtasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
    },
  });

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addMutation.mutate(newSubtaskTitle);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Subtasks</h4>
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 group">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={(checked) => 
                toggleMutation.mutate({ id: subtask.id, completed: !!checked })
              }
            />
            <span className={`text-sm flex-1 ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
              {subtask.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteMutation.mutate(subtask.id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <Input
          placeholder="Add a subtask..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          className="h-8 text-sm"
        />
        <Button size="sm" variant="outline" className="h-8" disabled={addMutation.isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
