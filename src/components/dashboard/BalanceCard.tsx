import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useData } from '@/context/DataContext';
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  PiggyBank,
  Wallet as WalletIcon,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react-native';
import { format as formatDate } from 'date-fns';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export interface BalanceCardProps {
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onTransfer?: () => void;
  onReconcile?: () => void;
  onSetStartingBalance?: () => void;
  onRecordSavings?: () => void;
}

export function BalanceCard({
  onAddExpense,
  onAddIncome,
  onTransfer,
  onReconcile,
}: BalanceCardProps) {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const {
    wallets,
    transactions,
    activeWalletId,
    setActiveWalletId,
    activeWallet,
    activeBalance,
    totalLiquidBalance,
    totalWalletBalance,
    calculatedBalances,
  } = useData();
  const { format, currencySymbol } = useCurrency();
  const router = useRouter();

  const [hideAmount, setHideAmount] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const toggleHide = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setHideAmount(!hideAmount);
  };

  // Calculate This Month In & Out from actual transactions
  const currentMonthPrefix = useMemo(() => formatDate(new Date(), 'yyyy-MM'), []);
  const { thisMonthIn, thisMonthOut } = useMemo(() => {
    let inAmount = 0;
    let outAmount = 0;
    for (const tx of transactions) {
      if (tx.date && tx.date.startsWith(currentMonthPrefix)) {
        if (tx.type === 'income' || tx.type === 'repayment_received') {
          inAmount += tx.amount || 0;
        } else if (tx.type === 'expense' || tx.type === 'lend') {
          outAmount += tx.amount || 0;
        }
      }
    }
    return { thisMonthIn: inAmount, thisMonthOut: outAmount };
  }, [transactions, currentMonthPrefix]);

  // Determine current active account display
  const isViewingTotal = !activeWalletId || activeWalletId === 'all';
  const displayedBalance = isViewingTotal ? totalWalletBalance : activeBalance;
  const badgeLabel = isViewingTotal
    ? (wallets.length > 0 ? (activeWallet?.name || 'Primary GPay') : 'Total Balance')
    : (activeWallet?.name || 'Selected Account');

  const updatedTimeStr = useMemo(() => {
    return `Today, ${formatDate(new Date(), 'h:mm a')}`;
  }, []);

  const getWalletIcon = (type: string, color: string, size = 18) => {
    switch (type) {
      case 'upi':
        return <Smartphone size={size} color={color} />;
      case 'bank':
        return <Building2 size={size} color={color} />;
      case 'cash':
        return <Banknote size={size} color={color} />;
      case 'credit_card':
        return <CreditCard size={size} color={color} />;
      case 'savings':
        return <PiggyBank size={size} color={color} />;
      default:
        return <WalletIcon size={size} color={color} />;
    }
  };

  return (
    <View style={styles.outerWrapper}>
      {/* 1. Main Forest Card */}
      <View
        style={[
          styles.forestContainer,
          {
            backgroundColor: '#11221A',
            borderRadius: 24,
            borderColor: '#193629',
            borderWidth: 1,
          },
          shadows.md,
        ]}
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <Text style={styles.walletLabel}>
              {isViewingTotal ? 'Total Balance' : `${activeWallet?.name || 'Account'} Balance`}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleHide}
              style={styles.eyeBtn}
            >
              {hideAmount ? (
                <EyeOff size={16} color="#8BAF9C" />
              ) : (
                <Eye size={16} color="#8BAF9C" />
              )}
            </TouchableOpacity>
          </View>

          {/* Account Selector Pill Badge */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowAccountPicker(true)}
            style={styles.activeAccountBadge}
          >
            <View style={styles.badgeGreenDot} />
            <Text style={styles.activeAccountBadgeText} numberOfLines={1}>
              {badgeLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Big Balance */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.mainBalance}>
            {hideAmount ? '₹ ••••••' : format(displayedBalance)}
          </Text>
          <Text style={styles.updatedDateText}>
            Updated: {updatedTimeStr}
          </Text>
        </View>

        {/* Two Sub-Cards: This Month In & This Month Out */}
        <View style={styles.monthStatsRow}>
          {/* This Month In */}
          <View style={styles.monthStatCard}>
            <View style={[styles.arrowCircle, { backgroundColor: '#143828' }]}>
              <ArrowDown size={14} color="#34D399" strokeWidth={2.5} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.monthStatLabel}>This Month In</Text>
              <Text style={[styles.monthStatValue, { color: '#34D399' }]}>
                {hideAmount ? '••••' : `+${format(thisMonthIn)}`}
              </Text>
            </View>
          </View>

          {/* This Month Out */}
          <View style={styles.monthStatCard}>
            <View style={[styles.arrowCircle, { backgroundColor: '#381C1C' }]}>
              <ArrowUp size={14} color="#F87171" strokeWidth={2.5} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.monthStatLabel}>This Month Out</Text>
              <Text style={[styles.monthStatValue, { color: '#F87171' }]}>
                {hideAmount ? '••••' : `-${format(thisMonthOut)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Quick Action Buttons Row (Send / Receive / Top-Up / Reconcile) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddExpense}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            <ArrowUpRight size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddIncome}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            <ArrowDownLeft size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onTransfer}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            <ArrowLeftRight size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Top-Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onReconcile}
          style={styles.actionItem}
        >
          <View style={[styles.actionCircle, styles.actionCircleHighlight]}>
            <RefreshCw size={21} color="#0B291F" strokeWidth={2.4} />
          </View>
          <Text style={[styles.actionText, { color: '#B4F06A', fontWeight: '700' }]}>
            Reconcile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAccountPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheetCard}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Choose Active Account</Text>
                  <TouchableOpacity onPress={() => setShowAccountPicker(false)} style={{ padding: 4 }}>
                    <X size={18} color="#8BA699" />
                  </TouchableOpacity>
                </View>

                {/* Option for Combined All Accounts */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    try { Haptics.selectionAsync(); } catch {}
                    setActiveWalletId('all');
                    setShowAccountPicker(false);
                  }}
                  style={[
                    styles.accountOptionRow,
                    isViewingTotal && styles.accountOptionRowSelected,
                  ]}
                >
                  <View style={[styles.optionIconCircle, { backgroundColor: '#133527' }]}>
                    <WalletIcon size={20} color="#34D399" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.optionName}>All Accounts (Total)</Text>
                    <Text style={styles.optionBalance}>
                      Total Balance: {format(totalWalletBalance)}
                    </Text>
                  </View>
                  {isViewingTotal && <CheckCircle2 size={18} color="#B4F06A" />}
                </TouchableOpacity>

                <ScrollView style={{ maxHeight: 260 }}>
                  {wallets.map((w) => {
                    const isSelected = activeWalletId === w.id;
                    const bal = calculatedBalances[w.id] ?? w.currentBalance ?? 0;
                    return (
                      <TouchableOpacity
                        key={w.id}
                        activeOpacity={0.7}
                        onPress={() => {
                          try { Haptics.selectionAsync(); } catch {}
                          setActiveWalletId(w.id);
                          setShowAccountPicker(false);
                        }}
                        style={[
                          styles.accountOptionRow,
                          isSelected && styles.accountOptionRowSelected,
                        ]}
                      >
                        <View style={[styles.optionIconCircle, { backgroundColor: `${w.color || '#34D399'}22` }]}>
                          {getWalletIcon(w.type, w.color || '#34D399', 20)}
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.optionName}>{w.name}</Text>
                            {w.isDefault && (
                              <View style={styles.defaultPill}>
                                <Text style={styles.defaultPillText}>DEFAULT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.optionBalance}>
                            Balance: {format(bal)}
                          </Text>
                        </View>
                        {isSelected && <CheckCircle2 size={18} color="#B4F06A" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowAccountPicker(false);
                    router.push('/wallets/add-wallet');
                  }}
                  style={styles.addAccountLink}
                >
                  <Plus size={16} color="#B4F06A" style={{ marginRight: 6 }} />
                  <Text style={styles.addAccountLinkText}>Add New Account / Bank</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginVertical: 4,
  },
  forestContainer: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletLabel: {
    color: '#8BAF9C',
    fontSize: 13,
    fontWeight: '600',
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 2,
  },
  activeAccountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#163124',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#214734',
    maxWidth: 160,
  },
  badgeGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B4F06A',
    marginRight: 6,
  },
  activeAccountBadgeText: {
    color: '#B4F06A',
    fontSize: 11,
    fontWeight: '800',
  },
  mainBalance: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  updatedDateText: {
    color: '#8BAF9C',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  monthStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  monthStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1A14',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#172C21',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthStatLabel: {
    color: '#8BAF9C',
    fontSize: 10,
    fontWeight: '600',
  },
  monthStatValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingHorizontal: 6,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#162820',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#1D3B2E',
  },
  actionCircleHighlight: {
    backgroundColor: '#B4F06A',
    borderColor: '#B4F06A',
  },
  actionText: {
    color: '#E0EDE6',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  sheetCard: {
    backgroundColor: '#0F221A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1B3B2E',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  accountOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#13281F',
    borderWidth: 1,
    borderColor: '#193629',
    marginBottom: 8,
  },
  accountOptionRowSelected: {
    borderColor: '#B4F06A',
    backgroundColor: '#163327',
  },
  optionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  optionBalance: {
    color: '#8BAF9C',
    fontSize: 11,
    marginTop: 2,
  },
  defaultPill: {
    backgroundColor: '#B4F06A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  defaultPillText: {
    color: '#0B291F',
    fontSize: 9,
    fontWeight: '800',
  },
  addAccountLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  addAccountLinkText: {
    color: '#B4F06A',
    fontSize: 13,
    fontWeight: '700',
  },
});
