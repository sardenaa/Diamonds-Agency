/**
 * MAS Agency Design System Tokens
 * 
 * Centralized design tokens for colors, spacing, typography, shadows, 
 * border-radii, and animation transitions to ensure complete consistency 
 * across all views, dashboards, and interactive widgets.
 */

export const tokens = {
  // Brand Color Palette & Semantics
  colors: {
    // Primary - Emerald Green
    primary: '#059669', // emerald-600
    primaryLight: '#10b981', // emerald-500
    primaryDark: '#047857', // emerald-700
    primaryBg: 'bg-emerald-600',
    primaryText: 'text-emerald-600',
    primaryBorder: 'border-emerald-600/20',

    // Secondary - Deep Navy
    secondary: '#0f172a', // slate-900
    secondaryLight: '#1e293b', // slate-800
    secondaryDark: '#020617', // slate-950
    secondaryBg: 'bg-slate-900',
    secondaryText: 'text-slate-900',

    // Accent - Luxury Gold
    accent: '#fbbf24', // amber-400
    accentLight: '#fcd34d', // amber-300
    accentDark: '#d97706', // amber-600
    accentBg: 'bg-amber-400',
    accentText: 'text-amber-400',

    // Backgrounds
    background: 'bg-white',
    bgDark: 'bg-slate-950',
    bgMuted: 'bg-slate-50',
    bgCard: 'bg-white',
    bgCardDark: 'bg-slate-900/40',

    // Neutral Scale
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    textLight: 'text-slate-400',
    textOnDark: 'text-white',
    
    // Status Semantics
    success: 'emerald-500',
    warning: 'amber-500',
    error: 'red-500',
    info: 'blue-500',

    // Dynamic combinations
    primaryHover: 'hover:bg-emerald-700 transition-colors',
    secondaryHover: 'hover:bg-slate-800 transition-colors',
    accentHover: 'hover:bg-amber-500 transition-colors',
  },

  // Layout & Component Spacing
  spacing: {
    container: 'max-w-6xl mx-auto px-4 md:px-8',
    containerWide: 'max-w-7xl mx-auto px-4 md:px-8',
    sectionPadding: 'py-12 md:py-20',
    cardPadding: 'p-5 md:p-6',
    flexGap: 'gap-4 md:gap-6',
    gridGap: 'gap-6 md:gap-8',
    innerSpacing: 'space-y-4 md:space-y-6',
  },

  // Unified Typography System
  typography: {
    // Fonts are defined in index.css
    familySans: 'font-sans',
    familySerif: 'font-serif',
    familyMono: 'font-mono',

    // Scale
    heroTitle: 'text-3xl md:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-none',
    sectionTitle: 'text-3xl md:text-4xl font-black font-serif tracking-tight text-slate-900',
    cardTitle: 'text-lg md:text-xl font-bold font-sans tracking-tight text-slate-900',
    subtitle: 'text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-600 block',
    body: 'text-xs md:text-sm text-slate-600 leading-relaxed font-sans font-medium',
    bodyMuted: 'text-xs text-slate-500 leading-relaxed font-sans',
    bodyBold: 'text-xs md:text-sm font-bold text-slate-800 font-sans',
    meta: 'text-[10px] md:text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider',
  },

  // Shadows / Elevations
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md shadow-slate-100/50',
    lg: 'shadow-lg shadow-slate-200/80',
    xl: 'shadow-xl shadow-slate-900/10',
    goldGlow: 'shadow-lg shadow-amber-400/10 border border-amber-400/20',
    emeraldGlow: 'shadow-lg shadow-emerald-600/10 border border-emerald-600/20',
    cardShadow: 'shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300',
  },

  // Border Radii
  borderRadius: {
    card: 'rounded-2xl',
    button: 'rounded-xl',
    input: 'rounded-lg',
    badge: 'rounded-full',
  },

  // Animation Transitions
  transitions: {
    default: 'transition-all duration-200 ease-in-out',
    smooth: 'transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)',
    slow: 'transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)',
    hover: 'hover:scale-[1.01] active:scale-[0.99]',
  }
};
