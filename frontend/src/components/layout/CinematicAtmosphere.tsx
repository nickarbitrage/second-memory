"use client";

import { useMemo } from "react";

const PARTICLE_COUNT = 28;

/**
 * Layered cinematic atmosphere: mesh, orbs, particles, vignette.
 * CSS-only for performance — no canvas, no WebGL.
 */
export function CinematicAtmosphere({ variant = "workspace" }: { variant?: "workspace" | "landing" }) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        top: `${(i * 23 + 11) % 100}%`,
        size: 1 + (i % 3),
        delay: `${(i % 12) * 0.7}s`,
        duration: `${14 + (i % 8) * 2}s`,
        opacity: 0.15 + (i % 5) * 0.06,
      })),
    []
  );

  return (
    <div
      className={`cinematic-atmosphere cinematic-atmosphere--${variant} pointer-events-none`}
      aria-hidden
    >
      <div className="cinematic-mesh cinematic-mesh-a" />
      <div className="cinematic-mesh cinematic-mesh-b" />
      <div className="ambient-layer">
        <div className="ambient-orb ambient-orb-primary" />
        <div className="ambient-orb ambient-orb-accent" />
        <div className="ambient-orb ambient-orb-muted" />
        <div className="ambient-orb ambient-orb-deep" />
      </div>
      <div className="cinematic-particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="cinematic-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      <div className="cinematic-blur-plate" />
      <div className="cinematic-vignette" />
      <div className="cinematic-noise" />
    </div>
  );
}
