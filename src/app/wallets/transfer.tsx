import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput, AmountInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { format } from 'date-fns';
import { ArrowLeftRight, ArrowDown, Calendar, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function TransferFundsModal() {
  const { colors, typography, radius, spacing } = useTheme();
  const { wallets, transfer } = useData();
  const { currencySymbol, format: formatMoney } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();

  const [fromWalletId, setFromWalletId] = useState<string>(
    wallets[0]?.id || ''
  );
  const [toWalletId, setToWalletId] = useState<string>(
    wallets[1]?.id || wallets[0]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState('');

  const fromWallet = wallets.find((w) => w.id === fromWalletId);
  const toWallet = wallets.find((w) => w.id === toWalletId);

  const handleSwap = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const temp = fromWalletId;
    setFromWalletId(toWalletId);
    setToWalletId(temp);
  };

  const handleTransfer = async () => {
    setAmountError('');

    if (fromWalletId === toWalletId) {
      showToast('Source and destination wallets cannot be the same.', 'warning');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid transfer amount.');
      return;
    }

    try {
      setLoading(true);
      await transfer(
        fromWalletId,
        toWalletId,
        numericAmount,
        date,
        description.trim() || `Transfer from ${fromWallet?.name} to ${toWallet?.name}`,
        notes.trim()
      );

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      showToast(
        `Transfer of ${formatMoney(numericAmount)} from ${fromWallet?.name} to ${toWallet?.name} completed!`,
        'success'
      );

      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete transfer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Transfer Between Wallets" showBack onBackPress={() => router.back()} />

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
              value={amount}
              onChangeText={(txt) => {
                setAmount(txt);
                if (amountError) setAmountError('');
              }}
              currencySymbol={currencySymbol}
              error={amountError}
            />
          </View>

          {/* From & To Wallets Selector */}
          <View style={styles.transferCardsWrap}>
            {/* From Wallet */}
            <View
              style={[
                styles.walletSelectBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '600' }}>
                FROM WALLET (SOURCE)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {wallets.map((w) => {
                  const isSelected = w.id === fromWalletId;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      activeOpacity={0.7}
                      onPress={() => setFromWalletId(w.id)}
                      style={[
                        styles.walletChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.lg,
                          marginRight: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primaryForeground : colors.text,
                          fontSize: typography.sizes.xs,
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {w.name} ({formatMoney(w.currentBalance)})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Swap Button Circle */}
            <View style={styles.swapBtnWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSwap}
                style={[
                  styles.swapBtn,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.card,
                    borderWidth: 3,
                  },
                ]}
              >
                <ArrowDown size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* To Wallet */}
            <View
              style={[
                styles.walletSelectBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '600' }}>
                TO WALLET (DESTINATION)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {wallets.map((w) => {
                  const isSelected = w.id === toWalletId;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      activeOpacity={0.7}
                      onPress={() => setToWalletId(w.id)}
                      style={[
                        styles.walletChip,
                        {
                          backgroundColor: isSelected ? colors.income : colors.surfaceSecondary,
                          borderColor: isSelected ? colors.income : colors.border,
                          borderRadius: radius.lg,
                          marginRight: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.text,
                          fontSize: typography.sizes.xs,
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {w.name} ({formatMoney(w.currentBalance)})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dateBox,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginTop: spacing.md,
                borderWidth: 1,
              },
            ]}
          >
            <Calendar size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>Transfer Date</Text>
              <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                {date}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Notes */}
          <View style={{ marginTop: spacing.md }}>
            <TextInput
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. ATM cash withdrawal, Salary transfer"
            />
          </View>

          {/* Info Badge */}
          <View
            style={[
              styles.infoBadge,
              {
                backgroundColor: colors.transferLight,
                borderColor: colors.transfer,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginTop: spacing.sm,
                borderWidth: 1,
              },
            ]}
          >
            <ArrowLeftRight size={18} color={colors.transfer} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontSize: typography.sizes.xs, flex: 1, lineHeight: 18 }}>
              Transfers move money between your accounts and do NOT count as an expense or affect your total net worth.
            </Text>
          </View>

          {/* Confirm Transfer Button */}
          <View style={{ marginTop: spacing.xl, marginBottom: 32 }}>
            <Button
              title="Confirm Transfer"
              onPress={handleTransfer}
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
        onSelectDate={(newD) => setDate(newD)}
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
  transferCardsWrap: {
    position: 'relative',
    marginVertical: 8,
  },
  walletSelectBox: {},
  walletChip: {},
  swapBtnWrapper: {
    alignItems: 'center',
    marginVertical: -16,
    zIndex: 10,
  },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
