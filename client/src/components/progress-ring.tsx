import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  className,
  showLabel = true,
}: ProgressRingProps) {
  const normalizedProgress = Number.isFinite(progress)
    ? Math.min(100, Math.max(0, progress))
    : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  const getColor = () => {
    if (normalizedProgress >= 100) return "stroke-emerald-500";
    if (normalizedProgress >= 75) return "stroke-sky-500";
    if (normalizedProgress >= 50) return "stroke-amber-500";
    return "stroke-primary";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="rotate-[-90deg] drop-shadow-[0_8px_18px_rgba(2,6,23,0.18)]"
        role="progressbar"
        aria-valuenow={normalizedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-500", getColor())}
        />
      </svg>
      {showLabel && (
        <span className="absolute z-10 rounded-full border border-border/70 bg-background/90 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-foreground shadow-sm backdrop-blur-sm">
          {Math.round(normalizedProgress)}%
        </span>
      )}
    </div>
  );
}
