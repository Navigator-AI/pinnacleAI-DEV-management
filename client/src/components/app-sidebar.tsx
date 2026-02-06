import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  FolderKanban,
  CheckSquare,
  LayoutGrid,
  Bug,
  BarChart3,
  Users,
  Settings,
  Triangle,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { Project, Task, IssueTable } from "@shared/schema";

export function AppSidebar({ user }: { user: { id: string; name: string; email: string; role: string } }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Only fetch data if user is authenticated
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: Boolean(user?.id),
  });
  
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: Boolean(user?.id),
  });

  const { data: issues } = useQuery<IssueTable[]>({
    queryKey: ["/api/issues"],
    enabled: Boolean(user?.id),
  });

  // Calculate real counts
  const projectCount = projects?.length || 0;
  const taskCount = tasks?.length || 0;
  const issueCount = issues?.length || 0;

  const handleProfileClick = () => {
    setLocation('/profile');
  };

  const handleSettingsClick = () => {
    setLocation('/settings');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Navigation items based on role hierarchy
  // All users can see: Home, Projects (view), Tasks, Kanban, Issues
  const mainNavItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Projects", url: "/projects", icon: FolderKanban, badge: projectCount > 0 ? projectCount : undefined },
    { title: "Tasks", url: "/tasks", icon: CheckSquare, badge: taskCount > 0 ? taskCount : undefined },
    { title: "Kanban", url: "/kanban", icon: LayoutGrid },
    { title: "Issues", url: "/issues", icon: Bug, badge: issueCount > 0 ? issueCount : undefined },
  ];

  // Management items based on role
  // Admin: Reports, Team, Settings
  // Manager: Reports, Settings
  // Member: Settings only
  const managementItems = user.role === 'admin' ? [
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Team", url: "/team", icon: Users },
    { title: "Settings", url: "/settings", icon: Settings },
  ] : user.role === 'manager' ? [
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Settings", url: "/settings", icon: Settings },
  ] : [
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const isActive = (url: string) => {
    if (url === "/") return location === "/";
    return location.startsWith(url);
  };

  const NavGroup = ({
    label,
    items,
  }: {
    label: string;
    items: typeof mainNavItems;
  }) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                className="group"
                data-testid={`nav-${item.title.toLowerCase()}`}
              >
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-xs font-medium"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Triangle className="h-4 w-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              PinnacleAI
            </span>
            <span className="text-xs text-muted-foreground">Projects</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        <NavGroup label="Core" items={mainNavItems} />
        <NavGroup label="Management" items={managementItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 rounded-md p-2 hover-elevate cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="top">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
