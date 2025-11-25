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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Radar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  History,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock search history
const searchHistory = [
  {
    id: "1",
    query: "AI Engineer Remote Startup",
    status: "completed" as const,
    jobsFound: 47,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    query: "ML Engineer Chicago",
    status: "completed" as const,
    jobsFound: 23,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    query: "Founding Engineer YC Startup",
    status: "failed" as const,
    jobsFound: 0,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

const jobSources = [
  { id: "linkedin", name: "LinkedIn", enabled: true },
  { id: "greenhouse", name: "Greenhouse", enabled: true },
  { id: "lever", name: "Lever", enabled: true },
  { id: "indeed", name: "Indeed", enabled: true },
];

function formatDate(date: Date) {
  const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function SearchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState(
    jobSources.filter((s) => s.enabled).map((s) => s.id)
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchProgress(0);

    const interval = setInterval(() => {
      setSearchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSearching(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  return (
    <AppShell
      title="Search Jobs"
      description="AI-powered job search across multiple platforms"
    >
      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            New Search
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* New Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Radar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>AI Job Search</CardTitle>
                  <CardDescription>
                    Describe what you&apos;re looking for and our AI will find matching
                    jobs across multiple platforms
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="search">What are you looking for?</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="e.g., AI Engineer in Chicago, remote friendly, startup"
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={isSearching}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="gap-2 min-w-[120px]"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Include job title, location, company type, or specific technologies
                </p>
              </div>

              {/* Job Sources */}
              <div className="space-y-3">
                <Label>Search Sources</Label>
                <div className="flex flex-wrap gap-2">
                  {jobSources.map((source) => (
                    <Badge
                      key={source.id}
                      variant={
                        selectedSources.includes(source.id)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        selectedSources.includes(source.id)
                          ? "hover:bg-primary/80"
                          : "hover:bg-muted"
                      )}
                      onClick={() => !isSearching && toggleSource(source.id)}
                    >
                      {source.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select defaultValue="any" disabled={isSearching}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead / Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Type</Label>
                  <Select defaultValue="any" disabled={isSearching}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="yc">YC Company</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Posted Within</Label>
                  <Select defaultValue="7" disabled={isSearching}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="any">Any time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Progress */}
              {isSearching && (
                <div className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Searching {selectedSources.length} platforms...
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(searchProgress)}%
                    </span>
                  </div>
                  <Progress value={searchProgress} className="h-2" />
                  <div className="space-y-2">
                    {selectedSources.map((sourceId, index) => {
                      const source = jobSources.find((s) => s.id === sourceId);
                      const isComplete =
                        searchProgress > (index + 1) * (100 / selectedSources.length);
                      return (
                        <div
                          key={sourceId}
                          className="flex items-center gap-2 text-sm"
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              "transition-colors",
                              isComplete ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {source?.name}
                          </span>
                          {isComplete && (
                            <span className="text-muted-foreground">
                              · {Math.floor(Math.random() * 20 + 5)} jobs
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Searches</CardTitle>
              <CardDescription>
                Popular searches based on your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "AI Engineer Remote",
                  "ML Engineer Chicago",
                  "Founding Engineer YC",
                  "Senior ML Researcher",
                  "LLM Engineer Startup",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(suggestion)}
                    disabled={isSearching}
                    className="transition-all hover:border-primary hover:text-primary"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Searches
              </CardTitle>
              <CardDescription>
                View and re-run your previous searches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No search history"
                  description="Your past searches will appear here"
                />
              ) : (
                <div className="space-y-3">
                  {searchHistory.map((search) => (
                    <div
                      key={search.id}
                      className="group flex items-center justify-between rounded-xl border border-border/60 p-4 transition-all duration-200 hover:border-border hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        {search.status === "completed" ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          </div>
                        ) : search.status === "failed" ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                            <XCircle className="h-5 w-5 text-destructive" />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{search.query}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(search.date)}
                            {search.status === "completed" && (
                              <span>· {search.jobsFound} jobs found</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {search.status === "completed" && (
                          <Link href={`/jobs?session=${search.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              View Results
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(search.query)}
                        >
                          Re-run
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
