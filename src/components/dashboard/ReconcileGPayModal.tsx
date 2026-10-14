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
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Smartphone,
  RefreshCw,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface ReconcileGPayModalProps {
  visible: boolean;
  onClose: () => void;
  onReviewTransactions?: () => void;
}

export function ReconcileGPayModal({
  visible,
  onClose,
  onReviewTransactions,
}: ReconcileGPayModalProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { gpayWallet, gpayBalance, reconcileGPayBalance } = useData();
  const { format, currencySymbol } = useCurrency();
  const { showToast } = useToast();

  const [actualBalanceInput, setActualBalanceInput] = useState('');
  const [notes, setNotes] = useState('');
  const [createAdjustment, setCreateAdjustment] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const numericActual = parseFloat(actualBalanceInput);
  const hasValidInput = !isNaN(numericActual) && actualBalanceInput.trim() !== '';
  const diff = hasValidInput ? Number((numericActual - gpayBalance).toFixed(2)) : 0;
  const isMatch = hasValidInput && Math.abs(diff) < 0.01;

  const handleReconcile = async () => {
    setError('');
    if (!hasValidInput) {
      setError('Please enter the balance shown in your Google Pay app.');
      return;
    }

    try {
      setLoading(true);
      const res = await reconcileGPayBalance(numericActual, createAdjustment, notes.trim());

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      if (Math.abs(res.diff) < 0.01) {
        showToast('GPay balance verified! App balance is 100% accurate.', 'success');
      } else if (createAdjustment) {
        showToast(
          `GPay reconciled! Adjustment of ${format(Math.abs(res.diff))} recorded.`,
          'success'
        );
      } else {
        showToast(
          `GPay verified with ${format(Math.abs(res.diff))} difference noted.`,
          'info'
        );
      }

      setActualBalanceInput('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reconcile balance.');
      showToast(err.message || 'Failed to reconcile balance.', 'error');
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
                      <Smartphone size={20} color={colors.primary} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.title,
                          { color: colors.text, fontSize: typography.sizes.lg, fontWeight: '700' },
                        ]}
                      >
                        Reconcile Google Pay
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                        Verify app balance with your real GPay balance
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
                  {/* Current App Balance Card */}
                  <View
                    style={[
                      styles.currentBalanceCard,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderRadius: radius.xl,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: typography.sizes.xs,
                        fontWeight: '500',
                      }}
                    >
                      PET Finance Calculated GPay Balance
                    </Text>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: typography.sizes['2xl'],
                        fontWeight: '800',
                        marginTop: 2,
                      }}
                    >
                      {format(gpayBalance)}
                    </Text>
                  </View>

                  {/* Input for Real GPay Balance */}
                  <View style={{ marginTop: spacing.md }}>
                    <AmountInput
                      label="Actual Balance shown in Google Pay"
                      value={actualBalanceInput}
                      onChangeAmount={(val) => {
                        setActualBalanceInput(val);
                        setError('');
                      }}
                      currencySymbol={currencySymbol}
                      placeholder="0.00"
                      error={error}
                    />
                  </View>

                  {/* Live Difference Analysis */}
                  {hasValidInput && (
                    <View
                      style={[
                        styles.diffBox,
                        {
                          backgroundColor: isMatch
                            ? colors.successLight
                            : diff > 0
                            ? colors.incomeLight
                            : colors.warningLight,
                          borderColor: isMatch
                            ? colors.success
                            : diff > 0
                            ? colors.income
                            : colors.warning,
                          borderRadius: radius.lg,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isMatch ? (
                          <CheckCircle2 size={18} color={colors.success} style={{ marginRight: 8 }} />
                        ) : (
                          <AlertTriangle
                            size={18}
                            color={diff > 0 ? colors.income : colors.warning}
                            style={{ marginRight: 8 }}
                          />
                        )}
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: typography.sizes.sm,
                            fontWeight: '600',
                          }}
                        >
                          {isMatch
                            ? 'Perfect Match! No discrepancy found.'
                            : diff > 0
                            ? `GPay has ${format(diff)} more than tracked`
                            : `GPay has ${format(Math.abs(diff))} less than tracked`}
                        </Text>
                      </View>

                      {!isMatch && (
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: typography.sizes.xs,
                            marginTop: 4,
                          }}
                        >
                          {diff > 0
                            ? 'You might have received money or cash that was not recorded yet.'
                            : 'You may have made a quick purchase that was not entered into PET Finance.'}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Adjustment Transaction Option */}
                  {hasValidInput && !isMatch && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setCreateAdjustment(!createAdjustment)}
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          borderRadius: radius.lg,
                          borderColor: createAdjustment ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: createAdjustment ? colors.primary : colors.border,
                            backgroundColor: createAdjustment ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {createAdjustment && <CheckCircle2 size={14} color="#FFFFFF" />}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: typography.sizes.xs,
                            fontWeight: '600',
                          }}
                        >
                          Auto-create reconciliation adjustment transaction
                        </Text>
                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: typography.sizes.xxs,
                            marginTop: 2,
                          }}
                        >
                          Preserves historical integrity without silently overwriting data.
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Notes input */}
                  {hasValidInput && !isMatch && createAdjustment && (
                    <View style={{ marginTop: spacing.sm }}>
                      <TextInput
                        label="Reconciliation Notes (Optional)"
                        placeholder="e.g. Small tea/coffee payments not tracked"
                        value={notes}
                        onChangeText={setNotes}
                      />
                    </View>
                  )}

                  {/* Review Missing Transactions Link */}
                  {hasValidInput && !isMatch && onReviewTransactions && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        onClose();
                        onReviewTransactions();
                      }}
                      style={styles.reviewBtn}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontSize: typography.sizes.xs,
                          fontWeight: '600',
                        }}
                      >
                        Review Recent GPay Transactions Instead
                      </Text>
                      <ArrowRight size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {/* Action Buttons */}
                <View style={[styles.footer, { marginTop: spacing.lg }]}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={onClose}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title={isMatch ? 'Confirm Match' : 'Reconcile Balance'}
                    variant="primary"
                    loading={loading}
                    onPress={handleReconcile}
                    style={{ flex: 1.5 }}
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
  currentBalanceCard: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  diffBox: {
    padding: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
