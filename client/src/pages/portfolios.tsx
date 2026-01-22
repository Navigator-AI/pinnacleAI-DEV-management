import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, Search, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Portfolio, TeamMember } from "@shared/schema";

function PortfolioCard({
  portfolio,
  members,
}: {
  portfolio: Portfolio;
  members: TeamMember[];
}) {
  const riskConfig = {
    low: {
      label: "Low Risk",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      icon: TrendingUp,
    },
    medium: {
      label: "Medium Risk",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      icon: AlertTriangle,
    },
    high: {
      label: "High Risk",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: AlertTriangle,
    },
  };

  const risk = riskConfig[portfolio.riskIndicator];
  const RiskIcon = risk.icon;
  const owners = members.filter((m) => portfolio.ownerIds.includes(m.id));

  return (
    <Card className="hover-elevate" data-testid={`card-portfolio-${portfolio.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-base mb-1" data-testid={`text-portfolio-name-${portfolio.id}`}>
              {portfolio.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {portfolio.description}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`${risk.className} no-default-hover-elevate no-default-active-elevate shrink-0`}
          >
            <RiskIcon className="h-3 w-3 mr-1" />
            {risk.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <p className="text-2xl font-bold">{portfolio.projectCount}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <p className="text-2xl font-bold">{portfolio.completionPercentage}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{portfolio.completionPercentage}%</span>
          </div>
          <Progress value={portfolio.completionPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Owners:</span>
          </div>
          <div className="flex -space-x-2">
            {owners.slice(0, 3).map((owner) => (
              <Avatar key={owner.id} className="h-7 w-7 border-2 border-card">
                <AvatarImage src={owner.avatar} />
                <AvatarFallback className="text-xs">{owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {owners.length > 3 && (
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                +{owners.length - 3}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PortfoliosPage() {
  const { data: portfolios, isLoading: portfoliosLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
  });

  const { data: members } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Portfolios</h1>
            <p className="text-sm text-muted-foreground">
              High-level project groupings and overview
            </p>
          </div>
          <Button data-testid="button-create-portfolio">
            <Plus className="h-4 w-4 mr-2" />
            Create Portfolio
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search portfolios..."
              className="pl-9"
              data-testid="input-search-portfolios"
            />
          </div>
          <Button variant="outline" size="sm" data-testid="button-filter-portfolios">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {portfoliosLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : portfolios && portfolios.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                members={members || []}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No portfolios yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                Create your first portfolio to group and track related projects
              </p>
              <Button data-testid="button-create-first-portfolio">
                <Plus className="h-4 w-4 mr-2" />
                Create Portfolio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
