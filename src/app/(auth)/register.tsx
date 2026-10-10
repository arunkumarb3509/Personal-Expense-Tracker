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
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react-native';

export default function RegisterScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    let hasError = false;

    if (!fullName.trim()) {
      setNameError('Full name is required.');
      hasError = true;
    }

    const emailCheck = validateEmailStrict(email);
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error || 'Please enter a valid email address.');
      hasError = true;
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);
      await register(email, password, fullName);
      // Route immediately to verify-email
      router.replace('/(auth)/verify-email');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
              Create Account
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
              Start tracking your income, expenses, and wallets.
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

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Full Name"
              value={fullName}
              onChangeText={(txt) => {
                setFullName(txt);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. Arun Kumar"
              autoCapitalize="words"
              leftIcon={<User size={20} color={colors.textSecondary} />}
              error={nameError}
            />

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
              hint="Must be a valid email (e.g. name@example.com)"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (passwordError) setPasswordError('');
              }}
              placeholder="At least 6 characters"
              isPassword
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              error={passwordError}
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(txt) => {
                setConfirmPassword(txt);
                if (confirmError) setConfirmError('');
              }}
              placeholder="Re-enter your password"
              isPassword
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              error={confirmError}
            />

            {/* Terms note */}
            <View style={styles.termsNote}>
              <CheckCircle2 size={14} color={colors.income} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.xxs, flex: 1 }}>
                A verification link will be sent to your email to activate your account.
              </Text>
            </View>

            {/* Submit Button */}
            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="Create Account"
                onPress={handleRegister}
                variant="primary"
                size="lg"
                loading={loading}
              />
            </View>
          </View>

          {/* Footer Login prompt */}
          <View style={[styles.footerRow, { marginTop: spacing['2xl'] }]}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.bold,
                }}
              >
                Sign In
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
  termsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
