import confetti from "canvas-confetti";

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
