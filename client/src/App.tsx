import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GlobalHeader } from "@/components/global-header";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/project-detail";
import TasksPage from "@/pages/tasks";
import KanbanPage from "@/pages/kanban";
import TeamPage from "@/pages/team";
import PortfoliosPage from "@/pages/portfolios";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import TimelinePage from "@/pages/timeline";
import CalendarPage from "@/pages/calendar";
import TimesheetsPage from "@/pages/timesheets";
import IssuesPage from "@/pages/issues";
import DocumentsPage from "@/pages/documents";
import AutomationPage from "@/pages/automation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/kanban" component={KanbanPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/portfolios" component={PortfoliosPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/timeline" component={TimelinePage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/timesheets" component={TimesheetsPage} />
      <Route path="/issues" component={IssuesPage} />
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/automation" component={AutomationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <GlobalHeader />
                <main className="flex-1 overflow-hidden">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
