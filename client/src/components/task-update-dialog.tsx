import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MessageSquare, History, Pencil, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task, TaskUpdate } from "@shared/schema";
import { format } from "date-fns";

interface TaskUpdateDialogProps {
  task: Task;
  trigger?: React.ReactNode;
}

export function TaskUpdateDialog({ task, trigger }: TaskUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const currentTaskProgress = task.progress || 0;
  const [progress, setProgress] = useState(currentTaskProgress);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isAdminViewOnly = user?.role === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: updates, isLoading: isLoadingUpdates } = useQuery<TaskUpdate[]>({
    queryKey: [`/api/tasks/${task.id}/updates`],
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setProgress(currentTaskProgress);
    }
  }, [open, currentTaskProgress]);

  const updateMutation = useMutation({
    mutationFn: async (data: { content: string; progress?: number }) => {
      const res = await apiRequest("POST", `/api/tasks/${task.id}/updates`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${task.id}/updates`] });
      toast({
        title: "Update added",
        description: "Your daily update has been recorded successfully.",
      });
      setContent("");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editUpdateMutation = useMutation({
    mutationFn: async ({ updateId, content }: { updateId: string; content: string }) => {
      const res = await apiRequest("PUT", `/api/tasks/${task.id}/updates/${updateId}`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${task.id}/updates`] });
      toast({
        title: "Update edited",
        description: "Your update has been edited successfully.",
      });
      setEditingUpdateId(null);
      setEditContent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to edit update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminViewOnly) return;
    if (!content.trim()) return;
    const payload: { content: string; progress?: number } = { content };
    if (progress !== currentTaskProgress) {
      payload.progress = progress;
    }
    updateMutation.mutate(payload);
  };

  const handleEditUpdate = (update: TaskUpdate) => {
    setEditingUpdateId(update.id);
    setEditContent(update.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingUpdateId) return;
    editUpdateMutation.mutate({ updateId: editingUpdateId, content: editContent });
  };

  const handleCancelEdit = () => {
    setEditingUpdateId(null);
    setEditContent("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 gap-2">
            <MessageSquare className="h-4 w-4" />
            Update
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Daily Update: {task.title}</DialogTitle>
          <DialogDescription>
            Record your progress and any notes for today.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6 py-4">
          {!isAdminViewOnly && (
            <form id="task-update-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="progress">Current Progress ({progress}%)</Label>
                <Slider
                  id="progress"
                  value={[progress]}
                  max={100}
                  step={5}
                  onValueChange={(vals) => setProgress(vals[0])}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Progress Notes</Label>
                <Textarea
                  id="content"
                  placeholder="What did you accomplish today? Any blockers?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>
            </form>
          )}

          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="h-4 w-4" />
              Recent Updates
            </div>
            
            <ScrollArea className="flex-1 border rounded-md p-3">
              {isLoadingUpdates ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Loading updates...
                </div>
              ) : updates && updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="text-sm space-y-1 pb-3 border-b last:border-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-xs bg-muted px-1.5 py-0.5 rounded">
                          {update.progress !== null && update.progress !== undefined
                            ? `${update.progress}% Complete`
                            : "Progress unchanged"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {update.createdAt ? format(new Date(update.createdAt), "MMM d, h:mm a") : "Just now"}
                          </span>
                          {!isAdminViewOnly && update.userId === user?.id && editingUpdateId !== update.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleEditUpdate(update)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingUpdateId === update.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={editUpdateMutation.isPending || !editContent.trim()}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground leading-relaxed">
                          {update.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No updates yet</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          {!isAdminViewOnly && (
            <Button 
              type="submit" 
              form="task-update-form" 
              disabled={updateMutation.isPending || !content.trim()}
            >
              {updateMutation.isPending ? "Saving..." : "Save Update"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
