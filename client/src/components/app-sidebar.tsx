import { Link, useLocation } from "wouter";
import {
  Home,
  Briefcase,
  FolderKanban,
  CheckSquare,
  LayoutGrid,
  GanttChart,
  Calendar,
  Clock,
  Bug,
  FileText,
  BarChart3,
  Zap,
  Users,
  Settings,
  Triangle,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mainNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Portfolios", url: "/portfolios", icon: Briefcase },
  { title: "Projects", url: "/projects", icon: FolderKanban, badge: 12 },
  { title: "Tasks", url: "/tasks", icon: CheckSquare, badge: 5 },
  { title: "Kanban", url: "/kanban", icon: LayoutGrid },
  { title: "Timeline", url: "/timeline", icon: GanttChart },
  { title: "Calendar", url: "/calendar", icon: Calendar },
];

const trackingItems = [
  { title: "Timesheets", url: "/timesheets", icon: Clock },
  { title: "Issues", url: "/issues", icon: Bug, badge: 3 },
  { title: "Documents", url: "/documents", icon: FileText },
];

const analyticsItems = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Automation", url: "/automation", icon: Zap },
];

const managementItems = [
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

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
        <NavGroup label="Tracking" items={trackingItems} />
        <NavGroup label="Analytics" items={analyticsItems} />
        <NavGroup label="Management" items={managementItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md p-2 hover-elevate">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">John Doe</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
