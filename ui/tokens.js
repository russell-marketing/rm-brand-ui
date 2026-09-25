// ui/tokens.js - Design tokens as JavaScript for framework integration
// This file exports the same values as tokens.css for use in JS frameworks like MUI

export const tokens = {
  // Fonts
  fonts: {
    display: '"Raleway", "Roboto", sans-serif',
    body: '"Roboto", "Segoe UI", -apple-system, system-ui, sans-serif',
    mono: '"Roboto Mono", "Courier New", monospace',
  },

  // Brand base colors
  colors: {
    infinite: '#18191E',    // near-black
    moon: '#F7F8F6',        // near-white
    space: '#2D334D',       // dark blue-gray for headers/emphasis
    galaxy: '#7A64A0',      // primary purple accent
    dust: '#DBE6E3',        // light sage for subtle backgrounds
    estrella: '#E0C169',    // warm gold tint
    space70: '#4D5C7B',     // mid blue-gray between Space and Dust, for fills/tracks
  },

  // Text colors (light mode)
  text: {
    primary: '#18191E',
    secondary: '#4B5163',
  },

  // Type scale
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },

  // Spacing
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
  },

  // Component spacing
  component: {
    sliderLabelGap: '1.5rem',      // Gap between slider label and slider
    sliderThumbSize: '20px',       // Slider thumb size
    sliderTrackHeight: '8px',      // Slider track height
    sliderContainerPadding: '2rem', // Horizontal padding to prevent thumb overlap
  },

  // Slider styling (framework-agnostic calculations)
  slider: {
    // Spacing
    marginTop: '1.5rem',           // Space between label and slider
    marginBottom: '1.5rem',        // Space below slider
    paddingLeft: '2rem',           // Left padding to prevent thumb overflow
    paddingRight: '2rem',          // Right padding to prevent thumb overflow

    // Thumb (the draggable circles)
    thumbWidth: '20px',
    thumbHeight: '20px',
    thumbBackgroundColor: '#7A64A0', // RM Galaxy
    thumbHoverBoxShadow: '0 0 0 8px rgba(122, 100, 160, 0.16)',
    thumbFocusBoxShadow: '0 0 0 12px rgba(122, 100, 160, 0.24)',

    // Track (the colored line)
    trackHeight: '8px',
    trackBackgroundColor: '#7A64A0', // RM Galaxy
    trackBorder: 'none',

    // Rail (the gray background line)
    railHeight: '8px',
    railBackgroundColor: '#CDD3DB', // RM border-subtle
    railOpacity: 1,

    // Value label (the popup showing the value)
    valueLabelBackgroundColor: '#7A64A0', // RM Galaxy
    valueLabelBorderRadius: '4px',
    valueLabelPadding: '4px 8px',
  },

  // Font weights
  fontWeight: {
    regular: 400,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Letter spacing
  letterSpacing: {
    caps: '0.5px',
  },

  // Links (light mode)
  link: {
    default: '#5A4286',
    hover: '#4B386F',
  },

  // Surfaces & borders (light mode)
  background: {
    page: '#F6F7F5',
    surface: '#FFFFFF',
  },

  border: {
    subtle: '#CDD3DB',
  },

  shadow: {
    soft: '0 1px 2px rgba(0,0,0,.04), 0 6px 18px rgba(0,0,0,.06)',
  },

  // Border radius
  radius: {
    s: '6px',
    m: '8px',
  },

  // Control sizes
  control: {
    height: '40px',
    paddingX: '14px',
  },

  // Status colors
  status: {
    success: {
      bg: '#E6F4E6',
      text: '#134E13',
      border: '#96C49A',
    },
    warning: {
      bg: '#FFF4E6',
      text: '#7A4900',
      // Lifted from #FFD699 (1.26:1 on warn-bg) to 1.47:1. Note the MUI
      // adapter also uses this as the warning Chip's hover fill.
      border: '#E7C990',
    },
    danger: {
      bg: '#FCE6E8',
      text: '#7E1E26',
      border: '#E7A3AB',
    },
  },

  // Score colors (for opportunity scores, ratings, etc.)
  scores: {
    high: {
      bg: '#E6F4E6',
      text: '#134E13',
      border: '#96C49A',
    },
    medium: {
      bg: '#FFF4E6',
      text: '#7A4900',
      border: '#FFD699',
    },
    low: {
      bg: '#FCE6E8',
      text: '#7E1E26',
      border: '#E7A3AB',
    },
  },

  // Accent ramp (light mode)
  accent: {
    50: '#F2ECF9',
    100: '#E8DEF7',
    200: '#D7CAF2',
    300: '#C2B1EA',
    600: '#7A64A0',
    700: '#5A4286',
  },

  // Neutral tints
  tint: {
    dust12: '#EEF3F1',
  },

  // Hit targets (WCAG 2.5.8 minimum 24px; 2.5.5 enhanced 44px)
  hitTarget: {
    min: '24px',
    ideal: '44px',
  },

  // Motion
  motion: {
    ease: 'cubic-bezier(0.2, 0, 0, 1)',
  },

  // Stacking order. Toasts sit above modals so alerts are never buried.
  zIndex: {
    sticky: 900,
    dropdown: 1000,
    modal: 1100,
    toast: 1200,
  },

  // Component surfaces that must respond to theme (see darkTokens.surfaces)
  surfaces: {
    tooltipBorder: 'rgba(0,0,0,.25)',
    skeletonBase: '#DBE6E3',            // Dust
    skeletonSheen: 'rgba(255,255,255,.60)',
    tableRowAlt: 'rgba(219,230,227,.30)',    // Dust at 30%
    tableRowHover: 'rgba(224,193,105,.20)',  // Estrella at 20%
  },

  // Chart/Data Visualization tokens
  charts: {
    // Background for charts (use Moon on Moon backgrounds, transparent on white)
    background: '#F7F8F6', // Moon

    // Primary gradient for sequential data (pie charts, heatmaps, etc.)
    // Charts can interpolate between these points
    gradient: {
      start: '#2D334D',  // Space - darkest
      mid: '#7A64A0',    // Galaxy - primary purple
      end: '#DBE6E3',    // Dust - lightest
    },

    // Single-series defaults (per brand guide)
    bar: '#7A64A0',           // Galaxy - default bar/column color
    barEmphasis: '#2D334D',   // Space - higher emphasis
    barMuted: '#DBE6E3',      // Dust - lower emphasis
    benchmark: '#E0C169',     // Estrella - benchmark/comparison lines

    // Categorical palette for pie charts & multi-series (10 colors)
    // Brand gradient: Space → Galaxy → Dust (perceptually uniform)
    categorical: [
      '#2D334D',  // Space (start)
      '#3D3E5A',  // Interpolated
      '#5A4286',  // Accent 700
      '#7A64A0',  // Galaxy (mid)
      '#9B85BA',  // Interpolated
      '#B8A7C8',  // Interpolated
      '#C8C5D0',  // Interpolated (purple→sage)
      '#D0D6D4',  // Interpolated
      '#DBE6E3',  // Dust (end)
      '#E8F0ED',  // Lighter dust
    ],

    // LLM/Model-specific colors (official brand colors)
    llm: {
      claude: '#DE7356',    // Anthropic peach
      gpt: '#74AA9C',       // ChatGPT teal
      llama: '#0082FB',     // Meta blue
      gemini: '#4285F4',    // Google blue
      mistral: '#FA520F',   // Mistral orange
      copilot: '#8A50D8',   // Microsoft Copilot purple
      perplexity: '#20808D', // Perplexity teal
      huggingface: '#FFCC00', // Hugging Face yellow
      default: '#2D334D',   // Space - fallback
    },
  },
};

