import { COLOR_TOKENS_DARK } from "./colors";
import { RADIUS_TOKENS } from "./radius";
import { SIZE_TOKENS } from "./size";
import { Z_INDEX } from "./z-index";

/**
 * Tokens values are based on tailwindcss values.
 *
 * `true` prop is default value for that token group.
 */
export const CUSTOM_TOKENS = {
  color: {
    ...COLOR_TOKENS_DARK,

    background: COLOR_TOKENS_DARK["base"],
    color: COLOR_TOKENS_DARK["base-contrast"],
  },
  radius: {
    ...RADIUS_TOKENS,
    true: RADIUS_TOKENS.lg, // 8px
  },
  size: {
    ...SIZE_TOKENS,
    true: SIZE_TOKENS[4], // 16px
  },
  space: {
    ...SIZE_TOKENS,
    true: SIZE_TOKENS[4], // 8px
  },
  zIndex: {
    ...Z_INDEX,
  },
};
