// adapters/mui-theme.js
// MUI theme adapter for Russell Marketing brand styles
// Import this in your MUI app to apply RM brand tokens to all MUI components

import { tokens, darkTokens } from '../ui/tokens.js';

// A colour that follows the page's theme: the system's CSS variable, with
// the light value as fallback for an app that hasn't loaded the tokens.
// With /layout and /dark loaded, these flip with the theme (data-theme),
// and the theme's own dark scheme (below) keeps MUI's palette in step.
const v = (name, fallback) => `var(${name}, ${fallback})`;

/**
 * Creates a Material-UI theme configuration using RM brand tokens
 *
 * Usage:
 * ```jsx
 * import { createTheme } from '@mui/material/styles';
 * import { getRMThemeConfig } from '@russell-marketing/brand-ui/adapters/mui-theme';
 *
 * const theme = createTheme(getRMThemeConfig());
 * ```
 *
 * Dark mode (RULES.md rule 7) is opt-in, so an app turns it on once its own
 * colours come from the theme and tokens:
 *
 * ```jsx
 * import '@russell-marketing/brand-ui/layout';
 * import '@russell-marketing/brand-ui/dark';
 * const theme = extendTheme(getRMThemeConfig({ dark: true }));
 * ```
 *
 * The theme then follows the device's setting, and marks the page with
 * data-theme="light" | "dark" so the system's CSS variables (layout classes,
 * var(--…) in sx) switch with it.
 */
