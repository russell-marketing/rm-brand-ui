// adapters/mui-theme.js
// MUI theme adapter for Russell Marketing brand styles
// Import this in your MUI app to apply RM brand tokens to all MUI components

import { tokens } from '../ui/tokens.js';

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
 */
export function getRMThemeConfig() {
  return {
    // Support for both createTheme and extendTheme
    colorSchemes: {
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
          divider: tokens.border.subtle,
        },
      },
    },

    typography: {
      fontFamily: tokens.fonts.body,
      fontSize: 16, // 1rem base
      h1: {
        fontFamily: tokens.fonts.display,
        fontSize: 'clamp(2rem, 1.5rem + 2vw, 2.5rem)',
        fontWeight: tokens.fontWeight.extrabold,
        letterSpacing: '2px',
        textTransform: 'uppercase',
      },
      h2: {
        fontFamily: tokens.fonts.display,
        fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 1.75rem)',
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
      code: {
        fontFamily: tokens.fonts.mono,
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.regular,
      },
    },

    shape: {
      borderRadius: parseInt(tokens.radius.m),
    },

    // Spacing system from RM tokens (0.25rem per unit)
    spacing: (factor) => `${0.25 * factor}rem`,

    // Extended shadows beyond base config
    shadows: [
      'none',
      tokens.shadow.soft, // RM soft shadow
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
          a: {
            color: tokens.link.default,
            textDecorationOffset: '3px',
            '&:hover': {
              color: tokens.link.hover,
            },
          },
          '*[disabled], *[readonly]': {
            opacity: '0.7 !important',
            cursor: 'not-allowed !important',
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: tokens.fontWeight.semibold,
            borderRadius: tokens.radius.m,
            padding: `8px ${tokens.control.paddingX}`,
            minHeight: tokens.control.height,
          },
          contained: {
            boxShadow: tokens.shadow.soft,
            '&:hover': {
              boxShadow: tokens.shadow.soft,
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
                borderColor: tokens.border.subtle,
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: tokens.text.secondary,
              },
              '&.Mui-focused fieldset': {
                borderColor: tokens.colors.galaxy,
                borderWidth: '2px',
                boxShadow: `0 0 0 1px ${tokens.colors.galaxy}`,
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
              borderColor: tokens.border.subtle,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.text.secondary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.colors.galaxy,
              borderWidth: '2px',
            },
          },
          input: {
            color: tokens.text.primary,
            fontWeight: tokens.fontWeight.regular,
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          select: {
            color: tokens.text.primary,
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
            color: tokens.text.secondary,
            '&.Mui-focused': {
              color: tokens.colors.galaxy,
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
            backgroundColor: tokens.background.surface,
            boxShadow: tokens.shadow.soft,
            borderRadius: tokens.radius.m,
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: tokens.shadow.soft,
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: tokens.shadow.soft,
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
              backgroundColor: tokens.accent[100],
              color: tokens.accent[700],
              '&.MuiChip-clickable:hover': {
                backgroundColor: tokens.accent[200],
              },
            },
          },
          // Explicit overrides for status colors to ensure they use the correct tokens
          colorSuccess: {
            backgroundColor: tokens.status.success.bg,
            color: tokens.status.success.text,
            '&.MuiChip-clickable:hover': {
              backgroundColor: tokens.status.success.border,
            },
          },
          colorWarning: {
            backgroundColor: tokens.status.warning.bg,
            color: tokens.status.warning.text,
            '&.MuiChip-clickable:hover': {
              backgroundColor: tokens.status.warning.border,
            },
          },
          colorError: {
            backgroundColor: tokens.status.danger.bg,
            color: tokens.status.danger.text,
            '&.MuiChip-clickable:hover': {
              backgroundColor: tokens.status.danger.border,
            },
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            fontSize: tokens.fontSize.md,
            fontWeight: tokens.fontWeight.semibold,
            textTransform: 'none',
            color: tokens.text.secondary,
            '&.Mui-selected': {
              color: tokens.colors.galaxy,
              backgroundColor: `rgba(122, 100, 160, 0.05)`,
              fontWeight: tokens.fontWeight.semibold,
            },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: tokens.colors.galaxy,
            height: 3,
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
                backgroundColor: 'rgba(219, 230, 227, 0.3)', // RM Dust at 30%
              },
              '&:hover': {
                backgroundColor: 'rgba(224, 193, 105, 0.2)', // RM Estrella at 20%
                transition: 'background-color 0.2s ease',
              },
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${tokens.border.subtle}`,
          },
        },
      },

      // DataGrid - matches table.css styling for consistency
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${tokens.border.subtle}`,
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
            borderBottom: `1px solid ${tokens.border.subtle}`,
            '&:focus, &:focus-within': {
              outline: `2px solid ${tokens.colors.galaxy}`,
              outlineOffset: '-2px',
            },
          },
          row: {
            '&:nth-of-type(even)': {
              backgroundColor: 'rgba(219, 230, 227, 0.3)', // RM Dust at 30%
            },
            '&:hover': {
              backgroundColor: 'rgba(224, 193, 105, 0.2) !important', // RM Estrella at 20%
              transition: 'background-color 0.2s ease',
            },
          },
          footerContainer: {
            borderTop: `1px solid ${tokens.border.subtle}`,
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
            '& .MuiSlider-thumb': {
              width: tokens.slider.thumbWidth,
              height: tokens.slider.thumbHeight,
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

/**
 * Export tokens directly for custom component styling
 */
export { tokens };
