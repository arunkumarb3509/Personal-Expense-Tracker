import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data. Please check your connection and try again.',
  onRetry,
  style,
}: ErrorStateProps) {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.errorLight,
            borderRadius: radius.full,
            width: 70,
            height: 70,
          },
        ]}
      >
        <AlertCircle size={36} color={colors.error} />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            marginTop: spacing.lg,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            marginTop: spacing.xs,
            lineHeight: 20,
          },
        ]}
      >
        {message}
      </Text>

      {onRetry && (
        <View style={{ marginTop: spacing.xl, width: 160 }}>
          <Button title="Try Again" onPress={onRetry} variant="outline" size="sm" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
