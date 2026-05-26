"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Network, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { MeetingListItem } from "@/types";
import { buildMemoryGraph, MemoryGraphNode } from "@/lib/memory-graph";

interface MemoryGraphProps {
  meetings: MeetingListItem[];
  compact?: boolean;
}

export function MemoryGraph({ meetings, compact = false }: MemoryGraphProps) {
  const { t, language } = useI18n();
  const router = useRouter();
  const { nodes, edges, insights } = buildMemoryGraph(meetings, language);
  const [hovered, setHovered] = useState<string | null>(null);

  if (nodes.length === 0) {
    return (
      <Card className="card-premium">
        <p className="text-sm text-surface-500">{t("memoryGraph.empty")}</p>
      </Card>
    );
  }

  const activeEdges = hovered
    ? edges.filter((e) => e.from === hovered || e.to === hovered)
    : edges;

  const nodeById = (id: string) => nodes.find((n) => n.id === id);

  return (
    <Card className={`card-premium border-primary-500/10 overflow-hidden ${compact ? "p-4" : ""}`}>
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-primary-400" />
        <div>
          <h2 className="text-lg font-semibold text-white">{t("memoryGraph.title")}</h2>
          {!compact && <p className="text-xs text-surface-500">{t("memoryGraph.subtitle")}</p>}
        </div>
      </div>

      <div className="relative aspect-[16/9] max-h-[280px] rounded-xl bg-[#06060e]/80 border border-surface-800/50 overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {activeEdges.map((edge) => {
            const a = nodeById(edge.from);
            const b = nodeById(edge.to);
            if (!a || !b) return null;
            return (
              <line
                key={edge.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#edgeGrad)"
                strokeWidth={0.15 + edge.strength * 0.35}
                strokeOpacity={hovered ? 0.9 : 0.35 + edge.strength * 0.3}
              />
            );
          })}
          {nodes.map((node) => (
            <GraphNodeDot
              key={node.id}
              node={node}
              active={hovered === node.id || activeEdges.some((e) => e.from === node.id || e.to === node.id)}
              onHover={setHovered}
              onSelect={() => router.push(`/meetings/${node.id}`)}
            />
          ))}
        </svg>
      </div>

      {insights.length > 0 && (
        <ul className="mt-4 space-y-2">
          {insights.map((ins, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-2 text-sm text-surface-400"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-400 mt-0.5 shrink-0" />
              {ins.text}
            </motion.li>
          ))}
        </ul>
      )}

      {!compact && (
        <p className="text-xs text-surface-600 mt-3">{t("memoryGraph.hint")}</p>
      )}
    </Card>
  );
}

function GraphNodeDot({
  node,
  active,
  onHover,
  onSelect,
}: {
  node: MemoryGraphNode;
  active: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
}) {
  return (
    <g
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <circle
        cx={node.x}
        cy={node.y}
        r={active ? node.size + 1.2 : node.size}
        fill={active ? "rgba(99, 102, 241, 0.9)" : "rgba(99, 102, 241, 0.45)"}
        style={{ filter: active ? "drop-shadow(0 0 6px rgba(99,102,241,0.8))" : undefined }}
      />
      {active && (
        <text
          x={node.x}
          y={node.y - node.size - 2}
          textAnchor="middle"
          fill="#c8cfdf"
          fontSize="2.5"
        >
          {node.label}
        </text>
      )}
    </g>
  );
}
