import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "default" ? "py-12" : "py-8",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-full bg-muted",
          variant === "default" ? "h-16 w-16" : "h-12 w-12"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground/70",
            variant === "default" ? "h-7 w-7" : "h-5 w-5"
          )}
        />
      </div>
      <h3
        className={cn(
          "font-medium text-foreground",
          variant === "default" ? "text-base" : "text-sm"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-1 max-w-sm text-muted-foreground",
            variant === "default" ? "text-sm" : "text-xs"
          )}
        >
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

