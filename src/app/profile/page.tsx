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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X, Plus, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [skills, setSkills] = useState<string[]>([
    "Python",
    "TypeScript",
    "React",
    "LLMs",
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [targetTitles, setTargetTitles] = useState<string[]>([
    "AI Engineer",
    "ML Engineer",
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [targetLocations, setTargetLocations] = useState<string[]>([
    "Chicago",
    "Remote",
  ]);
  const [newLocation, setNewLocation] = useState("");

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addTitle = () => {
    if (newTitle && !targetTitles.includes(newTitle)) {
      setTargetTitles([...targetTitles, newTitle]);
      setNewTitle("");
    }
  };

  const removeTitle = (title: string) => {
    setTargetTitles(targetTitles.filter((t) => t !== title));
  };

  const addLocation = () => {
    if (newLocation && !targetLocations.includes(newLocation)) {
      setTargetLocations([...targetLocations, newLocation]);
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setTargetLocations(targetLocations.filter((l) => l !== location));
  };

  const handleSaveProfile = () => {
    toast.success("Profile saved successfully!");
  };

  return (
    <AppShell title="Profile" description="Manage your resume and preferences">
      <Tabs defaultValue="resume" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
          <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
        </TabsList>

        {/* Resume Tab */}
        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Upload your resume to help us find matching jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 p-10",
                  "transition-all duration-200 hover:border-primary/50 hover:bg-muted/30",
                  "cursor-pointer"
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  Drop your resume here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, or DOCX up to 10MB
                </p>
                <Input
                  type="file"
                  className="mt-4 w-auto cursor-pointer"
                  accept=".pdf,.doc,.docx"
                />
              </div>

              {/* Current Resume */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">No resume uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a resume to get started
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  Parse with AI
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Parsed Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Parsed Profile</CardTitle>
              <CardDescription>
                AI-extracted information from your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-muted/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Upload and parse your resume to see extracted information here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
              <CardDescription>
                Define what you&apos;re looking for in your next role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Job Titles */}
              <div className="space-y-3">
                <Label>Target Job Titles</Label>
                <div className="flex flex-wrap gap-2">
                  {targetTitles.map((title) => (
                    <Badge key={title} variant="secondary" className="gap-1.5 pr-1.5">
                      {title}
                      <button
                        onClick={() => removeTitle(title)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add job title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTitle()}
                  />
                  <Button onClick={addTitle} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Target Locations */}
              <div className="space-y-3">
                <Label>Preferred Locations</Label>
                <div className="flex flex-wrap gap-2">
                  {targetLocations.map((location) => (
                    <Badge key={location} variant="secondary" className="gap-1.5 pr-1.5">
                      {location}
                      <button
                        onClick={() => removeLocation(location)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add location..."
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLocation()}
                  />
                  <Button onClick={addLocation} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Remote Preference */}
              <div className="space-y-2">
                <Label>Remote Preference</Label>
                <Select defaultValue="any">
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum Salary</Label>
                  <Input type="number" placeholder="e.g. 150000" />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Salary</Label>
                  <Input type="number" placeholder="e.g. 250000" />
                </div>
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label>Preferred Company Size</Label>
                <Select defaultValue="any">
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-50)</SelectItem>
                    <SelectItem value="mid">Mid-size (51-500)</SelectItem>
                    <SelectItem value="large">Large (500+)</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Add your technical and professional skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1.5 pr-1.5">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <Button onClick={addSkill} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
              <CardDescription>
                A brief summary of your experience and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write a brief summary of your professional background and what you're looking for..."
                className="min-h-32 resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Keywords</CardTitle>
              <CardDescription>
                Keywords to help find relevant jobs (e.g., LLM, RAG, agents)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter keywords separated by commas..."
                defaultValue="LLM, RAG, agents, machine learning, AI, NLP"
                className="min-h-20 resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveProfile} size="lg">
          Save Profile
        </Button>
      </div>
    </AppShell>
  );
}
