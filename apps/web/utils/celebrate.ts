import confetti from "canvas-confetti";
import { FIREWORK_SIDES } from "./consts";

/** Full-screen burst for a perfect score (same burst as finishing a course). */
export function celebrate(isMobile: boolean) {
  void confetti({
    particleCount: 200,
    spread: 100,
    startVelocity: isMobile ? 70 : 55,
    origin: isMobile ? { x: 0.5, y: 1 } : { y: 0.6 },
  });
}

/** Burst out of an element: toward the top-right where the popper opens, straight up on mobile. */
export function celebrateFrom(element: HTMLElement, isMobile: boolean) {
  const rect = element.getBoundingClientRect();
  void confetti({
    particleCount: 120,
    angle: isMobile ? 90 : 60,
    spread: 55,
    startVelocity: 45,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
  });
}

/**
 * Soft firework: sparks in every direction, low velocity and gravity with a slow decay so they
 * float down gently instead of popping.
 */
const FIREWORK_BURST = {
  particleCount: 40,
  startVelocity: 18,
  spread: 360,
  gravity: 0.35,
  decay: 0.95,
  ticks: 260,
  scalar: 0.8,
  shapes: ["circle"],
} satisfies confetti.Options;

/** One firework burst on the left or right side of the screen (by `tick`, alternating). */
export function fireworkBurst(tick: number) {
  const [min, max] = FIREWORK_SIDES[tick % FIREWORK_SIDES.length] ?? FIREWORK_SIDES[0];
  void confetti({
    ...FIREWORK_BURST,
    origin: { x: min + Math.random() * (max - min), y: 0.15 + Math.random() * 0.3 },
  });
}

/** One firework burst centered on an element, e.g. the button that was clicked. */
export function fireworkBurstFrom(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  void confetti({
    ...FIREWORK_BURST,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
  });
}
