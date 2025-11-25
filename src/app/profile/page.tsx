"use client";

import { useState, useRef, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Upload, 
  FileText, 
  X, 
  Plus, 
  Wand2, 
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Save
} from "lucide-react";
import { Loader } from "@/components/ai-elements/loader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { saveProfile, loadProfile, updateProfileFromResume, type ProfileData } from "@/app/actions/profile";
import type { ParsedResume } from "@/mastra/agents/resume-parser";
import { ParsingProgress } from "@/components/ui/parsing-progress";

type Experience = {
  title: string;
  company: string;
  duration: string;
  highlights: string[];
};

type Education = {
  school: string;
  degree: string;
  year: string;
};

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isParseComplete, setIsParseComplete] = useState(false);
  const [currentParsingStep, setCurrentParsingStep] = useState(0);
  const [resumeText, setResumeText] = useState<string | null>(null);
  
  // Profile state
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [targetTitles, setTargetTitles] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [targetLocations, setTargetLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [remotePreference, setRemotePreference] = useState("any");
  const [companySize, setCompanySize] = useState("any");

  // Load profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      const result = await loadProfile();
      
      if (result.success && result.data) {
        const data = result.data;
        setHeadline(data.headline ?? "");
        setSummary(data.summary ?? "");
        // Deduplicate arrays to avoid React key conflicts
        setSkills([...new Set(data.skills ?? [])]);
        setExperience(data.experience ?? []);
        setEducation(data.education ?? []);
        setTargetTitles([...new Set(data.targetTitles ?? [])]);
        setTargetLocations([...new Set(data.targetLocations ?? [])]);
        setSearchKeywords([...new Set(data.searchKeywords ?? [])]);
        setMinSalary(data.minSalary?.toString() ?? "");
        setMaxSalary(data.maxSalary?.toString() ?? "");
        setRemotePreference(data.remotePreference ?? "any");
        setResumeText(data.resumeText);
        if (data.companySize?.length > 0) {
          setCompanySize(data.companySize[0]);
        }
      }
      
      setIsLoading(false);
    }
    
    fetchProfile();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes("pdf")) {
        toast.error("Please upload a PDF file");
        return;
      }
      setUploadedFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (!file.type.includes("pdf")) {
        toast.error("Please upload a PDF file");
        return;
      }
      setUploadedFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleParseResume = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file first");
      return;
    }

    setIsParsing(true);
    setIsParseComplete(false);
    setCurrentParsingStep(0);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      // Use streaming API endpoint for real-time progress
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n").filter(line => line.startsWith("data: "));

        for (const line of lines) {
          try {
            const event = JSON.parse(line.replace("data: ", ""));
            
            if (event.type === "progress") {
              // Update progress step in real-time
              setCurrentParsingStep(event.stepIndex + 1);
            } else if (event.type === "complete") {
              const data = event.data;
              
              // Mark parsing as complete
              setIsParseComplete(true);
              setCurrentParsingStep(6);
              
              // Update local state (deduplicate arrays to avoid React key conflicts)
              setHeadline(data.headline ?? "");
              setSummary(data.summary ?? "");
              if (data.skills?.length > 0) setSkills([...new Set(data.skills as string[])]);
              if (data.experience?.length > 0) setExperience(data.experience);
              if (data.education?.length > 0) setEducation(data.education);
              if (data.targetTitles?.length > 0) setTargetTitles([...new Set(data.targetTitles as string[])]);
              if (data.searchKeywords?.length > 0) setSearchKeywords([...new Set(data.searchKeywords as string[])]);
              setResumeText(event.rawText);

              // Save to storage
              await updateProfileFromResume(data, event.rawText);

              toast.success("Resume parsed and saved!");
              
              // Hide progress after a brief delay to show completion
              setTimeout(() => {
                setIsParsing(false);
                setIsParseComplete(false);
                setCurrentParsingStep(0);
              }, 2000);
            } else if (event.type === "error") {
              toast.error(event.error);
              setIsParsing(false);
              setIsParseComplete(false);
              setCurrentParsingStep(0);
            }
          } catch (e) {
            // Ignore parsing errors for malformed chunks
          }
        }
      }
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse resume");
      setIsParsing(false);
      setIsParseComplete(false);
      setCurrentParsingStep(0);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving your profile...");

    try {
      const profileData: ProfileData = {
        headline: headline || null,
        summary: summary || null,
        skills,
        experience,
        education,
        targetTitles,
        targetLocations,
        searchKeywords,
        minSalary: minSalary ? parseInt(minSalary) : null,
        maxSalary: maxSalary ? parseInt(maxSalary) : null,
        remotePreference: remotePreference !== "any" ? remotePreference : null,
        companySize: companySize !== "any" ? [companySize] : [],
        resumeText,
      };

      const result = await saveProfile(profileData);

      if (result.success) {
        toast.success("Profile saved successfully!", { id: toastId });
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save profile", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // List management helpers
  const addToList = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value && !list.includes(value)) {
      setList([...list, value]);
      setValue("");
    }
  };

  const removeFromList = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList(list.filter((item) => item !== value));
  };

  // Experience management
  const addExperience = () => {
    setExperience([
      ...experience,
      { title: "", company: "", duration: "", highlights: [] },
    ]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Education management
  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", year: "" }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <AppShell title="Profile" description="Manage your resume and preferences">
        <div className="space-y-6">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile" description="Manage your resume and preferences">
      <Tabs defaultValue="resume" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
        </TabsList>

        {/* Resume Tab */}
        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Upload your resume to extract information automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 p-10",
                  "transition-all duration-200 hover:border-primary/50 hover:bg-muted/30",
                  "cursor-pointer",
                  uploadedFile && "border-primary/50 bg-primary/5"
                )}
              >
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full mb-4",
                  uploadedFile ? "bg-primary/10" : "bg-muted"
                )}>
                  {uploadedFile ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {uploadedFile 
                    ? uploadedFile.name 
                    : "Drop your resume here or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadedFile 
                    ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : "PDF up to 10MB"}
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Parse Button */}
              {!isParsing && (
                <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      uploadedFile || resumeText ? "bg-primary/10" : "bg-muted"
                    )}>
                      <FileText className={cn(
                        "h-5 w-5",
                        uploadedFile || resumeText ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                  <div>
                      <p className="font-medium">
                        {uploadedFile ? uploadedFile.name : resumeText ? "Resume on file" : "No resume uploaded"}
                      </p>
                    <p className="text-sm text-muted-foreground">
                        {uploadedFile 
                          ? "Ready to parse" 
                          : resumeText 
                          ? "Your resume has been parsed"
                          : "Upload a resume to get started"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleParseResume}
                    disabled={!uploadedFile || isParsing}
                  >
                    <Wand2 className="h-4 w-4" />
                    Parse with AI
                  </Button>
                </div>
              )}

              {/* Real-time Parsing Progress */}
              <ParsingProgress 
                isActive={isParsing} 
                isComplete={isParseComplete}
                currentStep={currentParsingStep}
              />
            </CardContent>
          </Card>

          {/* Profile Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Edit your professional headline and summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Professional Headline</Label>
                <Input
                  placeholder="e.g., Senior ML Engineer | LLM & RAG Specialist"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Professional Summary</Label>
                <Textarea
                  placeholder="Write a brief summary of your background and what you're looking for..."
                  className="min-h-24 resize-none"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills Card */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Your technical and professional skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={`skill-${index}-${skill}`} variant="secondary" className="gap-1.5 pr-1.5">
                    {skill}
                    <button
                      onClick={() => removeFromList(skills, setSkills, skill)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToList(skills, setSkills, newSkill, setNewSkill)}
                />
                <Button onClick={() => addToList(skills, setSkills, newSkill, setNewSkill)} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Search Keywords</CardTitle>
              <CardDescription>
                Keywords to help find relevant jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {searchKeywords.map((keyword, index) => (
                  <Badge key={`keyword-${index}-${keyword}`} variant="outline" className="gap-1.5 pr-1.5">
                    {keyword}
                    <button
                      onClick={() => removeFromList(searchKeywords, setSearchKeywords, keyword)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {searchKeywords.length === 0 && (
                  <p className="text-sm text-muted-foreground">No keywords added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addToList(searchKeywords, setSearchKeywords, newKeyword, setNewKeyword)}
                />
                <Button onClick={() => addToList(searchKeywords, setSearchKeywords, newKeyword, setNewKeyword)} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
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
                  {targetTitles.map((title, index) => (
                    <Badge key={`title-${index}-${title}`} className="gap-1.5 pr-1.5">
                      {title}
                      <button
                        onClick={() => removeFromList(targetTitles, setTargetTitles, title)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {targetTitles.length === 0 && (
                    <p className="text-sm text-muted-foreground">No job titles added yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add job title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToList(targetTitles, setTargetTitles, newTitle, setNewTitle)}
                  />
                  <Button onClick={() => addToList(targetTitles, setTargetTitles, newTitle, setNewTitle)} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Target Locations */}
              <div className="space-y-3">
                <Label>Preferred Locations</Label>
                <div className="flex flex-wrap gap-2">
                  {targetLocations.map((location, index) => (
                    <Badge key={`location-${index}-${location}`} variant="secondary" className="gap-1.5 pr-1.5">
                      {location}
                      <button
                        onClick={() => removeFromList(targetLocations, setTargetLocations, location)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {targetLocations.length === 0 && (
                    <p className="text-sm text-muted-foreground">No locations added yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add location..."
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToList(targetLocations, setTargetLocations, newLocation, setNewLocation)}
                  />
                  <Button onClick={() => addToList(targetLocations, setTargetLocations, newLocation, setNewLocation)} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Remote Preference */}
              <div className="space-y-2">
                <Label>Remote Preference</Label>
                <Select value={remotePreference} onValueChange={setRemotePreference}>
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
                  <Input 
                    type="number" 
                    placeholder="e.g. 150000" 
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Salary</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 250000" 
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                  />
                </div>
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label>Preferred Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
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

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          {/* Work Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              <CardDescription>
                  Your professional work history
              </CardDescription>
              </div>
              <Button onClick={addExperience} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.length === 0 ? (
                <div className="rounded-xl bg-muted/50 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No work experience added yet. Parse your resume or add manually.
                  </p>
                </div>
              ) : (
                experience.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="space-y-1">
                          <Label className="text-xs">Job Title</Label>
                          <Input
                            placeholder="e.g., Senior ML Engineer"
                            value={exp.title}
                            onChange={(e) => updateExperience(idx, "title", e.target.value)}
                          />
              </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Company</Label>
                <Input
                            placeholder="e.g., Acme Corp"
                            value={exp.company}
                            onChange={(e) => updateExperience(idx, "company", e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeExperience(idx)}
                      >
                        <X className="h-4 w-4" />
                </Button>
              </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Input
                        placeholder="e.g., Jan 2022 - Present"
                        value={exp.duration}
                        onChange={(e) => updateExperience(idx, "duration", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Highlights (one per line)</Label>
              <Textarea
                        placeholder="• Built a RAG pipeline achieving 52% accuracy&#10;• Led team of 5 engineers"
                        className="min-h-20 resize-none text-sm"
                        value={exp.highlights?.join("\n") ?? ""}
                        onChange={(e) => updateExperience(idx, "highlights", e.target.value.split("\n").filter(h => h.trim()))}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              <CardDescription>
                  Your educational background
              </CardDescription>
              </div>
              <Button onClick={addEducation} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.length === 0 ? (
                <div className="rounded-xl bg-muted/50 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No education added yet. Parse your resume or add manually.
                  </p>
                </div>
              ) : (
                education.map((edu, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid grid-cols-3 gap-3 flex-1">
                        <div className="space-y-1">
                          <Label className="text-xs">Degree</Label>
                          <Input
                            placeholder="e.g., M.S. Computer Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">School</Label>
                          <Input
                            placeholder="e.g., MIT"
                            value={edu.school}
                            onChange={(e) => updateEducation(idx, "school", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Year</Label>
                          <Input
                            placeholder="e.g., 2024"
                            value={edu.year}
                            onChange={(e) => updateEducation(idx, "year", e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeEducation(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveProfile} size="lg" disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader size={16} />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </AppShell>
  );
}
