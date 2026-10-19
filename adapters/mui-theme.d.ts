// adapters/mui-theme.d.ts
// Types for the MUI theme adapter, including the theme's own Typography
// variants, so `<Typography variant="appTitle">` type-checks in TS apps.
import type { ThemeOptions } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export function getRMThemeConfig(): ThemeOptions;
export { tokens } from '../ui/tokens.js';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    lead: CSSProperties;
    stat: CSSProperties;
    appTitle: CSSProperties;
  }
  interface TypographyVariantsOptions {
    lead?: CSSProperties;
    stat?: CSSProperties;
    appTitle?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    lead: true;
    stat: true;
    appTitle: true;
  }
}
