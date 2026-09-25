// ui/tokens.d.ts - TypeScript definitions for design tokens

export interface Tokens {
  fonts: {
    display: string;
    body: string;
    mono: string;
  };

  colors: {
    infinite: string;
    moon: string;
    space: string;
    galaxy: string;
    dust: string;
    estrella: string;
    space70: string;
  };

  text: {
    primary: string;
    secondary: string;
  };

  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  spacing: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    [key: number]: string;
  };

  component: {
    sliderLabelGap: string;
    sliderThumbSize: string;
    sliderTrackHeight: string;
    sliderContainerPadding: string;
  };

  slider: {
    marginTop: string;
    marginBottom: string;
    paddingLeft: string;
    paddingRight: string;
    thumbWidth: string;
    thumbHeight: string;
    thumbBackgroundColor: string;
    thumbHoverBoxShadow: string;
    thumbFocusBoxShadow: string;
    trackHeight: string;
    trackBackgroundColor: string;
    trackBorder: string;
    railHeight: string;
    railBackgroundColor: string;
    railOpacity: number;
    valueLabelBackgroundColor: string;
    valueLabelBorderRadius: string;
    valueLabelPadding: string;
  };

  fontWeight: {
    regular: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };

  letterSpacing: {
    caps: string;
  };

  link: {
    default: string;
    hover: string;
    visited: string;
  };

  border: {
    subtle: string;
    default: string;
  };

  background: {
    surface: string;
    hover: string;
  };

  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    [key: number]: string;
  };

  status: {
    success: {
      bg: string;
      text: string;
      border: string;
    };
    warning: {
      bg: string;
      text: string;
      border: string;
    };
    danger: {
      bg: string;
      text: string;
      border: string;
    };
    info: {
      bg: string;
      text: string;
      border: string;
    };
  };

  scores: {
    high: {
      bg: string;
      text: string;
      border: string;
    };
    medium: {
      bg: string;
      text: string;
      border: string;
    };
    low: {
      bg: string;
      text: string;
      border: string;
    };
  };

  radius: {
    s: string;
    m: string;
  };

  control: {
    height: string;
    paddingX: string;
  };

  shadow: {
    soft: string;
  };

  tint: {
    dust12: string;
  };

  /** WCAG 2.5.8 minimum (24px) and 2.5.5 enhanced (44px) hit targets. */
  hitTarget: {
    min: string;
    ideal: string;
  };

  motion: {
    ease: string;
  };

  /** Toasts sit above modals so alerts are never buried. */
  zIndex: {
    sticky: number;
    dropdown: number;
    modal: number;
    toast: number;
  };

  /** Component surfaces that must respond to theme. See DarkTokens. */
  surfaces: {
    tooltipBorder: string;
    skeletonBase: string;
    skeletonSheen: string;
    tableRowAlt: string;
    tableRowHover: string;
  };

  charts: {
    background: string;
    gradient: {
      start: string;
      mid: string;
      end: string;
    };
    bar: string;
    barEmphasis: string;
    barMuted: string;
    benchmark: string;
    categorical: string[];
    llm: {
      claude: string;
      gpt: string;
      llama: string;
      gemini: string;
      mistral: string;
      copilot: string;
      perplexity: string;
      huggingface: string;
      default: string;
      [key: string]: string;
    };
  };
}

/** Dark-theme overrides. Mirrors the --rm-dark-* block in ui/dark.css. */
export interface DarkTokens {
  background: { page: string; surface: string };
  text: { primary: string; secondary: string };
  border: { subtle: string };
  shadow: { soft: string };
  accent: {
    50: string; 100: string; 200: string; 300: string;
    600: string; 700: string;
    [key: number]: string;
  };
  link: { default: string; hover: string };
  tint: { dust12: string };
  status: {
    success: { bg: string; text: string; border: string };
    warning: { bg: string; text: string; border: string };
    danger:  { bg: string; text: string; border: string };
  };
  surfaces: {
    tooltipBorder: string;
    skeletonBase: string;
    skeletonSheen: string;
    tableRowAlt: string;
    tableRowHover: string;
  };
}

export const tokens: Tokens;
export const darkTokens: DarkTokens;

/** Reads a CSS custom property off :root. Returns '' outside the browser. */
export function getCSSVar(varName: string): string;
