import { Search, Bell, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GlobalHeaderProps {
  title?: string;
  subtitle?: string;
}

export function GlobalHeader({ title, subtitle }: GlobalHeaderProps) {
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

        {/* Product Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-1 md:flex"
              data-testid="button-product-switcher"
            >
              Projects
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Switch Product</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-projects">
              Projects
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-analytics">
              Analytics
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-automations">
              Automations
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-settings">
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-1 items-center justify-center max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects, tasks, team..."
            className="w-full pl-9 pr-4"
            data-testid="input-global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Assist Button */}
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 md:flex"
          data-testid="button-ai-assist"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Ask Pinnacle
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-1 -top-1 h-4 w-4 p-0 text-[10px]">
            3
          </Badge>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
