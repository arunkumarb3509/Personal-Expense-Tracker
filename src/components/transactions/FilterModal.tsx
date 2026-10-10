import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '../common/Button';
import { TransactionType } from '@/types/transaction';
import { Wallet } from '@/types/wallet';
import { ALL_CATEGORIES } from '@/constants/categories';
import { X, SlidersHorizontal, Check } from 'lucide-react-native';

export interface FilterOptions {
  type?: TransactionType | 'all';
  categoryId?: string;
  walletId?: string;
  minAmount?: string;
  maxAmount?: string;
  timeRange?: 'all' | 'this_week' | 'this_month' | 'last_month';
}

export interface FilterModalProps {
  visible: boolean;
  wallets: Wallet[];
  currentFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
  onClose: () => void;
}

export function FilterModal({
  visible,
  wallets,
  currentFilters,
  onApply,
  onReset,
  onClose,
}: FilterModalProps) {
  const { colors, typography, radius, spacing } = useTheme();

  const [type, setType] = useState<TransactionType | 'all'>(currentFilters.type || 'all');
  const [categoryId, setCategoryId] = useState<string>(currentFilters.categoryId || 'all');
  const [walletId, setWalletId] = useState<string>(currentFilters.walletId || 'all');
  const [minAmount, setMinAmount] = useState<string>(currentFilters.minAmount || '');
  const [maxAmount, setMaxAmount] = useState<string>(currentFilters.maxAmount || '');
  const [timeRange, setTimeRange] = useState<FilterOptions['timeRange']>(
    currentFilters.timeRange || 'all'
  );

  const typeOptions: { label: string; value: TransactionType | 'all' }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Expense', value: 'expense' },
    { label: 'Income', value: 'income' },
    { label: 'Transfer', value: 'transfer' },
    { label: 'Lending', value: 'lend' },
    { label: 'Borrowing', value: 'borrow' },
  ];

  const timeRangeOptions: { label: string; value: FilterOptions['timeRange'] }[] = [
    { label: 'All Time', value: 'all' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
  ];

  const handleApply = () => {
    onApply({
      type,
      categoryId,
      walletId,
      minAmount,
      maxAmount,
      timeRange,
    });
    onClose();
  };

  const handleReset = () => {
    setType('all');
    setCategoryId('all');
    setWalletId('all');
    setMinAmount('');
    setMaxAmount('');
    setTimeRange('all');
    onReset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: colors.card,
                  borderTopLeftRadius: radius['2xl'],
                  borderTopRightRadius: radius['2xl'],
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={[styles.headerRow, { padding: spacing.lg, borderBottomColor: colors.borderLight }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <SlidersHorizontal size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color: colors.text,
                        fontSize: typography.sizes.lg,
                        fontWeight: typography.weights.bold,
                      },
                    ]}
                  >
                    Filter Transactions
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: spacing.lg }}
              >
                {/* Transaction Type */}
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Transaction Type
                </Text>
                <View style={styles.chipsWrap}>
                  {typeOptions.map((opt) => {
                    const isSelected = type === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.7}
                        onPress={() => setType(opt.value)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: radius.full,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.primaryForeground : colors.textSecondary,
                            fontSize: typography.sizes.xs,
                            fontWeight: isSelected
                              ? typography.weights.bold
                              : typography.weights.medium,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Date / Time Range */}
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                      marginTop: spacing.md,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Time Period
                </Text>
                <View style={styles.chipsWrap}>
                  {timeRangeOptions.map((opt) => {
                    const isSelected = timeRange === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.7}
                        onPress={() => setTimeRange(opt.value)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: radius.full,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.primaryForeground : colors.textSecondary,
                            fontSize: typography.sizes.xs,
                            fontWeight: isSelected
                              ? typography.weights.bold
                              : typography.weights.medium,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Wallet Filter */}
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                      marginTop: spacing.md,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Wallet / Account
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setWalletId('all')}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: walletId === 'all' ? colors.primary : colors.surfaceSecondary,
                        borderColor: walletId === 'all' ? colors.primary : colors.border,
                        borderRadius: radius.full,
                        marginRight: 6,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: walletId === 'all' ? colors.primaryForeground : colors.textSecondary,
                        fontSize: typography.sizes.xs,
                        fontWeight: walletId === 'all' ? typography.weights.bold : typography.weights.medium,
                      }}
                    >
                      All Wallets
                    </Text>
                  </TouchableOpacity>
                  {wallets.map((w) => {
                    const isSelected = walletId === w.id;
                    return (
                      <TouchableOpacity
                        key={w.id}
                        activeOpacity={0.7}
                        onPress={() => setWalletId(w.id)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: radius.full,
                            marginRight: 6,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.primaryForeground : colors.textSecondary,
                            fontSize: typography.sizes.xs,
                            fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                          }}
                        >
                          {w.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Category Filter */}
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                      marginTop: spacing.md,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setCategoryId('all')}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: categoryId === 'all' ? colors.primary : colors.surfaceSecondary,
                        borderColor: categoryId === 'all' ? colors.primary : colors.border,
                        borderRadius: radius.full,
                        marginRight: 6,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: categoryId === 'all' ? colors.primaryForeground : colors.textSecondary,
                        fontSize: typography.sizes.xs,
                        fontWeight: categoryId === 'all' ? typography.weights.bold : typography.weights.medium,
                      }}
                    >
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  {ALL_CATEGORIES.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.7}
                        onPress={() => setCategoryId(cat.id)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: radius.full,
                            marginRight: 6,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.primaryForeground : colors.textSecondary,
                            fontSize: typography.sizes.xs,
                            fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Amount Range */}
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                      marginTop: spacing.md,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Amount Range
                </Text>
                <View style={styles.amountRangeRow}>
                  <View
                    style={[
                      styles.amountInputBox,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                        marginRight: spacing.sm,
                      },
                    ]}
                  >
                    <TextInput
                      value={minAmount}
                      onChangeText={setMinAmount}
                      placeholder="Min (₹0)"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={{ color: colors.text, fontSize: typography.sizes.sm, padding: 10 }}
                    />
                  </View>
                  <Text style={{ color: colors.textSecondary, marginHorizontal: 4 }}>to</Text>
                  <View
                    style={[
                      styles.amountInputBox,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        borderRadius: radius.lg,
                        marginLeft: spacing.sm,
                      },
                    ]}
                  >
                    <TextInput
                      value={maxAmount}
                      onChangeText={setMaxAmount}
                      placeholder="Max (₹99999)"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      style={{ color: colors.text, fontSize: typography.sizes.sm, padding: 10 }}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Action Bottom Buttons */}
              <View
                style={[
                  styles.bottomBar,
                  {
                    borderTopColor: colors.borderLight,
                    padding: spacing.lg,
                  },
                ]}
              >
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Button title="Reset All" onPress={handleReset} variant="secondary" size="md" />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Button title="Apply Filters" onPress={handleApply} variant="primary" size="md" />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '85%',
    borderTopWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  modalTitle: {
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {},
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  amountRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInputBox: {
    flex: 1,
    borderWidth: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
});
