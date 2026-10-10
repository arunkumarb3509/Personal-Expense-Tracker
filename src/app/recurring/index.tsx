import React from 'react';
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
import { useRouter } from 'expo-router';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { getCategoryById } from '@/constants/categories';
import {
  CalendarCheck,
  Plus,
  Trash2,
  Clock,
  Wallet,
  PlayCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function RecurringTransactionsScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { recurring, removeRecurringPayment, createTransaction } = useData();
  const { format } = useCurrency();
  const router = useRouter();

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Recurring Payment', `Are you sure you want to stop tracking "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeRecurringPayment(id);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handlePayNow = async (item: (typeof recurring)[0]) => {
    try {
      await createTransaction({
        amount: item.amount,
        type: item.type,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        walletId: item.walletId,
        walletName: item.walletName,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        description: item.name,
        notes: `Processed recurring payment (${item.frequency})`,
        recurringId: item.id,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      Alert.alert('Success', `Logged payment of ${format(item.amount)} for "${item.name}".`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Header
        title="Recurring Payments"
        subtitle="Rent, Netflix, Insurance, EMIs"
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/recurring/add-recurring')}
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
        <View style={{ marginTop: spacing.xs }}>
          {recurring.length > 0 ? (
            recurring.map((item) => {
              const cat = getCategoryById(item.categoryId);
              return (
                <Card
                  key={item.id}
                  variant="outlined"
                  padding={spacing.md}
                  style={{ marginBottom: spacing.md }}
                >
                  <View style={styles.topRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: `${cat.color || colors.primary}18`,
                            borderRadius: radius.md,
                          },
                        ]}
                      >
                        <CalendarCheck size={20} color={cat.color || colors.primary} />
                      </View>

                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text
                          style={[
                            styles.name,
                            {
                              color: colors.text,
                              fontSize: typography.sizes.md,
                              fontWeight: typography.weights.bold,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Badge label={item.frequency} variant="primary" size="sm" />
                          {item.walletName ? (
                            <Text
                              style={{
                                color: colors.textTertiary,
                                fontSize: typography.sizes.xxs,
                                marginLeft: 6,
                              }}
                            >
                              via {item.walletName}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          color: item.type === 'expense' ? colors.expense : colors.income,
                          fontSize: typography.sizes.lg,
                          fontWeight: typography.weights.bold,
                        }}
                      >
                        {format(item.amount)}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleDelete(item.id, item.name)}
                        style={{ padding: 4, marginTop: 4 }}
                      >
                        <Trash2 size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Due Date & Quick Log Payment Button */}
                  <View
                    style={[
                      styles.footerRow,
                      {
                        borderTopColor: colors.borderLight,
                        borderTopWidth: 1,
                        marginTop: spacing.md,
                        paddingTop: spacing.sm,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                        Next Due: {item.nextDueDate || 'Upcoming'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handlePayNow(item)}
                      style={[
                        styles.payNowBtn,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: radius.full,
                        },
                      ]}
                    >
                      <PlayCircle size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#FFFFFF', fontSize: typography.sizes.xxs, fontWeight: '700' }}>
                        Log Payment Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          ) : (
            <EmptyState
              type="recurring"
              title="No recurring payments tracked"
              description="Keep subscriptions, rent, insurance, and bills on auto-pilot."
              actionTitle="Add Recurring Payment"
              onActionPress={() => router.push('/recurring/add-recurring')}
            />
          )}
        </View>
      </ScrollView>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    letterSpacing: -0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
