import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/common/Header';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { TextInput, AmountInput } from '@/components/common/Input';
import { WalletPicker } from '@/components/transactions/WalletPicker';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { format } from 'date-fns';
import {
  Phone,
  Calendar,
  HandCoins,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function PersonDetailScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { people, transactions, wallets, recordRepayment, removePerson } = useData();
  const { currencySymbol, format: formatMoney } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();
  const { personId, autoOpenRepay } = useLocalSearchParams<{
    personId: string;
    mode?: string;
    autoOpenRepay?: string;
  }>();

  const person = people.find((p) => p.id === personId);

  const [showRepayModal, setShowRepayModal] = useState(autoOpenRepay === 'true');
  const [repayType, setRepayType] = useState<'received' | 'given'>('received');
  const [repayAmount, setRepayAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    wallets[0]?.id || ''
  );
  const [repayDate, setRepayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [repayNotes, setRepayNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [repayError, setRepayError] = useState('');

  // Transactions associated with this person
  const personTransactions = useMemo(() => {
    if (!personId) return [];
    return transactions.filter(
      (tx) =>
        tx.personId === personId ||
        (person && tx.personName?.toLowerCase() === person.name.toLowerCase())
    );
  }, [transactions, personId, person]);

  useEffect(() => {
    if (person) {
      // Set default repay type based on which balance is non-zero
      if (person.remainingReceivable > 0) {
        setRepayType('received');
        setRepayAmount(person.remainingReceivable.toString());
      } else if (person.remainingPayable > 0) {
        setRepayType('given');
        setRepayAmount(person.remainingPayable.toString());
      }
    }
  }, [person]);

  if (!person) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Person Record" showBack onBackPress={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.md }}>
            Person not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isReceivable = person.remainingReceivable > 0;
  const isPayable = person.remainingPayable > 0;
  const isSettled = person.remainingReceivable === 0 && person.remainingPayable === 0;

  const handleRecordRepayment = async () => {
    setRepayError('');
    const numeric = parseFloat(repayAmount);
    if (isNaN(numeric) || numeric <= 0) {
      setRepayError('Please enter a valid repayment amount.');
      return;
    }

    if (!selectedWalletId) {
      showToast('Please select a payment wallet.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await recordRepayment(
        person.id,
        person.name,
        repayType,
        selectedWalletId,
        numeric,
        repayDate,
        repayNotes.trim()
      );

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      showToast(`Repayment of ${formatMoney(numeric)} recorded successfully!`, 'success');
      setShowRepayModal(false);
      setRepayAmount('');
      setRepayNotes('');
    } catch (err: any) {
      showToast(err.message || 'Failed to record repayment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async () => {
    try {
      setDeleteLoading(true);
      await removePerson(person.id);
      setShowDeleteModal(false);
      showToast(`${person.name} deleted.`, 'info');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete person.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={person.name}
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDeleteModal(true)}
            style={[
              styles.deleteBtn,
              { backgroundColor: colors.errorLight, borderColor: colors.error },
            ]}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
      >
        {/* Person Hero Header Card */}
        <Card variant="elevated" padding={spacing.lg} style={[styles.heroCard, shadows.sm]}>
          <View style={styles.heroRow}>
            <Avatar name={person.name} size={54} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text
                  style={[
                    styles.heroName,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.lg,
                      fontWeight: typography.weights.bold,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {person.name}
                </Text>
                <Badge
                  label={person.status.replace('_', ' ')}
                  variant={
                    person.status === 'paid'
                      ? 'success'
                      : person.status === 'partially_paid'
                      ? 'warning'
                      : 'error'
                  }
                />
              </View>

              {person.phone ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Phone size={12} color={colors.textTertiary} style={{ marginRight: 4 }} />
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    {person.phone}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Outstanding Balance Highlight */}
          <View
            style={[
              styles.outstandingBox,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.xl,
                padding: spacing.md,
                marginTop: spacing.lg,
              },
            ]}
          >
            {/* Money Given (Receivable) */}
            <View style={styles.outRow}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                  Money Lent (Given)
                </Text>
                <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '700', marginTop: 1 }}>
                  {formatMoney(person.totalGiven)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                  Received Back
                </Text>
                <Text style={{ color: colors.income, fontSize: typography.sizes.sm, fontWeight: '700', marginTop: 1 }}>
                  {formatMoney(person.totalReceived)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.lend, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  Receivable
                </Text>
                <Text style={{ color: colors.lend, fontSize: typography.sizes.md, fontWeight: 'bold', marginTop: 1 }}>
                  {formatMoney(person.remainingReceivable)}
                </Text>
              </View>
            </View>

            {/* Money Borrowed (Payable) if any */}
            {person.totalBorrowed > 0 && (
              <View
                style={[
                  styles.outRow,
                  {
                    borderTopColor: colors.borderLight,
                    borderTopWidth: 1,
                    marginTop: spacing.md,
                    paddingTop: spacing.sm,
                  },
                ]}
              >
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    Borrowed
                  </Text>
                  <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '700', marginTop: 1 }}>
                    {formatMoney(person.totalBorrowed)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    Repaid
                  </Text>
                  <Text style={{ color: colors.income, fontSize: typography.sizes.sm, fontWeight: '700', marginTop: 1 }}>
                    {formatMoney(person.totalRepaid)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.borrow, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                    Payable
                  </Text>
                  <Text style={{ color: colors.borrow, fontSize: typography.sizes.md, fontWeight: 'bold', marginTop: 1 }}>
                    {formatMoney(person.remainingPayable)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Button */}
          <View style={{ marginTop: spacing.md }}>
            <Button
              title={
                person.remainingReceivable > 0
                  ? 'Record Repayment Received'
                  : person.remainingPayable > 0
                  ? 'Record Repayment Paid'
                  : 'Record New Repayment / Settlement'
              }
              onPress={() => setShowRepayModal(true)}
              variant="primary"
              size="md"
              icon={<HandCoins size={18} color="#FFFFFF" />}
            />
          </View>
        </Card>

        {/* Transaction History with this Person */}
        <View style={{ marginTop: spacing.lg }}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights.bold,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Transaction History ({personTransactions.length})
          </Text>

          {personTransactions.length > 0 ? (
            <View
              style={[
                styles.historyCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  borderWidth: 1,
                  overflow: 'hidden',
                },
              ]}
            >
              {personTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  showDate
                  onPress={(item) =>
                    router.push({ pathname: '/edit-transaction', params: { id: item.id } })
                  }
                />
              ))}
            </View>
          ) : (
            <Card variant="outlined" padding={spacing.lg}>
              <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.sm, textAlign: 'center' }}>
                No past transactions found for {person.name}.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Record Repayment Modal */}
      {showRepayModal && (
        <Modal visible={showRepayModal} transparent animationType="slide" onRequestClose={() => setShowRepayModal(false)}>
          <TouchableWithoutFeedback onPress={() => setShowRepayModal(false)}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalSheet,
                    {
                      backgroundColor: colors.card,
                      borderTopLeftRadius: radius['2xl'],
                      borderTopRightRadius: radius['2xl'],
                      borderColor: colors.border,
                      padding: spacing.lg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.sizes.lg,
                      fontWeight: typography.weights.bold,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Record Repayment with {person.name}
                  </Text>

                  {/* Type Toggle: Received vs Paid */}
                  <View style={styles.repayTypeRow}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setRepayType('received')}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            repayType === 'received' ? colors.incomeLight : colors.surfaceSecondary,
                          borderColor: repayType === 'received' ? colors.income : colors.border,
                          borderRadius: radius.lg,
                          borderWidth: 1,
                          marginRight: 8,
                        },
                      ]}
                    >
                      <ArrowDownLeft size={16} color={colors.income} style={{ marginRight: 4 }} />
                      <Text
                        style={{
                          color: repayType === 'received' ? colors.income : colors.textSecondary,
                          fontSize: typography.sizes.xs,
                          fontWeight: '700',
                        }}
                      >
                        Repayment Received (+Wallet)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setRepayType('given')}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            repayType === 'given' ? colors.expenseLight : colors.surfaceSecondary,
                          borderColor: repayType === 'given' ? colors.expense : colors.border,
                          borderRadius: radius.lg,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <ArrowUpRight size={16} color={colors.expense} style={{ marginRight: 4 }} />
                      <Text
                        style={{
                          color: repayType === 'given' ? colors.expense : colors.textSecondary,
                          fontSize: typography.sizes.xs,
                          fontWeight: '700',
                        }}
                      >
                        Repayment Paid (-Wallet)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Amount Input */}
                  <AmountInput
                    value={repayAmount}
                    onChangeText={(txt) => {
                      setRepayAmount(txt);
                      if (repayError) setRepayError('');
                    }}
                    currencySymbol={currencySymbol}
                    error={repayError}
                  />

                  {/* Wallet Picker */}
                  <WalletPicker
                    label={repayType === 'received' ? 'Deposit Into Wallet' : 'Pay From Wallet'}
                    wallets={wallets}
                    selectedWalletId={selectedWalletId}
                    onSelectWallet={(w) => setSelectedWalletId(w.id)}
                  />

                  {/* Date Box */}
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
                        marginVertical: spacing.sm,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Calendar size={18} color={colors.primary} style={{ marginRight: 8 }} />
                    <View>
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>Date</Text>
                      <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                        {repayDate}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Notes */}
                  <TextInput
                    label="Notes"
                    value={repayNotes}
                    onChangeText={setRepayNotes}
                    placeholder="Partial / Full settlement notes..."
                  />

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
                    <View style={{ flex: 1, marginRight: spacing.sm }}>
                      <Button
                        title="Cancel"
                        onPress={() => setShowRepayModal(false)}
                        variant="secondary"
                        size="md"
                      />
                    </View>
                    <View style={{ flex: 1.5 }}>
                      <Button
                        title="Save Repayment"
                        onPress={handleRecordRepayment}
                        variant={repayType === 'received' ? 'success' : 'primary'}
                        size="md"
                        loading={loading}
                      />
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Date Picker */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={repayDate}
        onSelectDate={(newD) => setRepayDate(newD)}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Delete Person Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title={`Delete ${person.name}?`}
        message="Are you sure you want to remove this person from your lending records?"
        confirmText="Delete Person"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeletePerson}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {},
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroName: {
    letterSpacing: -0.2,
  },
  outstandingBox: {},
  outRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  historyCard: {},
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopWidth: 1,
  },
  repayTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
