import React, { useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { CURRENCIES } from '@/constants/currencies';
import { format } from 'date-fns';
import {
  Wallet,
  PiggyBank,
  HandCoins,
  CalendarCheck,
  FileSpreadsheet,
  Bell,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
  LogOut,
  Trash2,
  ShieldCheck,
  CircleDollarSign,
  Check,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { colors, typography, radius, spacing, themeMode, setThemeMode } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const { currencyCode } = useCurrency();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const memberSince = user?.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : 'October 2026';

  const handleThemeChange = async (mode: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    await setThemeMode(mode as any);
  };

  const handleCurrencySelect = async (code: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    try {
      await updateProfile(displayName, code);
      setShowCurrencyModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      setShowLogoutModal(false);
      router.replace('/(auth)/welcome');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to logout.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const menuSections = [
    {
      title: 'FINANCIAL MANAGEMENT',
      items: [
        {
          id: 'wallets',
          title: 'Manage Wallets & Accounts',
          subtitle: 'GPay, Bank, Cash, Credit Cards',
          icon: <Wallet size={20} color={colors.primary} />,
          bgColor: colors.primaryLight,
          route: '/wallets',
        },
        {
          id: 'budgets',
          title: 'Budgets & Spending Limits',
          subtitle: 'Category budgets & 80%/100% alerts',
          icon: <PiggyBank size={20} color={colors.income} />,
          bgColor: colors.incomeLight,
          route: '/budgets',
        },
        {
          id: 'lending',
          title: 'Lending & Borrowing',
          subtitle: 'Money Given & Money Borrowed dues',
          icon: <HandCoins size={20} color={colors.lend} />,
          bgColor: colors.lendLight,
          route: '/lending',
        },
        {
          id: 'recurring',
          title: 'Recurring Payments & EMIs',
          subtitle: 'Rent, Subscriptions, Utilities',
          icon: <CalendarCheck size={20} color={colors.accentTeal} />,
          bgColor: colors.incomeLight,
          route: '/recurring',
        },
      ],
    },
    {
      title: 'DATA & NOTIFICATIONS',
      items: [
        {
          id: 'export',
          title: 'Export Data to CSV',
          subtitle: 'Download transactions & debt reports',
          icon: <FileSpreadsheet size={20} color={colors.accentPurple} />,
          bgColor: colors.transferLight,
          route: '/settings/export-data',
        },
        {
          id: 'notifications',
          title: 'Notification Center',
          subtitle: 'Alerts, budget warnings & reminders',
          icon: <Bell size={20} color={colors.warning} />,
          bgColor: colors.warningLight,
          route: '/notifications',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Header title="My Profile & Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 48 }}
      >
        {/* Profile Card */}
        <Card variant="outlined" padding={spacing.lg} style={{ marginBottom: spacing.lg }}>
          <View style={styles.profileRow}>
            <Avatar name={displayName} photoUrl={user?.photoURL} size={64} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text
                style={[
                  styles.profileName,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                  },
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Text
                style={[
                  styles.profileEmail,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    marginTop: 2,
                  },
                ]}
                numberOfLines={1}
              >
                {email}
              </Text>
              <View style={styles.memberSinceRow}>
                <ShieldCheck size={12} color={colors.income} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.xxs }}>
                  Verified member since {memberSince}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Theme Mode Selector Card */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                marginBottom: spacing.xs,
              },
            ]}
          >
            APPEARANCE & THEME
          </Text>
          <SegmentedControl
            options={[
              { value: 'light', label: 'Light', icon: <Sun size={16} color={colors.warning} /> },
              { value: 'dark', label: 'Dark', icon: <Moon size={16} color={colors.accentPurple} /> },
              { value: 'system', label: 'System', icon: <Smartphone size={16} color={colors.primary} /> },
            ]}
            selectedValue={themeMode}
            onValueChange={handleThemeChange}
          />
        </View>

        {/* Currency Setting */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={[
              styles.sectionHeading,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
                marginBottom: spacing.xs,
              },
            ]}
          >
            PRIMARY CURRENCY
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowCurrencyModal(true)}
            style={[
              styles.settingRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.xl,
                padding: spacing.md,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.primaryLight, borderRadius: radius.lg },
                ]}
              >
                <CircleDollarSign size={20} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '700' }}>
                  Default Currency
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: 1 }}>
                  {CURRENCIES[currencyCode]?.name || 'Indian Rupee'} ({CURRENCIES[currencyCode]?.symbol || '₹'})
                </Text>
              </View>
            </View>

            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuSections.map((sec, sIdx) => (
          <View key={sIdx} style={{ marginBottom: spacing.lg }}>
            <Text
              style={[
                styles.sectionHeading,
                {
                  color: colors.textSecondary,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.bold,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              {sec.title}
            </Text>

            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  borderWidth: 1,
                  overflow: 'hidden',
                },
              ]}
            >
              {sec.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => router.push(item.route as any)}
                  style={[
                    styles.menuRow,
                    {
                      padding: spacing.md,
                      borderBottomWidth: iIdx === sec.items.length - 1 ? 0 : 1,
                      borderBottomColor: colors.borderLight,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: item.bgColor, borderRadius: radius.lg },
                      ]}
                    >
                      {item.icon}
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.bold,
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: typography.sizes.xs,
                          marginTop: 1,
                        }}
                        numberOfLines={1}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>

                  <ChevronRight size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowLogoutModal(true)}
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.md,
              marginTop: spacing.md,
              borderWidth: 1,
            },
          ]}
        >
          <LogOut size={20} color={colors.error} style={{ marginRight: 8 }} />
          <Text
            style={{
              color: colors.error,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <Modal
          visible={showCurrencyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCurrencyModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowCurrencyModal(false)}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalBox,
                    {
                      backgroundColor: colors.card,
                      borderRadius: radius['2xl'],
                      borderColor: colors.border,
                      padding: spacing.lg,
                    },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: typography.sizes.lg,
                        fontWeight: typography.weights.bold,
                      }}
                    >
                      Select Primary Currency
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCurrencyModal(false)}
                      style={{ padding: 4 }}
                    >
                      <X size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 340, marginTop: spacing.sm }}>
                    {Object.values(CURRENCIES).map((curr) => {
                      const isSelected = currencyCode === curr.code;
                      return (
                        <TouchableOpacity
                          key={curr.code}
                          activeOpacity={0.7}
                          onPress={() => handleCurrencySelect(curr.code)}
                          style={[
                            styles.currencyRow,
                            {
                              backgroundColor: isSelected
                                ? colors.primaryLight
                                : 'transparent',
                              borderRadius: radius.lg,
                              padding: spacing.md,
                              marginBottom: 4,
                            },
                          ]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View
                              style={[
                                styles.symbolBadge,
                                {
                                  backgroundColor: isSelected
                                    ? colors.primary
                                    : colors.surfaceSecondary,
                                  borderRadius: radius.md,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: isSelected ? '#FFFFFF' : colors.text,
                                  fontSize: typography.sizes.sm,
                                  fontWeight: 'bold',
                                }}
                              >
                                {curr.symbol}
                              </Text>
                            </View>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                              <Text
                                style={{
                                  color: isSelected ? colors.primary : colors.text,
                                  fontSize: typography.sizes.sm,
                                  fontWeight: isSelected ? '700' : '500',
                                }}
                              >
                                {curr.name} ({curr.code})
                              </Text>
                            </View>
                          </View>

                          {isSelected && <Check size={18} color={colors.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your PET Finance account?"
        confirmText="Sign Out"
        variant="primary"
        loading={logoutLoading}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    letterSpacing: -0.3,
  },
  profileEmail: {},
  memberSinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionHeading: {
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuCard: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symbolBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
