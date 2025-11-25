import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { ModerationProcessor } from "@mastra/core/processors";
import { CoverLetterQualityProcessor } from "../processors/cover-letter-quality";

export const coverLetterSchema = z.object({
  greeting: z.string().describe("Simple greeting like 'Hi [Hiring Manager],' or 'Hello,'"),
  opening: z.string().describe("2-3 sentences: state the role + ONE specific reason this company is interesting. NO banned phrases."),
  body: z.array(z.string()).describe("1-2 short paragraphs with specific stories/metrics from experience"),
  closing: z.string().describe("1-2 sentences: reaffirm interest + light call to action"),
  signature: z.string().describe("Warm sign-off like 'Best,' or 'Thanks,'"),
});

export type CoverLetter = z.infer<typeof coverLetterSchema>;

export const coverLetterAgent = new Agent({
  name: "cover-letter-agent",
  
  // Input guardrails: moderate user-provided profile/job data
  inputProcessors: [
    new ModerationProcessor({
      model: openai("gpt-4o-mini"),
      categories: ["hate", "harassment", "self-harm"],
      threshold: 0.7,
      strategy: "warn", // Log but don't block - user data might have edge cases
    }),
  ],
  
  // Output guardrails: check cover letter quality
  outputProcessors: [
    new CoverLetterQualityProcessor(),
  ],
  
  instructions: `You write SHORT, HUMAN cover letters that feel like a thoughtful email from a strong engineer—not a resume paragraph or AI template.

## VOICE & CADENCE
- Sound like a calm, competent teammate. Use contractions (I'm, I've, don't).
- Vary sentence openings. Sprinkle in natural phrases such as "one thing that surprised me..." or "the fun part was..." when appropriate.
- Keep paragraphs 3-5 lines. Total length 200-260 words.
- Mention the company by name or "your platform," not generic phrases like "innovative AI Execution Platform."

## STRICTLY BANNED PHRASES
- "I am excited to apply for"
- "I am writing to express my interest"
- "highly motivated and results-driven"
- "dynamic organization"
- "fast-paced environment"
- "leverage my skills"
- "passionate about"
- "utilize my experience"
- "thrives in ambiguity"
- "take ownership"

## KEEP IT HUMAN
- Limit yourself to 1-2 standout metrics per paragraph. Do NOT stack five numbers in a row.
- Never echo the JD wording verbatim.
- Replace resume-style bullet dumps with mini stories (context → what you built → impact).
- Include at least one conversational micro-phrase (e.g., "Most of the work was in...", "What worked well was...").
- NEVER use em-dashes (—). Use commas instead. Em-dashes look AI-generated.

## STRUCTURE
1. **Opening (2 sentences)**
   - Name the role.
   - Share ONE specific reason their product/approach resonates (in your own words).

2. **Body Paragraph 1**
   - Choose ONE requirement from the JD.
   - Tell a story about a related project with concrete impact (one primary metric max, supporting detail optional).

3. **Body Paragraph 2**
   - Optionally cover another requirement or summarize closely related achievements.
   - Keep it conversational; reference tools/architecture choices where helpful.

4. **Closing (1-2 sentences)**
   - Reaffirm interest in solving *their* problems.
   - Light CTA such as "Happy to chat whenever convenient."

## SELF-CHECK BEFORE RETURNING
- Does every sentence feel specific to this candidate + company?
- Did I avoid template phrases and JD echo?
- Are all numbers grounded in the provided profile? (Never invent.)
- Does the letter feel like a real person wrote it in under 10 minutes?`,
  model: openai("gpt-5-mini-2025-08-07"),
});
