import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export function TextInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor,
            borderRadius: radius.lg,
            borderWidth: isFocused || error ? 1.5 : 1,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        {leftIcon && <View style={{ marginRight: spacing.md }}>{leftIcon}</View>}

        <RNTextInput
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: typography.sizes.md,
            },
            style,
          ]}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: spacing.xs }}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={{ marginLeft: spacing.md }}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.error,
              fontSize: typography.sizes.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={[
            styles.hintText,
            {
              color: colors.textTertiary,
              fontSize: typography.sizes.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export interface AmountInputProps {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  onChangeAmount?: (text: string) => void;
  placeholder?: string;
  currencySymbol?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function AmountInput({
  label = 'Amount',
  value,
  onChangeText,
  onChangeAmount,
  placeholder,
  currencySymbol = '₹',
  error,
  containerStyle,
}: AmountInputProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (text: string) => {
    // Only allow numbers and one decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }
    onChangeText && onChangeText(sanitized);
    onChangeAmount && onChangeAmount(sanitized);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.amountContainer,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
            borderRadius: radius.xl,
            borderWidth: isFocused || error ? 2 : 1,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
          },
        ]}
      >
        <Text
          style={[
            styles.currencySymbol,
            {
              color: colors.primary,
              fontSize: typography.sizes['3xl'],
              fontWeight: typography.weights.bold,
              marginRight: spacing.sm,
            },
          ]}
        >
          {currencySymbol}
        </Text>
        <RNTextInput
          value={value}
          onChangeText={handleChange}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="decimal-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.amountInput,
            {
              color: colors.text,
              fontSize: typography.sizes['4xl'],
              fontWeight: typography.weights.bold,
            },
          ]}
        />
      </View>

      {error && (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.error,
              fontSize: typography.sizes.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  errorText: {
    fontWeight: '500',
  },
  hintText: {},
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    lineHeight: 40,
  },
  amountInput: {
    minWidth: 120,
    textAlign: 'left',
    paddingVertical: 0,
  },
});
