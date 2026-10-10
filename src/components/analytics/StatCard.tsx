import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'neutral',
}: StatCardProps) {
  const { colors, typography, radius, spacing } = useTheme();

  let accentColor = colors.text;
  let bgColor = colors.surfaceSecondary;

  switch (variant) {
    case 'primary':
      accentColor = colors.primary;
      bgColor = colors.primaryLight;
      break;
    case 'success':
      accentColor = colors.income;
      bgColor = colors.incomeLight;
      break;
    case 'warning':
      accentColor = colors.warning;
      bgColor = colors.warningLight;
      break;
    case 'error':
      accentColor = colors.expense;
      bgColor = colors.expenseLight;
      break;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.xl,
          padding: spacing.md,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Text
          style={[
            styles.title,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {icon && (
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: bgColor,
                borderRadius: radius.md,
              },
            ]}
          >
            {icon}
          </View>
        )}
      </View>

      <Text
        style={[
          styles.value,
          {
            color: accentColor,
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            letterSpacing: -0.2,
            marginTop: 4,
          },
        ]}
      >
        {value}
      </Text>

      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textTertiary,
              fontSize: typography.sizes.xxs,
              marginTop: 2,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {},
  iconWrapper: {
    padding: 6,
  },
  value: {},
  subtitle: {},
});
