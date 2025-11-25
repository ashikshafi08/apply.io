import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5",
        "transition-all duration-200 hover:border-border hover:shadow-soft",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground/80">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.value > 0
                  ? "text-success"
                  : trend.value < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-muted/60 p-2 transition-colors group-hover:bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

