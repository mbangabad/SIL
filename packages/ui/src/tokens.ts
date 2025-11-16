/**
 * Design Tokens for SIL UI
 *
 * Centralized design system values
 * Used consistently across all UI components
 */

export const tokens = {
  // Colors
  colors: {
    primary: '#0ea5e9',
    background: '#0f172a',
    card: '#1e293b',
    cardHover: '#334155',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',

    // Semantic colors
    correct: '#10b981',
    incorrect: '#ef4444',
    selected: '#0ea5e9',
    disabled: '#475569',

    // Heat gradient (for hot/cold feedback)
    heatCold: '#3b82f6', // Blue
    heatWarm: '#f59e0b', // Orange
    heatHot: '#ef4444', // Red
  },

  // Spacing
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    xxl: '3rem', // 48px
  },

  // Border radius
  radius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    soft: '0 4px 12px rgba(0, 0, 0, 0.2)',
    medium: '0 8px 24px rgba(0, 0, 0, 0.3)',
    hard: '0 12px 36px rgba(0, 0, 0, 0.4)',
  },

  // Typography
  fonts: {
    title: 'var(--font-geometric, sans-serif)',
    body: 'var(--font-body, Inter, sans-serif)',
  },

  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.5rem', // 24px
    xxl: '2rem', // 32px
    xxxl: '3rem', // 48px
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Transitions
  transitions: {
    fast: '180ms ease',
    medium: '300ms ease',
    slow: '500ms ease',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    modal: 20,
    tooltip: 30,
    toast: 40,
  },

  // Breakpoints (for responsive design)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type Tokens = typeof tokens;

/**
 * Helper to get a token value by path
 * Example: getToken('colors.primary') → '#0ea5e9'
 */
export function getToken(path: string): any {
  const keys = path.split('.');
  let value: any = tokens;

  for (const key of keys) {
    value = value?.[key];
  }

  return value;
}
