import { createContext, useContext, useRef, useState } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { FullWindowOverlay } from "react-native-screens";
import { ConfettiBurst } from "./confetti-burst";
import {
  CONFETTI_DURATION,
  createParticles,
  type ConfettiOptions,
  type ConfettiParticle,
} from "./confetti-particles";

type Confetti = (options: ConfettiOptions) => void;

const ConfettiContext = createContext<Confetti | null>(null);

// iOS: a full-window overlay keeps the confetti above dialogs, like web's canvas above the page.
const Overlay = Platform.OS === "ios" ? FullWindowOverlay : View;

/**
 * Native counterpart of web's `canvas-confetti`: `useConfetti()` fires a burst over the whole app.
 * The layer never takes touches, and is only mounted while a burst is running.
 */
export function ConfettiProvider({ children }: React.PropsWithChildren) {
  const screen = useWindowDimensions();
  const isReducedMotion = useReducedMotion();
  const nextIdRef = useRef(0);
  const [bursts, setBursts] = useState<{ id: number; particles: ConfettiParticle[] }[]>([]);

  function confetti(options: ConfettiOptions) {
    if (isReducedMotion) {
      return;
    }
    const id = nextIdRef.current++;
    setBursts((current) => [...current, { id, particles: createParticles(options, screen) }]);
    setTimeout(() => {
      setBursts((current) => current.filter((burst) => burst.id !== id));
    }, CONFETTI_DURATION);
  }

  return (
    <ConfettiContext.Provider value={confetti}>
      {children}
      {bursts.length > 0 && (
        <Overlay>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {bursts.map((burst) => (
              <ConfettiBurst key={burst.id} particles={burst.particles} />
            ))}
          </View>
        </Overlay>
      )}
    </ConfettiContext.Provider>
  );
}

export function useConfetti(): Confetti {
  const confetti = useContext(ConfettiContext);
  if (!confetti) {
    throw new Error("useConfetti must be used within <ConfettiProvider>");
  }
  return confetti;
}
