import {
  COLOR_TOKENS_DARK,
  COLOR_TOKENS_LIGHT,
  ColorTokens,
} from "../tokens/colors";

// #region Helpers

function getThemeValues<T extends Record<string, string>>(
  colorTokens: ColorTokens,
  theme: T,
): T {
  const themeValues: Record<string, string> = {};

  Object.entries(theme).forEach(([key, value]) => {
    themeValues[key] = colorTokens[value as keyof ColorTokens];
  });

  return themeValues as T;
}

// #endregion

type BaseTheme = Record<keyof typeof BASE_THEME, string>;
type CustomTheme = Record<keyof typeof COLOR_TOKENS_LIGHT, string>;

type FullTheme = BaseTheme & CustomTheme;

/**
 * Dictionary of base theme values.
 *
 * @key - theme key witch value is used in tamagui components by default.
 * @value - color token key.
 */
const BASE_THEME = {
  background: "base",
  backgroundHover: "base-700",
  backgroundPress: "base-500",
  backgroundFocus: "base",

  color: "base-contrast",
  colorHover: "base-1100",
  colorPress: "base-contrast",
  colorFocus: "base-1100",
  placeholderColor: "neutral-300",

  borderColor: "base-contrast",
  borderColorHover: "base-contrast",
  borderColorFocus: "base-contrast",
  borderColorPress: "base-contrast",

  outlineColor: "base-contrast",

  shadowColor: "neutral",
  shadowColorHover: "neutral",
  shadowColorPress: "neutral-700",
  shadowColorFocus: "neutral-700",
} as const;

export const LIGHT_THEME: FullTheme = {
  ...getThemeValues(COLOR_TOKENS_LIGHT, BASE_THEME),
  ...COLOR_TOKENS_LIGHT,
  placeholderColor: "neutral-900",
};

export const DARK_THEME: FullTheme = {
  ...getThemeValues(COLOR_TOKENS_DARK, BASE_THEME),
  ...COLOR_TOKENS_DARK,
  placeholderColor: "neutral-300",
};
