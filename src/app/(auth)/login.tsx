import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { validateEmailStrict } from '@/services/authService';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    setEmailError('');
    setPasswordError('');

    const emailCheck = validateEmailStrict(email);
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error || 'Invalid email');
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.isEmailVerified) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/verify-email');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: typography.sizes['3xl'],
                  fontWeight: typography.weights.bold,
                },
              ]}
            >
              Welcome Back
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontSize: typography.sizes.sm,
                  marginTop: spacing.xs,
                },
              ]}
            >
              Sign in with your email to access your finances.
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.errorLight,
                  borderColor: colors.error,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
                },
              ]}
            >
              <AlertCircle size={18} color={colors.error} style={{ marginRight: 8 }} />
              <Text
                style={{
                  color: colors.error,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.medium,
                  flex: 1,
                }}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.form}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (emailError) setEmailError('');
              }}
              placeholder="e.g. arun123@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Mail size={20} color={colors.textSecondary} />}
              error={emailError}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter your password"
              isPassword
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              error={passwordError}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassButton}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <View style={{ marginTop: spacing.xl }}>
              <Button
                title="Sign In"
                onPress={handleLogin}
                variant="primary"
                size="lg"
                loading={loading}
                icon={<ArrowRight size={20} color="#FFFFFF" />}
                iconPosition="right"
              />
            </View>
          </View>

          {/* Footer Register prompt */}
          <View style={[styles.footerRow, { marginTop: spacing['2xl'] }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.bold,
                }}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  title: {
    letterSpacing: -0.5,
  },
  subtitle: {},
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  form: {
    width: '100%',
  },
  forgotPassButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
