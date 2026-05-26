import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function truncate(str: string, len: number = 100): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: "bg-surface-700 text-surface-300",
    standup: "bg-blue-500/10 text-blue-400",
    planning: "bg-purple-500/10 text-purple-400",
    brainstorm: "bg-yellow-500/10 text-yellow-400",
    review: "bg-green-500/10 text-green-400",
    one_on_one: "bg-pink-500/10 text-pink-400",
    client: "bg-orange-500/10 text-orange-400",
    other: "bg-surface-700 text-surface-300",
  };
  return colors[category] || colors.general;
}

export function getCategoryLabel(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
