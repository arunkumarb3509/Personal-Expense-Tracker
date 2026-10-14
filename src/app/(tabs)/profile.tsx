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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/Input';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { CURRENCIES } from '@/constants/currencies';
import * as ImagePicker from 'expo-image-picker';
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
  ShieldCheck,
  CircleDollarSign,
  Camera,
  Trash2,
  Edit2,
  Check,
  X,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { colors, typography, radius, spacing, themeMode, setThemeMode } = useTheme();
  const { user, logout, updateProfile, updatePhoto, deletePhoto } = useAuth();
  const { currencyCode } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const memberSince = user?.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : 'October 2026';

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access photo gallery was denied.', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoLoading(true);
        const asset = result.assets[0];
        await updatePhoto(asset.uri, asset.base64);
        showToast('Profile photo updated successfully!', 'success');
        setShowPhotoModal(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile photo.', 'error');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setPhotoLoading(true);
      await deletePhoto();
      showToast('Profile photo removed.', 'info');
      setShowPhotoModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to remove photo.', 'error');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editNameInput.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }
    try {
      await updateProfile(editNameInput.trim(), currencyCode);
      showToast('Name updated successfully!', 'success');
      setShowEditNameModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update name.', 'error');
    }
  };

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
      showToast(`Default currency changed to ${code}`, 'success');
      setShowCurrencyModal(false);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      setShowLogoutModal(false);
      router.replace('/(auth)/welcome');
    } catch (err: any) {
      showToast(err.message || 'Failed to logout.', 'error');
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
          subtitle: 'GPay, Bank, Cash, Savings Vault',
          icon: <Wallet size={20} color={colors.primary} />,
          bgColor: colors.primaryLight,
          route: '/wallets',
        },
        {
          id: 'lending',
          title: 'Cash & Personal Settlements',
          subtitle: 'Money Given, Received & Due History',
          icon: <HandCoins size={20} color={colors.lend} />,
          bgColor: colors.lendLight,
          route: '/lending',
        },
        {
          id: 'budgets',
          title: 'Budgets & Spending Limits',
          subtitle: 'Category limits & alert thresholds',
          icon: <PiggyBank size={20} color={colors.income} />,
          bgColor: colors.incomeLight,
          route: '/budgets',
        },
        {
          id: 'recurring',
          title: 'Recurring Payments & EMIs',
          subtitle: 'Rent, Subscriptions, Utilities',
          icon: <CalendarCheck size={20} color={colors.accentTeal} />,
          bgColor: colors.borrowLight,
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <Header title="My Profile & Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 110 }}
      >
        {/* Profile Card with Photo & Edit */}
        <Card variant="outlined" padding={spacing.lg} style={{ marginBottom: spacing.lg, borderRadius: radius['2xl'] }}>
          <View style={styles.profileRow}>
            {/* Avatar with Camera badge */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPhotoModal(true)}
              style={styles.avatarContainer}
            >
              <Avatar name={displayName} photoUrl={user?.photoURL} size={68} />
              <View
                style={[
                  styles.cameraBadge,
                  { backgroundColor: colors.primary, borderColor: colors.card },
                ]}
              >
                {photoLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={13} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.profileName,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.lg,
                      fontWeight: '800',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditNameInput(displayName);
                    setShowEditNameModal(true);
                  }}
                  style={{ marginLeft: 8, padding: 4 }}
                >
                  <Edit2 size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

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
                <ShieldCheck size={13} color={colors.income} style={{ marginRight: 4 }} />
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
                fontWeight: '700',
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
                fontWeight: '700',
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
                  fontWeight: '700',
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
                          fontWeight: '700',
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

        {/* Sign Out Button */}
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
              marginTop: spacing.sm,
              borderWidth: 1,
            },
          ]}
        >
          <LogOut size={18} color={colors.error} style={{ marginRight: 8 }} />
          <Text
            style={{
              color: colors.error,
              fontSize: typography.sizes.sm,
              fontWeight: '700',
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPhotoModal(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.photoModalCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radius['2xl'],
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: '700',
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                >
                  Profile Photo
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickImage}
                  style={[
                    styles.photoOptionBtn,
                    { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg },
                  ]}
                >
                  <ImageIcon size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '600' }}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>

                {user?.photoURL && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleRemovePhoto}
                    style={[
                      styles.photoOptionBtn,
                      { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, marginTop: 8 },
                    ]}
                  >
                    <Trash2 size={20} color={colors.error} style={{ marginRight: 12 }} />
                    <Text style={{ color: colors.error, fontSize: typography.sizes.sm, fontWeight: '600' }}>
                      Remove Photo
                    </Text>
                  </TouchableOpacity>
                )}

                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => setShowPhotoModal(false)}
                  style={{ marginTop: 12 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Display Name Modal */}
      <Modal
        visible={showEditNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEditNameModal(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.photoModalCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radius['2xl'],
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: '700',
                    marginBottom: 12,
                  }}
                >
                  Edit Name
                </Text>

                <TextInput
                  label="Display Name"
                  value={editNameInput}
                  onChangeText={setEditNameInput}
                  placeholder="Enter your name"
                />

                <View style={{ flexDirection: 'row', marginTop: 16 }}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={() => setShowEditNameModal(false)}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Save"
                    variant="primary"
                    onPress={handleSaveName}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Currency Selection Modal */}
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
                      fontWeight: '700',
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: '700',
                              color: isSelected ? colors.primary : colors.text,
                              width: 32,
                            }}
                          >
                            {curr.symbol}
                          </Text>
                          <View style={{ marginLeft: 8 }}>
                            <Text
                              style={{
                                color: colors.text,
                                fontSize: typography.sizes.sm,
                                fontWeight: '700',
                              }}
                            >
                              {curr.name}
                            </Text>
                            <Text
                              style={{
                                color: colors.textSecondary,
                                fontSize: typography.sizes.xxs,
                              }}
                            >
                              {curr.code}
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

      {/* Confirmation Sign Out Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of PET Finance?"
        confirmText="Sign Out"
        confirmVariant="danger"
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
  avatarContainer: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  profileName: {
    letterSpacing: -0.2,
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
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCard: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 20,
    borderWidth: 1,
  },
  photoOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
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
    marginBottom: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
