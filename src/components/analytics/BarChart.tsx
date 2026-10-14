import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Circle } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { DailySpendItem } from '@/services/analyticsCalculator';
import * as Haptics from 'expo-haptics';

export interface BarChartProps {
  data: DailySpendItem[];
  height?: number;
  isDarkTheme?: boolean;
}

export function BarChart({ data, height = 190, isDarkTheme = false }: BarChartProps) {
  const { colors, typography, radius } = useTheme();
  const { format } = useCurrency();

  // Find max spend index to highlight by default (like the Friday bar in the reference UI)
  const maxSpend = Math.max(...data.map((d) => d.totalAmount), 100);
  const peakIndex = data.findIndex((d) => d.totalAmount === maxSpend && d.totalAmount > 0);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    peakIndex !== -1 ? peakIndex : null
  );

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 72; // accounting for padding

  const barWidth = 26;
  const barSpacing = Math.max(8, (chartWidth - barWidth * data.length) / (data.length + 1));

  const handleBarPress = (index: number) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  const activeIdx = selectedIndex !== null ? selectedIndex : peakIndex;

  return (
    <View style={styles.container}>
      {/* Floating Tooltip Pill */}
      <View style={[styles.tooltipContainer, { height: 28 }]}>
        {activeIdx !== null && data[activeIdx] && data[activeIdx].totalAmount > 0 ? (
          <View
            style={[
              styles.tooltip,
              {
                backgroundColor: '#B4F06A', // Reference neon lime tooltip
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={{
                color: '#0B291F',
                fontSize: 11,
                fontWeight: '800',
              }}
            >
              {data[activeIdx].dayName}: {format(data[activeIdx].totalAmount)}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: isDarkTheme ? '#8CAFA0' : colors.textTertiary,
              fontSize: typography.sizes.xs,
            }}
          >
            Tap any day to see breakdown
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
          stroke={isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : colors.border}
          strokeWidth="1"
        />
        <Line
          x1="0"
          y1={(height - 30) / 2}
          x2={chartWidth}
          y2={(height - 30) / 2}
          stroke={isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : colors.borderLight}
          strokeWidth="1"
          strokeDasharray="4, 4"
        />

        {/* Bars and labels */}
        {data.map((item, index) => {
          const x = barSpacing + index * (barWidth + barSpacing);
          const barHeight = Math.max(
            8,
            ((item.totalAmount || 0) / maxSpend) * (height - 65)
          );
          const y = height - 30 - barHeight;
          const isHighlighted = activeIdx === index;

          // Color palette inspired by reference screenshot
          let barFill = '#3D6353'; // Muted dark forest bar
          if (isHighlighted) {
            barFill = '#B4F06A'; // Bright neon lime for peak / active
          } else if (item.totalAmount > 0) {
            barFill = isDarkTheme ? '#2F5444' : '#7DA693';
          } else {
            barFill = isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : colors.surfaceHighlight;
          }

          const labelColor = isHighlighted
            ? '#B4F06A'
            : isDarkTheme
            ? '#A0C2B0'
            : colors.textSecondary;

          return (
            <React.Fragment key={index}>
              {/* Highlight dot above active/peak bar */}
              {isHighlighted && item.totalAmount > 0 && (
                <Circle
                  cx={x + barWidth / 2}
                  cy={y - 6}
                  r={3}
                  fill="#B4F06A"
                />
              )}

              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={8}
                ry={8}
                fill={barFill}
                onPress={() => handleBarPress(index)}
              />

              <SvgText
                x={x + barWidth / 2}
                y={height - 10}
                fill={labelColor}
                fontSize="11"
                fontWeight={isHighlighted ? 'bold' : 'normal'}
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
    marginVertical: 10,
  },
  tooltipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tooltip: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    shadowColor: '#B4F06A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
