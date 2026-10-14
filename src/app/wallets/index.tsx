import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ReconcileGPayModal } from '@/components/dashboard/ReconcileGPayModal';
import { SetGPayBalanceModal } from '@/components/dashboard/SetGPayBalanceModal';
import {
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  PiggyBank,
  Wallet as WalletIcon,
  Plus,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';

export default function WalletsListScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { wallets, totalWalletBalance, gpayWallet } = useData();
  const { format } = useCurrency();
  const router = useRouter();

  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showSetBalanceModal, setShowSetBalanceModal] = useState(false);

  const getWalletIcon = (type: string, color: string) => {
    const size = 22;
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Wallets & Accounts"
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/wallets/add-wallet')}
            style={[
              styles.addBtn,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
          >
            <Plus size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
      >
        {/* Total Liquid Balance Card */}
        <Card variant="elevated" padding={spacing.xl} style={[styles.totalCard, shadows.sm]}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
            Total Liquid Balance
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.sizes['3xl'],
              fontWeight: typography.weights.bold,
              letterSpacing: -0.4,
              marginTop: 2,
            }}
          >
            {format(totalWalletBalance)}
          </Text>

          {/* Quick Actions (Transfer Funds, Add Wallet) */}
          <View style={[styles.cardActionRow, { marginTop: spacing.lg }]}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Button
                title="Transfer Funds"
                onPress={() => router.push('/wallets/transfer')}
                variant="primary"
                size="sm"
                icon={<ArrowLeftRight size={16} color="#FFFFFF" />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Add Wallet"
                onPress={() => router.push('/wallets/add-wallet')}
                variant="secondary"
                size="sm"
                icon={<Plus size={16} color={colors.text} />}
              />
            </View>
          </View>
        </Card>

        {/* Wallets List */}
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
            All Accounts ({wallets.length})
          </Text>

          {wallets.length > 0 ? (
            wallets.map((wallet) => {
              const wColor = wallet.color || colors.primary;
              return (
                <Card
                  key={wallet.id}
                  variant="outlined"
                  padding={spacing.lg}
                  style={{ marginBottom: spacing.md }}
                >
                  <View style={styles.walletHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: `${wColor}18`,
                            borderRadius: radius.lg,
                          },
                        ]}
                      >
                        {getWalletIcon(wallet.type, wColor)}
                      </View>

                      <View style={{ marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text
                            style={[
                              styles.walletName,
                              {
                                color: colors.text,
                                fontSize: typography.sizes.md,
                                fontWeight: typography.weights.bold,
                              },
                            ]}
                          >
                            {wallet.name}
                          </Text>
                          {(wallet.isPrimaryGPay || wallet.name.toLowerCase().includes('gpay')) && (
                            <View
                              style={[
                                styles.defaultPill,
                                {
                                  backgroundColor: colors.lime,
                                  marginLeft: 6,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: '#0B291F',
                                  fontSize: typography.sizes.xxs,
                                  fontWeight: '800',
                                }}
                              >
                                GPAY PRIMARY
                              </Text>
                            </View>
                          )}
                          {wallet.isDefault && !(wallet.isPrimaryGPay || wallet.name.toLowerCase().includes('gpay')) && (
                            <View
                              style={[
                                styles.defaultPill,
                                {
                                  backgroundColor: colors.primaryLight,
                                  marginLeft: 6,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: colors.primary,
                                  fontSize: typography.sizes.xxs,
                                  fontWeight: '700',
                                }}
                              >
                                DEFAULT
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text
                          style={{
                            color: colors.textSecondary,
                            fontSize: typography.sizes.xs,
                            marginTop: 1,
                            textTransform: 'capitalize',
                          }}
                        >
                          {wallet.type.replace('_', ' ')} Account
                          {wallet.lastReconciledAt ? ` • Verified` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: typography.sizes.lg,
                          fontWeight: typography.weights.bold,
                        }}
                      >
                        {format(wallet.currentBalance)}
                      </Text>
                      <Text
                        style={{
                          color: colors.textTertiary,
                          fontSize: typography.sizes.xxs,
                          marginTop: 1,
                        }}
                      >
                        Opening: {format(wallet.openingBalance)}
                      </Text>
                    </View>
                  </View>

                  {(wallet.isPrimaryGPay || wallet.name.toLowerCase().includes('gpay')) && (
                    <View
                      style={{
                        marginTop: spacing.md,
                        paddingTop: spacing.sm,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        {wallet.lastReconciledAt ? (
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: typography.sizes.xxs,
                            }}
                          >
                            Verified {wallet.lastReconciledAt}
                            {wallet.reconciliationDiff !== undefined && (
                              <Text
                                style={{
                                  color:
                                    wallet.reconciliationDiff === 0
                                      ? colors.income
                                      : colors.warning,
                                  fontWeight: '700',
                                }}
                              >
                                {` • Diff: ${format(wallet.reconciliationDiff)}`}
                              </Text>
                            )}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              color: colors.textTertiary,
                              fontSize: typography.sizes.xxs,
                            }}
                          >
                            Manual reconciliation available
                          </Text>
                        )}
                      </View>

                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setShowSetBalanceModal(true)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: radius.md,
                            backgroundColor: colors.surfaceSecondary,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: typography.sizes.xxs,
                              fontWeight: '700',
                            }}
                          >
                            Set Balance
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setShowReconcileModal(true)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: radius.md,
                            backgroundColor: colors.primary,
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: typography.sizes.xxs,
                              fontWeight: '700',
                            }}
                          >
                            Reconcile
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Card>
              );
            })
          ) : (
            <EmptyState
              type="wallets"
              title="No wallets created"
              description="Add your Bank, GPay, or Cash wallets to begin tracking balances."
              actionTitle="Create Wallet"
              onActionPress={() => router.push('/wallets/add-wallet')}
            />
          )}
        </View>
      </ScrollView>

      {/* Reconcile GPay Modal */}
      {gpayWallet && (
        <ReconcileGPayModal
          visible={showReconcileModal}
          onClose={() => setShowReconcileModal(false)}
          currentAppBalance={gpayWallet.currentBalance}
          walletId={gpayWallet.id}
        />
      )}

      {/* Set Starting Balance Modal */}
      {gpayWallet && (
        <SetGPayBalanceModal
          visible={showSetBalanceModal}
          onClose={() => setShowSetBalanceModal(false)}
          currentBalance={gpayWallet.currentBalance}
          walletId={gpayWallet.id}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalCard: {
    marginTop: 4,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    letterSpacing: -0.2,
  },
  defaultPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
