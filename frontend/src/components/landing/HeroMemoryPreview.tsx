"use client";

import { motion } from "framer-motion";
import { Brain, Network, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const SNIPPETS_EN = [
  "Authentication concerns first appeared 12 days ago.",
  "This discussion evolved across 4 meetings.",
  "Linked to architecture review sessions.",
];

const SNIPPETS_RU = [
  "Тема аутентификации впервые — 12 дней назад.",
  "Обсуждение развивалось в 4 встречах.",
  "Связано с architecture review.",
];

export function HeroMemoryPreview() {
  const { language } = useI18n();
  const snippets = language === "ru" ? SNIPPETS_RU : SNIPPETS_EN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.55 }}
      className="relative max-w-3xl mx-auto mt-14 rounded-2xl border border-surface-800/60 bg-[#08080f]/80 backdrop-blur-xl overflow-hidden shadow-2xl"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary-500/20 blur-3xl"
        animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative p-6 sm:p-8 grid sm:grid-cols-2 gap-6 items-center">
        <motion.div
          className="relative aspect-square max-w-[200px] mx-auto w-full"
          animate={{ rotate: [0, 2, 0, -2, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="heroEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {[
              [50, 20, 25, 70],
              [25, 70, 75, 70],
              [50, 20, 75, 70],
              [50, 20, 50, 50],
            ].map(([x1, y1, x2, y2], i) => (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#heroEdge)"
                strokeWidth="0.4"
                initial={{ pathLength: 0, opacity: 0.2 }}
                animate={{ pathLength: 1, opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
            {[
              [50, 20],
              [25, 70],
              [75, 70],
              [50, 50],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r={3.5}
                fill="rgba(99, 102, 241, 0.85)"
                animate={{ opacity: [0.6, 1, 0.6], r: [3.2, 4, 3.2] }}
                transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
                style={{ filter: "drop-shadow(0 0 4px rgba(99,102,241,0.7))" }}
              />
            ))}
          </svg>
          <Network className="absolute top-2 right-2 w-4 h-4 text-primary-400/60" />
        </motion.div>

        <motion.div className="space-y-3 text-left">
          <div className="flex items-center gap-2 text-primary-300 text-sm font-medium">
            <Brain className="w-4 h-4" />
            <span>Second Memory</span>
          </div>
          {snippets.map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.35 }}
              className="flex items-start gap-2 text-sm text-surface-400"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-400 mt-0.5 shrink-0" />
              <span>{text}</span>
            </motion.div>
          ))}
          <motion.div
            className="mt-2 h-1 rounded-full bg-surface-800 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
              initial={{ width: "12%" }}
              animate={{ width: ["12%", "78%", "92%"] }}
              transition={{ duration: 4, delay: 1.2, repeat: Infinity, repeatType: "reverse" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
