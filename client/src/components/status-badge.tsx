import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus, PriorityType, TaskStatus } from "@shared/schema";

type StatusType = ProjectStatus | "in-progress";

interface StatusBadgeProps {
  status: StatusType | TaskStatus;
  className?: string;
}

interface PriorityBadgeProps {
  priority: PriorityType;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  "on-track": {
    label: "On Track",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  "at-risk": {
    label: "At Risk",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  "overdue": {
    label: "Overdue",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  "completed": {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  "todo": {
    label: "To Do",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  },
  "review": {
    label: "Review",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  "done": {
    label: "Done",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

const priorityConfig: Record<PriorityType, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  high: {
    label: "High",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "font-medium no-default-hover-elevate no-default-active-elevate",
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
          className
        )}
      >
        {status || 'Unknown'}
      </Badge>
    );
  }
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium no-default-hover-elevate no-default-active-elevate",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  if (!config) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "font-medium no-default-hover-elevate no-default-active-elevate",
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
          className
        )}
      >
        {priority || 'Unknown'}
      </Badge>
    );
  }
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium no-default-hover-elevate no-default-active-elevate",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
