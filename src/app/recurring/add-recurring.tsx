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
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput, AmountInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { WalletPicker } from '@/components/transactions/WalletPicker';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { Category } from '@/types/transaction';
import { RecurringFrequency } from '@/types/app';
import { format } from 'date-fns';
import { CheckCircle2, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AddRecurringModal() {
  const { colors, typography, radius, spacing } = useTheme();
  const { wallets, createRecurringPayment } = useData();
  const { currencySymbol } = useCurrency();
  const router = useRouter();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<Category>(EXPENSE_CATEGORIES[0]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    wallets[0]?.id || ''
  );
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  const handleSave = async () => {
    setNameError('');
    setAmountError('');

    if (!name.trim()) {
      setNameError('Name is required (e.g. Netflix, Rent).');
      return;
    }

    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) {
      setAmountError('Please enter a valid amount.');
      return;
    }

    const currentWallet = wallets.find((w) => w.id === selectedWalletId);

    try {
      setLoading(true);
      await createRecurringPayment({
        name: name.trim(),
        amount: numeric,
        type: 'expense',
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        walletId: selectedWalletId,
        walletName: currentWallet?.name || 'Wallet',
        frequency,
        startDate,
        nextDueDate: startDate,
        reminderEnabled: true,
        isActive: true,
        notes: notes.trim(),
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save recurring payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Add Recurring Payment" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Frequency Selector */}
          <View style={{ marginVertical: spacing.sm }}>
            <SegmentedControl
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              selectedValue={frequency}
              onValueChange={(f) => setFrequency(f as any)}
            />
          </View>

          {/* Amount Input */}
          <AmountInput
            value={amount}
            onChangeText={(txt) => {
              setAmount(txt);
              if (amountError) setAmountError('');
            }}
            currencySymbol={currencySymbol}
            error={amountError}
          />

          {/* Payment Name */}
          <TextInput
            label="Payment Name"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. House Rent, Netflix, Car EMI, Wi-Fi"
            error={nameError}
          />

          {/* Category Picker */}
          <CategoryPicker
            type="expense"
            selectedCategoryId={selectedCategory.id}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* Wallet Selector */}
          <WalletPicker
            label="Default Wallet for this Payment"
            wallets={wallets}
            selectedWalletId={selectedWalletId}
            onSelectWallet={(w) => setSelectedWalletId(w.id)}
          />

          {/* Start Date */}
          <View style={{ marginTop: spacing.xs }}>
            <Button
              title={`Start Date: ${startDate}`}
              onPress={() => setShowDatePicker(true)}
              variant="secondary"
              size="md"
              icon={<Calendar size={18} color={colors.primary} />}
            />
          </View>

          {/* Notes */}
          <View style={{ marginTop: spacing.md }}>
            <TextInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Account numbers, reminder details..."
            />
          </View>

          {/* Submit Button */}
          <View style={{ marginTop: spacing.xl, marginBottom: 32 }}>
            <Button
              title="Save Recurring Payment"
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

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={startDate}
        onSelectDate={(newD) => setStartDate(newD)}
        onClose={() => setShowDatePicker(false)}
      />
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
});
