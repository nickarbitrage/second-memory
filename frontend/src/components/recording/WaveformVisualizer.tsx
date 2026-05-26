"use client";

import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  active: boolean;
  intensity?: number;
}

const BAR_COUNT = 32;

export function WaveformVisualizer({ active, intensity = 0.5 }: WaveformVisualizerProps) {
  return (
    <motion.div
      className="flex items-end justify-center gap-[3px] h-16 w-full max-w-md mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0.35 }}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const base = 0.15 + Math.sin(i * 0.45) * 0.12;
        const peak = base + intensity * (0.35 + (i % 5) * 0.06);
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-primary-600 to-accent-400"
            animate={
              active
                ? { height: [`${base * 100}%`, `${peak * 100}%`, `${base * 100}%`] }
                : { height: `${base * 60}%` }
            }
            transition={{
              duration: 0.35 + (i % 7) * 0.04,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
              delay: i * 0.02,
            }}
            style={{ minHeight: 4 }}
          />
        );
      })}
    </motion.div>
  );
}
