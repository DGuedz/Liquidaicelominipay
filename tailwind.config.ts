import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-glow': 'var(--primary-glow)',
        secondary: 'var(--secondary)',
        destructive: 'var(--destructive)',
        'card-bg': 'var(--card-bg)',
        'surface-solid': 'var(--surface-solid)',
        'surface-outline': 'var(--surface-outline)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'border-glass': 'var(--border-glass)',
        'border-subtle': 'var(--border-subtle)',
      },
      fontFamily: {
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
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
