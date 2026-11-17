import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0e14',
          sidebar: '#0d1117',
          card: '#131920',
          'card-alt': '#161b22',
          input: '#1c2333',
          hover: '#1a2332',
        },
        accent: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
        },
        pink: {
          accent: '#ec4899',
          light: '#f472b6',
        },
        blue: {
          accent: '#3b82f6',
          light: '#60a5fa',
        },
        purple: {
          accent: '#8b5cf6',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#7d8590',
          disabled: '#484f58',
        },
        border: {
          DEFAULT: '#21262d',
          light: '#30363d',
          focus: '#388bfd',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'subheading': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'small': ['12px', { lineHeight: '1.4' }],
        'xs': ['11px', { lineHeight: '1.3' }],
      },
      borderRadius: {
        card: '10px',
        badge: '6px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 20px rgba(16,185,129,0.15)',
        'glow-danger': '0 0 20px rgba(239,68,68,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
