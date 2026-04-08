import { Switch, Route, Redirect } from "wouter";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GlobalHeader } from "@/components/global-header";
import { ForcePasswordChangeDialog } from "@/components/force-password-change-dialog";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/project-detail";
import TasksPage from "@/pages/tasks";
import TaskDetailPage from "@/pages/task-detail";
import KanbanPage from "@/pages/kanban";
import TeamPage from "@/pages/team";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import IssuesPage from "@/pages/issues";
import IssueDetailPage from "@/pages/issue-detail";
import NotificationsPage from "@/pages/notifications";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/login";
import CalendarPage from "@/pages/calendar";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  mustChangePassword?: boolean;
  teamsNotificationEnabled?: boolean;
  gender?: string;
  teamsUsername?: string | null;
}

function AuthenticatedRouter({ user }: { user: User }) {
  // All authenticated users can access these routes
  // RBAC is enforced at the component level for actions (create, edit, delete)
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/tasks" component={() => <TasksPage />} />
      <Route path="/tasks/:id" component={TaskDetailPage} />
      <Route path="/kanban" component={KanbanPage} />
      <Route path="/issues" component={IssuesPage} />
      <Route path="/issues/:id" component={IssueDetailPage} />
      <Route path="/calendar" component={CalendarPage} />
      {/* Admin and Manager can see reports */}
      {(user.role === 'admin' || user.role === 'manager') && (
        <Route path="/reports" component={ReportsPage} />
      )}
      {/* Only Admin can manage team */}
      {user.role === 'admin' && (
        <Route path="/team" component={TeamPage} />
      )}
      <Route path="/profile" component={ProfilePage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [location, setLocation] = useLocation();
  const presenceIdleThresholdMs = 5 * 60 * 1000;
  const presenceHeartbeatMs = 30 * 1000;

  useEffect(() => {
    let isMounted = true;

    const syncFromSessionStorage = () => {
      const savedUser = sessionStorage.getItem('user');
      const savedMustChange = sessionStorage.getItem('mustChangePassword') === 'true';

      if (!savedUser) {
        setUser(null);
        setMustChangePassword(false);
        sessionStorage.removeItem('mustChangePassword');
        return;
      }

      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setMustChangePassword(savedMustChange || Boolean(userData.mustChangePassword));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('mustChangePassword');
        setUser(null);
        setMustChangePassword(false);
      }
    };

    const hydrateUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          queryClient.setQueryData(["/api/auth/me"], { user: data.user });
          if (data.user?.mustChangePassword) {
            setMustChangePassword(true);
            sessionStorage.setItem('mustChangePassword', 'true');
          } else {
            setMustChangePassword(false);
            sessionStorage.removeItem('mustChangePassword');
          }
          setLoading(false);
          return;
        }

        if (response.status === 401) {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('mustChangePassword');
          queryClient.removeQueries({ queryKey: ["/api/auth/me"] });
          setUser(null);
          setMustChangePassword(false);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Failed to hydrate auth session:', error);
      }

      syncFromSessionStorage();
      setLoading(false);
    };

    const handleUserUpdated = () => {
      syncFromSessionStorage();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    };

    hydrateUser();
    window.addEventListener('user-updated', handleUserUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, []);

  // Handle login success
  const handleLoginSuccess = (userData: User, mustChange?: boolean) => {
    console.log('App handleLoginSuccess called with:', userData, 'mustChange:', mustChange);
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    queryClient.setQueryData(["/api/auth/me"], { user: userData });
    if (mustChange) {
      setMustChangePassword(true);
      sessionStorage.setItem('mustChangePassword', 'true');
    } else {
      setMustChangePassword(false);
      sessionStorage.removeItem('mustChangePassword');
    }
    console.log('User state updated, should show dashboard now');
  };

  // Handle password changed
  const handlePasswordChanged = () => {
    setMustChangePassword(false);
    sessionStorage.removeItem('mustChangePassword');
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let active = true;
    let lastActivityAt = Date.now();

    const markActivity = () => {
      lastActivityAt = Date.now();
    };

    const sendHeartbeat = async () => {
      const status = Date.now() - lastActivityAt >= presenceIdleThresholdMs ? "away" : "online";

      try {
        const response = await fetch("/api/presence/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        });

        if (!active || !response.ok) {
          return;
        }
      } catch (error) {
        if (active) {
          console.error("Presence heartbeat failed:", error);
        }
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "focus",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity);
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    markActivity();
    void sendHeartbeat();

    const interval = window.setInterval(() => {
      void sendHeartbeat();
    }, presenceHeartbeatMs);

    return () => {
      active = false;
      window.clearInterval(interval);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('mustChangePassword');
      queryClient.clear();
      setUser(null);
      setMustChangePassword(false);
      setLocation('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, show login page
  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="midnight" storageKey="pinnacleai-theme">
          <TooltipProvider>
            <LoginPage onLoginSuccess={handleLoginSuccess} />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="midnight" storageKey="pinnacleai-theme">
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar user={user} onLogout={handleLogout} />
              <div className="flex flex-col flex-1 min-w-0">
                <GlobalHeader user={user} onLogout={handleLogout} />
                <main className="flex-1 overflow-auto">
                  <AuthenticatedRouter user={user} />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <ForcePasswordChangeDialog
            open={mustChangePassword}
            onPasswordChanged={handlePasswordChanged}
          />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
