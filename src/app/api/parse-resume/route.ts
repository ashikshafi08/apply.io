import { mastra } from "@/mastra";
import { resumeSchema, type ParsedResume } from "@/mastra/agents/resume-parser";
import { extractText } from "unpdf";
import { NextRequest } from "next/server";

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
  return text;
}

export type StreamEvent = {
  type: "progress" | "complete" | "error";
  step?: string;
  stepIndex?: number;
  totalSteps?: number;
  data?: ParsedResume;
  rawText?: string;
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
        const formData = await request.formData();
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
        
        const parsingSteps = [
          "Identifying skills & technologies",
          "Parsing work experience",
          "Extracting education",
          "Generating search keywords",
        ];

        let currentStepIndex = 2;
        let lastEmitTime = Date.now();
        const MIN_EMIT_INTERVAL = 2000; // Emit progress at most every 2 seconds

        // Use streaming with callbacks for real-time progress
        const agentStream = await agent.stream(
          `Please parse the following resume and extract structured information:\n\n${rawText}`,
          {
            structuredOutput: {
              schema: resumeSchema,
            },
            onChunk: (chunk) => {
              // Track AI activity and emit progress
              const now = Date.now();
              if (now - lastEmitTime >= MIN_EMIT_INTERVAL && currentStepIndex < 6) {
                emit({
                  type: "progress",
                  step: parsingSteps[currentStepIndex - 2] || "Processing...",
                  stepIndex: currentStepIndex,
                  totalSteps: 6,
                });
                currentStepIndex++;
                lastEmitTime = now;
              }
            },
          }
        );

        // Consume stream to completion
        for await (const chunk of agentStream.fullStream) {
          // The onChunk callback handles progress emission
          // This just ensures we consume the stream
        }

        // Get the final structured output
        const parsedData = await agentStream.object as ParsedResume;

        if (!parsedData) {
          emit({ type: "error", error: "Failed to parse resume data" });
          controller.close();
          return;
        }

        // Emit remaining steps as complete
        while (currentStepIndex < 6) {
          emit({
            type: "progress",
            step: parsingSteps[currentStepIndex - 2] || "Finalizing...",
            stepIndex: currentStepIndex,
            totalSteps: 6,
          });
          currentStepIndex++;
        }

        // Complete!
        emit({
          type: "complete",
          data: parsedData,
          rawText,
          stepIndex: 6,
          totalSteps: 6,
        });

        controller.close();
      } catch (error) {
        console.error("Resume parsing error:", error);
        emit({
          type: "error",
          error: error instanceof Error ? error.message : "An unexpected error occurred",
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

