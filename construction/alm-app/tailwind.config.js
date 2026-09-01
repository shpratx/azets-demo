/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#DDF8EA',
          500: '#26CF7C',
          600: '#1CAE68',
          700: '#148653',
        },
        ink: {
          950: '#0F0F0F',
          800: '#2B2B2B',
          600: '#5D625F',
          400: '#939A96',
        },
        canvas: '#FFFFFF',
        mist: {
          50: '#F7F8F7',
          100: '#EEF1EF',
        },
        border: '#D9DEDB',
        focus: '#0067B8',
        danger: '#B42318',
        success: '#16794D',
        warning: '#9A6400',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        feature: '24px',
        control: '10px',
        pill: '999px',
      },
      boxShadow: {
        1: '0 10px 35px rgba(15,15,15,.08)',
        2: '0 20px 60px rgba(15,15,15,.12)',
      },
      fontSize: {
        eyebrow: ['13px', { lineHeight: '1.25', letterSpacing: '0.08em', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
