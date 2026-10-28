import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'expo-router';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  exportTransactionsToCSV,
  exportLendingBorrowingToCSV,
} from '@/services/exportService';
import {
  FileSpreadsheet,
  Download,
  Share2,
  Receipt,
  HandCoins,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ExportDataScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { transactions, wallets, people } = useData();
  const { currencyCode } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();

  const [exportingTx, setExportingTx] = useState(false);
  const [exportingDebt, setExportingDebt] = useState(false);

  const handleExportTransactions = async () => {
    if (transactions.length === 0) {
      showToast('You have no transactions to export yet.', 'warning');
      return;
    }

    try {
      setExportingTx(true);
      await exportTransactionsToCSV(transactions, wallets, currencyCode);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      showToast('Transactions exported successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not export transactions.', 'error');
    } finally {
      setExportingTx(false);
    }
  };

  const handleExportLending = async () => {
    if (people.length === 0) {
      showToast('You have no lending or borrowing records to export.', 'warning');
      return;
    }

    try {
      setExportingDebt(true);
      await exportLendingBorrowingToCSV(people, currencyCode);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      showToast('Settlement records exported successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not export debt records.', 'error');
    } finally {
      setExportingDebt(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Export Financial Data" showBack onBackPress={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
      >
        <View style={{ marginVertical: spacing.xs }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
              lineHeight: 22,
              marginBottom: spacing.md,
            }}
          >
            Export your complete financial records as CSV files compatible with Microsoft Excel, Google Sheets, or any accounting software.
          </Text>

          {/* Transactions Export Card */}
          <Card variant="outlined" padding={spacing.lg} style={{ marginBottom: spacing.md }}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.primaryLight, borderRadius: radius.lg },
                ]}
              >
                <Receipt size={24} color={colors.primary} />  
              </View>

              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: typography.weights.bold,
                  }}
                >
                  All Transactions CSV
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    marginTop: 2,
                  }}
                >
                  {transactions.length} total records (Expenses, Incomes, Transfers, Lending)
                </Text>
              </View>
            </View>

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="Export Transactions (.CSV)"
                onPress={handleExportTransactions}
                variant="primary"
                size="md"
                loading={exportingTx}
                icon={<Share2 size={16} color="#FFFFFF" />}
              />
            </View>
          </Card>

          {/* Lending & Borrowing Export Card */}
          <Card variant="outlined" padding={spacing.lg} style={{ marginBottom: spacing.md }}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.lendLight, borderRadius: radius.lg },
                ]}
              >
                <HandCoins size={24} color={colors.lend} />
              </View>

              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: typography.weights.bold,
                  }}
                >
                  Lending & Borrowing CSV
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    marginTop: 2,
                  }}
                >
                  {people.length} people records (Given, Received, Remaining, Payable)
                </Text>
              </View>
            </View>

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="Export Debt Records (.CSV)"
                onPress={handleExportLending}
                variant="secondary"
                size="md"
                loading={exportingDebt}
                icon={<Share2 size={16} color={colors.text} />}
              />
            </View>
          </Card>

          {/* Privacy Guarantee Card */}
          <View
            style={[
              styles.privacyCard,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                borderRadius: radius.xl,
                padding: spacing.md,
                marginTop: spacing.sm,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldCheck size={20} color={colors.income} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                Encrypted & Private Export
              </Text>
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              Export files are generated entirely on your device and shared directly via your OS share sheet. No external third parties have access to your raw financial exports.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCard: {},
});
