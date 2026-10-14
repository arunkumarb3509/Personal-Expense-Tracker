export interface ThemeColors {
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryForeground: string;

  // Fintech Reference Accents
  forestDark: string;
  forestCard: string;
  lime: string;
  limeLight: string;
  limeDark: string;
  limeForeground: string;

  // Backgrounds
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  surfaceHighlight: string;

  // Cards
  card: string;
  cardSecondary: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  textInverse: string;

  // Borders & Dividers
  border: string;
  borderLight: string;
  borderFocus: string;
  divider: string;

  // Financial Semantics
  income: string;
  incomeLight: string;
  expense: string;
  expenseLight: string;
  transfer: string;
  transferLight: string;
  lend: string;
  lendLight: string;
  borrow: string;
  borrowLight: string;

  // UI States
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Accents
  accentBlue: string;
  accentPurple: string;
  accentTeal: string;
  accentOrange: string;
  accentPink: string;

  // Overlays
  overlay: string;
  modalBackground: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightColors: ThemeColors = {
  primary: '#11382B',         // Deep Forest Green
  primaryLight: '#EBF4EF',
  primaryDark: '#0A261D',
  primaryForeground: '#FFFFFF',

  // Reference visual tokens
  forestDark: '#0B291F',
  forestCard: '#11382B',
  lime: '#B4F06A',            // Vibrant Neon Lime from reference
  limeLight: '#F0FCE1',
  limeDark: '#679B1C',
  limeForeground: '#0B291F',

  background: '#F5F8F5',      // Soft fresh off-white
  backgroundSecondary: '#EBF1EB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F6F2',
  surfaceHighlight: '#E0ECE3',

  card: '#FFFFFF',
  cardSecondary: '#F7FAF7',

  text: '#0C1C16',            // Slate dark pine
  textSecondary: '#4A6256',   // Muted sage slate
  textTertiary: '#8AA094',    // Light sage
  textMuted: '#677E73',
  textInverse: '#FFFFFF',

  border: '#E1ECE3',
  borderLight: '#EDF4EE',
  borderFocus: '#11382B',
  divider: '#E7EFE9',

  income: '#10B981',          // Emerald Green
  incomeLight: '#ECFDF5',
  expense: '#EF4444',         // Red 500
  expenseLight: '#FEF2F2',
  transfer: '#0284C7',        // Cyan-Blue 600
  transferLight: '#E0F2FE',
  lend: '#D97706',            // Amber 600
  lendLight: '#FEF3C7',
  borrow: '#0D9488',          // Teal 600
  borrowLight: '#CCFBF1',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  accentBlue: '#0284C7',
  accentPurple: '#7C3AED',
  accentTeal: '#0D9488',
  accentOrange: '#EA580C',
  accentPink: '#DB2777',

  overlay: 'rgba(11, 41, 31, 0.55)',
  modalBackground: '#FFFFFF',
  tabBar: '#11382B',          // Dark green floating dock
  tabBarBorder: 'transparent',
  tabBarActive: '#B4F06A',    // Neon lime active indicator
  tabBarInactive: '#8BA699',
};

export const darkColors: ThemeColors = {
  primary: '#B4F06A',         // Vibrant Lime on Dark
  primaryLight: '#1B3828',
  primaryDark: '#8DC743',
  primaryForeground: '#0B291F',

  forestDark: '#071610',
  forestCard: '#102A20',
  lime: '#B4F06A',
  limeLight: '#1E3B27',
  limeDark: '#8DC743',
  limeForeground: '#0B291F',

  background: '#091510',      // Deepest forest night
  backgroundSecondary: '#0D1E17',
  surface: '#12261E',
  surfaceSecondary: '#162F25',
  surfaceHighlight: '#204033',

  card: '#12261E',
  cardSecondary: '#162F25',

  text: '#F2FAF5',
  textSecondary: '#9BB8AA',
  textTertiary: '#698778',
  textMuted: '#698778',
  textInverse: '#091510',

  border: '#1E3B2E',
  borderLight: '#152C22',
  borderFocus: '#B4F06A',
  divider: '#1A362A',

  income: '#34D399',
  incomeLight: '#064E3B',
  expense: '#F87171',
  expenseLight: '#7F1D1D',
  transfer: '#38BDF8',
  transferLight: '#0C4A6E',
  lend: '#FBBF24',
  lendLight: '#78350F',
  borrow: '#2DD4BF',
  borrowLight: '#134E4A',

  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  error: '#F87171',
  errorLight: '#7F1D1D',
  info: '#38BDF8',
  infoLight: '#0C4A6E',

  accentBlue: '#38BDF8',
  accentPurple: '#A78BFA',
  accentTeal: '#2DD4BF',
  accentOrange: '#FB923C',
  accentPink: '#F472B6',

  overlay: 'rgba(0, 0, 0, 0.78)',
  modalBackground: '#12261E',
  tabBar: '#0D1E17',
  tabBarBorder: '#1A362A',
  tabBarActive: '#B4F06A',
  tabBarInactive: '#5B7869',
};
