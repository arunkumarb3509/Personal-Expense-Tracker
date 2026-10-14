import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput, AmountInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { WalletPicker } from '@/components/transactions/WalletPicker';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { TransactionType, Category } from '@/types/transaction';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AddTransactionModal() {
  const { colors, typography, radius, spacing } = useTheme();
  const { wallets, createTransaction } = useData();
  const { currencySymbol } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();

  const [type, setType] = useState<TransactionType>(
    params.type === 'income' ? 'income' : 'expense'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Default Category
  const initialCategory = type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    initialCategory.subcategories ? initialCategory.subcategories[0] : ''
  );

  // Default Wallet (prefer default wallet or first available)
  const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0];
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    defaultWallet ? defaultWallet.id : ''
  );

  // Date and Time
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const nowTimeStr = format(new Date(), 'HH:mm');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTimeStr);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [walletError, setWalletError] = useState('');

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const def = wallets.find((w) => w.isDefault) || wallets[0];
      setSelectedWalletId(def.id);
    }
  }, [wallets, selectedWalletId]);

  // When type changes, switch default category
  const handleTypeChange = (newType: string) => {
    const t = newType as TransactionType;
    setType(t);
    const defaultCat = t === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    setSelectedCategory(defaultCat);
    setSelectedSubcategory(
      defaultCat.subcategories && defaultCat.subcategories.length > 0
        ? defaultCat.subcategories[0]
        : ''
    );
  };

  const handleSelectCategory = (cat: Category, sub?: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(sub || '');
    // If description is empty, default to subcategory or category name
    if (!description || description === selectedCategory.name || description === selectedSubcategory) {
      setDescription(sub || cat.name);
    }
  };

  const handleSave = async () => {
    setAmountError('');
    setWalletError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!selectedWalletId) {
      setWalletError('Please select a payment wallet or account.');
      return;
    }

    const currentWallet = wallets.find((w) => w.id === selectedWalletId);
    const finalDesc = description.trim() || selectedSubcategory || selectedCategory.name;

    try {
      setLoading(true);
      await createTransaction({
        amount: numericAmount,
        type,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        subcategory: selectedSubcategory,
        walletId: selectedWalletId,
        walletName: currentWallet?.name || 'Wallet',
        date,
        time,
        description: finalDesc,
        notes: notes.trim(),
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      showToast(
        type === 'expense'
          ? `Expense of ${currencySymbol}${numericAmount} saved successfully!`
          : `Income of ${currencySymbol}${numericAmount} saved successfully!`,
        'success'
      );

      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to save transaction.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={type === 'expense' ? 'Add Expense' : 'Add Income'}
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
          {/* Segmented Type Selector */}
          <View style={{ marginVertical: spacing.sm }}>
            <SegmentedControl
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
              selectedValue={type}
              onValueChange={handleTypeChange}
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

          {/* Category & Subcategory Selector */}
          <CategoryPicker
            type={type === 'income' ? 'income' : 'expense'}
            selectedCategoryId={selectedCategory.id}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* Wallet Selector */}
          <WalletPicker
            wallets={wallets}
            selectedWalletId={selectedWalletId}
            onSelectWallet={(w) => {
              setSelectedWalletId(w.id);
              if (walletError) setWalletError('');
            }}
            error={walletError}
          />

          {/* Date & Time Row */}
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateTimeBox,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  marginRight: spacing.sm,
                },
              ]}
            >
              <Calendar size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>Date</Text>
                <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  {date === todayStr ? 'Today' : date}
                </Text>
              </View>
            </TouchableOpacity>

            <View
              style={[
                styles.dateTimeBox,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  marginLeft: spacing.sm,
                },
              ]}
            >
              <Clock size={18} color={colors.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>Time</Text>
                <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  {time}
                </Text>
              </View>
            </View>
          </View>

          {/* Description / Title Input */}
          <View style={{ marginTop: spacing.md }}>
            <TextInput
              label="Description / Title"
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Morning Tea, Lunch, Metro Recharge"
              leftIcon={<FileText size={18} color={colors.textSecondary} />}
            />
          </View>

          {/* Optional Notes */}
          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional details or tags..."
            multiline
            numberOfLines={2}
          />

          {/* Save Button */}
          <View style={{ marginTop: spacing.lg, marginBottom: 32 }}>
            <Button
              title={type === 'expense' ? 'Save Expense' : 'Save Income'}
              onPress={handleSave}
              variant={type === 'expense' ? 'primary' : 'success'}
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
        selectedDate={date}
        onSelectDate={(newDate) => setDate(newDate)}
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
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  dateTimeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
