import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { CONFETTI_DRAG, CONFETTI_DURATION, type ConfettiParticle } from "./confetti-particles";

type ConfettiBurstProps = {
  particles: ConfettiParticle[];
};

/** One burst: every particle is driven by a single 0 → 1 progress value. */
export function ConfettiBurst({ particles }: ConfettiBurstProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: CONFETTI_DURATION, easing: Easing.linear });
  }, [progress]);

  return particles.map((particle, index) => (
    <Particle key={index} particle={particle} progress={progress} />
  ));
}

type ParticleProps = {
  particle: ConfettiParticle;
  progress: SharedValue<number>;
};

/**
 * Linear drag + gravity, in closed form: the particle shoots out, slows down, then drifts down at
 * terminal velocity (gravity / drag) while spinning and fading out.
 */
function Particle({ particle, progress }: ParticleProps) {
  const { x, y, vx, vy, gravity, size, color, round, rotation, spin } = particle;

  const style = useAnimatedStyle(() => {
    const t = (progress.value * CONFETTI_DURATION) / 1000;
    const decay = (1 - Math.exp(-CONFETTI_DRAG * t)) / CONFETTI_DRAG;
    const terminal = gravity / CONFETTI_DRAG;
    return {
      opacity: 1 - progress.value ** 3,
      transform: [
        { translateX: x + vx * decay },
        { translateY: y + (vy + terminal) * decay - terminal * t },
        { rotate: `${rotation + spin * t}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: -size / 2,
          top: -size / 2,
          width: size,
          height: round ? size : size * 0.6,
          borderRadius: round ? size / 2 : 1,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
