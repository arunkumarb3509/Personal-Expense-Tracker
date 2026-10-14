import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useData } from '@/context/DataContext';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  RefreshCw,
  PiggyBank,
  Banknote,
  Smartphone,
  SlidersHorizontal,
} from 'lucide-react-native';
import { format as formatDate } from 'date-fns';
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
  onSetStartingBalance,
  onRecordSavings,
}: BalanceCardProps) {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const {
    gpayWallet,
    gpayBalance,
    cashBalance,
    savingsBalance,
    totalLiquidBalance,
    totalWalletBalance,
    totalReceivable,
    totalPayable,
    netWorth,
    todayGPaySpend,
    monthlyGPaySpend,
  } = useData();
  const { format } = useCurrency();

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);

  const toggleHide = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setHideAmount(!hideAmount);
  };

  const toggleBreakdown = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setShowBreakdown(!showBreakdown);
  };

  const lastReconciledStr = gpayWallet?.lastReconciledAt
    ? formatDate(new Date(gpayWallet.lastReconciledAt), 'dd/MM/yyyy')
    : formatDate(new Date(), 'dd/MM/yyyy');

  const hasDiscrepancy =
    gpayWallet?.reconciliationDiff !== undefined &&
    Math.abs(gpayWallet.reconciliationDiff) > 0.01;

  return (
    <View
      style={[
        styles.forestContainer,
        {
          backgroundColor: colors.forestCard,
          borderRadius: radius['3xl'],
        },
        shadows.md,
      ]}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.labelBadgeRow}>
          <Text style={[styles.walletLabel, { color: '#B3D4C4' }]}>
            Wallet Balance
          </Text>
          <View style={[styles.limeBadge, { backgroundColor: colors.lime }]}>
            <Text style={styles.limeBadgeText}>Primary GPay</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleHide}
            style={styles.circleIconBtn}
          >
            {hideAmount ? (
              <EyeOff size={18} color="#B3D4C4" />
            ) : (
              <Eye size={18} color="#B3D4C4" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Big Balance */}
      <View style={{ marginTop: 6 }}>
        <Text style={styles.mainBalance}>
          {hideAmount ? '₹ ••••••' : format(gpayBalance)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.updatedDateText}>
            Updated: {lastReconciledStr}
          </Text>
          {hasDiscrepancy && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onReconcile}
              style={[
                styles.diffPill,
                {
                  backgroundColor:
                    (gpayWallet?.reconciliationDiff || 0) > 0
                      ? 'rgba(16, 185, 129, 0.25)'
                      : 'rgba(239, 68, 68, 0.25)',
                },
              ]}
            >
              <Text
                style={{
                  color:
                    (gpayWallet?.reconciliationDiff || 0) > 0 ? '#34D399' : '#FCA5A5',
                  fontSize: 10,
                  fontWeight: '700',
                }}
              >
                Diff:{' '}
                {(gpayWallet?.reconciliationDiff || 0) > 0 ? '+' : ''}
                {format(gpayWallet?.reconciliationDiff || 0)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Action Buttons Row (Send / Receive / Top-Up / Reconcile) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddExpense}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            <ArrowUpRight size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddIncome}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            <ArrowDownLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onTransfer}
          style={styles.actionItem}
        >
          <View style={styles.actionCircle}>
            <ArrowLeftRight size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.actionText}>Top-Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onReconcile}
          style={styles.actionItem}
        >
          <View style={[styles.actionCircle, { borderColor: colors.lime, borderWidth: 1 }]}>
            <RefreshCw size={19} color={colors.lime} strokeWidth={2.2} />
          </View>
          <Text style={[styles.actionText, { color: colors.lime }]}>Reconcile</Text>
        </TouchableOpacity>
      </View>

      {/* Today & This Month GPay Spend Strip */}
      <View style={styles.spendStrip}>
        <View style={styles.spendStripCol}>
          <Text style={styles.spendLabel}>Today's GPay Spend</Text>
          <Text style={styles.spendVal}>
            {hideAmount ? '••••' : format(todayGPaySpend)}
          </Text>
        </View>

        <View style={styles.spendDivider} />

        <View style={styles.spendStripCol}>
          <Text style={styles.spendLabel}>This Month's GPay Spend</Text>
          <Text style={styles.spendVal}>
            {hideAmount ? '••••' : format(monthlyGPaySpend)}
          </Text>
        </View>
      </View>

      {/* Expandable Financial Overview Toggle */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleBreakdown}
        style={styles.breakdownHeader}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ShieldCheck size={14} color="#B3D4C4" style={{ marginRight: 6 }} />
          <Text style={styles.breakdownTitle}>
            {showBreakdown ? 'Hide Cash, Savings & Dues' : 'Cash, Savings & Total Net Worth'}
          </Text>
        </View>
        {showBreakdown ? (
          <ChevronUp size={16} color="#B3D4C4" />
        ) : (
          <ChevronDown size={16} color="#B3D4C4" />
        )}
      </TouchableOpacity>

      {/* Expanded Breakdown Rows */}
      {showBreakdown && (
        <View style={styles.breakdownContainer}>
          {/* Cash Balance */}
          <View style={styles.breakdownRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Banknote size={15} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.breakdownLabel}>Separate Cash in Hand</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {hideAmount ? '••••' : format(cashBalance)}
            </Text>
          </View>

          {/* Savings Balance */}
          <View style={styles.breakdownRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PiggyBank size={15} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text style={styles.breakdownLabel}>Savings Vault</Text>
            </View>
            <TouchableOpacity onPress={onRecordSavings} activeOpacity={0.7}>
              <Text style={[styles.breakdownValue, { color: '#FCD34D' }]}>
                {hideAmount ? '••••' : format(savingsBalance)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Receivables */}
          <View style={styles.breakdownRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.statusDot, { backgroundColor: colors.lend }]} />
              <Text style={styles.breakdownLabel}>Money Given (To Receive)</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#FBBF24' }]}>
              +{hideAmount ? '••••' : format(totalReceivable)}
            </Text>
          </View>

          {/* Payables */}
          <View style={styles.breakdownRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.statusDot, { backgroundColor: colors.borrow }]} />
              <Text style={styles.breakdownLabel}>Money Borrowed (To Pay)</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#2DD4BF' }]}>
              -{hideAmount ? '••••' : format(totalPayable)}
            </Text>
          </View>

          <View style={styles.breakdownDivider} />

          {/* Net Worth */}
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { fontWeight: '700', color: '#FFFFFF' }]}>
              Calculated Net Worth
            </Text>
            <Text style={[styles.breakdownValue, { color: colors.lime, fontWeight: '800' }]}>
              {hideAmount ? '••••••' : format(netWorth)}
            </Text>
          </View>

          {/* Setup / Reconcile links */}
          <View style={styles.helperActions}>
            <TouchableOpacity onPress={onSetStartingBalance} style={styles.helperLink}>
              <Text style={styles.helperLinkText}>Set Starting GPay</Text>
            </TouchableOpacity>
            <Text style={{ color: '#527766' }}>•</Text>
            <TouchableOpacity onPress={onRecordSavings} style={styles.helperLink}>
              <Text style={styles.helperLinkText}>Add Savings</Text>
            </TouchableOpacity>
            <Text style={{ color: '#527766' }}>•</Text>
            <TouchableOpacity onPress={onReconcile} style={styles.helperLink}>
              <Text style={styles.helperLinkText}>Verify GPay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  forestContainer: {
    padding: 22,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  limeBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  limeBadgeText: {
    color: '#0B291F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBalance: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  updatedDateText: {
    color: '#8BAF9C',
    fontSize: 11,
    fontWeight: '500',
  },
  diffPill: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    color: '#E0EDE6',
    fontSize: 12,
    fontWeight: '600',
  },
  spendStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 18,
  },
  spendStripCol: {
    flex: 1,
  },
  spendLabel: {
    color: '#8BAF9C',
    fontSize: 10,
    fontWeight: '500',
  },
  spendVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  spendDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakdownTitle: {
    color: '#B3D4C4',
    fontSize: 11,
    fontWeight: '600',
  },
  breakdownContainer: {
    marginTop: 10,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    color: '#A0C2B0',
    fontSize: 12,
  },
  breakdownValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  helperActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
  },
  helperLink: {},
  helperLinkText: {
    color: '#B4F06A',
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
