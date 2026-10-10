import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, ImageStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface AvatarProps {
  name?: string;
  photoUrl?: string | null;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ name = 'User', photoUrl, size = 44, style }: AvatarProps) {
  const { colors, typography, radius } = useTheme();

  const getInitials = (text: string) => {
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase() || 'U';
  };

  const initials = getInitials(name);

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius.full,
          } as ImageStyle,
          style as unknown as ImageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: colors.primaryLight,
          borderColor: colors.border,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: colors.primary,
            fontSize: size * 0.38,
            fontWeight: typography.weights.bold,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    letterSpacing: 0.5,
  },
});
