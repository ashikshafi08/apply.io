import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { PIIDetector } from "@mastra/core/processors";

// Schema for structured resume output
export const resumeSchema = z.object({
  headline: z
    .string()
    .describe("A professional headline summarizing the candidate, e.g. 'Senior AI Engineer with 5+ years experience'"),
  summary: z
    .string()
    .describe("A 2-3 sentence professional summary of the candidate's background and goals"),
  skills: z
    .array(z.string())
    .describe("List of technical and professional skills extracted from the resume"),
  experience: z
    .array(
      z.object({
        title: z.string().describe("Job title"),
        company: z.string().describe("Company name"),
        duration: z.string().describe("Duration of employment, e.g. 'Jan 2020 - Present'"),
        highlights: z.array(z.string()).describe("Key achievements and responsibilities"),
      })
    )
    .describe("Work experience in reverse chronological order"),
  education: z
    .array(
      z.object({
        school: z.string().describe("Name of school or university"),
        degree: z.string().describe("Degree and field of study"),
        year: z.string().describe("Graduation year or expected graduation"),
      })
    )
    .describe("Educational background"),
  targetTitles: z
    .array(z.string())
    .describe("Suggested job titles this candidate should apply for based on their experience"),
  searchKeywords: z
    .array(z.string())
    .describe("Important keywords for job searching extracted from the resume, including technologies, methodologies, and domain expertise"),
});

export type ParsedResume = z.infer<typeof resumeSchema>;

export const resumeParserAgent = new Agent({
  name: "resume-parser",
  
  // Output guardrails: detect and warn about PII in parsed output
  // We use 'warn' strategy since resumes legitimately contain some PII
  outputProcessors: [
    new PIIDetector({
      model: openai("gpt-5-mini-2025-08-07"),
      detectionTypes: ["credit-card", "ssn"], // Only flag sensitive financial/identity info
      threshold: 0.8,
      strategy: "warn", // Log but don't block - resumes have names/emails by design
    }),
  ],
  
  instructions: `You are an expert resume parser and career advisor. Your job is to:

1. Extract structured information from resume text
2. Identify key skills, technologies, and experiences
3. Generate relevant job search keywords based on the candidate's background
4. Suggest appropriate job titles the candidate should apply for

When parsing resumes:
- Extract ALL technical skills and technologies mentioned
- Capture work experience with specific achievements and metrics when available
- Identify education and certifications
- Generate comprehensive search keywords including: technologies, frameworks, methodologies, soft skills, and industry terms
- Suggest 3-5 realistic job titles based on their experience level

Be thorough but concise. Focus on information that would be useful for job searching.`,
  model: openai("gpt-5-mini-2025-08-07"),
});

