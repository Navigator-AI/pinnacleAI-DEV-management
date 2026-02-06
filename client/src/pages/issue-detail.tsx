import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Bug,
  AlertTriangle,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { IssueWithDetails, TeamMember, Project } from "@shared/schema";

const severityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-4 w-4" />,
  feature: <AlertTriangle className="h-4 w-4" />,
  improvement: <AlertTriangle className="h-4 w-4" />,
  task: <AlertTriangle className="h-4 w-4" />,
};

export default function IssueDetailPage() {
  const [, params] = useRoute("/issues/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const issueId = params?.id;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userRole = user.role || "member";
  const canEdit = userRole === "admin" || userRole === "manager";

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    type: "",
    severity: "",
    status: "",
    assigneeId: "",
    projectId: "",
  });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const { data: issue, isLoading } = useQuery<IssueWithDetails>({
    queryKey: [`/api/issues/${issueId}`],
    enabled: !!issueId,
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  useEffect(() => {
    if (issue) {
      setEditData({
        title: issue.title || "",
        description: issue.description || "",
        type: issue.type || "bug",
        severity: issue.severity || "medium",
        status: issue.status || "open",
        assigneeId: issue.assigneeId || "",
        projectId: issue.projectId || "",
      });
      if (issue.assigneeId) {
        setSelectedAssignees([issue.assigneeId]);
      }
    }
  }, [issue]);

  const updateIssueMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update issue");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      setIsEditing(false);
      toast({ title: "Issue updated", description: "Changes saved successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update issue",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updates = {
      ...editData,
      assigneeId: selectedAssignees[0] || null,
    };
    updateIssueMutation.mutate(updates);
  };

  const toggleAssignee = (memberId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Issue not found</h1>
        <Button onClick={() => setLocation("/issues")} className="mt-4">
          Back to Issues
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/issues")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="text-xl font-semibold"
              />
            ) : (
              <h1 className="text-xl font-semibold">{issue.title}</h1>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[issue.status] || ""}>
                {issue.status}
              </Badge>
              <Badge className={severityColors[issue.severity] || ""}>
                {issue.severity}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {typeIcons[issue.type]}
                {issue.type}
              </Badge>
              {issue.projectName && (
                <Badge variant="outline">{issue.projectName}</Badge>
              )}
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({ ...editData, description: e.target.value })
                      }
                      rows={8}
                      placeholder="Supports markdown formatting..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports Markdown: **bold**, *italic*, `code`, - lists, etc.
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {issue.description ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {issue.description}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">No description</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type */}
                <div>
                  <Label className="text-muted-foreground text-xs">Type</Label>
                  {isEditing ? (
                    <Select
                      value={editData.type}
                      onValueChange={(value) =>
                        setEditData({ ...editData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {typeIcons[issue.type]}
                      {issue.type}
                    </Badge>
                  )}
                </div>

                {/* Status */}
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  {isEditing ? (
                    <Select
                      value={editData.status}
                      onValueChange={(value) =>
                        setEditData({ ...editData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={statusColors[issue.status] || ""}>
                      {issue.status}
                    </Badge>
                  )}
                </div>

                {/* Severity */}
                <div>
                  <Label className="text-muted-foreground text-xs">Severity</Label>
                  {isEditing ? (
                    <Select
                      value={editData.severity}
                      onValueChange={(value) =>
                        setEditData({ ...editData, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={severityColors[issue.severity] || ""}>
                      {issue.severity}
                    </Badge>
                  )}
                </div>

                {/* Project */}
                <div>
                  <Label className="text-muted-foreground text-xs">Project</Label>
                  {isEditing ? (
                    <Select
                      value={editData.projectId}
                      onValueChange={(value) =>
                        setEditData({ ...editData, projectId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">{issue.projectName || "No project"}</p>
                  )}
                </div>

                {/* Created */}
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created
                  </Label>
                  <p className="text-sm">
                    {issue.createdAt
                      ? new Date(issue.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Assignees */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assignees
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    {teamMembers?.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 ${
                          selectedAssignees.includes(member.id) ? "bg-muted" : ""
                        }`}
                        onClick={() => toggleAssignee(member.id)}
                      >
                        <Checkbox
                          checked={selectedAssignees.includes(member.id)}
                          onCheckedChange={() => toggleAssignee(member.id)}
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {issue.assigneeName ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={issue.assigneeAvatar} />
                          <AvatarFallback>
                            {issue.assigneeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{issue.assigneeName}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
