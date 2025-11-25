"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  Bookmark,
  MoreVertical,
  Mail,
  FileText,
  Linkedin,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with real data
const mockJobs = [
  {
    id: "1",
    title: "Senior ML Engineer",
    company: "Anthropic",
    companyLogo: null,
    location: "San Francisco, CA",
    isRemote: true,
    source: "greenhouse",
    sourceUrl: "https://example.com",
    salaryMin: 200000,
    salaryMax: 350000,
    fitScore: 9.2,
    fitReasons: ["LLM experience", "Python expertise", "Research background"],
    requiredSkills: ["Python", "PyTorch", "LLMs", "Distributed Systems"],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    saved: false,
  },
  {
    id: "2",
    title: "AI Engineer",
    company: "OpenAI",
    companyLogo: null,
    location: "San Francisco, CA",
    isRemote: false,
    source: "lever",
    sourceUrl: "https://example.com",
    salaryMin: 180000,
    salaryMax: 300000,
    fitScore: 8.7,
    fitReasons: ["Strong fit for AI systems", "TypeScript experience"],
    requiredSkills: ["Python", "TypeScript", "RAG", "Vector DBs"],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    saved: true,
  },
  {
    id: "3",
    title: "Founding ML Engineer",
    company: "Stealth Startup (YC W24)",
    companyLogo: null,
    location: "Remote",
    isRemote: true,
    source: "linkedin",
    sourceUrl: "https://example.com",
    salaryMin: 150000,
    salaryMax: 220000,
    fitScore: 8.5,
    fitReasons: ["Startup experience", "Full-stack ML", "Early stage"],
    requiredSkills: ["Python", "FastAPI", "LLMs", "AWS"],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    saved: false,
  },
];

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null;
  const format = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `${format(min)}+`;
  return `Up to ${format(max!)}`;
}

function formatDate(date: Date) {
  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function getSourceBadgeVariant(source: string) {
  switch (source) {
    case "greenhouse":
      return "success";
    case "lever":
      return "default";
    case "linkedin":
      return "secondary";
    default:
      return "muted";
  }
}

function getFitScoreClass(score: number) {
  if (score >= 8.5) return "bg-success text-success-foreground";
  if (score >= 7) return "bg-warning/80 text-warning-foreground";
  return "bg-muted text-muted-foreground";
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs] = useState(mockJobs);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell title="Jobs" description="Browse and manage your job matches">
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title or company..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="greenhouse">Greenhouse</SelectItem>
                    <SelectItem value="lever">Lever</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Remote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count & Sort */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredJobs.length} job{filteredJobs.length !== 1 && "s"} found
          </p>
          <Select defaultValue="fit">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit Score</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job List */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-0">
              <EmptyState
                icon={Briefcase}
                title="No jobs found"
                description="Try adjusting your search or run a new search to find matching opportunities"
              >
                <Link href="/search">
                  <Button>New Search</Button>
                </Link>
              </EmptyState>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="group transition-all duration-200 hover:border-border hover:shadow-soft"
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 transition-colors group-hover:bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Job Details */}
                    <div className="min-w-0 flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-lg font-semibold tracking-tight hover:text-primary transition-colors"
                          >
                            {job.title}
                          </Link>
                          <p className="text-muted-foreground">{job.company}</p>
                        </div>

                        {/* Fit Score */}
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-transform group-hover:scale-105",
                            getFitScoreClass(job.fitScore)
                          )}
                        >
                          {job.fitScore.toFixed(1)}
                        </div>
                      </div>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        {job.isRemote && (
                          <Badge variant="secondary">Remote</Badge>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(job.postedAt)}
                        </span>
                        {formatSalary(job.salaryMin, job.salaryMax) && (
                          <span className="font-medium text-foreground">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline" className="font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Fit Reasons */}
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Why it matches:{" "}
                        </span>
                        {job.fitReasons.join(", ")}
                      </p>

                      {/* Actions Row */}
                      <div className="flex items-center justify-between border-t border-border/60 pt-3">
                        <Badge
                          variant={getSourceBadgeVariant(job.source) as "success" | "default" | "secondary" | "muted"}
                        >
                          {job.source}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "gap-2",
                              job.saved && "text-primary"
                            )}
                          >
                            <Bookmark
                              className={cn(
                                "h-4 w-4",
                                job.saved && "fill-current"
                              )}
                            />
                            {job.saved ? "Saved" : "Save"}
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={job.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View
                            </a>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <FileText className="h-4 w-4" />
                                Generate Cover Letter
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Mail className="h-4 w-4" />
                                Generate Email
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Linkedin className="h-4 w-4" />
                                Generate LinkedIn Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
