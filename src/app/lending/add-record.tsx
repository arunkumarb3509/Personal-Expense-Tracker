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
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput, AmountInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { WalletPicker } from '@/components/transactions/WalletPicker';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { format } from 'date-fns';
import { User, Calendar, CheckCircle2, Phone } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AddLendingRecordModal() {
  const { colors, typography, radius, spacing } = useTheme();
  const { wallets, people, createPerson, recordLending, recordBorrowing } = useData();
  const { currencySymbol } = useCurrency();
  const router = useRouter();

  const [type, setType] = useState<'given' | 'borrowed'>('given');
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    wallets[0]?.id || ''
  );
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  const handleSelectExistingPerson = (p: (typeof people)[0]) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setPersonName(p.name);
    if (p.phone) setPersonPhone(p.phone);
  };

  const handleSave = async () => {
    setNameError('');
    setAmountError('');

    if (!personName.trim()) {
      setNameError('Person name is required.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid amount.');
      return;
    }

    if (!selectedWalletId) {
      Alert.alert('Wallet required', 'Please select a wallet.');
      return;
    }

    try {
      setLoading(true);

      // 1. Check if person already exists or create new
      let person = people.find(
        (p) => p.name.toLowerCase().trim() === personName.toLowerCase().trim()
      );
      if (!person) {
        person = await createPerson({
          name: personName.trim(),
          phone: personPhone.trim(),
          notes: notes.trim(),
        });
      }

      // 2. Record lending or borrowing transaction
      if (type === 'given') {
        await recordLending(
          person.id,
          person.name,
          selectedWalletId,
          numericAmount,
          date,
          `Money given to ${person.name}`,
          notes.trim() + (dueDate ? ` | Due: ${dueDate}` : '')
        );
      } else {
        await recordBorrowing(
          person.id,
          person.name,
          selectedWalletId,
          numericAmount,
          date,
          `Money borrowed from ${person.name}`,
          notes.trim() + (dueDate ? ` | Due: ${dueDate}` : '')
        );
      }

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={type === 'given' ? 'Record Money Given' : 'Record Money Borrowed'}
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
          {/* Segmented Mode Selector */}
          <View style={{ marginVertical: spacing.sm }}>
            <SegmentedControl
              options={[
                { value: 'given', label: 'Money Given (Lend)' },
                { value: 'borrowed', label: 'Money Borrowed' },
              ]}
              selectedValue={type}
              onValueChange={(t) => setType(t as any)}
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

          {/* Existing People Quick Select */}
          {people.length > 0 && (
            <View style={{ marginBottom: spacing.sm }}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.sizes.xs,
                  fontWeight: '600',
                  marginBottom: 6,
                }}
              >
                Quick Select Person:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {people.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectExistingPerson(p)}
                    style={[
                      styles.personChip,
                      {
                        backgroundColor:
                          personName === p.name ? colors.primaryLight : colors.surfaceSecondary,
                        borderColor: personName === p.name ? colors.primary : colors.border,
                        borderRadius: radius.full,
                        marginRight: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: personName === p.name ? colors.primary : colors.text,
                        fontSize: typography.sizes.xs,
                        fontWeight: personName === p.name ? '700' : '500',
                      }}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Person Name Input */}
          <TextInput
            label="Person Name"
            value={personName}
            onChangeText={(txt) => {
              setPersonName(txt);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Rahul Sharma, Suresh"
            leftIcon={<User size={18} color={colors.textSecondary} />}
            error={nameError}
          />

          {/* Optional Phone */}
          <TextInput
            label="Phone Number (Optional)"
            value={personPhone}
            onChangeText={setPersonPhone}
            placeholder="e.g. +91 98765 43210"
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={colors.textSecondary} />}
          />

          {/* Wallet Selector */}
          <WalletPicker
            label={type === 'given' ? 'Pay From Wallet' : 'Deposit Into Wallet'}
            wallets={wallets}
            selectedWalletId={selectedWalletId}
            onSelectWallet={(w) => setSelectedWalletId(w.id)}
          />

          {/* Date & Due Date Row */}
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateBox,
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

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDueDatePicker(true)}
              style={[
                styles.dateBox,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  marginLeft: spacing.sm,
                },
              ]}
            >
              <Calendar size={18} color={colors.warning} style={{ marginRight: 8 }} />
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>Due Date (Optional)</Text>
                <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                  {dueDate || 'Not set'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={{ marginTop: spacing.md }}>
            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Reason, repayment promise, terms..."
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Submit Button */}
          <View style={{ marginTop: spacing.xl, marginBottom: 32 }}>
            <Button
              title={type === 'given' ? 'Record Money Given' : 'Record Money Borrowed'}
              onPress={handleSave}
              variant={type === 'given' ? 'warning' : 'primary'}
              size="lg"
              loading={loading}
              icon={<CheckCircle2 size={20} color="#FFFFFF" />}
              iconPosition="right"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={date}
        onSelectDate={(newD) => setDate(newD)}
        onClose={() => setShowDatePicker(false)}
      />
      <DatePickerModal
        visible={showDueDatePicker}
        selectedDate={dueDate || date}
        onSelectDate={(newD) => setDueDate(newD)}
        onClose={() => setShowDueDatePicker(false)}
        title="Select Due Date"
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
  personChip: {},
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
