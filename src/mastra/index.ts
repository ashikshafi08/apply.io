import { Mastra } from "@mastra/core/mastra";
import { resumeParserAgent } from "./agents/resume-parser";
import { coverLetterAgent } from "./agents/cover-letter";

export const mastra = new Mastra({
  agents: { resumeParserAgent, coverLetterAgent },
});

