import type { Processor } from "@mastra/core/processors";
import type { MastraMessageV2 } from "@mastra/core/agent";

/**
 * Banned phrases that make cover letters sound AI-generated
 */
const BANNED_PHRASES = [
  "i am excited to apply",
  "i am writing to express my interest",
  "highly motivated and results-driven",
  "dynamic organization",
  "fast-paced environment",
  "leverage my skills",
  "passionate about",
  "utilize my experience",
  "thrives in ambiguity",
  "take ownership",
  "innovative ai execution platform",
  "my experience aligns well",
  "unique opportunity",
  "perfect fit",
  "eager to contribute",
];

/**
 * Custom output processor that validates cover letter quality
 * Checks for banned phrases and AI-sounding patterns
 */
export class CoverLetterQualityProcessor implements Processor {
  readonly name = "cover-letter-quality";

  async processOutputResult(args: {
    messages: MastraMessageV2[];
    abort: (reason?: string) => never;
  }): Promise<MastraMessageV2[]> {
    const { messages } = args;

    // Find assistant messages with cover letter content
    for (const message of messages) {
      if (message.role === "assistant") {
        const content = this.extractTextContent(message);
        const issues = this.checkQuality(content);

        if (issues.length > 0) {
          console.warn(
            `[CoverLetterQuality] Found ${issues.length} issue(s):`,
            issues
          );
        }
      }
    }

    return messages;
  }

  private extractTextContent(message: MastraMessageV2): string {
    if (typeof message.content === "string") {
      return message.content;
    }
    if (Array.isArray(message.content)) {
      return message.content
        .filter((part): part is { type: "text"; text: string } => 
          typeof part === "object" && part !== null && "type" in part && part.type === "text"
        )
        .map((part) => part.text)
        .join(" ");
    }
    return "";
  }

  private checkQuality(content: string): string[] {
    const issues: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check for banned phrases
    for (const phrase of BANNED_PHRASES) {
      if (lowerContent.includes(phrase)) {
        issues.push(`Contains banned phrase: "${phrase}"`);
      }
    }

    // Check for ANY em-dashes (they look AI-generated)
    const emDashCount = (content.match(/—/g) || []).length;
    if (emDashCount > 0) {
      issues.push(`Contains em-dashes (${emDashCount}) - use commas instead`);
    }

    // Check for too many semicolons (more than 1)
    const semicolonCount = (content.match(/;/g) || []).length;
    if (semicolonCount > 1) {
      issues.push(`Too many semicolons (${semicolonCount})`);
    }

    // Check word count (should be 200-300 words)
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    if (wordCount > 350) {
      issues.push(`Too long (${wordCount} words, max 300)`);
    }

    return issues;
  }
}

