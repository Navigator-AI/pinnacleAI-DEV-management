import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  LayoutGrid,
  List,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { ProgressRing } from "@/components/progress-ring";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectWithDetails } from "@shared/schema";

type ViewMode = "grid" | "list";

function ProjectGridCard({ project, queryClient, userRole }: { project: ProjectWithDetails; queryClient: any; userRole: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const handleEdit = () => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit projects",
        variant: "destructive",
      });
      return;
    }
    const newName = prompt("Enter new project name:", project.name);
    if (newName && newName !== project.name) {
      toast({
        title: "Project Updated",
        description: `Project name would be updated to: ${newName}`,
      });
    }
  };

  const handleViewDetails = () => {
    setLocation(`/projects/${project.id}`);
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete projects",
        variant: "destructive",
      });
      return;
    }
    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          toast({
            title: "Project Deleted",
            description: `Project "${project.name}" has been deleted`,
            variant: "destructive",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete project",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
      }
    }
  };
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover-elevate cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base truncate mb-1"
                data-testid={`text-project-${project.id}`}
              >
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    data-testid={`button-project-menu-${project.id}`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleEdit(); }}>Edit Project</DropdownMenuItem>}
                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleViewDetails(); }}>View Details</DropdownMenuItem>
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
                        Delete Project
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <StatusBadge status={project.status as any} />
            <PriorityBadge priority={project.priority as any} />
          </div>

          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "No start date"} -{" "}
              {project.endDate ? new Date(project.endDate).toLocaleDateString() : "No end date"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={project.ownerAvatar} />
                <AvatarFallback className="text-xs">
                  {(project.ownerName || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{project.ownerName || "Unknown"}</span>
            </div>
            <ProgressRing progress={project.progress || 0} size={40} strokeWidth={3} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProjectTableRow({ project, userRole }: { project: ProjectWithDetails; userRole: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canDelete = userRole === 'admin';

  const handleEdit = () => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit projects",
        variant: "destructive",
      });
      return;
    }
    const newName = prompt("Enter new project name:", project.name);
    if (newName && newName !== project.name) {
      toast({
        title: "Project Updated",
        description: `Project name would be updated to: ${newName}`,
      });
    }
  };

  const handleViewDetails = () => {
    setLocation(`/projects/${project.id}`);
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete projects",
        variant: "destructive",
      });
      return;
    }
    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          toast({
            title: "Project Deleted",
            description: `Project "${project.name}" has been deleted`,
            variant: "destructive",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete project",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
      }
    }
  };
  return (
    <TableRow className="hover-elevate">
      <TableCell>
        <Link
          href={`/projects/${project.id}`}
          className="font-medium hover:text-primary"
          data-testid={`link-project-${project.id}`}
        >
          {project.name}
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.ownerAvatar} />
            <AvatarFallback className="text-xs">
              {(project.ownerName || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{project.ownerName || "Unknown"}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 w-32">
          <Progress value={project.progress || 0} className="h-2" />
          <span className="text-sm text-muted-foreground w-10">
            {project.progress || 0}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={project.status as any} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={project.priority as any} />
      </TableCell>
      <TableCell>
        {(canEdit || canDelete) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid={`button-actions-${project.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>}
              <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleViewDetails}
            data-testid={`button-view-${project.id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user info from sessionStorage (matches App.tsx storage)
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userRole = user?.role || 'member';
  const canCreate = userRole === 'admin';

  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
    enabled: Boolean(user?.id),
  });

  const filteredProjects =
    projects?.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleProjectCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  };

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
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {canCreate ? "Manage and track all your projects" : "View and track all projects"}
            </p>
          </div>
          {canCreate && <CreateProjectDialog onProjectCreated={handleProjectCreated} />}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mt-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-projects"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-filter" onClick={handleFilterClick}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex rounded-md border border-border">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full mb-2" />
                  ))}
              </CardContent>
            </Card>
          )
        ) : filteredProjects.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectGridCard key={project.id} project={project} queryClient={queryClient} userRole={userRole} />
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <ProjectTableRow key={project.id} project={project} userRole={userRole} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No projects found</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : canCreate ? "Get started by creating your first project" : "No projects have been assigned to you yet"}
              </p>
              {!searchQuery && canCreate && (
                <CreateProjectDialog onProjectCreated={handleProjectCreated} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
