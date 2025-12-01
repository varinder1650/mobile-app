import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#007AFF',
  secondary: '#4CAF50',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#f8f9fa',
  cardBackground: '#fff',
  border: '#e0e0e0',
  text: {
    primary: '#333',
    secondary: '#666',
    tertiary: '#999',
  },
  input: {
    background: '#f8f9fa',
    border: '#e0e0e0',
    placeholder: '#999',
  },
  success: {
    background: '#E8F5E9',
    border: '#C8E6C9',
    text: '#2E7D32',
  },
  info: {
    background: '#E3F2FD',
    border: '#90CAF9',
    text: '#0277BD',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  round: 20,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const typography = {
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.input.background,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: colors.text.secondary,
  },
  input: {
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});