export function getRMThemeConfig({ dark = false } = {}) {
  return {
    // Support for both createTheme and extendTheme
    ...(dark ? {
      // extendTheme reads colorSchemeSelector; createTheme reads cssVariables.
      colorSchemeSelector: '[data-theme="%s"]',
      cssVariables: { colorSchemeSelector: '[data-theme="%s"]' },
    } : {}),
    colorSchemes: {
      ...(dark ? { dark: { palette: darkPalette() } } : {}),
      light: {
        palette: {
          primary: {
            main: tokens.colors.galaxy,
            dark: tokens.accent[700],
            light: tokens.accent[200],
            contrastText: tokens.colors.moon,
          },
          secondary: {
            main: tokens.colors.space,
            contrastText: tokens.colors.moon,
          },
          background: {
            default: tokens.background.page,
            paper: tokens.background.surface,
          },
          text: {
            primary: tokens.text.primary,
            secondary: tokens.text.secondary,
          },
          error: {
            main: tokens.status.danger.bg,
            dark: tokens.status.danger.text,
            contrastText: tokens.status.danger.text, // Text color for Chip component
          },
          warning: {
            main: tokens.status.warning.bg,
            dark: tokens.status.warning.text,
            contrastText: tokens.status.warning.text, // Text color for Chip component
          },
          success: {
            main: tokens.status.success.bg,
            dark: tokens.status.success.text,
            contrastText: tokens.status.success.text, // Text color for Chip component
          },
          link: {
            main: tokens.link.default,
            hover: tokens.link.hover,
          },
          // The accent ramp, for tints and emphasis: palette.accent[100] etc.
          accent: { ...tokens.accent },
          // Code blocks and inline code; matches .code / .code-block.
          code: { ...tokens.code },
          divider: tokens.border.subtle,
        },
      },
    },

    typography: {
      fontFamily: tokens.fonts.body,
      fontSize: 16, // 1rem base
      // Sizes come from the type scale (RULES.md rule 5), fixed rather than
      // growing with the screen, so titles stay in proportion on a phone.
      h1: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize['3xl'],
        fontWeight: tokens.fontWeight.extrabold,
        letterSpacing: '2px',
        textTransform: 'uppercase',
      },
      h2: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize['2xl'],
        fontWeight: tokens.fontWeight.bold,
      },
      h3: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize.xl,
        fontWeight: tokens.fontWeight.extrabold,
        textTransform: 'uppercase',
        letterSpacing: tokens.letterSpacing.caps,
      },
      h4: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize.lg,
        fontWeight: tokens.fontWeight.bold,
      },
      h5: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize.md,
        fontWeight: tokens.fontWeight.bold,
      },
      h6: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.bold,
      },
      body1: {
        fontFamily: tokens.fonts.body,
        fontSize: tokens.fontSize.md,
        fontWeight: tokens.fontWeight.regular,
      },
      body2: {
        fontFamily: tokens.fonts.body,
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.regular,
      },
      // Lead text: the line under a page title, an intro paragraph.
      lead: {
        fontFamily: tokens.fonts.body,
        fontSize: tokens.fontSize.lg,
        fontWeight: tokens.fontWeight.regular,
      },
      // The app's name in .app-header__title. Matches the CSS version.
      appTitle: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize.md,
        fontWeight: tokens.fontWeight.extrabold,
        letterSpacing: tokens.letterSpacing.caps,
        textTransform: 'uppercase',
        lineHeight: 1.3,
      },
      // A stat card's number. Matches .stat__value.
      stat: {
        fontFamily: tokens.fonts.display,
        fontSize: tokens.fontSize['2xl'],
        fontWeight: tokens.fontWeight.extrabold,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
      },
      button: {
        fontFamily: tokens.fonts.body,
        fontSize: tokens.fontSize.md,
        fontWeight: tokens.fontWeight.semibold,
        textTransform: 'none',
      },
      caption: {
        fontSize: tokens.fontSize.xs,
        fontWeight: tokens.fontWeight.regular,
      },
      // Code, keys and IDs in the device's own monospace font: 14px, and
      // 12px (codeSm) for dense tables and logs.
      code: {
        fontFamily: tokens.fonts.mono,
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.regular,
      },
      codeSm: {
        fontFamily: tokens.fonts.mono,
        fontSize: tokens.fontSize.xs,
        fontWeight: tokens.fontWeight.regular,
      },
    },

    shape: {
      borderRadius: parseInt(tokens.radius.m),
    },

    // The system's motion: short UI transitions use its durations and ease.
    // Longer MUI transitions (dialogs, drawers) keep MUI's own durations.
    transitions: {
      easing: {
        easeInOut: tokens.motion.ease,
        easeOut: tokens.motion.ease,
      },
      duration: {
        shortest: parseInt(tokens.motion.durationFast),
        shorter: parseInt(tokens.motion.durationBase),
      },
    },

    // Spacing system from RM tokens (0.25rem per unit)
    spacing: (factor) => `${0.25 * factor}rem`,

    // Extended shadows beyond base config
    shadows: [
      'none',
      v('--shadow-soft', tokens.shadow.soft), // RM soft shadow
      '0 2px 4px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.08)',
      '0 4px 8px rgba(0,0,0,.08), 0 12px 24px rgba(0,0,0,.1)',
      '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
      '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
      '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
      '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
      '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
      '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
      '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
      '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
      '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
      '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
      '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
      '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Not on MUI buttons rendered as links (<Button href>): link colours
          // would win on hover and put dark purple on the button.
          'a:where(:not(.MuiButtonBase-root))': {
            color: v('--link', tokens.link.default),
            textUnderlineOffset: '3px',
            '&:hover': {
              color: v('--link-hover', tokens.link.hover),
            },
          },
          '*[disabled], *[readonly]': {
            opacity: `${tokens.opacity.disabled} !important`,
            cursor: 'not-allowed !important',
          },
        },
      },

      // Icon sizes: fontSize="small" | "medium" (the default) | "large" are
      // 16, 20 and 24px: --icon-sm / --icon-md / --icon-lg.
      MuiSvgIcon: {
        styleOverrides: {
          fontSizeSmall: { fontSize: tokens.iconSize.sm },
          fontSizeMedium: { fontSize: tokens.iconSize.md },
          fontSizeLarge: { fontSize: tokens.iconSize.lg },
        },
      },

      MuiTypography: {
        defaultProps: {
          variantMapping: { lead: 'p', stat: 'p', appTitle: 'p', code: 'code', codeSm: 'code' },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: tokens.fontWeight.semibold,
            borderRadius: tokens.radius.m,
            // The control height, like .btn and a small field: vertical
            // padding plus the text's line height made MUI buttons 46px.
            padding: `0 ${tokens.control.paddingX}`,
            minHeight: tokens.control.height,
            lineHeight: 1.5,
          },
          // Matches .btn--sm: for controls inside table rows.
          sizeSmall: {
            minHeight: tokens.control.heightSm,
            padding: `0 ${tokens.control.paddingXSm}`,
            fontSize: tokens.fontSize.sm,
          },
          contained: {
            boxShadow: v('--shadow-soft', tokens.shadow.soft),
            '&:hover': {
              boxShadow: v('--shadow-soft', tokens.shadow.soft),
            },
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: tokens.radius.m,
              '& fieldset': {
                borderColor: v('--border-subtle', tokens.border.subtle),
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: v('--text-secondary', tokens.text.secondary),
              },
              // A border only: a box-shadow here would ignore the gap MUI
              // leaves for the floating label and draw a line through it.
              '&.Mui-focused fieldset': {
                borderColor: tokens.colors.galaxy,
                borderWidth: '2px',
              },
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: v('--border-subtle', tokens.border.subtle),
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: v('--text-secondary', tokens.text.secondary),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.colors.galaxy,
              borderWidth: '2px',
            },
          },
          input: {
            color: v('--text-primary', tokens.text.primary),
            fontWeight: tokens.fontWeight.regular,
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          select: {
            color: v('--text-primary', tokens.text.primary),
            fontWeight: tokens.fontWeight.regular,
            backgroundColor: 'transparent',
          },
        },
      },

      MuiInput: {
        styleOverrides: {
          root: {
            '&.Mui-focused': {
              outline: `2px solid ${tokens.colors.galaxy}`,
              outlineOffset: '1px',
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: v('--text-secondary', tokens.text.secondary),
            // Galaxy in light; the light accent in dark, where Galaxy as text
            // is too dark to read.
            '&.Mui-focused': {
              color: v('--accent-600', tokens.accent[600]),
            },
          },
          outlined: {
            backgroundColor: 'transparent',
            '&.MuiInputLabel-shrink': {
              backgroundColor: 'transparent',
            },
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: tokens.fontSize.md,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: v('--bg-surface', tokens.background.surface),
            boxShadow: v('--shadow-soft', tokens.shadow.soft),
            borderRadius: tokens.radius.m,
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: v('--shadow-soft', tokens.shadow.soft),
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: v('--shadow-soft', tokens.shadow.soft),
            borderRadius: tokens.radius.m,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.s,
            fontWeight: tokens.fontWeight.semibold,
          },
          filled: {
            // Only set background for default color when NOT overridden by sx
            // Using :not([style*="background"]) selector to allow sx overrides
            '&.MuiChip-colorDefault:not([style*="background"])': {
              backgroundColor: v('--accent-surface', tokens.accent[100]),
              color: v('--accent-ink', tokens.accent[700]),
              '&.MuiChip-clickable:hover': {
                backgroundColor: v('--accent-200', tokens.accent[200]),
              },
            },
          },
          // Matches .badge--neutral: present, not asking for attention.
          outlined: {
            '&.MuiChip-colorDefault': {
              borderColor: v('--border-subtle', tokens.border.subtle),
              color: v('--text-secondary', tokens.text.secondary),
            },
          },
          // Explicit overrides for status colors to ensure they use the correct tokens
          colorSuccess: {
            backgroundColor: v('--success-bg', tokens.status.success.bg),
            color: v('--success-text', tokens.status.success.text),
            '&.MuiChip-clickable:hover': {
              backgroundColor: v('--success-border', tokens.status.success.border),
            },
          },
          colorWarning: {
            backgroundColor: v('--warning-bg', tokens.status.warning.bg),
            color: v('--warning-text', tokens.status.warning.text),
            '&.MuiChip-clickable:hover': {
              backgroundColor: v('--warning-border', tokens.status.warning.border),
            },
          },
          colorError: {
            backgroundColor: v('--danger-bg', tokens.status.danger.bg),
            color: v('--danger-text', tokens.status.danger.text),
            '&.MuiChip-clickable:hover': {
              backgroundColor: v('--danger-border', tokens.status.danger.border),
            },
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            whiteSpace: 'nowrap',
            fontSize: tokens.fontSize.md,
            fontWeight: tokens.fontWeight.semibold,
            textTransform: 'none',
            color: v('--text-secondary', tokens.text.secondary),
            '&.Mui-selected': {
              color: v('--accent-600', tokens.accent[600]),
              backgroundColor: v('--accent-50', tokens.accent[50]),
              fontWeight: tokens.fontWeight.semibold,
            },
          },
          // MUI makes a tab with an icon 72px tall, for an icon above the
          // label. With the icon beside the label it only needs the normal
          // height; an icon above still grows the tab to fit.
          labelIcon: {
            minHeight: 48,
          },
        },
      },

      // Tab bars scroll sideways when the tabs don't fit; they are never
      // squeezed to share the width (RULES.md rule 13).
      MuiTabs: {
        defaultProps: {
          variant: 'scrollable',
          scrollButtons: 'auto',
          allowScrollButtonsMobile: true,
        },
        styleOverrides: {
          indicator: {
            backgroundColor: tokens.colors.galaxy,
            height: 3,
          },
          // A scroll arrow with nothing to scroll to is dimmed, not hidden:
          // hidden, it still holds its place and reads as a stray gap.
          scrollButtons: {
            '&.Mui-disabled': { opacity: 0.3 },
          },
        },
      },

      // Matches .choices: separate buttons with a gap, exactly one chosen,
      // marked with the accent tint. The group wraps rather than running off
      // a phone screen, so buttons don't share borders: joined buttons lose
      // their edges when they wrap onto a second row.
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            flexWrap: 'wrap',
            maxWidth: '100%',
            gap: tokens.spacing[2],
          },
          ...Object.fromEntries(['firstButton', 'middleButton', 'lastButton'].map((key) => [key, {
            marginLeft: 0,
            border: `1px solid ${v('--border-subtle', tokens.border.subtle)}`,
            borderRadius: tokens.radius.s,
            '&.Mui-selected': { borderColor: v('--accent-600', tokens.accent[600]) },
          }])),
        },
      },

      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: tokens.fontWeight.semibold,
            color: v('--text-secondary', tokens.text.secondary),
            borderColor: v('--border-subtle', tokens.border.subtle),
            '&.Mui-selected, &.Mui-selected:hover': {
              backgroundColor: v('--accent-surface', tokens.accent[100]),
              color: v('--accent-ink', tokens.accent[700]),
              borderColor: v('--accent-600', tokens.accent[600]),
            },
          },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              textTransform: 'uppercase',
              letterSpacing: tokens.letterSpacing.caps,
              fontWeight: tokens.fontWeight.extrabold,
              backgroundColor: tokens.colors.space,
              color: tokens.colors.moon,
              borderBottom: `2px solid ${tokens.colors.galaxy}`,
            },
          },
        },
      },

      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              '&:nth-of-type(even)': {
                backgroundColor: v('--table-row-alt', tokens.surfaces.tableRowAlt),
              },
              '&:hover': {
                backgroundColor: v('--table-row-hover', tokens.surfaces.tableRowHover),
                transition: 'background-color 0.2s ease',
              },
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${v('--border-subtle', tokens.border.subtle)}`,
          },
          // Matches .table--compact.
          sizeSmall: {
            padding: `${tokens.spacing[2]} ${tokens.table.cellPadX}`,
          },
        },
      },

      // Matches ui/components/rating.css. Galaxy, never Estrella (under 3:1).
      MuiRating: {
        styleOverrides: {
          iconFilled: { color: v('--rating-on', tokens.rating.on) },
          iconHover: { color: v('--rating-on', tokens.rating.on) },
          iconEmpty: { color: v('--rating-off', tokens.rating.off) },
        },
      },

      // DataGrid - matches table.css styling for consistency
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${v('--border-subtle', tokens.border.subtle)}`,
            borderRadius: '10px',
            fontFamily: tokens.fonts.body,
          },
          columnHeaders: {
            backgroundColor: tokens.colors.space,
            borderBottom: `2px solid ${tokens.colors.galaxy}`,
            minHeight: '48px !important',
            maxHeight: '48px !important',
          },
          columnHeader: {
            backgroundColor: tokens.colors.space,
            color: tokens.colors.moon,
            fontFamily: tokens.fonts.display,
            fontWeight: tokens.fontWeight.extrabold,
            textTransform: 'uppercase',
            letterSpacing: tokens.letterSpacing.caps,
            fontSize: tokens.fontSize.sm,
            '&:focus, &:focus-within': {
              outline: `2px solid ${tokens.colors.galaxy}`,
              outlineOffset: '-2px',
            },
          },
          columnHeaderTitle: {
            fontFamily: tokens.fonts.display,
            fontWeight: tokens.fontWeight.extrabold,
          },
          columnSeparator: {
            color: tokens.colors.galaxy,
          },
          cell: {
            borderBottom: `1px solid ${v('--border-subtle', tokens.border.subtle)}`,
            '&:focus, &:focus-within': {
              outline: `2px solid ${tokens.colors.galaxy}`,
              outlineOffset: '-2px',
            },
          },
          row: {
            '&:nth-of-type(even)': {
              backgroundColor: v('--table-row-alt', tokens.surfaces.tableRowAlt),
            },
            '&:hover': {
              backgroundColor: `${v('--table-row-hover', tokens.surfaces.tableRowHover)} !important`,
              transition: `background-color ${tokens.motion.durationBase} ${tokens.motion.ease}`,
            },
          },
          footerContainer: {
            borderTop: `1px solid ${v('--border-subtle', tokens.border.subtle)}`,
          },
        },
      },

      // Slider - maps RM brand tokens to MUI's Slider component
      MuiSlider: {
        styleOverrides: {
          root: {
            height: tokens.slider.trackHeight,
            // Do NOT put horizontal padding on the Slider root. MUI's rail, track,
            // and thumb are absolutely positioned against the root's PADDING box, so
            // horizontal padding shifts them right and overflows the container (the
            // rail keeps width:100% but starts at the padding-left offset). To give a
            // slider breathing room, pad/margin a wrapper around it instead.
            padding: 0,
            boxSizing: 'border-box',
            // Inset by half a thumb with margin (not padding), so the end
            // handles sit inside the slider's own box and line up with the
            // fields around it. Block, not inline-block, so it doesn't sit on
            // a line of text and gain space above and below.
            '&:not(.MuiSlider-vertical)': {
              display: 'block',
              marginInline: `calc(${tokens.slider.thumbWidth} / 2)`,
              width: `calc(100% - ${tokens.slider.thumbWidth})`,
            },
            '& .MuiSlider-thumb': {
              width: tokens.slider.thumbWidth,
              height: tokens.slider.thumbHeight,
              // MUI's invisible touch area is 42px, which reaches past a
              // phone's 16px page edge and widens the page. The system's
              // minimum hit target (24px) stays inside it.
              '&::after': {
                width: tokens.hitTarget.min,
                height: tokens.hitTarget.min,
              },
              backgroundColor: tokens.slider.thumbBackgroundColor,
              '&:hover': {
                boxShadow: tokens.slider.thumbHoverBoxShadow,
              },
              '&.Mui-focusVisible': {
                boxShadow: tokens.slider.thumbFocusBoxShadow,
              },
            },
            '& .MuiSlider-track': {
              backgroundColor: tokens.slider.trackBackgroundColor,
              border: tokens.slider.trackBorder,
              height: tokens.slider.trackHeight,
            },
            '& .MuiSlider-rail': {
              backgroundColor: tokens.slider.railBackgroundColor,
              opacity: tokens.slider.railOpacity,
              height: tokens.slider.railHeight,
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: tokens.slider.valueLabelBackgroundColor,
              borderRadius: tokens.slider.valueLabelBorderRadius,
              padding: tokens.slider.valueLabelPadding,
            },
          },
        },
      },
    },
  };
}

