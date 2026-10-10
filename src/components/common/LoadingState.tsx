import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Loading your financial data...',
  style,
  fullScreen = false,
}: LoadingStateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && {
          flex: 1,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text
          style={[
            styles.message,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
              marginTop: spacing.md,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export function SkeletonCard({ height = 80 }: { height?: number }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        width: '100%',
        height,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: radius.xl,
        marginBottom: 12,
        opacity: 0.6,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  message: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
