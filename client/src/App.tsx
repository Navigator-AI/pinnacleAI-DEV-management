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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

  useEffect(() => {
    // Check for existing user session (only during same browser session)
    const savedUser = sessionStorage.getItem('user');
    const savedMustChange = sessionStorage.getItem('mustChangePassword');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        if (savedMustChange === 'true') {
          setMustChangePassword(true);
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('mustChangePassword');
      }
    }
    setLoading(false);
  }, []);

  // Handle login success
  const handleLoginSuccess = (userData: User, mustChange?: boolean) => {
    console.log('App handleLoginSuccess called with:', userData, 'mustChange:', mustChange);
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    if (mustChange) {
      setMustChangePassword(true);
      sessionStorage.setItem('mustChangePassword', 'true');
    }
    console.log('User state updated, should show dashboard now');
  };

  // Handle password changed
  const handlePasswordChanged = () => {
    setMustChangePassword(false);
    sessionStorage.removeItem('mustChangePassword');
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('mustChangePassword');
    setUser(null);
    setMustChangePassword(false);
    setLocation('/login');
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
        <ThemeProvider defaultTheme="light" storageKey="pinnacleai-theme">
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
      <ThemeProvider defaultTheme="light" storageKey="pinnacleai-theme">
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar user={user} />
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