"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Sparkles,
  Loader2,
  ArrowRight,
  Mic,
  Settings,
  LayoutDashboard,
  FileDown,
  Command,
  type LucideIcon,
} from "lucide-react";

interface AIResult {
  meeting_id: string;
  title: string;
  snippet: string;
  relevance_score: number;
  category: string;
  created_at: string | null;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  action: () => void | Promise<void>;
}

interface SearchResultItem {
  kind: "search";
  data: AIResult;
}

interface CommandResultItem {
  kind: "command";
  data: CommandItem;
}

type PaletteItem = SearchResultItem | CommandResultItem;

export function CommandPalette() {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AIResult[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentMeetingId, setRecentMeetingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isCommandMode = query.startsWith("/");
  const searchQuery = isCommandMode ? query.slice(1).trim() : query.trim();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSummary("");
    setSelectedIndex(0);
  }, []);

  const runCommand = useCallback(
    async (action: () => void | Promise<void>) => {
      close();
      await action();
    },
    [close]
  );

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "new-meeting",
        label: t("commandPalette.cmdNewMeeting"),
        description: t("commandPalette.cmdNewMeetingDesc"),
        icon: Mic,
        keywords: ["new", "meeting", "record", "upload", "новая", "встреча", "запись"],
        action: () => router.push("/record"),
      },
      {
        id: "settings",
        label: t("commandPalette.cmdSettings"),
        description: t("commandPalette.cmdSettingsDesc"),
        icon: Settings,
        keywords: ["settings", "profile", "настройки", "профиль"],
        action: () => router.push("/settings"),
      },
      {
        id: "ai-summary",
        label: t("commandPalette.cmdAiSummary"),
        description: t("commandPalette.cmdAiSummaryDesc"),
        icon: Sparkles,
        keywords: ["summary", "ai", "overview", "резюме", "обзор"],
        action: () => {
          router.push("/dashboard#ai-overview");
          setTimeout(() => {
            document.getElementById("ai-overview")?.scrollIntoView({ behavior: "smooth" });
          }, 300);
        },
      },
      {
        id: "export-pdf",
        label: t("commandPalette.cmdExportPdf"),
        description: t("commandPalette.cmdExportPdfDesc"),
        icon: FileDown,
        keywords: ["export", "pdf", "report", "экспорт", "отчёт"],
        action: async () => {
          if (!recentMeetingId) {
            toast.error(t("commandPalette.exportFailed"));
            return;
          }
          toast.info(t("commandPalette.exporting"));
          try {
            await api.downloadReport(recentMeetingId);
            toast.success(t("meetings.reportDownloaded"));
          } catch {
            toast.error(t("meetings.exportFailed"));
          }
        },
      },
      {
        id: "dashboard",
        label: t("commandPalette.cmdDashboard"),
        description: t("commandPalette.cmdDashboardDesc"),
        icon: LayoutDashboard,
        keywords: ["dashboard", "home", "workspace", "панель", "главная"],
        action: () => router.push("/dashboard"),
      },
      {
        id: "search",
        label: t("commandPalette.cmdSearch"),
        description: t("commandPalette.cmdSearchDesc"),
        icon: Search,
        keywords: ["search", "find", "поиск", "найти"],
        action: () => router.push("/search"),
      },
    ],
    [t, router, recentMeetingId]
  );

  const filteredCommands = useMemo(() => {
    if (!isCommandMode) return commands;
    const q = searchQuery.toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
    );
  }, [commands, isCommandMode, searchQuery]);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    if (isCommandMode) {
      return filteredCommands.map((c) => ({ kind: "command" as const, data: c }));
    }
    if (results.length > 0) {
      return results.map((r) => ({ kind: "search" as const, data: r }));
    }
    return [];
  }, [isCommandMode, filteredCommands, results]);

  const defaultCommands = useMemo(
    () => commands.slice(0, 4).map((c) => ({ kind: "command" as const, data: c })),
    [commands]
  );

  const activeItems = query.trim() ? paletteItems : defaultCommands;

  const navigateTo = useCallback(
    (meetingId: string) => {
      close();
      router.push(`/meetings/${meetingId}`);
    },
    [close, router]
  );

  const executeItem = useCallback(
    (item: PaletteItem) => {
      if (item.kind === "search") {
        navigateTo(item.data.meeting_id);
      } else {
        runCommand(item.data.action);
      }
    },
    [navigateTo, runCommand]
  );

  useEffect(() => {
    const onToggle = () => setOpen((prev) => !prev);
    window.addEventListener("secondmemory:command-palette", onToggle);
    window.addEventListener("meetmind:command-palette", onToggle);
    return () => {
      window.removeEventListener("secondmemory:command-palette", onToggle);
      window.removeEventListener("meetmind:command-palette", onToggle);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      api.getMeetings(1).then((m) => setRecentMeetingId(m[0]?.id ?? null));
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length, filteredCommands.length]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      const items = query.trim() ? paletteItems : defaultCommands;
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && items[selectedIndex]) {
        e.preventDefault();
        executeItem(items[selectedIndex]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, paletteItems, defaultCommands, selectedIndex, query, close, executeItem]);

  useEffect(() => {
    if (isCommandMode || !query.trim()) {
      if (!isCommandMode) {
        setResults([]);
        setSummary("");
      }
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.aiSearchMeetings(query);
        setResults(data.results);
        setSummary(data.summary);
      } catch {
        setResults([]);
        setSummary("");
      }
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, isCommandMode]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const examples = [t("search.example1"), t("search.example2"), t("search.example3")];

  const renderItem = (item: PaletteItem, index: number) => {
    const selected = index === selectedIndex;

    if (item.kind === "command") {
      const cmd = item.data;
      const Icon = cmd.icon;
      return (
        <button
          key={cmd.id}
          type="button"
          data-index={index}
          onClick={() => executeItem(item)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
            selected
              ? "bg-primary-500/12 border-l-2 border-primary-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.06)]"
              : "hover:bg-surface-800/40 border-l-2 border-transparent"
          }`}
        >
          <div
            className={`p-1.5 rounded-md ${selected ? "bg-primary-500/20" : "bg-surface-800/80"}`}
          >
            <Icon className={`w-4 h-4 ${selected ? "text-primary-400" : "text-surface-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${selected ? "text-white" : "text-surface-200"}`}>
              {cmd.label}
            </p>
            <p className="text-xs text-surface-500 truncate">{cmd.description}</p>
          </div>
          <Command className="w-3 h-3 text-surface-600 shrink-0" />
        </button>
      );
    }

    const result = item.data;
    return (
      <button
        key={result.meeting_id}
        type="button"
        data-index={index}
        onClick={() => executeItem(item)}
        onMouseEnter={() => setSelectedIndex(index)}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-150 ${
          selected
            ? "bg-accent-500/10 border-l-2 border-accent-400 shadow-[inset_0_0_20px_rgba(20,184,166,0.06)]"
            : "hover:bg-surface-800/40 border-l-2 border-transparent"
        }`}
      >
        <div className="p-1.5 rounded-md bg-accent-500/10 mt-0.5">
          <Sparkles className="w-4 h-4 text-accent-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-sm font-medium truncate ${selected ? "text-white" : "text-surface-200"}`}>
              {result.title}
            </span>
            <Badge category={result.category} />
          </div>
          <p className="text-xs text-surface-500 line-clamp-2">{result.snippet}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-accent-400/90 font-medium">
            {Math.round(result.relevance_score * 100)}%
          </span>
          <ArrowRight className={`w-3.5 h-3.5 ${selected ? "text-accent-400" : "text-surface-600"}`} />
        </div>
      </button>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
            role="dialog"
            aria-modal="true"
            aria-label={t("commandPalette.title")}
          >
            <div className="glass glow rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-surface-700/60">
              <div className="flex items-center gap-3 px-4 border-b border-surface-800/60">
                {loading ? (
                  <Loader2 className="w-5 h-5 text-primary-400 animate-spin shrink-0" />
                ) : isCommandMode ? (
                  <Command className="w-5 h-5 text-primary-400 shrink-0" />
                ) : (
                  <Search className="w-5 h-5 text-surface-500 shrink-0" />
                )}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("commandPalette.placeholder")}
                  className="flex-1 py-4 bg-transparent text-surface-100 placeholder-surface-500 focus:outline-none text-base"
                />
                <div className="hidden sm:flex items-center gap-1.5">
                  {isCommandMode ? (
                    <span className="text-[10px] text-primary-400/80 px-1.5 py-0.5 rounded bg-primary-500/10 border border-primary-500/20">
                      {t("commandPalette.commands")}
                    </span>
                  ) : query.trim() ? (
                    <span className="text-[10px] text-accent-400/80 px-1.5 py-0.5 rounded bg-accent-500/10 border border-accent-500/20">
                      {t("commandPalette.searchMode")}
                    </span>
                  ) : null}
                  <kbd className="text-[10px] text-surface-500 bg-surface-800/80 px-1.5 py-0.5 rounded border border-surface-700/60">
                    ESC
                  </kbd>
                </div>
              </div>

              <div ref={listRef} className="max-h-[min(440px,55vh)] overflow-y-auto">
                {summary && !isCommandMode && query.trim() && !loading && (
                  <div className="px-4 py-3 border-b border-surface-800/40 bg-gradient-to-r from-primary-500/8 to-transparent">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                      <span className="text-xs font-medium text-primary-300">
                        {t("commandPalette.aiSummary")}
                      </span>
                    </div>
                    <p className="text-sm text-surface-400 leading-relaxed">{summary}</p>
                  </div>
                )}

                {activeItems.length > 0 ? (
                  <div className="py-2">
                    {!query.trim() && (
                      <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-surface-600 font-medium">
                        {t("commandPalette.commands")}
                      </p>
                    )}
                    {isCommandMode && query.trim() && (
                      <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-surface-600 font-medium">
                        {t("commandPalette.commands")}
                      </p>
                    )}
                    {!isCommandMode && query.trim() && results.length > 0 && (
                      <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-surface-600 font-medium">
                        {t("commandPalette.searchMode")}
                      </p>
                    )}
                    {activeItems.map((item, index) => renderItem(item, index))}
                  </div>
                ) : isCommandMode && query.trim() ? (
                  <div className="py-10 text-center text-sm text-surface-500">
                    {t("commandPalette.noResults")}
                  </div>
                ) : !isCommandMode && query.trim() && !loading ? (
                  <div className="py-10 text-center text-sm text-surface-500">
                    {t("commandPalette.noResults")}
                  </div>
                ) : !query.trim() ? (
                  <div className="py-4 px-4 border-t border-surface-800/30">
                    <p className="text-xs text-surface-500 mb-3">{t("commandPalette.tryExamples")}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {examples.map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => setQuery(ex)}
                          className="text-xs px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:text-accent-300 hover:border-accent-500/30 transition-colors"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-surface-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>/ {t("commandPalette.commands").toLowerCase()}</span>
                      <span>↑↓ {t("commandPalette.navigate")}</span>
                      <span>↵ {t("commandPalette.select")}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function openCommandPalette() {
  window.dispatchEvent(new Event("secondmemory:command-palette"));
}
