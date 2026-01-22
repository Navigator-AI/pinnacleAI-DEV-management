import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Plus, MoreHorizontal, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMember } from "@shared/schema";

function TeamMemberCard({ member }: { member: TeamMember }) {
  const statusConfig = {
    online: { label: "Online", color: "bg-emerald-500" },
    away: { label: "Away", color: "bg-amber-500" },
    busy: { label: "Busy", color: "bg-red-500" },
    offline: { label: "Offline", color: "bg-slate-400" },
  };

  const roleConfig = {
    admin: { label: "Admin", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    manager: { label: "Manager", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    member: { label: "Member", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  };

  const status = statusConfig[member.status];
  const role = roleConfig[member.role];

  return (
    <Card className="hover-elevate" data-testid={`card-member-${member.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card ${status.color}`}
                title={status.label}
              />
            </div>
            <div>
              <h3 className="font-semibold" data-testid={`text-member-name-${member.id}`}>
                {member.name}
              </h3>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid={`button-member-menu-${member.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Send Message</DropdownMenuItem>
              <DropdownMenuItem>Assign Tasks</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit Member</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="secondary"
            className={`${role.className} no-default-hover-elevate no-default-active-elevate`}
          >
            {role.label}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal">
            {status.label}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Workload</span>
              <span className="font-medium">{member.workload}%</span>
            </div>
            <Progress
              value={member.workload}
              className={`h-2 ${
                member.workload > 80
                  ? "[&>div]:bg-red-500"
                  : member.workload > 60
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-emerald-500"
              }`}
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              data-testid={`button-email-${member.id}`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              data-testid={`button-call-${member.id}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  const filteredMembers =
    teamMembers?.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const stats = {
    total: teamMembers?.length || 0,
    online: teamMembers?.filter((m) => m.status === "online").length || 0,
    admins: teamMembers?.filter((m) => m.role === "admin").length || 0,
    managers: teamMembers?.filter((m) => m.role === "manager").length || 0,
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Team</h1>
            <p className="text-sm text-muted-foreground">
              Manage your team members and their roles
            </p>
          </div>
          <Button data-testid="button-add-member">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-muted-foreground">Online:</span>{" "}
            <span className="font-medium text-emerald-500">{stats.online}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-muted-foreground">Admins:</span>{" "}
            <span className="font-medium">{stats.admins}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-muted-foreground">Managers:</span>{" "}
            <span className="font-medium">{stats.managers}</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-team"
            />
          </div>
          <Button variant="outline" size="sm" data-testid="button-filter-team">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-lg font-medium mb-1">No team members found</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start by adding your first team member"}
              </p>
              {!searchQuery && (
                <Button data-testid="button-add-first-member">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
