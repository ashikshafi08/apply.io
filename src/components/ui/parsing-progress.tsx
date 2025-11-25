"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader } from "@/components/ai-elements/loader";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CheckCircle2, ChevronDown, FileText, Brain, Sparkles, Briefcase, GraduationCap, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const PARSING_STEPS = [
  { id: "extract", label: "Extracting PDF", short: "PDF" },
  { id: "analyze", label: "Analyzing structure", short: "Structure" },
  { id: "skills", label: "Finding skills", short: "Skills" },
  { id: "experience", label: "Parsing experience", short: "Experience" },
  { id: "education", label: "Extracting education", short: "Education" },
  { id: "keywords", label: "Generating keywords", short: "Keywords" },
];

type ParsingProgressProps = {
  isActive: boolean;
  isComplete?: boolean;
  currentStep?: number;
};

export function ParsingProgress({ isActive, isComplete = false, currentStep = 0 }: ParsingProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current step info
  const activeStepIndex = Math.min(Math.max(currentStep - 1, 0), PARSING_STEPS.length - 1);
  const activeStep = PARSING_STEPS[activeStepIndex];
  const progress = isComplete ? 100 : (currentStep / 6) * 100;

  if (!isActive && !isComplete) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        {/* Compact main view */}
        <div 
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
            isComplete 
              ? "border-primary/30 bg-primary/5" 
              : "border-border bg-muted/30"
          )}
        >
          {/* Status icon */}
          <div className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isComplete ? "bg-primary/10" : "bg-muted"
          )}>
            {isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <Loader size={16} className="text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <span className="text-sm font-medium text-primary">Resume parsed successfully</span>
              ) : (
                <Shimmer className="text-sm font-medium" duration={1.5}>
                  {activeStep?.label || "Processing..."}
                </Shimmer>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                {currentStep}/6
              </span>
            </div>
          </div>

          {/* Expand button (only when not complete) */}
          {!isComplete && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </button>
          )}
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {isExpanded && !isComplete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                {PARSING_STEPS.map((step, index) => {
                  const isCompleted = currentStep > index + 1 || isComplete;
                  const isActiveStep = currentStep === index + 1;
                  
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all",
                        isCompleted && "bg-primary/10 text-primary",
                        isActiveStep && "bg-primary text-primary-foreground",
                        !isCompleted && !isActiveStep && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted && <CheckCircle2 className="h-2.5 w-2.5" />}
                      {isActiveStep && <Loader size={10} />}
                      <span>{step.short}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// Minimal inline indicator for very tight spaces
export function ParsingIndicator({ text = "Parsing..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loader size={14} className="text-primary" />
      <Shimmer className="text-xs" duration={1.5}>
        {text}
      </Shimmer>
    </div>
  );
}
