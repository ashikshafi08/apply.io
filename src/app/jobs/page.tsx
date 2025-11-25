"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  FileText,
  Briefcase,
  Loader2,
  Copy,
  Check,
  Download,
  DollarSign,
  Wand2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MOCK_JOBS, type Job } from "@/lib/mock-jobs";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { loadProfileFromStorage } from "@/lib/profile-storage";
import type { CoverLetter } from "@/mastra/agents/cover-letter";

function getFitScoreClass(score: number) {
  if (score >= 90) return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
  if (score >= 75) return "bg-amber-500/15 text-amber-600 border-amber-500/20";
  return "bg-muted text-muted-foreground";
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs] = useState<Job[]>(MOCK_JOBS);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set(["job-2"]));
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [profileWarning, setProfileWarning] = useState<string | null>(null);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSaved = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const generateCoverLetter = async (job: Job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
    setCoverLetter(null);
    setIsGenerating(true);
    setProfileWarning(null);
    setGenerationStep("Loading your profile...");

    try {
      // Load user profile from localStorage
      const profile = loadProfileFromStorage();

      // Check if profile is empty
      const hasContent = profile && (
        (profile.experience && profile.experience.length > 0) ||
        (profile.skills && profile.skills.length > 0) ||
        (profile.headline && profile.headline.trim().length > 0) ||
        (profile.summary && profile.summary.trim().length > 0)
      );

      if (!hasContent) {
        setProfileWarning("Your profile is empty. Upload a resume first for a personalized cover letter!");
      }

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          profile: profile ? {
            headline: profile.headline,
            summary: profile.summary,
            skills: profile.skills,
            experience: profile.experience,
            education: profile.education,
          } : {},
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "progress") {
                setGenerationStep(event.step || "Processing...");
              } else if (event.type === "complete" && event.coverLetter) {
                setCoverLetter(event.coverLetter);
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setGenerationStep("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    const text = formatCoverLetterAsText(coverLetter);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    if (!coverLetter || !selectedJob) return;
    const text = formatCoverLetterAsText(coverLetter);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${selectedJob.company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCoverLetterAsText = (cl: CoverLetter): string => {
    return `${cl.greeting}\n\n${cl.opening}\n\n${cl.body.join("\n\n")}\n\n${cl.closing}\n\n${cl.signature}`;
  };

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
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="greenhouse">Greenhouse</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
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
              <SelectItem value="fit">Match Score</SelectItem>
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
                className="group transition-all duration-200 hover:shadow-md"
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
                          <h3 className="text-lg font-semibold tracking-tight">
                            {job.title}
                          </h3>
                          <p className="text-muted-foreground">{job.company}</p>
                        </div>

                        {/* Match Score */}
                        {job.matchScore && (
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold border transition-transform group-hover:scale-105",
                              getFitScoreClass(job.matchScore)
                            )}
                          >
                            {job.matchScore}%
                          </div>
                        )}
                      </div>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {job.type}
                        </Badge>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {job.postedAt}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.salary}
                          </span>
                        )}
                      </div>

                      {/* Requirements Preview */}
                      <div className="flex flex-wrap gap-1.5">
                        {job.requirements.slice(0, 3).map((req, i) => (
                          <Badge
                            key={`${job.id}-req-${i}`}
                            variant="outline"
                            className="font-normal text-xs max-w-[200px] truncate"
                          >
                            {req.split(" ").slice(0, 4).join(" ")}...
                          </Badge>
                        ))}
                        {job.requirements.length > 3 && (
                          <Badge variant="outline" className="font-normal text-xs">
                            +{job.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Match Reasons */}
                      {job.matchReasons && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Why it matches:{" "}
                          </span>
                          {job.matchReasons.join(", ")}
                        </p>
                      )}

                      {/* Actions Row */}
                      <div className="flex items-center justify-between border-t border-border/60 pt-3">
                        <Badge variant="secondary">{job.source}</Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "gap-2",
                              savedJobs.has(job.id) && "text-primary"
                            )}
                            onClick={() => toggleSaved(job.id)}
                          >
                            <Bookmark
                              className={cn(
                                "h-4 w-4",
                                savedJobs.has(job.id) && "fill-current"
                              )}
                            />
                            {savedJobs.has(job.id) ? "Saved" : "Save"}
                          </Button>
                          {job.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-2"
                            onClick={() => generateCoverLetter(job)}
                          >
                            <Wand2 className="h-4 w-4" />
                            Cover Letter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cover Letter Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cover Letter for {selectedJob?.company}
              </DialogTitle>
              <DialogDescription>
                {selectedJob?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              {/* Profile warning */}
              {profileWarning && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-medium">Limited personalization</p>
                    <p className="text-amber-700">{profileWarning}</p>
                    <a href="/profile" className="mt-1 inline-block text-amber-900 underline hover:no-underline">
                      Go to Profile →
                    </a>
                  </div>
                </div>
              )}

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <Shimmer className="text-sm text-muted-foreground" duration={1.5}>
                    {generationStep}
                  </Shimmer>
                </div>
              ) : coverLetter ? (
                <div className="space-y-4 text-sm leading-relaxed">
                  <p className="font-medium">{coverLetter.greeting}</p>
                  <p>{coverLetter.opening}</p>
                  {coverLetter.body.map((paragraph, i) => (
                    <p key={`body-${i}`}>{paragraph}</p>
                  ))}
                  <p>{coverLetter.closing}</p>
                  <p className="font-medium">{coverLetter.signature}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  Something went wrong. Please try again.
                </div>
              )}
            </div>

            {coverLetter && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadAsTxt}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" onClick={() => setIsDialogOpen(false)}>
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