// Dark mode tokens
export const darkTokens = {
  background: {
    page: '#0F1115',
    surface: '#171A22',
  },

  text: {
    primary: '#EDEFF3',
    secondary: '#B7BECA',
  },

  border: {
    subtle: '#30364A',
  },

  shadow: {
    soft: '0 1px 2px rgba(0,0,0,.55), 0 8px 24px rgba(0,0,0,.35)',
  },

  accent: {
    50: '#241F2B',
    100: '#2E2837',
    200: '#3A3250',
    300: '#4D4070',
    600: '#BCA7E0',
    700: '#A894D0',
  },

  // Was #A894D0/#BCA7E0. Realigned to match ui/dark.css, which the CSS
  // side needed for AA on a near-black page.
  link: {
    default: '#BCA7E0',
    hover: '#D7CAF2',
  },

  // Neutral hover tint. The light value is near-white, which put
  // near-white .btn text on a near-white hover (1.03:1).
  tint: {
    dust12: '#232838',
  },

  status: {
    success: {
      bg: '#12301A',
      text: '#9BE0A8',
      border: '#2E6B3C',
    },
    warning: {
      bg: '#33270F',
      text: '#E8C98A',
      border: '#6B5424',
    },
    danger: {
      bg: '#351A1E',
      text: '#F0A8B0',
      border: '#7E3A42',
    },
  },

  surfaces: {
    tooltipBorder: 'rgba(255,255,255,.18)',
    skeletonBase: '#232838',
    skeletonSheen: 'rgba(255,255,255,.08)',
    tableRowAlt: 'rgba(219,230,227,.06)',
    tableRowHover: 'rgba(224,193,105,.14)',
  },
};

// Helper to get CSS variable value
export const getCSSVar = (varName) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return '';
};
