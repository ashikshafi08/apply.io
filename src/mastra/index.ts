import { Mastra } from "@mastra/core/mastra";
import { resumeParserAgent } from "./agents/resume-parser";

export const mastra = new Mastra({
  agents: { resumeParserAgent },
});

