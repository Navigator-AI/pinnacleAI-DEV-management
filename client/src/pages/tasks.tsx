import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/task-list";
import { KanbanBoard } from "@/components/kanban-board";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { useToast } from "@/hooks/use-toast";
import type { TaskWithDetails } from "@shared/schema";

interface TasksPageProps {
  userRole?: string;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "done":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "in-progress":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "review":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

function getPriorityBorderClass(priority: string): string {
  switch (priority) {
    case "critical":
      return "border-l-red-500";
    case "high":
      return "border-l-orange-500";
    case "medium":
      return "border-l-yellow-500";
    default:
      return "border-l-sky-500";
  }
}

function TaskCalendarView({
  tasks,
  isLoading,
}: {
  tasks: TaskWithDetails[];
  isLoading: boolean;
}) {
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prefixCount = firstDay.getDay();
    const dayCount = lastDay.getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < prefixCount; i += 1) cells.push(null);
    for (let d = 1; d <= dayCount; d += 1) cells.push(new Date(year, month, d));

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [visibleMonth]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskWithDetails[]>();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const due = new Date(task.dueDate);
      if (Number.isNaN(due.getTime())) return;
      const key = formatDateKey(due);
      const list = map.get(key) || [];
      list.push(task);
      map.set(key, list);
    });
    return map;
  }, [tasks]);

  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDateTasks = useMemo(() => {
    if (!selectedDateKey) return [];
    return tasksByDay.get(selectedDateKey) || [];
  }, [selectedDateKey, tasksByDay]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) return "";
    const selected = new Date(selectedDateKey);
    if (Number.isNaN(selected.getTime())) return selectedDateKey;
    return selected.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDateKey]);

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading calendar...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Calendar</h3>
          <p className="text-sm text-muted-foreground">Tasks are shown by due date.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
            data-testid="button-calendar-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[180px] text-center text-sm font-medium">{monthLabel}</div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
            data-testid="button-calendar-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground p-2"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-[120px] rounded-md border border-transparent" />;
          }

          const key = formatDateKey(day);
          const dayTasks = tasksByDay.get(key) || [];
          const overflow = dayTasks.length > 3 ? dayTasks.length - 3 : 0;
          const isToday = formatDateKey(day) === formatDateKey(new Date());
          const isSelected = selectedDateKey === key;

          return (
            <div
              key={key}
              className={`min-h-[120px] rounded-md border p-2 cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : isToday
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-muted/20"
              }`}
              data-testid={`calendar-day-${key}`}
              onClick={() => setSelectedDateKey(key)}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day.getDate()}</span>
                {dayTasks.length > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                    {dayTasks.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-sm border border-border/60 border-l-4 bg-muted/30 px-2 py-1 ${getPriorityBorderClass(task.priority)}`}
                    title={task.title}
                    data-testid={`calendar-task-${task.id}`}
                  >
                    <div className="truncate text-[11px] font-medium">{task.title}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <Badge variant="outline" className={`h-4 px-1 text-[10px] ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="text-[11px] text-muted-foreground">+{overflow} more task(s)</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          {!selectedDateKey ? (
            <p className="text-sm text-muted-foreground">
              Click any date in the calendar to view task details, assignees, and counts.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold">{selectedDateLabel}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedDateTasks.length} task(s) due on this date
                  </p>
                </div>
                <Badge variant="outline">{selectedDateTasks.length} tasks</Badge>
              </div>

              {selectedDateTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks scheduled for this date.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateTasks.map((task) => {
                    const assigneesFromArray = task.assignees?.map((a) => a.name).filter(Boolean) || [];
                    const fallbackAssignee = task.assigneeName ? [task.assigneeName] : [];
                    const assigneeNames = [...assigneesFromArray, ...fallbackAssignee]
                      .filter((name, idx, arr) => arr.indexOf(name) === idx)
                      .join(", ") || "Unassigned";

                    return (
                      <div
                        key={`selected-${task.id}`}
                        className={`rounded-md border border-border/70 border-l-4 bg-muted/20 p-3 ${getPriorityBorderClass(task.priority)}`}
                        data-testid={`calendar-selected-task-${task.id}`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{task.title}</p>
                          <Badge variant="outline" className={getStatusBadgeClass(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Assignee(s): <span className="text-foreground">{assigneeNames}</span>
                        </p>
                        {task.projectName && (
                          <p className="text-sm text-muted-foreground">
                            Project: <span className="text-foreground">{task.projectName}</span>
                          </p>
                        )}
                        {typeof task.progress === "number" && (
                          <p className="text-sm text-muted-foreground">
                            Progress: <span className="text-foreground">{task.progress}%</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TasksPage({ userRole }: TasksPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("list");
  const { toast } = useToast();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const { data: tasks, isLoading, error } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    enabled: Boolean(user?.id),
  });

  console.log("Tasks query result:", { tasks, isLoading, error, userExists: Boolean(user?.id) });

  const filteredTasks =
    tasks?.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const taskStats = {
    total: tasks?.length || 0,
    todo: tasks?.filter((t) => t.status === "todo").length || 0,
    inProgress: tasks?.filter((t) => t.status === "in-progress").length || 0,
    review: tasks?.filter((t) => t.status === "review").length || 0,
    done: tasks?.filter((t) => t.status === "done").length || 0,
    overdue:
      tasks?.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length || 0,
  };

  if (!isAdmin) {
    return (
      <div className="h-full overflow-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-semibold">My Tasks</h1>
              <p className="text-sm text-muted-foreground">Track your assigned tasks and daily progress</p>
            </div>

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

            <div className="flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search your tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex rounded-md border border-border">
                <Button
                  variant={activeView === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => setActiveView("list")}
                  data-testid="button-view-list-tasks-member"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeView === "calendar" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-l-none border-l border-border"
                  onClick={() => setActiveView("calendar")}
                  data-testid="button-view-calendar-tasks-member"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeView === "list" ? (
            <TaskList
              tasks={filteredTasks}
              isLoading={isLoading}
              showUserView={true}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              hideSearch={true}
            />
          ) : (
            <TaskCalendarView tasks={filteredTasks} isLoading={isLoading} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tasks</h1>
            <p className="text-sm text-muted-foreground">Manage all tasks across your projects</p>
          </div>
          {isAdmin && <CreateTaskDialog />}
        </div>

        <div className="flex items-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total:</span> <span className="font-medium">{taskStats.total}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-muted-foreground">To Do:</span> <span className="font-medium">{taskStats.todo}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">In Progress:</span>{" "}
            <span className="font-medium">{taskStats.inProgress}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Review:</span> <span className="font-medium">{taskStats.review}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Done:</span> <span className="font-medium">{taskStats.done}</span>
          </div>
        </div>

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
          <Button
            variant="outline"
            size="sm"
            data-testid="button-filter-tasks-global"
            onClick={() => {
              toast({
                title: "Filters",
                description: "Advanced filtering options coming soon",
              });
            }}
          >
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
        {activeView === "calendar" && <TaskCalendarView tasks={filteredTasks} isLoading={isLoading} />}
      </div>
    </div>
  );
}
