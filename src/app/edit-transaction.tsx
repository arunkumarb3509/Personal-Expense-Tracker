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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput, AmountInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { WalletPicker } from '@/components/transactions/WalletPicker';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { getCategoryById } from '@/constants/categories';
import { Transaction, Category } from '@/types/transaction';
import { Calendar, Clock, Trash2, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function EditTransactionModal() {
  const { colors, typography, radius, spacing } = useTheme();
  const { transactions, wallets, editTransaction, removeTransaction } = useData();
  const { currencySymbol } = useCurrency();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const transaction = transactions.find((t) => t.id === id);

  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [notes, setNotes] = useState(transaction ? transaction.notes || '' : '');
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    transaction ? getCategoryById(transaction.categoryId) : getCategoryById('other')
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    transaction?.subcategory || ''
  );
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    transaction?.walletId || (wallets[0]?.id || '')
  );
  const [date, setDate] = useState(transaction?.date || '');
  const [time, setTime] = useState(transaction?.time || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setNotes(transaction.notes || '');
      setSelectedCategory(getCategoryById(transaction.categoryId));
      setSelectedSubcategory(transaction.subcategory || '');
      setSelectedWalletId(transaction.walletId);
      setDate(transaction.date);
      setTime(transaction.time || '');
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Transaction Details" showBack onBackPress={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.md }}>
            Transaction not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSelectCategory = (cat: Category, sub?: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(sub || '');
  };

  const handleUpdate = async () => {
    setAmountError('');
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid amount greater than 0.');
      return;
    }

    const currentWallet = wallets.find((w) => w.id === selectedWalletId);

    try {
      setLoading(true);
      await editTransaction(transaction, {
        amount: numericAmount,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        subcategory: selectedSubcategory,
        walletId: selectedWalletId,
        walletName: currentWallet?.name || transaction.walletName,
        date,
        time,
        description: description.trim(),
        notes: notes.trim(),
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await removeTransaction(transaction);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      setShowDeleteModal(false);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete transaction.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Edit Transaction"
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDeleteModal(true)}
            style={[
              styles.deleteIconBtn,
              { backgroundColor: colors.errorLight, borderColor: colors.error },
            ]}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        }
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
          <AmountInput
            value={amount}
            onChangeText={(txt) => {
              setAmount(txt);
              if (amountError) setAmountError('');
            }}
            currencySymbol={currencySymbol}
            error={amountError}
          />

          {/* Category Selector */}
          <CategoryPicker
            type={transaction.type === 'income' ? 'income' : 'expense'}
            selectedCategoryId={selectedCategory.id}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* Wallet Selector */}
          <WalletPicker
            wallets={wallets}
            selectedWalletId={selectedWalletId}
            onSelectWallet={(w) => setSelectedWalletId(w.id)}
          />

          {/* Date & Time */}
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
                  {date}
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

          {/* Description */}
          <View style={{ marginTop: spacing.md }}>
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Lunch"
            />
          </View>

          {/* Notes */}
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            multiline
            numberOfLines={2}
          />

          {/* Save Changes Button */}
          <View style={{ marginTop: spacing.lg, marginBottom: 32 }}>
            <Button
              title="Update Transaction"
              onPress={handleUpdate}
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
        selectedDate={date}
        onSelectDate={(newDate) => setDate(newDate)}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction? Your wallet balances will be automatically recalculated."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
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
  deleteIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
