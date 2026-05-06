import {StyleSheet} from 'react-native';

export const Colors = {
  // Backgrounds
  pageBg: '#f8f7f4',
  cardBg: '#ffffff',
  surfaceBg: '#f0ede8',
  pillInactive: '#ede9e6',
  headerBg: '#eeecea',

  // Borders
  border: '#d4cfc9',
  borderLight: '#ede9e6',

  // Text
  textPrimary: '#1a1612',
  textSecondary: '#6b6560',
  textMuted: '#9a9490',
  textSubtle: '#8a837d',

  // Brand
  purple: '#7c3aed',
  blue: '#3b82f6',
  rose: '#F43F5E',
  green: '#34D399',
  orange: '#F97316',

  // Gradients (used as start/end for LinearGradient)
  gradientPurple: ['#7c3aed', '#3b82f6'] as [string, string],
  gradientRose: ['#F43F5E', '#7c3aed'] as [string, string],

  // Accent banners
  purpleBannerBg: '#f3eeff',
  purpleBannerBg2: '#eef3ff',
  roseBannerBg: '#ffeef1',
};

export const Typography = {
  fontFamily: 'System',
  h1: {fontSize: 28, fontWeight: '800' as const, color: Colors.textPrimary, letterSpacing: -0.5},
  h2: {fontSize: 20, fontWeight: '800' as const, color: Colors.textPrimary},
  h3: {fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary},
  body: {fontSize: 15, fontWeight: '400' as const, color: Colors.textPrimary},
  label: {fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, letterSpacing: 0.5},
  caption: {fontSize: 12, fontWeight: '400' as const, color: Colors.textSecondary},
  tiny: {fontSize: 11, fontWeight: '400' as const, color: Colors.textMuted},
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  pill: 999,
  card: 16,
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.card,
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: Radii.md,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.cardBg,
  },
  pillBtnActive: {
    borderWidth: 1.5,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
