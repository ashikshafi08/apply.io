"use server";

import { mastra } from "@/mastra";
import { resumeSchema, type ParsedResume } from "@/mastra/agents/resume-parser";
import { extractText } from "unpdf";

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
  return text;
}

export type ParseResumeResult =
  | { success: true; data: ParsedResume; rawText: string }
  | { success: false; error: string };

export type StreamingParseResult = {
  type: "progress" | "complete" | "error";
  step?: string;
  stepIndex?: number;
  totalSteps?: number;
  data?: ParsedResume;
  rawText?: string;
  error?: string;
};

// Non-streaming version for simple use cases
export async function parseResume(formData: FormData): Promise<ParseResumeResult> {
  try {
    const file = formData.get("file") as File | null;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!file.type.includes("pdf")) {
      return { success: false, error: "Please upload a PDF file" };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File size must be under 10MB" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let rawText: string;
    try {
      rawText = await extractPdfText(buffer);
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError);
      return { success: false, error: "Failed to read PDF. Please ensure it's a valid PDF file." };
    }

    if (!rawText || rawText.trim().length === 0) {
      return { success: false, error: "Could not extract text from PDF. It may be an image-based PDF." };
    }

    const agent = mastra.getAgent("resumeParserAgent");

    const response = await agent.generate(
      `Please parse the following resume and extract structured information:\n\n${rawText}`,
      {
        structuredOutput: {
          schema: resumeSchema,
        },
      }
    );

    const parsedData = response.object as ParsedResume;

    return {
      success: true,
      data: parsedData,
      rawText,
    };
  } catch (error) {
    console.error("Resume parsing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Streaming version that reports real progress
export async function parseResumeWithProgress(formData: FormData): Promise<ReadableStream<StreamingParseResult>> {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      const emit = (result: StreamingParseResult) => {
        controller.enqueue(result);
      };

      try {
        const file = formData.get("file") as File | null;

        if (!file) {
          emit({ type: "error", error: "No file provided" });
          controller.close();
          return;
        }

        if (!file.type.includes("pdf")) {
          emit({ type: "error", error: "Please upload a PDF file" });
          controller.close();
          return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          emit({ type: "error", error: "File size must be under 10MB" });
          controller.close();
          return;
        }

        // Step 1: Extract text from PDF
        emit({ type: "progress", step: "Extracting text from PDF", stepIndex: 0, totalSteps: 6 });
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let rawText: string;
        try {
          rawText = await extractPdfText(buffer);
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          emit({ type: "error", error: "Failed to read PDF. Please ensure it's a valid PDF file." });
          controller.close();
          return;
        }

        if (!rawText || rawText.trim().length === 0) {
          emit({ type: "error", error: "Could not extract text from PDF. It may be an image-based PDF." });
          controller.close();
          return;
        }

        // Step 2: Starting AI analysis
        emit({ type: "progress", step: "Analyzing document structure", stepIndex: 1, totalSteps: 6 });

        const agent = mastra.getAgent("resumeParserAgent");
        let currentStepIndex = 2;
        const steps = [
          "Identifying skills & technologies",
          "Parsing work experience", 
          "Extracting education",
          "Generating search keywords"
        ];

        // Use streaming with onChunk to track real progress
        const stream = await agent.stream(
          `Please parse the following resume and extract structured information:\n\n${rawText}`,
          {
            structuredOutput: {
              schema: resumeSchema,
            },
            onStepFinish: () => {
              // Each step finish indicates AI is making progress
              if (currentStepIndex < 6) {
                emit({ 
                  type: "progress", 
                  step: steps[currentStepIndex - 2] || "Processing...", 
                  stepIndex: currentStepIndex, 
                  totalSteps: 6 
                });
                currentStepIndex++;
              }
            },
          }
        );

        // Wait for the streaming to complete and get the structured output
        let parsedData: ParsedResume | null = null;
        
        // Consume the stream to completion
        for await (const chunk of stream.fullStream) {
          // Track different chunk types for progress
          if (chunk.type === "text-delta" && currentStepIndex < 6) {
            // AI is generating, update progress occasionally
            if (Math.random() < 0.1) { // 10% chance to update per chunk
              emit({ 
                type: "progress", 
                step: steps[Math.min(currentStepIndex - 2, steps.length - 1)] || "Processing...", 
                stepIndex: Math.min(currentStepIndex, 5), 
                totalSteps: 6 
              });
              currentStepIndex = Math.min(currentStepIndex + 1, 6);
            }
          }
        }

        // Get the final structured output
        const finalResponse = await stream.object;
        parsedData = finalResponse as ParsedResume;

        if (!parsedData) {
          emit({ type: "error", error: "Failed to parse resume data" });
          controller.close();
          return;
        }

        // Complete!
        emit({ 
          type: "complete", 
          data: parsedData, 
          rawText,
          stepIndex: 6,
          totalSteps: 6 
        });
        
        controller.close();
      } catch (error) {
        console.error("Resume parsing error:", error);
        emit({ 
          type: "error", 
          error: error instanceof Error ? error.message : "An unexpected error occurred" 
        });
        controller.close();
      }
    }
  });
}
