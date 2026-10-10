import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  style,
}: HeaderProps) {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.borderLight,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontSize: typography.sizes.xs,
                },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 1,
  },
  rightAction: {
    marginLeft: 12,
  },
});
