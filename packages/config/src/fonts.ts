import { createInterFont } from '@tamagui/font-inter';
import { SIZE_TOKENS } from './tokens/size';

// Only numeric values are valid as font sizes
const NUMERIC_SIZE_TOKENS = Object.fromEntries(
  Object.entries(SIZE_TOKENS).filter(([, v]) => typeof v === 'number')
) as Record<string, number>;

export const headingFont = createInterFont({
  size: {
    ...NUMERIC_SIZE_TOKENS,
    6: 15,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6,
  },
  face: {
    700: { normal: 'InterBold' },
  },
});

export const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
    size: {
      ...NUMERIC_SIZE_TOKENS,
      true: SIZE_TOKENS['4'], // 16px default
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
  }
);
