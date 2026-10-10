import React from 'react';
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
import { useRouter } from 'expo-router';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Card } from '@/components/common/Card';
import {
  Bell,
  AlertTriangle,
  HandCoins,
  CalendarCheck,
  TrendingUp,
  Info,
  CheckCheck,
} from 'lucide-react-native';
import { format } from 'date-fns';

export default function NotificationCenterScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { notifications, markNotificationRead } = useData();
  const router = useRouter();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_warning':
      case 'budget_exceeded':
        return <AlertTriangle size={20} color={colors.warning} />;
      case 'debt_reminder':
        return <HandCoins size={20} color={colors.lend} />;
      case 'recurring_due':
        return <CalendarCheck size={20} color={colors.accentTeal} />;
      case 'spending_insight':
        return <TrendingUp size={20} color={colors.primary} />;
      default:
        return <Info size={20} color={colors.primary} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Header
        title="Notification Center"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
      >
        <View style={{ marginTop: spacing.xs }}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.8}
                onPress={() => markNotificationRead(notif.id)}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: notif.isRead ? colors.card : colors.surfaceSecondary,
                    borderColor: notif.isRead ? colors.border : colors.primary,
                    borderRadius: radius.xl,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                    borderWidth: notif.isRead ? 1 : 1.5,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: notif.isRead
                          ? colors.surfaceHighlight
                          : colors.primaryLight,
                        borderRadius: radius.md,
                        marginRight: 12,
                      },
                    ]}
                  >
                    {getNotificationIcon(notif.type)}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text
                        style={[
                          styles.notifTitle,
                          {
                            color: colors.text,
                            fontSize: typography.sizes.sm,
                            fontWeight: notif.isRead ? '600' : '700',
                          },
                        ]}
                      >
                        {notif.title}
                      </Text>
                      {!notif.isRead && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.primary,
                          }}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.notifMsg,
                        {
                          color: colors.textSecondary,
                          fontSize: typography.sizes.xs,
                          marginTop: 2,
                          lineHeight: 18,
                        },
                      ]}
                    >
                      {notif.message}
                    </Text>

                    <Text
                      style={{
                        color: colors.textTertiary,
                        fontSize: typography.sizes.xxs,
                        marginTop: 4,
                      }}
                    >
                      {notif.timestamp ? format(new Date(notif.timestamp), 'd MMM, h:mm a') : 'Just now'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <EmptyState
              type="notifications"
              title="All Caught Up!"
              description="Smart spending insights, budget warnings, and debt alerts will appear here."
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
  notifCard: {},
  iconCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    letterSpacing: -0.1,
  },
  notifMsg: {},
});
