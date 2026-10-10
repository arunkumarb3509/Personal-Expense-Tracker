import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { SmartInsight } from '@/services/analyticsCalculator';
import { Lightbulb, TrendingUp, TrendingDown, HandCoins, Activity, PieChart } from 'lucide-react-native';

export interface InsightCardProps {
  insight: SmartInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const { colors, typography, radius, spacing } = useTheme();

  let icon = <Lightbulb size={20} color={colors.primary} />;
  let bgColor = colors.primaryLight;
  let borderColor = colors.primary;

  switch (insight.type) {
    case 'positive':
      icon = <TrendingDown size={20} color={colors.success} />;
      bgColor = colors.successLight;
      borderColor = colors.success;
      break;
    case 'warning':
      icon = <TrendingUp size={20} color={colors.warning} />;
      bgColor = colors.warningLight;
      borderColor = colors.warning;
      break;
    case 'neutral':
      icon = <HandCoins size={20} color={colors.lend} />;
      bgColor = colors.lendLight;
      borderColor = colors.lend;
      break;
    case 'info':
      icon = <Activity size={20} color={colors.primary} />;
      bgColor = colors.primaryLight;
      borderColor = colors.primary;
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.xl,
          padding: spacing.md,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: bgColor,
              borderRadius: radius.lg,
            },
          ]}
        >
          {icon}
        </View>

        <View style={styles.textColumn}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.bold,
              },
            ]}
          >
            {insight.title}
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                marginTop: 2,
                lineHeight: 18,
              },
            ]}
          >
            {insight.message}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    letterSpacing: -0.2,
  },
  message: {},
});
