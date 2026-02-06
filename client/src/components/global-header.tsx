import { Search, Bell, Sparkles, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface GlobalHeaderProps {
  title?: string;
  subtitle?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export function GlobalHeader({ title, subtitle, user, onLogout }: GlobalHeaderProps) {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications from API
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Get current section name based on location
  const getCurrentSection = () => {
    if (location === '/') return 'Home';
    if (location.startsWith('/projects')) return 'Projects';
    if (location.startsWith('/tasks')) return 'Tasks';
    if (location.startsWith('/kanban')) return 'Kanban';
    if (location.startsWith('/issues')) return 'Issues';
    if (location.startsWith('/reports')) return 'Reports';
    if (location.startsWith('/team')) return 'Team';
    if (location.startsWith('/settings')) return 'Settings';
    if (location.startsWith('/profile')) return 'Profile';
    if (location.startsWith('/notifications')) return 'Notifications';
    return 'Projects';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate based on search query
      const query = searchQuery.toLowerCase();
      if (query.includes('task') || query.includes('todo')) {
        setLocation('/tasks');
      } else if (query.includes('project')) {
        setLocation('/projects');
      } else if (query.includes('team') || query.includes('user')) {
        setLocation('/team');
      } else if (query.includes('report') || query.includes('analytics')) {
        setLocation('/reports');
      } else if (query.includes('issue') || query.includes('bug')) {
        setLocation('/issues');
      } else if (query.includes('kanban') || query.includes('board')) {
        setLocation('/kanban');
      } else {
        // Default to tasks page
        setLocation('/tasks');
      }
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  const handleAIAssist = () => {
    toast({
      title: "AI Assistant",
      description: "Pinnacle AI Assistant is ready to help you!",
    });
  };

  const handleNotifications = () => {
    // This will be handled by the Popover component
  };

  const handleProfileClick = () => {
    setLocation('/profile');
  };

  const handleSettingsClick = () => {
    setLocation('/settings');
  };

  const handleProductSwitch = (product: string) => {
    toast({
      title: "Product Switcher",
      description: `Switching to ${product}`,
    });
  };
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />

        {title && (
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {/* Product Switcher - Only show for admin */}
        {user.role === 'admin' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-1 md:flex"
                data-testid="button-product-switcher"
              >
                {getCurrentSection()}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Switch Product</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="menu-projects" onClick={() => setLocation('/projects')}>
                Projects
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-tasks" onClick={() => setLocation('/tasks')}>
                Tasks
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-kanban" onClick={() => setLocation('/kanban')}>
                Kanban
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-issues" onClick={() => setLocation('/issues')}>
                Issues
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-settings" onClick={() => setLocation('/settings')}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center max-w-xl">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={user.role === 'admin' ? "Search projects, tasks, team..." : "Search your tasks..."}
            className="w-full pl-9 pr-4"
            data-testid="input-global-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Assist Button - REMOVED */}

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-4 w-4 p-0 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification: any) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-accent">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.type === 'task' ? 'bg-blue-500' :
                      notification.type === 'project' ? 'bg-green-500' :
                      'bg-orange-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No notifications
                  </p>
                )}
              </div>
              <div className="pt-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={async () => {
                  try {
                    await fetch("/api/notifications/mark-all-read", { method: "PUT" });
                    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
                    toast({
                      title: "Notifications",
                      description: "All notifications marked as read",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to mark notifications as read",
                      variant: "destructive",
                    });
                  }
                }}>
                  Mark as Read
                </Button>
                <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => {
                  setLocation('/notifications');
                }}>
                  View all notifications
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
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
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
