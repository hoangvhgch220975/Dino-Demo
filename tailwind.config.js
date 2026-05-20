/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./public/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'on-surface-variant': '#c7c6cd',
        'surface-variant': '#353436',
        'on-primary-fixed': '#161b2b',
        'inverse-on-surface': '#313031',
        'on-tertiary-fixed': '#281807',
        outline: '#909097',
        tertiary: '#dfc1a7',
        'surface-container-lowest': '#0e0e0f',
        'on-secondary': '#002e6a',
        'on-primary-container': '#777b8e',
        'on-tertiary-container': '#907760',
        'surface-bright': '#39393a',
        'surface-container-high': '#2a2a2b',
        'on-surface': '#e5e2e3',
        'secondary-fixed-dim': '#adc6ff',
        'primary-fixed-dim': '#c2c6db',
        'outline-variant': '#46464c',
        'tertiary-fixed': '#fdddc1',
        'surface-container-highest': '#353436',
        'on-secondary-container': '#e6ecff',
        'tertiary-container': '#1a0c01',
        'surface-dim': '#131314',
        'secondary-container': '#0566d9',
        'tertiary-fixed-dim': '#dfc1a7',
        'on-background': '#e5e2e3',
        'on-primary': '#2b3040',
        'on-secondary-fixed': '#001a42',
        'on-error-container': '#ffdad6',
        'on-secondary-fixed-variant': '#004395',
        'on-tertiary': '#3f2d1a',
        'inverse-primary': '#595e70',
        'on-error': '#690005',
        'on-tertiary-fixed-variant': '#58432f',
        surface: '#131314',
        secondary: '#adc6ff',
        'surface-container': '#201f21',
        'error-container': '#93000a',
        primary: '#c2c6db',
        error: '#ffb4ab',
        'on-primary-fixed-variant': '#414658',
        'secondary-fixed': '#d8e2ff',
        background: '#131314',
        'primary-fixed': '#dee1f7',
        'primary-container': '#0a0f1e',
        'surface-tint': '#c2c6db',
        'surface-container-low': '#1c1b1d',
        'inverse-surface': '#e5e2e3'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        'padding-window': '24px',
        'icon-size': '46px',
        'gutter-md': '16px',
        'icon-grid': '80px',
        'dock-height': '64px'
      },
      fontFamily: {
        'label-sm': ['Inter'],
        'label-xs': ['Inter'],
        'body-md': ['Inter'],
        'headline-md': ['Inter'],
        'clock-display': ['Inter']
      },
      fontSize: {
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-xs': ['10px', { lineHeight: '12px', fontWeight: '700' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'clock-display': ['42px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '600' }]
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
