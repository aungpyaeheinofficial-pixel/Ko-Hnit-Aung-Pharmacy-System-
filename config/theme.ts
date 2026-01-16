// Ko Hnit Aung Pharmacy Theme Configuration
// Dark Green + Yellow + White Color Scheme

export const theme = {
  colors: {
    primary: {
      dark: '#1B5E20',      // Dark Green
      main: '#2E7D32',      // Medium Green
      light: '#4CAF50',     // Light Green
    },
    secondary: {
      dark: '#F57F17',      // Dark Yellow
      main: '#FFEB3B',      // Yellow
      light: '#FFF59D',     // Light Yellow
    },
    background: {
      default: '#F1F8F4',   // Light Green tinted background
      paper: '#FFFFFF',     // White
      dark: '#1B5E20',      // Dark Green for headers
    },
    text: {
      primary: '#1B5E20',   // Dark Green text
      secondary: '#2E7D32', // Medium Green
      light: '#FFFFFF',     // White text on dark
      muted: '#757575',     // Gray
    },
    status: {
      success: '#4CAF50',   // Green
      warning: '#FFEB3B',   // Yellow
      error: '#F44336',     // Red
      info: '#2196F3',      // Blue
      // Traffic Light System
      stockGood: '#4CAF50',     // Green - Good stock
      stockLow: '#FFEB3B',      // Yellow - Low stock
      stockOut: '#F44336',      // Red - Out of stock
      expired: '#D32F2F',       // Dark Red - Expired
    },
    border: {
      default: '#E0E0E0',
      light: '#F5F5F5',
      dark: '#BDBDBD',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(27, 94, 32, 0.05)',
    md: '0 4px 6px -1px rgba(27, 94, 32, 0.1)',
    lg: '0 10px 15px -3px rgba(27, 94, 32, 0.1)',
    xl: '0 20px 25px -5px rgba(27, 94, 32, 0.1)',
  },
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  fonts: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mm: ['Myanmar3', 'Padauk', 'Noto Sans Myanmar', 'sans-serif'],
  },
};

// Tailwind CSS class helpers
export const themeClasses = {
  bg: {
    primary: 'bg-[#2E7D32]',
    primaryDark: 'bg-[#1B5E20]',
    primaryLight: 'bg-[#4CAF50]',
    secondary: 'bg-[#FFEB3B]',
    secondaryDark: 'bg-[#F57F17]',
    background: 'bg-[#F1F8F4]',
    white: 'bg-white',
  },
  text: {
    primary: 'text-[#1B5E20]',
    secondary: 'text-[#2E7D32]',
    white: 'text-white',
    yellow: 'text-[#FFEB3B]',
  },
  border: {
    primary: 'border-[#2E7D32]',
    primaryDark: 'border-[#1B5E20]',
    yellow: 'border-[#FFEB3B]',
  },
  status: {
    stockGood: 'bg-green-500 text-white',
    stockLow: 'bg-yellow-400 text-gray-900',
    stockOut: 'bg-red-500 text-white',
    expired: 'bg-red-700 text-white',
  },
};
