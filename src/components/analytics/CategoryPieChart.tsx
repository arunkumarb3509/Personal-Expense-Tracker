import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { CategorySpendItem } from '@/services/analyticsCalculator';

export interface CategoryPieChartProps {
  categories: CategorySpendItem[];
  totalAmount: number;
}

export function CategoryPieChart({ categories, totalAmount }: CategoryPieChartProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { format } = useCurrency();

  if (categories.length === 0 || totalAmount === 0) {
    return (
      <View style={[styles.emptyContainer, { padding: spacing.xl }]}>
        <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.sm }}>
          No category spending recorded for this period.
        </Text>
      </View>
    );
  }

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 24;
  const center = size / 2;
  const chartRadius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * chartRadius;

  let accumulatedPercent = 0;

  return (
    <View style={styles.container}>
      {/* SVG Donut */}
      <View style={styles.donutWrapper}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background ring */}
            <Circle
              cx={center}
              cy={center}
              r={chartRadius}
              stroke={colors.surfaceSecondary}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Segments */}
            {categories.map((cat, i) => {
              const strokeDashoffset = circumference - (cat.percentage / 100) * circumference;
              const rotation = (accumulatedPercent / 100) * 360;
              accumulatedPercent += cat.percentage;

              return (
                <Circle
                  key={cat.categoryId}
                  cx={center}
                  cy={center}
                  r={chartRadius}
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation={rotation}
                  origin={`${center}, ${center}`}
                  fill="transparent"
                />
              );
            })}
          </G>
        </Svg>
        {/* Center label */}
        <View style={styles.centerTextContainer}>
          <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>TOTAL</Text>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              marginTop: 1,
            }}
          >
            {format(totalAmount)}
          </Text>
        </View>
      </View>

      {/* Legend list with subcategories */}
      <View style={[styles.legendList, { marginTop: spacing.lg }]}>
        {categories.map((cat) => (
          <View
            key={cat.categoryId}
            style={[
              styles.legendRow,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.xs,
              },
            ]}
          >
            <View style={styles.legendLeft}>
              <View
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: cat.color,
                    borderRadius: 4,
                    width: 10,
                    height: 10,
                    marginRight: 8,
                  },
                ]}
              />
              <View>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.bold,
                  }}
                >
                  {cat.categoryName}
                </Text>
                {cat.subcategories.length > 0 && (
                  <Text
                    style={{
                      color: colors.textTertiary,
                      fontSize: typography.sizes.xxs,
                      marginTop: 2,
                    }}
                  >
                    {cat.subcategories
                      .slice(0, 2)
                      .map((s) => `${s.name} (${format(s.amount)})`)
                      .join(' • ')}
                  </Text>
                )}
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.bold,
                }}
              >
                {format(cat.amount)}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.sizes.xxs,
                  fontWeight: typography.weights.semibold,
                  marginTop: 1,
                }}
              >
                {cat.percentage}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  donutWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendList: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
