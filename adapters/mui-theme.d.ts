// adapters/mui-theme.d.ts
// Types for the MUI theme adapter, including the theme's own Typography
// variants, so `<Typography variant="appTitle">` type-checks in TS apps.
import type { ThemeOptions } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export function getRMThemeConfig(): ThemeOptions;
export { tokens } from '../ui/tokens.js';

type AccentRamp = { 50: string; 100: string; 200: string; 300: string; 600: string; 700: string };
type CodeColours = { bg: string; text: string; border: string };

declare module '@mui/material/styles' {
  interface TypographyVariants {
    lead: CSSProperties;
    stat: CSSProperties;
    appTitle: CSSProperties;
    code: CSSProperties;
    codeSm: CSSProperties;
  }
  interface TypographyVariantsOptions {
    lead?: CSSProperties;
    stat?: CSSProperties;
    appTitle?: CSSProperties;
    code?: CSSProperties;
    codeSm?: CSSProperties;
  }
  interface Palette {
    accent: AccentRamp;
    code: CodeColours;
  }
  interface PaletteOptions {
    accent?: AccentRamp;
    code?: CodeColours;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    lead: true;
    stat: true;
    appTitle: true;
    code: true;
    codeSm: true;
  }
}
