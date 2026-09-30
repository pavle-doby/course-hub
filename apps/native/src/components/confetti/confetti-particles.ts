/** `3 seconds` - How long one burst lives. */
export const CONFETTI_DURATION = 3000;

/** Linear drag (1/s); with gravity it gives a slow terminal fall of gravity / drag px/s. */
export const CONFETTI_DRAG = 2.5;

/** px/s² */
export const CONFETTI_GRAVITY = 700;

/** Maps canvas-confetti's `startVelocity` (web) to px/s, so the same options give a similar burst. */
const VELOCITY_SCALE = 24;

/** canvas-confetti's default palette, so native bursts match web. */
const COLORS = ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"];

/** Same meaning as the canvas-confetti options web passes (`origin` is 0–1 of the screen). */
export type ConfettiOptions = {
  particleCount?: number;
  /** Degrees; 90 shoots straight up. */
  angle?: number;
  /** Degrees around `angle`. */
  spread?: number;
  startVelocity?: number;
  origin?: { x?: number; y?: number };
  /** Only round particles (web's `shapes: ["circle"]`). */
  round?: boolean;
  /** Gravity multiplier; below 1 the particles float down slowly. */
  gravity?: number;
  /** Particle size multiplier. */
  scalar?: number;
};

export type ConfettiParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  size: number;
  color: string;
  round: boolean;
  rotation: number;
  spin: number;
};

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function createParticles(
  {
    particleCount = 50,
    angle = 90,
    spread = 45,
    startVelocity = 45,
    origin,
    round = false,
    gravity = 1,
    scalar = 1,
  }: ConfettiOptions,
  screen: { width: number; height: number }
): ConfettiParticle[] {
  const x = (origin?.x ?? 0.5) * screen.width;
  const y = (origin?.y ?? 0.5) * screen.height;

  return Array.from({ length: particleCount }, () => {
    const direction = ((angle + random(-spread / 2, spread / 2)) * Math.PI) / 180;
    const velocity = startVelocity * VELOCITY_SCALE * random(0.5, 1);
    return {
      x,
      y,
      vx: Math.cos(direction) * velocity,
      vy: -Math.sin(direction) * velocity,
      gravity: CONFETTI_GRAVITY * gravity,
      size: random(6, 10) * scalar,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      round: round || Math.random() < 0.3,
      rotation: random(0, 360),
      spin: random(-720, 720),
    };
  });
}
