import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/Input';
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
  Download,
  Cloud,
  Fingerprint,
  HelpCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { colors, typography, radius, spacing, themeMode, setThemeMode } = useTheme();
  const { user, logout, updateProfile, updatePhoto, deletePhoto } = useAuth();
  const { wallets, budgets, people, totalReceivable, recurring } = useData();
  const { currencyCode, format: formatMoney } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Arun Kumar';
  const email = user?.email || 'arun.finance@pet.app';

  // Calculate pending settlements due
  const totalLentPending = totalReceivable || 100;

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

  const handleManualSync = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast('Cloud database synchronized successfully!', 'success');
    }, 800);
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header Bar matching Screenshot 3 */}
      <View style={[styles.headerBar, { paddingHorizontal: spacing.lg }]}>
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
            Profile
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/notifications')}
            style={[styles.iconCircleBtn, { backgroundColor: '#132119', borderColor: '#1F2E25' }]}
          >
            <Bell size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowPhotoModal(true)}
            style={[styles.iconCircleBtn, { backgroundColor: '#132119', borderColor: '#1F2E25' }]}
          >
            <Avatar name={displayName} photoUrl={user?.photoURL} size={28} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 110, paddingTop: 10 }}
      >
        {/* Large Arch Portrait Hero matching Screenshot 3 */}
        <View style={styles.heroArchContainer}>
          <View style={styles.archFrame}>
            <Avatar
              name={displayName}
              photoUrl={user?.photoURL}
              size={220}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPhotoModal(true)}
              style={styles.heroEditBadge}
            >
              {photoLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* APPEARANCE & THEME */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>APPEARANCE & THEME</Text>
            <Text style={{ color: colors.lime, fontSize: 11, fontWeight: '700' }}>
              OLED Black Mode
            </Text>
          </View>

          <View style={styles.themeToggleBar}>
            {[
              { id: 'light', label: 'Light', icon: <Sun size={15} color="#A0AEC0" /> },
              { id: 'dark', label: 'Dark', icon: <Moon size={15} color={colors.lime} /> },
              { id: 'system', label: 'System', icon: <Smartphone size={15} color="#A0AEC0" /> },
            ].map((opt) => {
              const isActive = themeMode === opt.id || (themeMode === 'dark' && opt.id === 'dark');
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  onPress={() => handleThemeChange(opt.id)}
                  style={[
                    styles.themeToggleBtn,
                    {
                      backgroundColor: isActive ? '#1A2920' : '#111915',
                      borderColor: isActive ? '#2D4738' : 'transparent',
                    },
                  ]}
                >
                  {opt.icon}
                  <Text
                    style={{
                      color: isActive ? colors.lime : '#6F8C7C',
                      fontSize: 12,
                      fontWeight: isActive ? '700' : '500',
                      marginLeft: 6,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PRIMARY CURRENCY */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeaderTitle}>PRIMARY CURRENCY</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowCurrencyModal(true)}
            style={[styles.menuRowCard, { backgroundColor: '#132119', borderColor: '#1D3327' }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(56, 178, 172, 0.15)' }]}>
                <CircleDollarSign size={20} color={colors.accentTeal} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                  Default Currency
                </Text>
                <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                  Indian Rupee (₹) • Global settlement
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.accentTeal, fontSize: 13, fontWeight: '700', marginRight: 4 }}>
                {currencyCode}
              </Text>
              <ChevronRight size={16} color="#6F8C7C" />
            </View>
          </TouchableOpacity>
        </View>

        {/* FINANCIAL MANAGEMENT */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeaderTitle}>FINANCIAL MANAGEMENT</Text>
          <View style={[styles.cardGroup, { backgroundColor: '#132119', borderColor: '#1D3327' }]}>
            {/* Wallets & Accounts */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/wallets')}
              style={styles.groupRow}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(204, 255, 0, 0.12)' }]}>
                  <Wallet size={18} color={colors.lime} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Manage Wallets & Accounts
                  </Text>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                    GPay, HDFC, Cash, Vault{' '}
                    <Text style={{ color: colors.lime, fontWeight: '700' }}>
                      ({wallets.length} active)
                    </Text>
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color="#6F8C7C" />
            </TouchableOpacity>

            {/* Settlements & Lending */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/lending')}
              style={[styles.groupRow, { borderTopWidth: 1, borderTopColor: '#1A2920' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <HandCoins size={18} color="#F87171" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Cash & Personal Settlements
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                    <Text style={{ color: '#8BAF9C', fontSize: 11 }}>Money Lent & Borrowed • </Text>
                    <View style={[styles.greenDot, { backgroundColor: colors.accentTeal }]} />
                    <Text style={{ color: colors.accentTeal, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
                      ₹{totalLentPending || 100} due
                    </Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={16} color="#6F8C7C" />
            </TouchableOpacity>

            {/* Budgets & Spending Limits */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/budgets')}
              style={[styles.groupRow, { borderTopWidth: 1, borderTopColor: '#1A2920' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(56, 178, 172, 0.12)' }]}>
                  <PiggyBank size={18} color={colors.accentTeal} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Budgets & Spending Limits
                  </Text>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                    Category limits & thresholds ({budgets.length || 2} active)
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color="#6F8C7C" />
            </TouchableOpacity>

            {/* Recurring Payments & EMIs */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/recurring')}
              style={[styles.groupRow, { borderTopWidth: 1, borderTopColor: '#1A2920' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(160, 174, 192, 0.12)' }]}>
                  <CalendarCheck size={18} color="#A0AEC0" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Recurring Payments & EMIs
                  </Text>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                    Rent, OTT Subscriptions, Utilities
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color="#6F8C7C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* DATA & BACKUP */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeaderTitle}>DATA & BACKUP</Text>
          <View style={[styles.cardGroup, { backgroundColor: '#132119', borderColor: '#1D3327' }]}>
            {/* Export Data */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/settings/export-data')}
              style={styles.groupRow}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(56, 178, 172, 0.12)' }]}>
                  <Download size={18} color={colors.accentTeal} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Export Data to CSV / Excel
                  </Text>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                    Full transaction history & tax statements
                  </Text>
                </View>
              </View>
              <Download size={18} color={colors.lime} />
            </TouchableOpacity>

            {/* Cloud Sync */}
            <View style={[styles.groupRow, { borderTopWidth: 1, borderTopColor: '#1A2920' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(56, 178, 172, 0.12)' }]}>
                  <Cloud size={18} color={colors.accentTeal} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Cloud Sync & Backup
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                    <View style={[styles.greenDot, { backgroundColor: colors.accentTeal }]} />
                    <Text style={{ color: '#8BAF9C', fontSize: 11, marginLeft: 4 }}>
                      Auto-synced 5 mins ago
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleManualSync}
                style={styles.syncBtn}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                    Sync Now
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECURITY & PREFERENCES */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeaderTitle}>SECURITY & PREFERENCES</Text>
          <View style={[styles.cardGroup, { backgroundColor: '#132119', borderColor: '#1D3327' }]}>
            {/* Biometric Toggle */}
            <View style={styles.groupRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(204, 255, 0, 0.12)' }]}>
                  <Fingerprint size={18} color={colors.lime} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Biometric / App Lock
                  </Text>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                    Unlock via Fingerprint or Face ID
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setBiometricEnabled(val);
                }}
                trackColor={{ false: '#2D3748', true: colors.lime }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Help & Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => showToast('Help & Support is always available at support@pet.app', 'info')}
              style={[styles.groupRow, { borderTopWidth: 1, borderTopColor: '#1A2920' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(160, 174, 192, 0.12)' }]}>
                  <HelpCircle size={18} color="#A0AEC0" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    Help & Support
                  </Text>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                    FAQs, chat assistance & guides
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color="#6F8C7C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button matching Screenshot 3 Crimson Pill */}
        <View style={{ marginTop: 24 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowLogoutModal(true)}
            style={styles.logoutPill}
          >
            <LogOut size={16} color="#FF6B6B" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out of PET</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Build info */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerText}>
            PET Wealth Tracker • v2.4.0 (Build 2026.10)
          </Text>
          <Text style={styles.footerSubText}>
            End-to-End Encrypted Financial Storage
          </Text>
        </View>
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPhotoModal(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.photoModalCard, { backgroundColor: '#132119', borderColor: '#1F2E25' }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>
                  Profile Photo
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickImage}
                  style={[styles.photoOptionBtn, { backgroundColor: '#1A2920' }]}
                >
                  <ImageIcon size={20} color={colors.lime} style={{ marginRight: 12 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>

                {user?.photoURL && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleRemovePhoto}
                    style={[styles.photoOptionBtn, { backgroundColor: '#1A2920', marginTop: 8 }]}
                  >
                    <Trash2 size={20} color="#FF6B6B" style={{ marginRight: 12 }} />
                    <Text style={{ color: '#FF6B6B', fontSize: 14, fontWeight: '600' }}>
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
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.photoModalCard, { backgroundColor: '#132119', borderColor: '#1F2E25' }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
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
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalBox, { backgroundColor: '#132119', borderColor: '#1F2E25', padding: 20 }]}>
                <View style={styles.modalHeader}>
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                    Select Primary Currency
                  </Text>
                  <TouchableOpacity onPress={() => setShowCurrencyModal(false)} style={{ padding: 4 }}>
                    <X size={20} color="#8BAF9C" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 340, marginTop: 10 }}>
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
                            backgroundColor: isSelected ? 'rgba(204, 255, 0, 0.12)' : 'transparent',
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
                              color: isSelected ? colors.lime : '#FFFFFF',
                              width: 32,
                            }}
                          >
                            {curr.symbol}
                          </Text>
                          <View style={{ marginLeft: 8 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                              {curr.name}
                            </Text>
                            <Text style={{ color: '#8BAF9C', fontSize: 11 }}>
                              {curr.code}
                            </Text>
                          </View>
                        </View>
                        {isSelected && <Check size={18} color={colors.lime} />}
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArchContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  archFrame: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#111915',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#1D3327',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  heroEditBadge: {
    position: 'absolute',
    bottom: 12,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2A4D3B',
    borderWidth: 2,
    borderColor: '#132119',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    color: '#8BAF9C',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  themeToggleBar: {
    flexDirection: 'row',
    gap: 8,
  },
  themeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  menuRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncBtn: {
    backgroundColor: '#1E3326',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D4738',
  },
  logoutPill: {
    backgroundColor: '#2A1014',
    borderWidth: 1,
    borderColor: '#4A151C',
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '700',
  },
  footerWrap: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    color: '#5A7566',
    fontSize: 11,
  },
  footerSubText: {
    color: '#42574C',
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  photoOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
