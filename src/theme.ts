import { createTheme, ThemeOptions } from '@mui/material/styles';
import type { TeamBranding } from './types/teamSettings';
import { brand, backgrounds, text, status, radius, shadows } from './designTokens';

// Points System Category Colors
export const pointsCategoryColors = {
  light: '#90caf9',      // Light Blue
  moderate: '#ffa726',   // Orange
  team: '#ab47bc',       // Purple
  intensive: '#ef5350',  // Red
};

// Workout/Session Type Colors
export const workoutTypeColors = {
  coach: '#4caf50',      // Green for coach/team workouts
  player: '#ffc107',     // Yellow for player/free sessions
  team: '#ff9800',       // Orange for team sessions
  personal: '#9c27b0',   // Purple for personal sessions
};

// Base theme options shared between light and dark
const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: radius.md,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
        },
        '*': {
          boxSizing: 'border-box',
          // Custom scrollbar styles for Webkit browsers (Chrome, Safari, Edge)
          '&::-webkit-scrollbar': {
            width: '10px',
            height: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(180deg, ${brand.primary.main} 0%, ${brand.primary.dark} 100%)`,
            borderRadius: '10px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: `linear-gradient(180deg, ${brand.primary.light} 0%, ${brand.primary.main} 100%)`,
              border: '2px solid rgba(255, 255, 255, 0.2)',
            },
            '&:active': {
              background: brand.primary.dark,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          boxShadow: shadows.card,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radius.xs,
          },
        },
      },
    },
  },
};

/**
 * Create dark theme for public pages (landing, auth, etc.)
 */
export function createDarkTheme(): ReturnType<typeof createTheme> {
  return createTheme({
    ...baseThemeOptions,
    palette: {
      mode: 'dark',
      primary: {
        main: brand.primary.main,
        light: brand.primary.light,
        dark: brand.primary.dark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: brand.secondary.main,
        light: brand.secondary.light,
        dark: brand.secondary.dark,
        contrastText: '#ffffff',
      },
      background: {
        default: backgrounds.dark.primary,
        paper: backgrounds.dark.elevated,
      },
      text: {
        primary: text.dark.primary,
        secondary: text.dark.secondary,
      },
      success: {
        main: status.success.main,
        light: status.success.light,
        dark: status.success.dark,
      },
      warning: {
        main: status.warning.main,
        light: status.warning.light,
        dark: status.warning.dark,
      },
      error: {
        main: status.error.main,
        light: status.error.light,
        dark: status.error.dark,
      },
      info: {
        main: status.info.main,
        light: status.info.light,
        dark: status.info.dark,
      },
      grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
    },
    components: {
      ...baseThemeOptions.components,
      MuiCssBaseline: {
        styleOverrides: {
          ...baseThemeOptions.components?.MuiCssBaseline?.styleOverrides,
          '*': {
            boxSizing: 'border-box',
            // Custom scrollbar styles for dark theme
            '&::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: `linear-gradient(180deg, ${brand.primary.main} 0%, ${brand.primary.dark} 100%)`,
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: `linear-gradient(180deg, ${brand.primary.light} 0%, ${brand.primary.main} 100%)`,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `0 0 8px ${brand.primary.main}`,
              },
              '&:active': {
                background: brand.primary.dark,
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            backgroundColor: backgrounds.dark.card,
            border: '1px solid rgba(255,255,255,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.sm,
            padding: '10px 24px',
            transition: 'all 0.2s ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: shadows.button,
            },
          },
          outlined: {
            borderColor: 'rgba(255,255,255,0.3)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: radius.xs,
              backgroundColor: '#14141a',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.35)',
              },
              '&.Mui-focused fieldset': {
                borderColor: brand.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-focused': {
                color: brand.primary.light,
              },
              '&.MuiInputLabel-shrink': {
                color: 'rgba(255,255,255,0.9)',
              },
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.5)',
                opacity: 1,
              },
              '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                WebkitBoxShadow: '0 0 0 100px #14141a inset !important',
                WebkitTextFillColor: '#ffffff !important',
              },
            },
            '& .MuiFormHelperText-root': {
              color: 'rgba(255,255,255,0.6)',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: radius.xs,
          },
          outlined: {
            backgroundColor: 'rgba(20,20,25,0.8)',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: 'rgba(255,255,255,0.7)',
            '&.Mui-focused': {
              color: brand.primary.light,
            },
            '&.MuiInputLabel-shrink': {
              color: 'rgba(255,255,255,0.9)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.xs,
            backgroundColor: '#14141a',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.35)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: brand.primary.main,
            },
          },
          input: {
            '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
              WebkitBoxShadow: '0 0 0 100px #14141a inset !important',
              WebkitTextFillColor: '#ffffff !important',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1).toUpperCase();
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
    (G > 0 ? G : 0) * 0x100 +
    (B > 0 ? B : 0))
    .toString(16).slice(1).toUpperCase();
}

/**
 * Create dynamic theme based on branding configuration (for app interior)
 * Keeps the light theme for the main app experience
 */
export function createDynamicTheme(branding?: TeamBranding): ReturnType<typeof createTheme> {
  const primaryColor = branding?.primaryColor || brand.primary.main;
  const secondaryColor = branding?.secondaryColor || brand.secondary.main;
  const primaryLight = lightenColor(primaryColor, 20);
  const primaryDark = darkenColor(primaryColor, 20);

  return createTheme({
    ...baseThemeOptions,
    palette: {
      mode: 'light',
      primary: {
        main: primaryColor,
        light: primaryLight,
        dark: primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryColor,
        light: brand.secondary.light,
        dark: brand.secondary.dark,
        contrastText: '#ffffff',
      },
      background: {
        default: backgrounds.light.primary,
        paper: backgrounds.light.secondary,
      },
      text: {
        primary: text.light.primary,
        secondary: text.light.secondary,
      },
      success: {
        main: status.success.main,
      },
      warning: {
        main: status.warning.main,
      },
      error: {
        main: status.error.main,
      },
    },
    components: {
      ...baseThemeOptions.components,
      MuiCssBaseline: {
        styleOverrides: {
          ...baseThemeOptions.components?.MuiCssBaseline?.styleOverrides,
          '*': {
            boxSizing: 'border-box',
            // Custom scrollbar with dynamic primary color
            '&::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryDark} 100%)`,
              borderRadius: '10px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: `linear-gradient(180deg, ${primaryLight} 0%, ${primaryColor} 100%)`,
                border: '2px solid rgba(255, 255, 255, 0.2)',
              },
              '&:active': {
                background: primaryDark,
              },
            },
          },
        },
      },
    },
  });
}

// Default themes
export const darkTheme = createDarkTheme();
export const theme = createDynamicTheme();

// Export for backwards compatibility
export default theme;
