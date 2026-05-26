import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-surface-800/60 p-5",
          "bg-gradient-to-b from-[#0e0e16]/90 to-[#0a0a12]/80 backdrop-blur-xl",
          "shadow-[0_4px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.04)]",
          hover &&
            "hover:border-surface-700/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_0_1px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5 transition-all duration-200 ease-out",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
