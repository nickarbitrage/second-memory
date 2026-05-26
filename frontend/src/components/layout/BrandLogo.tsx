import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const textSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

const iconSizes = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export function BrandLogo({ className, showIcon = true, size = "md" }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {showIcon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25",
            iconSizes[size]
          )}
        >
          <Sparkles className={cn("text-white", size === "lg" ? "w-5 h-5" : "w-4 h-4")} />
        </div>
      )}
      <span className={cn("font-bold text-white tracking-tight", textSizes[size])}>
        Second<span className="text-primary-400">Memory</span>
      </span>
    </div>
  );
}
