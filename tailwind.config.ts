import type { Config } from 'tailwindcss'
import { tokens } from './src/lib/tokens'

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base Theme (existing + new tokens)
        background: tokens.colors.background.base,
        foreground: tokens.colors.text.primary,
        
        // Brand Accents
        cyan: tokens.colors.accent.cyan.DEFAULT,
        'cyan-hover': tokens.colors.accent.cyan.hover,
        emerald: tokens.colors.accent.emerald.DEFAULT,
        'emerald-hover': tokens.colors.accent.emerald.hover,
        danger: tokens.colors.accent.danger.DEFAULT,
        
        // Surface & Borders
        surface: tokens.colors.background.surface,
        'border-subtle': tokens.colors.border.subtle,
        
        // Text
        'text-primary': tokens.colors.text.primary,
        'text-secondary': tokens.colors.text.secondary,
        'text-mono': tokens.colors.text.mono,

        // Legacy compatibility
        primary: 'var(--primary)',
        'primary-glow': 'var(--primary-glow)',
        secondary: 'var(--secondary)',
        destructive: 'var(--destructive)',
        'card-bg': 'var(--card-bg)',
        'surface-solid': 'var(--surface-solid)',
        'surface-outline': 'var(--surface-outline)',
        'border-glass': 'var(--border-glass)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: tokens.radii.sm,
        md: tokens.radii.md,
        lg: tokens.radii.lg,
        xl: tokens.radii.xl,
      },
      boxShadow: {
        'neon': 'var(--shadow-neon-cyan)',
        'neon-strong': 'var(--shadow-neon-strong)',
        'neon-emerald': 'var(--shadow-neon-emerald)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
