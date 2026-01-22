import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  Plus,
  Clock,
  BarChart3,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { TaskList } from "@/components/task-list";
import { KanbanBoard } from "@/components/kanban-board";
import type { Project, Task } from "@shared/schema";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("tasks");

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", params.id],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/projects", params.id, "tasks"],
  });

  if (projectLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-40 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-medium mb-2">Project not found</h3>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist.
            </p>
            <Link href="/projects">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const taskStats = {
    todo: tasks?.filter((t) => t.status === "todo").length || 0,
    inProgress: tasks?.filter((t) => t.status === "in-progress").length || 0,
    review: tasks?.filter((t) => t.status === "review").length || 0,
    done: tasks?.filter((t) => t.status === "done").length || 0,
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Project Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="text-xl font-semibold truncate"
                  data-testid="text-project-title"
                >
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-log-time">
                <Clock className="h-4 w-4 mr-2" />
                Log Time
              </Button>
              <Button variant="outline" size="sm" data-testid="button-view-report">
                <BarChart3 className="h-4 w-4 mr-2" />
                Report
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-more">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress and Stats */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={project.ownerAvatar} />
                <AvatarFallback>{project.ownerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{project.ownerName}</p>
                <p className="text-xs text-muted-foreground">Owner</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-sm font-medium">
                {new Date(project.startDate).toLocaleDateString()} -{" "}
                {new Date(project.endDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-muted-foreground">To Do:</span>
                <span className="font-medium">{taskStats.todo}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">In Progress:</span>
                <span className="font-medium">{taskStats.inProgress}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Done:</span>
                <span className="font-medium">{taskStats.done}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 border-t border-border">
            <TabsList className="h-12 w-full justify-start gap-4 rounded-none border-0 bg-transparent p-0">
              <TabsTrigger
                value="tasks"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                data-testid="tab-tasks"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                data-testid="tab-kanban"
              >
                Kanban
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                data-testid="tab-timeline"
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="issues"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                data-testid="tab-issues"
              >
                Issues
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                data-testid="tab-documents"
              >
                Documents
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="tasks" className="mt-0 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <Button size="sm" data-testid="button-add-task">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            <TaskList tasks={tasks || []} isLoading={tasksLoading} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 p-6">
            <KanbanBoard tasks={tasks || []} isLoading={tasksLoading} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <h3 className="text-lg font-medium mb-2">Timeline View</h3>
                <p className="text-muted-foreground">
                  Gantt chart visualization coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="mt-0 p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <h3 className="text-lg font-medium mb-2">Issues</h3>
                <p className="text-muted-foreground">
                  Bug tracker and issue management coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-0 p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <h3 className="text-lg font-medium mb-2">Documents</h3>
                <p className="text-muted-foreground">
                  File management coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
