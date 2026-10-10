import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  selectedValue: T;
  onValueChange: (val: T) => void;
  style?: ViewStyle;
}

export function SegmentedControl<T extends string = string>({
  options,
  selectedValue,
  onValueChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors, typography, radius, spacing, shadows } = useTheme();

  const handleSelect = (val: T) => {
    if (val !== selectedValue) {
      try {
        Haptics.selectionAsync();
      } catch {}
      onValueChange(val);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.lg,
          padding: 4,
          borderColor: colors.border,
          borderWidth: 1,
        },
        style,
      ]}
    >
      {options.map((opt) => {
        const isSelected = opt.value === selectedValue;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => handleSelect(opt.value)}
            style={[
              styles.segment,
              {
                borderRadius: radius.md,
                backgroundColor: isSelected ? colors.card : 'transparent',
                ...(isSelected ? shadows.sm : {}),
              },
            ]}
          >
            {opt.icon && <View style={{ marginRight: 6 }}>{opt.icon}</View>}
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.primary : colors.textSecondary,
                  fontSize: typography.sizes.sm,
                  fontWeight: isSelected
                    ? typography.weights.bold
                    : typography.weights.medium,
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  label: {
    textAlign: 'center',
  },
});
