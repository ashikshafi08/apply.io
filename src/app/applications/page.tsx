"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  ExternalLink,
  Mail,
  Linkedin,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  MessageSquare,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock applications data
const mockApplications = [
  {
    id: "1",
    jobTitle: "Senior ML Engineer",
    company: "Anthropic",
    status: "applied" as const,
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    appliedVia: "portal",
    nextStep: "Wait for response",
    nextStepDate: null,
  },
  {
    id: "2",
    jobTitle: "AI Engineer",
    company: "OpenAI",
    status: "interviewing" as const,
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    appliedVia: "email",
    nextStep: "Technical interview",
    nextStepDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    jobTitle: "Founding ML Engineer",
    company: "Stealth Startup",
    status: "responded" as const,
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    appliedVia: "linkedin",
    nextStep: "Schedule call",
    nextStepDate: null,
  },
  {
    id: "4",
    jobTitle: "ML Research Engineer",
    company: "Google DeepMind",
    status: "rejected" as const,
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    appliedVia: "portal",
    nextStep: null,
    nextStepDate: null,
  },
];

type ApplicationStatus =
  | "draft"
  | "applied"
  | "responded"
  | "interviewing"
  | "rejected"
  | "offer";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success"; icon: typeof Clock }
> = {
  draft: { label: "Draft", variant: "outline", icon: Clock },
  applied: { label: "Applied", variant: "secondary", icon: Clock },
  responded: { label: "Responded", variant: "success", icon: MessageSquare },
  interviewing: { label: "Interviewing", variant: "success", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  offer: { label: "Offer", variant: "success", icon: CheckCircle },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [applications] = useState(mockApplications);

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    responded: applications.filter((a) => a.status === "responded").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
  };

  return (
    <AppShell
      title="Applications"
      description="Track your job applications and responses"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total" value={stats.total} icon={FileText} />
          <StatCard title="Applied" value={stats.applied} icon={Clock} />
          <StatCard title="Responded" value={stats.responded} icon={MessageSquare} />
          <StatCard title="Interviewing" value={stats.interviewing} icon={CheckCircle} />
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Applications</CardTitle>
            <CardDescription>
              {filteredApplications.length} application
              {filteredApplications.length !== 1 && "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No applications yet"
                description="Start applying to jobs to track your progress here"
              >
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Via</TableHead>
                      <TableHead>Next Step</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => {
                      const config = statusConfig[app.status];
                      return (
                        <TableRow key={app.id} className="group">
                          <TableCell className="font-medium">
                            <Link
                              href={`/jobs/${app.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {app.jobTitle}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span>{app.company}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.variant}>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(app.appliedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize font-normal">
                              {app.appliedVia}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.nextStep ? (
                              <div className="flex items-center gap-2">
                                {app.nextStepDate && (
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                <span className="text-sm">{app.nextStep}</span>
                                {app.nextStepDate && (
                                  <span className="text-xs text-muted-foreground">
                                    ({formatDate(app.nextStepDate)})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2">
                                  <ExternalLink className="h-4 w-4" />
                                  View Job
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <FileText className="h-4 w-4" />
                                  Generate Follow-up
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Mail className="h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Linkedin className="h-4 w-4" />
                                  LinkedIn Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                <DropdownMenuItem>Add Notes</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
