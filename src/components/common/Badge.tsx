import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', size = 'sm', style }: BadgeProps) {
  const { colors, typography, radius, spacing } = useTheme();

  let backgroundColor = colors.surfaceSecondary;
  let textColor = colors.textSecondary;

  switch (variant) {
    case 'success':
      backgroundColor = colors.incomeLight;
      textColor = colors.income;
      break;
    case 'warning':
      backgroundColor = colors.warningLight;
      textColor = colors.warning;
      break;
    case 'error':
      backgroundColor = colors.expenseLight;
      textColor = colors.expense;
      break;
    case 'info':
      backgroundColor = colors.infoLight;
      textColor = colors.info;
      break;
    case 'primary':
      backgroundColor = colors.primaryLight;
      textColor = colors.primary;
      break;
    case 'neutral':
      backgroundColor = colors.surfaceHighlight;
      textColor = colors.textSecondary;
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderRadius: radius.full,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? 3 : 5,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? typography.sizes.xxs : typography.sizes.xs,
            fontWeight: typography.weights.semibold,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
