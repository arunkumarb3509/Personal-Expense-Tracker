import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { AmountInput, TextInput } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { PiggyBank, X, ArrowRight, ShieldCheck, Wallet as WalletIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface RecordSavingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RecordSavingsModal({ visible, onClose }: RecordSavingsModalProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { wallets, gpayWallet, recordSavingsContribution, createWallet } = useData();
  const { format, currencySymbol } = useCurrency();
  const { showToast } = useToast();

  // Find or determine savings wallet
  const savingsWallets = wallets.filter((w) => w.type === 'savings');
  const defaultSavingsWallet = savingsWallets[0] || null;

  const [fromWalletId, setFromWalletId] = useState<string>(
    gpayWallet ? gpayWallet.id : wallets[0]?.id || ''
  );
  const [savingsWalletId, setSavingsWalletId] = useState<string>(
    defaultSavingsWallet ? defaultSavingsWallet.id : ''
  );
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sourceWallet = wallets.find((w) => w.id === fromWalletId);

  const handleSave = async () => {
    setError('');
    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) {
      setError('Please enter a valid savings amount.');
      return;
    }

    if (!fromWalletId) {
      setError('Please select a source wallet.');
      return;
    }

    if (sourceWallet && sourceWallet.currentBalance < numeric) {
      setError(
        `Insufficient funds in ${sourceWallet.name}. Current balance: ${format(
          sourceWallet.currentBalance
        )}`
      );
      return;
    }

    try {
      setLoading(true);

      // If no savings wallet exists, create a default Savings Vault first
      let targetId = savingsWalletId;
      if (!targetId) {
        const newSavings = await createWallet({
          name: 'Savings Vault',
          type: 'savings',
          openingBalance: 0,
          currency: 'INR',
          color: '#F59E0B',
          icon: 'PiggyBank',
        });
        targetId = newSavings.id;
      }

      await recordSavingsContribution(fromWalletId, targetId, numeric, notes.trim());

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      showToast(
        `Savings recorded! ${format(numeric)} moved to Savings Vault as a transfer.`,
        'success'
      );
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record savings.');
      showToast(err.message || 'Failed to record savings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ width: '100%', maxWidth: 420 }}
            >
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radius['2xl'],
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.iconBadge,
                        { backgroundColor: colors.primaryLight, borderRadius: radius.full },
                      ]}
                    >
                      <PiggyBank size={20} color={colors.primary} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.title,
                          { color: colors.text, fontSize: typography.sizes.lg, fontWeight: '700' },
                        ]}
                      >
                        Add to Savings Vault
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                        Move money into savings without counting as an expense
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Source Wallet Selector */}
                  <View style={{ marginBottom: spacing.md }}>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: typography.sizes.xs,
                        fontWeight: '600',
                        marginBottom: 6,
                      }}
                    >
                      Deduct from Wallet (e.g. GPay)
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {wallets
                        .filter((w) => w.type !== 'savings')
                        .map((w) => {
                          const isSelected = w.id === fromWalletId;
                          return (
                            <TouchableOpacity
                              key={w.id}
                              onPress={() => setFromWalletId(w.id)}
                              style={[
                                styles.walletPill,
                                {
                                  backgroundColor: isSelected
                                    ? colors.primary
                                    : colors.surfaceSecondary,
                                  borderColor: isSelected ? colors.primary : colors.border,
                                  borderRadius: radius.lg,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: isSelected ? '#FFFFFF' : colors.text,
                                  fontSize: typography.sizes.xs,
                                  fontWeight: '600',
                                }}
                              >
                                {w.name} ({format(w.currentBalance)})
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </ScrollView>
                  </View>

                  <AmountInput
                    label="Savings Amount"
                    value={amount}
                    onChangeAmount={(val) => {
                      setAmount(val);
                      setError('');
                    }}
                    currencySymbol={currencySymbol}
                    placeholder="0.00"
                    error={error}
                  />

                  <View style={{ marginTop: spacing.md }}>
                    <TextInput
                      label="Goal / Purpose (Optional)"
                      placeholder="e.g. Emergency fund, vacation, bike savings"
                      value={notes}
                      onChangeText={setNotes}
                    />
                  </View>

                  {/* Financial Rule Notice */}
                  <View
                    style={[
                      styles.noticeBox,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderRadius: radius.lg,
                        borderColor: colors.borderLight,
                        marginTop: spacing.md,
                      },
                    ]}
                  >
                    <ShieldCheck size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: typography.sizes.xxs,
                        flex: 1,
                      }}
                    >
                      Transfer rule applied: Reduces {sourceWallet?.name || 'GPay'} and increases Savings Vault. It will NOT inflate monthly expenses or double-count in net worth.
                    </Text>
                  </View>
                </ScrollView>

                <View style={[styles.footer, { marginTop: spacing.lg }]}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={onClose}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Transfer to Savings"
                    variant="primary"
                    loading={loading}
                    onPress={handleSave}
                    style={{ flex: 1.6 }}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBadge: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {},
  closeBtn: {
    padding: 6,
  },
  walletPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
