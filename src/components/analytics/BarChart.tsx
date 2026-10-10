import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { DailySpendItem } from '@/services/analyticsCalculator';
import * as Haptics from 'expo-haptics';

export interface BarChartProps {
  data: DailySpendItem[];
  height?: number;
}

export function BarChart({ data, height = 180 }: BarChartProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { format } = useCurrency();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // accounting for padding
  const maxSpend = Math.max(...data.map((d) => d.totalAmount), 100);

  const barWidth = 24;
  const barSpacing = (chartWidth - barWidth * data.length) / (data.length + 1);

  const handleBarPress = (index: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Tooltip for selected bar */}
      <View style={[styles.tooltipContainer, { height: 26 }]}>
        {selectedIndex !== null && data[selectedIndex] ? (
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={{
                color: colors.primaryForeground,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
              }}
            >
              {data[selectedIndex].dayName}: {format(data[selectedIndex].totalAmount)}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: typography.sizes.xs,
            }}
          >
            Tap any bar to see daily total
          </Text>
        )}
      </View>

      <Svg width={chartWidth} height={height}>
        {/* Horizontal grid lines */}
        <Line
          x1="0"
          y1={height - 30}
          x2={chartWidth}
          y2={height - 30}
          stroke={colors.border}
          strokeWidth="1"
        />
        <Line
          x1="0"
          y1={(height - 30) / 2}
          x2={chartWidth}
          y2={(height - 30) / 2}
          stroke={colors.borderLight}
          strokeWidth="1"
          strokeDasharray="4, 4"
        />

        {/* Bars and labels */}
        {data.map((item, index) => {
          const x = barSpacing + index * (barWidth + barSpacing);
          const barHeight = Math.max(
            4,
            ((item.totalAmount || 0) / maxSpend) * (height - 50)
          );
          const y = height - 30 - barHeight;
          const isSelected = selectedIndex === index;
          const barColor = isSelected
            ? colors.primary
            : item.totalAmount > 0
            ? colors.accentBlue
            : colors.surfaceHighlight;

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                ry={6}
                fill={barColor}
                onPress={() => handleBarPress(index)}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 10}
                fill={isSelected ? colors.primary : colors.textSecondary}
                fontSize="11"
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {item.dayName}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  tooltipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tooltip: {
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
});
