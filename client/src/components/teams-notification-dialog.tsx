import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

interface TeamsNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle?: () => void;
}

export function TeamsNotificationDialog({
  open,
  onOpenChange,
  onToggle,
}: TeamsNotificationDialogProps) {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem("pinnacleai-teams-notification-enabled");
    return saved === null ? true : saved === "true";
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeamsNotificationStatus();
    }
  }, [open]);

  const fetchTeamsNotificationStatus = async () => {
    try {
      const response = await fetch("/api/settings/teams-notification", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const enabled = data.teamsNotificationEnabled ?? true;
        setIsEnabled(enabled);
        localStorage.setItem("pinnacleai-teams-notification-enabled", String(enabled));
      }
    } catch (error) {
      console.error("Failed to fetch Teams notification status:", error);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/teams-notification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnabled(enabled);
        localStorage.setItem("pinnacleai-teams-notification-enabled", String(enabled));
        toast({
          title: "Success",
          description: data.message,
        });
        onToggle?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to update Teams notification setting",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating Teams notification:", error);
      toast({
        title: "Error",
        description: "Failed to update Teams notification setting",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Teams Notifications
          </DialogTitle>
          <DialogDescription>
            Control when daily task updates are sent to your Teams channel at 10 PM
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Task Updates</p>
                <p className="text-sm text-muted-foreground">
                  Sent every weekday at 10 PM (except Saturday & Sunday)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {isEnabled ? (
                    <span className="text-green-600">ON</span>
                  ) : (
                    <span className="text-red-600">OFF</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>When enabled:</strong> You'll receive daily task update summaries in Teams
            </p>
            <p>
              <strong>When disabled:</strong> No Teams notifications will be sent
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleToggle(false)}
            disabled={isLoading || !isEnabled}
          >
            Turn OFF
          </Button>
          <Button
            onClick={() => handleToggle(true)}
            disabled={isLoading || isEnabled}
          >
            Turn ON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
