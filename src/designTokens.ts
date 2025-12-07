/**
 * Centralized Design Tokens for TeamTrainer
 * All colors, gradients, and design values used across the app
 */

// Brand Colors - Primary palette (purple/indigo theme)
export const brand = {
  primary: {
    main: '#6366f1',      // Indigo
    light: '#818cf8',     // Light Indigo
    dark: '#4f46e5',      // Dark Indigo
    darker: '#3730a3',    // Darker Indigo
  },
  secondary: {
    main: '#8b5cf6',      // Purple
    light: '#a78bfa',     // Light Purple
    dark: '#7c3aed',      // Dark Purple
  },
  accent: {
    main: '#a855f7',      // Violet
    light: '#c084fc',     // Light Violet
    dark: '#9333ea',      // Dark Violet
  },
};

// Background Colors
export const backgrounds = {
  // Dark theme backgrounds
  dark: {
    primary: '#0a0a0a',      // Main background
    secondary: '#050505',    // Footer/darker areas
    elevated: '#0f0f0f',     // Slightly elevated surfaces
    card: 'rgba(255,255,255,0.03)',  // Card background
    cardHover: 'rgba(255,255,255,0.05)',  // Card hover
    input: 'rgba(255,255,255,0.05)',  // Input fields
  },
  // Light theme backgrounds (for app interior)
  light: {
    primary: '#f5f5f5',
    secondary: '#ffffff',
    elevated: '#ffffff',
    card: '#ffffff',
  },
};

// Text Colors
export const text = {
  dark: {
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.7)',
    muted: 'rgba(255,255,255,0.5)',
    disabled: 'rgba(255,255,255,0.3)',
  },
  light: {
    primary: '#212121',
    secondary: '#666666',
    muted: '#999999',
    disabled: '#cccccc',
  },
};

// Border Colors
export const borders = {
  dark: {
    subtle: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.2)',
    focus: 'rgba(99,102,241,0.5)',
  },
  light: {
    subtle: 'rgba(0,0,0,0.06)',
    light: 'rgba(0,0,0,0.1)',
    medium: 'rgba(0,0,0,0.2)',
    focus: 'rgba(99,102,241,0.5)',
  },
};

// Gradients
export const gradients = {
  // Brand gradients
  primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  primaryHover: 'linear-gradient(135deg, #5558e8 0%, #7c4fe0 100%)',

  // Text gradients
  textShine: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #ffffff 100%)',

  // Background gradients for sections
  darkSection: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(15,12,22,1) 100%)',
  darkSectionReverse: 'linear-gradient(180deg, rgba(15,12,22,1) 0%, rgba(10,10,10,1) 100%)',

  // Glow effects
  purpleGlow: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',

  // CTA gradient
  cta: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',

  // Footer transition
  footerTransition: 'linear-gradient(180deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 20%, rgba(50,50,70,0.1) 50%, rgba(5,5,5,0) 100%)',
};

// Status Colors
export const status = {
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
};

// Shadow configurations
export const shadows = {
  card: '0 2px 8px rgba(0,0,0,0.1)',
  cardHover: '0 8px 24px rgba(0,0,0,0.15)',
  primaryGlow: '0 4px 12px rgba(99,102,241,0.3)',
  primaryGlowStrong: '0 12px 40px rgba(99,102,241,0.3)',
  button: '0 4px 12px rgba(255,255,255,0.15)',
};

// Blur effects
export const blurs = {
  nav: 'blur(12px) saturate(180%)',
  glass: 'blur(20px)',
};

// Animation/Transition
export const transitions = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
  spring: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Border Radius
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Z-Index scale
export const zIndex = {
  base: 0,
  elevated: 1,
  header: 1100,
  modal: 1300,
  tooltip: 1400,
};

// Spacing scale (in pixels, multiply by 8 for MUI spacing)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Header configuration
export const header = {
  height: 64,
  bgColor: 'rgba(10, 10, 10, 0.7)',
  borderColor: borders.dark.subtle,
  blur: blurs.nav,
};

// Export all tokens as a single object
export const tokens = {
  brand,
  backgrounds,
  text,
  borders,
  gradients,
  status,
  shadows,
  blurs,
  transitions,
  radius,
  zIndex,
  spacing,
  header,
};

export default tokens;
