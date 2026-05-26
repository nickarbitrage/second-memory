import { cn, getCategoryColor, getCategoryLabel } from "@/lib/utils";

interface BadgeProps {
  category: string;
  className?: string;
}

export function Badge({ category, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getCategoryColor(category),
        className
      )}
    >
      {getCategoryLabel(category)}
    </span>
  );
}
