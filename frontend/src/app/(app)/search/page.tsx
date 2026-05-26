"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { MeetingListItem } from "@/types";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Card } from "@/components/ui/card";
import { SmartEmptyState } from "@/components/ui/smart-empty-state";
import { openCommandPalette } from "@/components/search/CommandPalette";
import { FadeInStagger, FadeInItem } from "@/components/ui/animations";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Search as SearchIcon,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type SearchMode = "ai" | "analyst" | "basic";

interface AIResult {
  meeting_id: string;
  title: string;
  snippet: string;
  relevance_score: number;
  category: string;
  created_at: string | null;
}

export default function SearchPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("ai");
  const [basicResults, setBasicResults] = useState<MeetingListItem[]>([]);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [analystAnswer, setAnalystAnswer] = useState("");
  const [analystKeyPoints, setAnalystKeyPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setBasicResults([]);
        setAiResults([]);
        setAiSummary("");
        setAnalystAnswer("");
        setAnalystKeyPoints([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        if (mode === "analyst") {
          const data = await api.aiAnalystQuery(q);
          setAnalystAnswer(data.answer);
          setAnalystKeyPoints(data.key_points || []);
          setAiResults(data.results || []);
          setAiSummary("");
          setBasicResults([]);
        } else if (mode === "ai") {
          const data = await api.aiSearchMeetings(q);
          setAiResults(data.results);
          setAiSummary(data.summary);
          setAnalystAnswer("");
          setAnalystKeyPoints([]);
          setBasicResults([]);
        } else {
          const data = await api.searchMeetings(q);
          setBasicResults(data);
          setAiResults([]);
          setAiSummary("");
          setAnalystAnswer("");
          setAnalystKeyPoints([]);
        }
      } catch {
        setBasicResults([]);
        setAiResults([]);
        setAiSummary("");
        setAnalystAnswer("");
        setAnalystKeyPoints([]);
      }
      setLoading(false);
    },
    [mode]
  );

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const examples = [
    t("search.example1"),
    t("search.example2"),
    t("search.example3"),
  ];

  const resultCount = mode === "basic" ? basicResults.length : aiResults.length;

  return (
    <FadeInStagger className="page-container max-w-3xl space-y-6">
      <FadeInItem>
        <PageHeader
          title={t("search.title")}
          description={t("search.subtitle")}
          showBack
          backHref="/dashboard"
          breadcrumbs={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("search.title") },
          ]}
        />
      </FadeInItem>

      <FadeInItem delay={0.05}>
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-surface-900 border border-surface-800 w-fit">
          <button
            onClick={() => setMode("analyst")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "analyst"
                ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                : "text-surface-400 hover:text-surface-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t("analyst.modeAnalyst")}
          </button>
          <button
            onClick={() => setMode("ai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "ai"
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                : "text-surface-400 hover:text-surface-300"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t("search.aiMode")}
          </button>
          <button
            onClick={() => setMode("basic")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "basic"
                ? "bg-surface-800 text-white shadow-sm"
                : "text-surface-400 hover:text-surface-300"
            }`}
          >
            <SearchIcon className="w-4 h-4" />
            {t("search.basicMode")}
          </button>
        </div>
      </FadeInItem>

      <FadeInItem delay={0.1}>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "analyst"
                ? t("analyst.subtitle")
                : mode === "ai"
                ? t("search.aiPlaceholder")
                : t("search.basicPlaceholder")
            }
            className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-surface-900/80 border border-surface-700/80 text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-base backdrop-blur-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </FadeInItem>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-surface-400">
          <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
          <span className="text-sm">{t("search.searching")}</span>
        </div>
      )}

      {!loading && searched && mode === "analyst" && analystAnswer && (
        <FadeInItem>
          <Card className="border-accent-500/20 bg-gradient-to-br from-accent-500/10 to-transparent card-premium">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <h3 className="text-sm font-semibold text-accent-300">{t("analyst.answer")}</h3>
            </div>
            <p className="text-sm text-surface-300 leading-relaxed mb-4">{analystAnswer}</p>
            {analystKeyPoints.length > 0 && (
              <>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">
                  {t("analyst.keyPoints")}
                </p>
                <ul className="space-y-1.5">
                  {analystKeyPoints.map((point, i) => (
                    <li key={i} className="text-sm text-surface-400 flex items-start gap-2">
                      <span className="text-accent-400 mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </FadeInItem>
      )}

      {!loading && searched && mode === "ai" && aiSummary && (
        <FadeInItem>
          <Card className="border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-primary-300">{t("search.aiSummary")}</h3>
            </div>
            <p className="text-sm text-surface-300 leading-relaxed">{aiSummary}</p>
          </Card>
        </FadeInItem>
      )}

      {!loading && searched && (
        <FadeInItem>
          <p className="text-sm text-surface-500 mb-4">
            {resultCount}{" "}
            {resultCount === 1 ? t("search.resultFor") : t("search.resultsFor")} &ldquo;{query}&rdquo;
          </p>
          <div className="space-y-3">
            {resultCount === 0 ? (
              <Card className="card-premium">
                <SmartEmptyState
                  icon={<SearchIcon className="w-8 h-8 text-surface-600" />}
                  title={t("search.noResults")}
                  description={t("search.noResultsDesc")}
                  aiTip={t("empty.searchAiTip")}
                  suggestions={[
                    {
                      label: t("empty.searchSuggestion1"),
                      onClick: () => setQuery(t("search.example2")),
                    },
                    { label: t("empty.dashboardSuggestion1"), href: "/record" },
                  ]}
                />
              </Card>
            ) : mode === "basic" ? (
              basicResults.map((m) => <MeetingCard key={m.id} meeting={m} />)
            ) : (
              aiResults.map((r) => (
                <Link key={r.meeting_id} href={`/meetings/${r.meeting_id}`}>
                  <Card className="hover:border-primary-500/30 transition-all duration-200 group cursor-pointer card-premium">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white truncate group-hover:text-primary-300 transition-colors">
                            {r.title}
                          </h3>
                          <Badge category={r.category} />
                        </div>
                        <p className="text-sm text-surface-400 line-clamp-2">{r.snippet}</p>
                        {r.created_at && (
                          <p className="text-xs text-surface-500 mt-2">
                            {formatDate(r.created_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-primary-400 font-medium">
                          {Math.round(r.relevance_score * 100)}% {t("search.relevance")}
                        </span>
                        <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </FadeInItem>
      )}

      {!searched && !loading && (
        <FadeInItem>
          <Card className="card-premium">
            <SmartEmptyState
              icon={<Sparkles className="w-10 h-10 text-primary-400" />}
              title={t("search.emptyTitle")}
              description={t("search.emptyDesc")}
              aiTip={t("empty.searchAiTip")}
              suggestions={examples.map((ex) => ({
                label: ex,
                onClick: () => setQuery(ex),
              }))}
            />
          </Card>
        </FadeInItem>
      )}
    </FadeInStagger>
  );
}
