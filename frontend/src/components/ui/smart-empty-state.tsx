"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface SmartEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  aiTip?: string;
  suggestions?: { label: string; href?: string; onClick?: () => void }[];
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function SmartEmptyState({
  icon,
  title,
  description,
  aiTip,
  suggestions,
  action,
  className,
  compact = false,
}: SmartEmptyStateProps) {
  return (
    <div className={cn("relative", className)}>
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={action}
        className={compact ? "py-10" : undefined}
      />
      {(aiTip || (suggestions && suggestions.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn(
            "mx-auto max-w-md -mt-4 px-4",
            compact ? "pb-2" : "pb-4"
          )}
        >
          {aiTip && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary-500/5 border border-primary-500/15 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
              <p className="text-xs text-surface-400 leading-relaxed text-left">{aiTip}</p>
            </div>
          )}
          {suggestions && suggestions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) =>
                s.href ? (
                  <a
                    key={s.label}
                    href={s.href}
                    className="text-xs px-3 py-1.5 rounded-full bg-surface-800/60 border border-surface-700/50 text-surface-400 hover:text-primary-300 hover:border-primary-500/30 transition-all duration-200"
                  >
                    {s.label}
                  </a>
                ) : (
                  <button
                    key={s.label}
                    type="button"
                    onClick={s.onClick}
                    className="text-xs px-3 py-1.5 rounded-full bg-surface-800/60 border border-surface-700/50 text-surface-400 hover:text-primary-300 hover:border-primary-500/30 transition-all duration-200"
                  >
                    {s.label}
                  </button>
                )
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
