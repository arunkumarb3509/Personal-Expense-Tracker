import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const { colors, typography, radius, spacing } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  // Variant Styling
  let backgroundColor = colors.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';
  let borderWidth = 0;

  switch (variant) {
    case 'primary':
      backgroundColor = colors.primary;
      textColor = colors.primaryForeground;
      break;
    case 'secondary':
      backgroundColor = colors.surfaceSecondary;
      textColor = colors.text;
      borderColor = colors.border;
      borderWidth = 1;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = colors.primary;
      borderColor = colors.primary;
      borderWidth = 1.5;
      break;
    case 'danger':
      backgroundColor = colors.error;
      textColor = '#FFFFFF';
      break;
    case 'success':
      backgroundColor = colors.success;
      textColor = '#FFFFFF';
      break;
    case 'warning':
      backgroundColor = colors.warning;
      textColor = '#FFFFFF';
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = colors.textSecondary;
      break;
  }

  // Size styling
  let height = 52;
  let paddingHorizontal = spacing.xl;
  let fontSize = typography.sizes.md;

  if (size === 'sm') {
    height = 38;
    paddingHorizontal = spacing.md;
    fontSize = typography.sizes.sm;
  } else if (size === 'lg') {
    height = 58;
    paddingHorizontal = spacing['2xl'];
    fontSize = typography.sizes.lg;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        {
          backgroundColor: disabled ? colors.border : backgroundColor,
          borderColor: disabled ? colors.border : borderColor,
          borderWidth,
          height,
          paddingHorizontal,
          borderRadius: radius.lg,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: spacing.sm }}>{icon}</View>
          )}
          <Text
            style={[
              styles.textBase,
              {
                color: disabled ? colors.textTertiary : textColor,
                fontSize,
                fontWeight: typography.weights.semibold,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: spacing.sm }}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBase: {
    textAlign: 'center',
  },
});
