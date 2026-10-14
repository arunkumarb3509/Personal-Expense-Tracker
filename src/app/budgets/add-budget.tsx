import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { AmountInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { Category } from '@/types/transaction';
import { format } from 'date-fns';
import { CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AddBudgetModal() {
  const { colors, typography, radius, spacing } = useTheme();
  const { saveBudget } = useData();
  const { currencySymbol, format: formatMoney } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState('');

  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const currentMonthName = format(new Date(), 'MMMM yyyy');

  const handleSave = async () => {
    setAmountError('');
    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) {
      setAmountError('Please enter a valid monthly budget limit.');
      return;
    }

    try {
      setLoading(true);
      await saveBudget(selectedCategory.id, selectedCategory.name, numeric, currentMonthStr);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      showToast(`Monthly budget for ${selectedCategory.name} saved!`, 'success');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to save budget.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Set Category Budget"
        subtitle={`For ${currentMonthName}`}
        showBack
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount Input */}
          <View style={{ marginTop: spacing.sm }}>
            <AmountInput
              label="Monthly Spending Limit"
              value={amount}
              onChangeText={(txt) => {
                setAmount(txt);
                if (amountError) setAmountError('');
              }}
              currencySymbol={currencySymbol}
              error={amountError}
            />
          </View>

          {/* Category Picker */}
          <CategoryPicker
            type="expense"
            selectedCategoryId={selectedCategory.id}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* Alert Preview */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                borderRadius: radius.xl,
                padding: spacing.md,
                marginTop: spacing.md,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AlertTriangle size={18} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                Smart Threshold Alerts
              </Text>
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              We'll automatically alert you when you hit 80% of your {selectedCategory.name} budget and when you reach 100%.
            </Text>
          </View>

          {/* Save Button */}
          <View style={{ marginTop: spacing.xl, marginBottom: 32 }}>
            <Button
              title="Save Budget Target"
              onPress={handleSave}
              variant="primary"
              size="lg"
              loading={loading}
              icon={<CheckCircle2 size={20} color="#FFFFFF" />}
              iconPosition="right"
            />
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
    paddingBottom: 24,
  },
  infoCard: {},
});
