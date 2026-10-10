import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: number;
}

export function Card({
  children,
  style,
  onPress,
  variant = 'outlined',
  padding,
}: CardProps) {
  const { colors, radius, spacing, shadows } = useTheme();

  const cardPadding = padding !== undefined ? padding : spacing.lg;

  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: cardPadding,
    borderColor: colors.border,
    borderWidth: variant === 'outlined' ? 1 : 0,
    ...(variant === 'elevated' ? shadows.sm : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.card, cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
  },
});
