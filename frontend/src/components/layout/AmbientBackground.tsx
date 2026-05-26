"use client";

/**
 * Subtle floating gradient orbs — workspace atmosphere only.
 */
export function AmbientBackground() {
  return (
    <div className="ambient-layer pointer-events-none" aria-hidden>
      <div className="ambient-orb ambient-orb-primary" />
      <div className="ambient-orb ambient-orb-accent" />
      <div className="ambient-orb ambient-orb-muted" />
    </div>
  );
}
