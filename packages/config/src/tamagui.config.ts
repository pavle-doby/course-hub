import { defaultConfig } from '@tamagui/config/v5';
import { createTamagui } from 'tamagui';
import { bodyFont, headingFont } from './fonts';
import { animationsApp } from './animationsApp';
import { MEDIA_QUERIES } from './tokens/media-queries';
import { DARK_THEME, LIGHT_THEME } from './theme';
import { CUSTOM_TOKENS } from './tokens';

export const config = createTamagui({
  ...defaultConfig,
  animations: animationsApp,
  tokens: { ...CUSTOM_TOKENS },
  themes: {
    light: LIGHT_THEME,
    dark: DARK_THEME,
  },
  media: {
    ...MEDIA_QUERIES,
  },
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
    disableRootThemeClass: true,
  },
});

export type Conf = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}
