import { createLightTheme, createDarkTheme } from '@fluentui/react-components';
import type { BrandVariants, Theme } from '@fluentui/react-components';

/**
 * Custom purple brand ramp matching the Foundry Portal's nextGenForegroundBrand.
 * Base color: #7B5EA7 (Foundry's colorBrandBackground equivalent)
 *
 * Generated to produce a purple palette instead of Fluent's default blue.
 */
const purpleBrand: BrandVariants = {
  10: '#050208',
  20: '#1B0E2E',
  30: '#2D1650',
  40: '#3D1D6D',
  50: '#4C2585',
  60: '#5C2E9E',
  70: '#6B3AB3',
  80: '#7B5EA7',  // Base — matches Foundry
  90: '#8E6FBB',
  100: '#9F82C8',
  110: '#B095D4',
  120: '#C0A8DF',
  130: '#CFBCE9',
  140: '#DDD0F1',
  150: '#EBE4F8',
  160: '#F5F0FC',
};

export const voiceLiveLightTheme: Theme = {
  ...createLightTheme(purpleBrand),
};

export const voiceLiveDarkTheme: Theme = {
  ...createDarkTheme(purpleBrand),
};
