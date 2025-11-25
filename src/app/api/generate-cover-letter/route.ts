import { mastra } from "@/mastra";
import { coverLetterSchema, type CoverLetter } from "@/mastra/agents/cover-letter";
import { getJobById, type Job } from "@/lib/mock-jobs";
import { NextRequest } from "next/server";

export type GenerateCoverLetterRequest = {
  jobId: string;
  profile: {
    headline?: string;
    summary?: string;
    skills?: string[];
    experience?: {
      title: string;
      company: string;
      duration: string;
      highlights: string[];
    }[];
    education?: {
      school: string;
      degree: string;
      year: string;
    }[];
  };
};

export type StreamEvent = {
  type: "progress" | "complete" | "error";
  step?: string;
  coverLetter?: CoverLetter;
  error?: string;
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const body: GenerateCoverLetterRequest = await request.json();
        const { jobId, profile } = body;

        // Get job details
        const job = getJobById(jobId);
        if (!job) {
          emit({ type: "error", error: "Job not found" });
          controller.close();
          return;
        }

        emit({ type: "progress", step: "Analyzing job requirements" });

        // Build the prompt
        const prompt = buildCoverLetterPrompt(job, profile);

        emit({ type: "progress", step: "Crafting personalized content" });

        const agent = mastra.getAgent("coverLetterAgent");

        // Generate the cover letter
        const response = await agent.generate(prompt, {
          structuredOutput: {
            schema: coverLetterSchema,
          },
        });

        emit({ type: "progress", step: "Polishing final draft" });

        const coverLetter = response.object as CoverLetter;

        emit({ type: "complete", coverLetter });
        controller.close();
      } catch (error) {
        console.error("Cover letter generation error:", error);
        emit({
          type: "error",
          error: error instanceof Error ? error.message : "Failed to generate cover letter",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function buildCoverLetterPrompt(
  job: Job,
  profile: GenerateCoverLetterRequest["profile"]
): string {
  const experienceText = profile.experience
    ?.map(
      (exp) =>
        `- ${exp.title} at ${exp.company} (${exp.duration})\n  ${exp.highlights.join("\n  ")}`
    )
    .join("\n") || "No work experience provided";

  const educationText = profile.education
    ?.map((edu) => `- ${edu.degree} from ${edu.school} (${edu.year})`)
    .join("\n") || "No education provided";

  // Check if profile is essentially empty
  const hasExperience = profile.experience && profile.experience.length > 0;
  const hasSkills = profile.skills && profile.skills.length > 0;
  const hasHeadline = profile.headline && profile.headline.trim().length > 0;
  const hasSummary = profile.summary && profile.summary.trim().length > 0;
  const profileIsEmpty = !hasExperience && !hasSkills && !hasHeadline && !hasSummary;

  return `You are writing a SHORT, HUMAN-SOUNDING cover letter for a specific job.

Your goals:
- Make it feel like a real person wrote this, not an AI.
- Show why this candidate is a strong fit for THIS role at THIS company.
- Keep it skimmable for a recruiter who has 20-30 seconds.
- Include a natural, conversational phrase or observation somewhere in the letter.

## HUMAN VOICE GUARDRAILS
- Mention the company by name or "your platform," but do not copy their marketing tagline verbatim.
- Use contractions and varied sentence openings.
- Limit yourself to the strongest 1-2 metrics per paragraph. Pick the best numbers; do not stack every stat.
- Avoid template phrases like "My experience aligns well with your needs."
- If you cite multiple achievements, focus on the story and architecture choices, not just metrics.

## CRITICAL: GROUNDING RULES

${profileIsEmpty ? `
⚠️ CRITICAL: The candidate profile is EMPTY. NO experience, skills, or background provided.

STRICT RULES FOR EMPTY PROFILE:
- Do NOT invent ANY experience, projects, metrics, or numbers.
- Do NOT say "I developed..." or "I built..." or "I improved X by Y%".
- Do NOT make up university projects, internships, or coursework.
- Write ONLY about why this specific role interests them.
- Keep it to 100-120 words max.
- Be genuine: express interest in the company/role, ask for a chance to learn.
- Tone: curious, eager, honest about being early-career or transitioning.

Example opening: "The Full Stack AI/ML role at your company caught my attention because..."
Example body: "I'm drawn to the opportunity to work on production AI systems alongside experienced engineers. While I'm still building my hands-on experience, I'm a quick learner who..."
` : `
You MUST only use information from the CANDIDATE PROFILE below.
- Every claim must come directly from the profile.
- Every metric/number must be from the profile's highlights.
- Every skill mentioned must be in their skills list.
- If something isn't in the profile, DO NOT mention it.
- If you can't find a good story, keep it brief and honest.
`}

## JOB DETAILS
**Position:** ${job.title}
**Company:** ${job.company}
**Location:** ${job.location}

**Job Description:**
${job.description}

**Key Requirements:**
${job.requirements.map((r) => `• ${r}`).join("\n")}

## CANDIDATE PROFILE
**Headline:** ${profile.headline || "Not provided"}
**Summary:** ${profile.summary || "Not provided"}
**Skills:** ${profile.skills?.join(", ") || "Not provided"}

**Work Experience:**
${experienceText}

**Education:**
${educationText}

## STYLE & TONE RULES (CRITICAL)

Write in first person ("I"), but:
- Use contractions (I'm, I've, don't).
- Do NOT start every sentence with "I". Vary your sentence openings.
- Use clear, simple language. Prefer concrete verbs over buzzwords.
- Keep paragraphs short (3-5 lines). Total length: 200-280 words.

Sound professional but conversational, like a strong candidate emailing a future manager — not like a legal memo.

NEVER use these phrases (or close variants):
- "I am excited to apply for"
- "I am writing to express my interest"
- "highly motivated and results-driven"
- "dynamic organization"
- "fast-paced environment"
- "leverage my skills"
- "passionate about"
- "utilize my experience"
- "thrive in ambiguity"
- "take ownership"

Avoid:
- NEVER use em-dashes (—). Use commas instead. Em-dashes look AI-generated.
- Avoid semicolons where possible.
- Copying bullet points from the resume word-for-word.
- Repeating the job description back to the reader.

## CONTENT RULES

1. **Opening (2-3 sentences)**
   - State the role you're applying for.
   - Include ONE specific reason this role/company is interesting (pull from the job description if needed).
   - Do NOT use any of the banned phrases above.

2. **Body Paragraph 1 (3-4 sentences)**
   - Pick ONE top requirement from the job description.
   - Choose ONE real experience from the candidate profile that proves they can do that.
   - Describe it as a mini-story: context → what they did → impact.
   - Use real metrics if they exist in the profile. If not provided, stay qualitative and honest.

3. **Body Paragraph 2 (2-3 sentences)**
   - Optionally, pick ONE more requirement and connect it to another specific experience
     OR summarize 2-3 closely related achievements in one tight paragraph.

4. **Closing (1-2 sentences)**
   - Reaffirm interest in this specific role/team.
   - Add a light call to action ("I'd welcome the chance to talk further," etc.).
   - Stay warm and confident, not desperate.

5. **Company awareness**
   - Mention the company name naturally.
   - Include at least ONE sentence that shows understanding of their product, domain, or mission,
     based ONLY on the information in the job description above. Do not invent details.

6. **Self-check before finalizing**
   - Remove any sentences that would make sense in almost any cover letter.
   - Replace them with more specific details (project names, technologies, outcomes) from the profile.
   - Make sure every claim is consistent with the candidate profile and not made up.
   - If you referenced more than two metrics in a single paragraph, rewrite it to feel less like a resume dump.

Return ONLY the cover letter content in the structured format requested.`;
}

