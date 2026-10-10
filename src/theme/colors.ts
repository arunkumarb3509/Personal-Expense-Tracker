export interface ThemeColors {
  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryForeground: string;

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
  primary: '#2563EB',         // Professional Blue
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  primaryForeground: '#FFFFFF',

  background: '#F8FAFC',      // Crisp light slate
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceHighlight: '#E2E8F0',

  card: '#FFFFFF',
  cardSecondary: '#F8FAFC',

  text: '#0F172A',            // Slate 900
  textSecondary: '#475569',   // Slate 600
  textTertiary: '#94A3B8',    // Slate 400
  textMuted: '#64748B',       // Slate 500
  textInverse: '#FFFFFF',

  border: '#E2E8F0',          // Slate 200
  borderLight: '#F1F5F9',
  borderFocus: '#2563EB',
  divider: '#EEF2F6',

  income: '#10B981',          // Emerald 500
  incomeLight: '#ECFDF5',
  expense: '#EF4444',         // Red 500
  expenseLight: '#FEF2F2',
  transfer: '#8B5CF6',        // Violet 500
  transferLight: '#F5F3FF',
  lend: '#F59E0B',            // Amber 500 (money given out)
  lendLight: '#FFFBEB',
  borrow: '#06B6D4',          // Cyan 500
  borrowLight: '#ECFEFF',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  accentBlue: '#3B82F6',
  accentPurple: '#8B5CF6',
  accentTeal: '#14B8A6',
  accentOrange: '#F97316',
  accentPink: '#EC4899',

  overlay: 'rgba(15, 23, 42, 0.45)',
  modalBackground: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#2563EB',
  tabBarInactive: '#94A3B8',
};

export const darkColors: ThemeColors = {
  primary: '#3B82F6',         // Vibrant Blue
  primaryLight: '#1E293B',
  primaryDark: '#1D4ED8',
  primaryForeground: '#FFFFFF',

  background: '#0B0F19',      // Deep dark navy
  backgroundSecondary: '#111827',
  surface: '#1E293B',         // Slate 800
  surfaceSecondary: '#141E33',
  surfaceHighlight: '#334155',

  card: '#161F30',
  cardSecondary: '#1E293B',

  text: '#F8FAFC',            // Slate 50
  textSecondary: '#94A3B8',   // Slate 400
  textTertiary: '#64748B',    // Slate 500
  textMuted: '#64748B',
  textInverse: '#0F172A',

  border: '#2A374A',          // Muted slate border
  borderLight: '#1E293B',
  borderFocus: '#3B82F6',
  divider: '#1E293B',

  income: '#34D399',          // Emerald 400
  incomeLight: '#064E3B',
  expense: '#F87171',         // Red 400
  expenseLight: '#7F1D1D',
  transfer: '#A78BFA',        // Violet 400
  transferLight: '#4C1D95',
  lend: '#FBBF24',            // Amber 400
  lendLight: '#78350F',
  borrow: '#22D3EE',          // Cyan 400
  borrowLight: '#164E63',

  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  error: '#F87171',
  errorLight: '#7F1D1D',
  info: '#60A5FA',
  infoLight: '#1E3A8A',

  accentBlue: '#60A5FA',
  accentPurple: '#A78BFA',
  accentTeal: '#2DD4BF',
  accentOrange: '#FB923C',
  accentPink: '#F472B6',

  overlay: 'rgba(0, 0, 0, 0.75)',
  modalBackground: '#161F30',
  tabBar: '#111827',
  tabBarBorder: '#1F2937',
  tabBarActive: '#60A5FA',
  tabBarInactive: '#64748B',
};
