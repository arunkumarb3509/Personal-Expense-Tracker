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
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { AmountInput } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Smartphone, X, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface SetGPayBalanceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SetGPayBalanceModal({ visible, onClose }: SetGPayBalanceModalProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { gpayWallet, setStartingGPayBalance } = useData();
  const { format, currencySymbol } = useCurrency();
  const { showToast } = useToast();

  const [startingAmount, setStartingAmount] = useState(
    gpayWallet ? (gpayWallet.openingBalance || 0).toString() : '0'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveStartingBalance = async () => {
    setError('');
    const numeric = parseFloat(startingAmount);
    if (isNaN(numeric) || numeric < 0) {
      setError('Please enter a valid starting balance (e.g. 500.00).');
      return;
    }

    try {
      setLoading(true);
      await setStartingGPayBalance(numeric);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      showToast(`Starting GPay balance set to ${format(numeric)}!`, 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update starting balance.');
      showToast(err.message || 'Failed to update starting balance.', 'error');
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
              style={{ width: '100%', maxWidth: 400 }}
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
                        Set Starting GPay Balance
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                        Accurate starting point for your wallet
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Info callout */}
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderRadius: radius.lg,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <ShieldCheck size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      flex: 1,
                    }}
                  >
                    Open your Google Pay app right now and enter the balance shown in your linked bank/account.
                  </Text>
                </View>

                <View style={{ marginTop: spacing.md }}>
                  <AmountInput
                    label="Verified Starting Balance"
                    value={startingAmount}
                    onChangeAmount={(val) => {
                      setStartingAmount(val);
                      setError('');
                    }}
                    currencySymbol={currencySymbol}
                    placeholder="0.00"
                    error={error}
                  />
                </View>

                <View style={[styles.footer, { marginTop: spacing.lg }]}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={onClose}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Save Balance"
                    variant="primary"
                    loading={loading}
                    onPress={handleSaveStartingBalance}
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
    marginBottom: 14,
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
  infoBox: {
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
