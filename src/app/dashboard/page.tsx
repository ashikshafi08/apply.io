import { AppShell } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Briefcase,
  FileText,
  TrendingUp,
  Clock,
  Search,
  Upload,
  Rocket,
} from "lucide-react";
import Link from "next/link";

// Stats data (will be dynamic later)
const stats = [
  {
    title: "Jobs Found",
    value: "0",
    description: "From all searches",
    icon: Briefcase,
  },
  {
    title: "Applications",
    value: "0",
    description: "Submitted this month",
    icon: FileText,
  },
  {
    title: "Response Rate",
    value: "0%",
    description: "Based on applications",
    icon: TrendingUp,
  },
  {
    title: "Pending",
    value: "0",
    description: "Awaiting response",
    icon: Clock,
  },
];

// Recent searches (will be dynamic later)
const recentSearches: {
  id: string;
  query: string;
  jobsFound: number;
  date: string;
  status: "completed" | "running" | "failed";
}[] = [];

// Recent jobs (will be dynamic later)
const recentJobs: {
  id: string;
  title: string;
  company: string;
  location: string;
  fitScore: number;
  source: string;
}[] = [];

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Overview of your job search progress"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Rocket className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Get Started</CardTitle>
                  <CardDescription>
                    Quick actions to power your job search
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/search">
                  <Button className="gap-2">
                    <Search className="h-4 w-4" />
                    New Job Search
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Resume
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" className="gap-2">
                    <Briefcase className="h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Two Column Section */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <SectionHeader
                title="Recent Searches"
                description="Your latest job searches"
                action={{ label: "View all", href: "/search" }}
              />
            </CardHeader>
            <CardContent>
              {recentSearches.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No searches yet"
                  description="Start a new search to find jobs that match your profile"
                  variant="compact"
                >
                  <Link href="/search">
                    <Button size="sm" variant="outline">
                      Start searching
                    </Button>
                  </Link>
                </EmptyState>
              ) : (
                <div className="space-y-3">
                  {recentSearches.map((search) => (
                    <div
                      key={search.id}
                      className="group flex items-center justify-between rounded-lg border border-border/60 p-3 transition-all duration-200 hover:border-border hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{search.query}</p>
                        <p className="text-sm text-muted-foreground">
                          {search.jobsFound} jobs found
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Matching Jobs */}
          <Card>
            <CardHeader>
              <SectionHeader
                title="Top Matching Jobs"
                description="Jobs that match your profile"
                action={{ label: "View all", href: "/jobs" }}
              />
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No jobs found yet"
                  description="Run a search to discover opportunities matched to your skills"
                  variant="compact"
                >
                  <Link href="/search">
                    <Button size="sm" variant="outline">
                      Find jobs
                    </Button>
                  </Link>
                </EmptyState>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="group flex items-center justify-between rounded-lg border border-border/60 p-3 transition-all duration-200 hover:border-border hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.company} · {job.location}
                        </p>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-sm font-semibold text-success-foreground">
                        {job.fitScore.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
