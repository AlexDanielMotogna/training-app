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
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          boxShadow: shadows.card,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radius.md,
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
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            backgroundColor: backgrounds.dark.card,
            border: '1px solid rgba(255,255,255,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
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
              borderRadius: radius.md,
              backgroundColor: 'rgba(255,255,255,0.05)',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: brand.primary.main,
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255,255,255,0.7)',
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          outlined: {
            backgroundColor: 'rgba(255,255,255,0.05)',
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
 * Create dynamic theme based on branding configuration (for app interior)
 * Keeps the light theme for the main app experience
 */
export function createDynamicTheme(branding?: TeamBranding): ReturnType<typeof createTheme> {
  const primaryColor = branding?.primaryColor || brand.primary.main;
  const secondaryColor = branding?.secondaryColor || brand.secondary.main;

  return createTheme({
    ...baseThemeOptions,
    palette: {
      mode: 'light',
      primary: {
        main: primaryColor,
        light: brand.primary.light,
        dark: brand.primary.dark,
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
  });
}

// Default themes
export const darkTheme = createDarkTheme();
export const theme = createDynamicTheme();

// Export for backwards compatibility
export default theme;
