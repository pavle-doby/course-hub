import { useWindowDimensions, type GestureResponderEvent } from "react-native";
import { useConfetti } from "@/components/confetti/confetti-provider";
import { FIREWORK_SIDES } from "@/utils/consts";

/** Web's confetti calls (quiz `celebrate.ts`, the reader page, the completion dialog), mobile variants. */
export function useCelebrate() {
  const confetti = useConfetti();
  const screen = useWindowDimensions();

  function originOf(event: GestureResponderEvent) {
    const { pageX, pageY } = event.nativeEvent;
    return { x: pageX / screen.width, y: pageY / screen.height };
  }

  /** Full-screen burst for a perfect quiz score, shooting up from the bottom center. */
  function celebrate() {
    confetti({ particleCount: 200, spread: 100, startVelocity: 70, origin: { x: 0.5, y: 1 } });
  }

  /** Burst straight up out of the pressed element. */
  function celebrateFrom(event: GestureResponderEvent) {
    confetti({
      particleCount: 120,
      angle: 90,
      spread: 55,
      startVelocity: 45,
      origin: originOf(event),
    });
  }

  /** The course just turned done: the biggest burst, up from the bottom center. */
  function celebrateCourse() {
    confetti({ particleCount: 300, spread: 120, startVelocity: 70, origin: { x: 0.5, y: 1 } });
  }

  /** A finished course keeps celebrating: a small burst where the learner taps. */
  function celebrateAt(event: GestureResponderEvent) {
    confetti({ particleCount: 70, spread: 70, origin: originOf(event) });
  }

  /**
   * One soft firework for the completion dialog, alternating sides per `tick`: low velocity and
   * gravity let the sparks float down gently instead of popping.
   */
  function firework(tick: number) {
    const [min, max] = FIREWORK_SIDES[tick % FIREWORK_SIDES.length] ?? FIREWORK_SIDES[0];
    confetti({
      particleCount: 40,
      startVelocity: 18,
      spread: 360,
      gravity: 0.35,
      scalar: 0.8,
      round: true,
      origin: { x: min + Math.random() * (max - min), y: 0.15 + Math.random() * 0.3 },
    });
  }

  return { celebrate, celebrateFrom, celebrateCourse, celebrateAt, firework };
}
