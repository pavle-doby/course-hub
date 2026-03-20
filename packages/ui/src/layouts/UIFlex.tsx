import type { Insets } from 'react-native';
import { GetProps, SizeTokens, View, styled } from 'tamagui';

export const flexStyles = {
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
  shrink: { flexShrink: 1 },
};

type SizeOrNumber = number | SizeTokens;

type SizedInset = {
  top: SizeOrNumber;
  left: SizeOrNumber;
  right: SizeOrNumber;
  bottom: SizeOrNumber;
};

const getInset = (val: SizeOrNumber): SizedInset => ({
  top: val,
  right: val,
  bottom: val,
  left: val,
});


export type FlexProps = GetProps<typeof UIFlex>;

/**
 * Flex container with predefined styles.
 *
 * Supports `animateEnter`, `animateExit`, and `animateEnterExit` variants.
 * Wrap with Tamagui's `AnimatePresence` for mount/unmount animations.
 * Available values: `true` | `"fade"` | `"slideUp"` | `"slideDown"`
 *
 * @default
 *  flexDirection: column,
 */
export const UIFlex = styled(View, {
  flexDirection: 'column',

  variants: {
    inset: (size: SizeOrNumber | Insets) =>
      size && typeof size === 'object' ? size : getInset(size as SizeOrNumber),

    row: {
      true: {
        flexDirection: 'row',
      },
      false: {
        flexDirection: 'column',
      },
    },

    shrink: {
      true: {
        flexShrink: 1,
      },
    },

    grow: {
      true: {
        flexGrow: 1,
      },
    },

    fill: {
      true: {
        flex: 1,
      },
    },

    centered: {
      true: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    },

    animateEnter: {
      true: {
        animateOnly: ['opacity', 'transform'],
        enterStyle: { opacity: 0, y: 8 },
      },
      fade: {
        animateOnly: ['opacity'],
        enterStyle: { opacity: 0 },
      },
      slideUp: {
        animateOnly: ['opacity', 'transform'],
        enterStyle: { opacity: 0, y: 16 },
      },
      slideDown: {
        animateOnly: ['opacity', 'transform'],
        enterStyle: { opacity: 0, y: -16 },
      },
    },

    animateExit: {
      true: {
        animateOnly: ['opacity', 'transform'],
        exitStyle: { opacity: 0, y: -8 },
      },
      fade: {
        animateOnly: ['opacity'],
        exitStyle: { opacity: 0 },
      },
      slideUp: {
        animateOnly: ['opacity', 'transform'],
        exitStyle: { opacity: 0, y: -16 },
      },
      slideDown: {
        animateOnly: ['opacity', 'transform'],
        exitStyle: { opacity: 0, y: 16 },
      },
    },

    animateEnterExit: {
      true: {
        animateOnly: ['opacity', 'transform'],
        enterStyle: { opacity: 0, y: 8 },
        exitStyle: { opacity: 0, y: -8 },
      },
      fade: {
        animateOnly: ['opacity'],
        enterStyle: { opacity: 0 },
        exitStyle: { opacity: 0 },
      },
      slideUp: {
        animateOnly: ['opacity', 'transform'],
        enterStyle: { opacity: 0, y: 16 },
        exitStyle: { opacity: 0, y: -16 },
      },
      slideDown: {
        animateOnly: ['opacity', 'transform'],
        enterStyle: { opacity: 0, y: -16 },
        exitStyle: { opacity: 0, y: 16 },
      },
    },
  } as const,
});