// The dark scheme's palette, from darkTokens. Primary is the light accent
// (Galaxy itself is too dark to read as text or an outline on the dark
// page), with dark text on it; secondary is Russell, which keeps Moon text
// readable.
function darkPalette() {
  return {
    primary: {
      main: darkTokens.accent[600],
      dark: darkTokens.accent[700],
      light: darkTokens.accent[300],
      contrastText: tokens.colors.infinite,
    },
    secondary: {
      main: tokens.colors.russell,
      contrastText: tokens.colors.moon,
    },
    background: {
      default: darkTokens.background.page,
      paper: darkTokens.background.surface,
    },
    text: {
      primary: darkTokens.text.primary,
      secondary: darkTokens.text.secondary,
    },
    error: {
      main: darkTokens.status.danger.bg,
      dark: darkTokens.status.danger.text,
      contrastText: darkTokens.status.danger.text,
    },
    warning: {
      main: darkTokens.status.warning.bg,
      dark: darkTokens.status.warning.text,
      contrastText: darkTokens.status.warning.text,
    },
    success: {
      main: darkTokens.status.success.bg,
      dark: darkTokens.status.success.text,
      contrastText: darkTokens.status.success.text,
    },
    link: {
      main: darkTokens.link.default,
      hover: darkTokens.link.hover,
    },
    accent: { ...darkTokens.accent },
    code: { ...darkTokens.code },
    divider: darkTokens.border.subtle,
  };
}

/**
 * Export tokens directly for custom component styling
 */
export { tokens, darkTokens };
