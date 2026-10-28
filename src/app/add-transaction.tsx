import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/context/ToastContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DatePickerModal, parseLocalDate, formatLocalDate } from '@/components/common/DatePickerModal';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { TransactionType, Category } from '@/types/transaction';
import { Wallet } from '@/types/wallet';
import { format } from 'date-fns';
import {
  ChevronLeft,
  User,
  Scan,
  Delete,
  Wallet as WalletIcon,
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  PiggyBank,
  Calendar,
  Edit3,
  Users,
  Repeat,
  CheckCircle2,
  ChevronDown,
  Plus,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Gamepad,
  HeartPulse,
  ShoppingBasket,
  LayoutGrid,
  ArrowRightLeft,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AddTransactionScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const {
    wallets,
    calculatedBalances,
    activeWallet,
    createTransaction,
    transfer,
  } = useData();
  const { currencySymbol, format: formatMoney } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; walletId?: string }>();

  // Transaction Mode: 'expense' | 'income' | 'transfer'
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'transfer'>(() => {
    if (params.type === 'income') return 'income';
    if (params.type === 'transfer') return 'transfer';
    return 'expense';
  });

  // Amount string typed in
  const [amountStr, setAmountStr] = useState('450');

  // Categories
  const initialCategory = activeTab === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Dining');

  // Selected Account (Source)
  const defaultW = wallets.find((w) => w.isDefault) || activeWallet || wallets[0];
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    params.walletId || (defaultW ? defaultW.id : '')
  );

  // Destination Account (for Transfer)
  const targetDefault = wallets.find((w) => w.id !== selectedWalletId) || wallets[1] || wallets[0];
  const [targetWalletId, setTargetWalletId] = useState<string>(
    targetDefault ? targetDefault.id : ''
  );

  // Account Picker Modal State: 'source' | 'target' | null
  const [pickerMode, setPickerMode] = useState<'source' | 'target' | null>(null);

  // Date and Time
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate(now));
  const [selectedTime, setSelectedTime] = useState<string>(format(now, 'hh:mm a'));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Description / Note
  const [description, setDescription] = useState('Breakfast at Blue Tokai');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Toggles
  const [splitDue, setSplitDue] = useState(false);
  const [makeRecurring, setMakeRecurring] = useState(false);

  const [loading, setLoading] = useState(false);

  // Update default account when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const def = wallets.find((w) => w.isDefault) || activeWallet || wallets[0];
      setSelectedWalletId(def.id);
      const tgt = wallets.find((w) => w.id !== def.id) || wallets[0];
      setTargetWalletId(tgt.id);
    }
  }, [wallets, selectedWalletId, activeWallet]);

  // Tab switch handler
  const handleTabChange = (tab: 'expense' | 'income' | 'transfer') => {
    try { Haptics.selectionAsync(); } catch {}
    setActiveTab(tab);
    if (tab === 'expense') {
      setSelectedCategory(EXPENSE_CATEGORIES[0]);
      setSelectedSubcategory('Dining');
    } else if (tab === 'income') {
      setSelectedCategory(INCOME_CATEGORIES[0]);
      setSelectedSubcategory(INCOME_CATEGORIES[0].name);
    }
  };

  // 8 Quick Categories Matching Reference Screenshot
  const quickCategories = useMemo(() => {
    return [
      { id: 'dining', name: 'Dining', fullName: 'Food & Dining', icon: Utensils, catId: 'food' },
      { id: 'transit', name: 'Transit', fullName: 'Travel & Commute', icon: Car, catId: 'travel' },
      { id: 'shopping', name: 'Shopping', fullName: 'Shopping', icon: ShoppingBag, catId: 'shopping' },
      { id: 'bills', name: 'Bills', fullName: 'Bills & Utilities', icon: Zap, catId: 'bills' },
      { id: 'fun', name: 'Fun', fullName: 'Entertainment', icon: Gamepad, catId: 'entertainment' },
      { id: 'health', name: 'Health', fullName: 'Health & Medical', icon: HeartPulse, catId: 'health' },
      { id: 'grocery', name: 'Grocery', fullName: 'Groceries & Supplies', icon: ShoppingBasket, catId: 'food' },
      { id: 'others', name: 'Others', fullName: 'General & Misc', icon: LayoutGrid, catId: 'other' },
    ];
  }, []);

  const [activeQuickCatId, setActiveQuickCatId] = useState('dining');

  const handleSelectQuickCat = (item: (typeof quickCategories)[0]) => {
    try { Haptics.selectionAsync(); } catch {}
    setActiveQuickCatId(item.id);
    const catMatch = EXPENSE_CATEGORIES.find((c) => c.id === item.catId) || EXPENSE_CATEGORIES[0];
    setSelectedCategory(catMatch);
    setSelectedSubcategory(item.name);
  };

  // Quick Amount Additions (+100, +200, +500, +1000)
  const handleAddQuickAmount = (val: number) => {
    try { Haptics.selectionAsync(); } catch {}
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + val).toString());
  };

  // Custom Keypad input handlers
  const handleKeyPress = (key: string) => {
    try { Haptics.selectionAsync(); } catch {}
    if (key === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(amountStr ? `${amountStr}.` : '0.');
      }
    } else if (key === '00') {
      if (amountStr && amountStr !== '0') {
        setAmountStr(`${amountStr}00`);
      }
    } else {
      if (amountStr === '0' || amountStr === '') {
        setAmountStr(key);
      } else {
        setAmountStr(`${amountStr}${key}`);
      }
    }
  };

  const handleBackspace = () => {
    try { Haptics.selectionAsync(); } catch {}
    if (amountStr.length <= 1) {
      setAmountStr('0');
    } else {
      setAmountStr(amountStr.slice(0, -1));
    }
  };

  // Source & Destination Wallets
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];
  const targetWallet = wallets.find((w) => w.id === targetWalletId) || wallets[1] || wallets[0];

  const sourceBalance = selectedWallet
    ? (calculatedBalances[selectedWallet.id] ?? selectedWallet.currentBalance ?? 0)
    : 0;

  const targetBalance = targetWallet
    ? (calculatedBalances[targetWallet.id] ?? targetWallet.currentBalance ?? 0)
    : 0;

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

  // Formatted date string for row display: "Today, 24 Oct • 09:15 AM"
  const formattedDateTimeRow = useMemo(() => {
    try {
      const parsed = parseLocalDate(selectedDate);
      const isTodaysDate = formatLocalDate(new Date()) === selectedDate;
      const datePart = isTodaysDate ? `Today, ${format(parsed, 'd MMM')}` : format(parsed, 'EEE, d MMM yyyy');
      return `${datePart} • ${selectedTime}`;
    } catch {
      return `${selectedDate} • ${selectedTime}`;
    }
  }, [selectedDate, selectedTime]);

  // Main Submit Handler
  const handleSave = async () => {
    const numericAmount = parseFloat(amountStr);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid amount greater than 0.', 'warning');
      return;
    }

    if (!selectedWalletId) {
      showToast('Please select a payment account.', 'warning');
      return;
    }

    try {
      setLoading(true);

      if (activeTab === 'transfer') {
        if (selectedWalletId === targetWalletId) {
          showToast('Source and destination accounts cannot be the same.', 'warning');
          setLoading(false);
          return;
        }

        await transfer(
          selectedWalletId,
          targetWalletId,
          numericAmount,
          selectedDate,
          description.trim() || `Transfer to ${targetWallet?.name || 'Account'}`,
          `Self transfer from ${selectedWallet?.name} to ${targetWallet?.name}`
        );

        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        showToast(
          `Transferred ${currencySymbol}${numericAmount} from ${selectedWallet?.name} to ${targetWallet?.name}!`,
          'success'
        );
      } else {
        const txType: TransactionType = activeTab === 'income' ? 'income' : 'expense';
        await createTransaction({
          amount: numericAmount,
          type: txType,
          categoryId: selectedCategory.id,
          categoryName: selectedCategory.name,
          subcategory: selectedSubcategory,
          walletId: selectedWalletId,
          walletName: selectedWallet?.name || 'Account',
          date: selectedDate,
          time: selectedTime,
          description: description.trim() || selectedSubcategory || selectedCategory.name,
        });

        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        showToast(
          `${txType === 'expense' ? 'Expense' : 'Income'} of ${currencySymbol}${numericAmount} saved to ${selectedWallet?.name}!`,
          'success'
        );
      }

      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to record transaction.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const parsedAmount = parseFloat(amountStr) || 0;
  const ctaButtonTitle = useMemo(() => {
    if (activeTab === 'transfer') {
      return `✓ Confirm Transfer • ${currencySymbol}${parsedAmount.toLocaleString()}`;
    }
    if (activeTab === 'income') {
      return `✓ Save Income • ${currencySymbol}${parsedAmount.toLocaleString()}`;
    }
    return `✓ Save Expense • ${currencySymbol}${parsedAmount.toLocaleString()}`;
  }, [activeTab, currencySymbol, parsedAmount]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#091510' }]}>
      {/* 1. Header Bar */}
      <View style={styles.topHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Transaction</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.profileBtn}
        >
          <User size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 2. Sub-Header: Fast Entry & Scan Bill */}
          <View style={styles.subHeaderRow}>
            <View style={styles.fastEntryPill}>
              <View style={styles.greenDot} />
              <Text style={styles.fastEntryText}>FAST ENTRY</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => showToast('Bill scanner ready. Select or take a photo of receipt.', 'info')}
              style={styles.scanBillBtn}
            >
              <Scan size={14} color="#34D399" style={{ marginRight: 6 }} />
              <Text style={styles.scanBillText}>Scan Bill</Text>
            </TouchableOpacity>
          </View>

          {/* 3. Type Switcher Tabs (Expense / Income / Transfer) */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTabChange('expense')}
              style={[
                styles.tabBtn,
                activeTab === 'expense' && styles.tabBtnActiveExpense,
              ]}
            >
              <View
                style={[
                  styles.tabDot,
                  { backgroundColor: activeTab === 'expense' ? '#EF4444' : '#698778' },
                ]}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'expense' ? '#FFFFFF' : '#8BA699' },
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTabChange('income')}
              style={[
                styles.tabBtn,
                activeTab === 'income' && styles.tabBtnActiveIncome,
              ]}
            >
              {activeTab === 'income' && <View style={[styles.tabDot, { backgroundColor: '#34D399' }]} />}
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'income' ? '#FFFFFF' : '#8BA699' },
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTabChange('transfer')}
              style={[
                styles.tabBtn,
                activeTab === 'transfer' && styles.tabBtnActiveTransfer,
              ]}
            >
              {activeTab === 'transfer' && <View style={[styles.tabDot, { backgroundColor: '#38BDF8' }]} />}
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'transfer' ? '#FFFFFF' : '#8BA699' },
                ]}
              >
                Transfer
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4. Enter Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>ENTER AMOUNT</Text>

            <View style={styles.amountDisplayRow}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <Text style={styles.amountText}>{amountStr || '0'}</Text>
              <View style={styles.cursorBlink} />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBackspace}
                style={styles.backspaceIconBtn}
              >
                <Delete size={20} color="#8BA699" />
              </TouchableOpacity>
            </View>

            {/* Quick Increment Chips */}
            <View style={styles.quickChipsRow}>
              {[100, 200, 500, 1000].map((inc) => (
                <TouchableOpacity
                  key={inc}
                  activeOpacity={0.75}
                  onPress={() => handleAddQuickAmount(inc)}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipText}>+{currencySymbol}{inc.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 5. Category Selection Grid (Only in Expense / Income modes) */}
          {activeTab !== 'transfer' && (
            <View style={styles.categorySection}>
              <View style={styles.categorySectionHeader}>
                <Text style={styles.sectionTitle}>Select Category</Text>
                <Text style={styles.categoryActiveSubtitle}>
                  {activeQuickCatId === 'dining' ? 'Food & Dining' : selectedSubcategory || selectedCategory.name}
                </Text>
              </View>

              <View style={styles.categoriesGrid}>
                {quickCategories.map((catItem) => {
                  const isSelected = activeQuickCatId === catItem.id;
                  const IconComp = catItem.icon;
                  return (
                    <TouchableOpacity
                      key={catItem.id}
                      activeOpacity={0.8}
                      onPress={() => handleSelectQuickCat(catItem)}
                      style={[
                        styles.categoryCard,
                        isSelected && styles.categoryCardSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.catIconCircle,
                          isSelected && styles.catIconCircleSelected,
                        ]}
                      >
                        <IconComp
                          size={20}
                          color={isSelected ? '#B4F06A' : '#8BA699'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryLabel,
                          isSelected && styles.categoryLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {catItem.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 6. Form Details Section (Card Rows) */}
          <View style={styles.detailsGroup}>
            {/* Row 1: Source Account (Paid From / From Account / Deposit Into) */}
            <View style={styles.rowItem}>
              <View style={[styles.rowIconCircle, { backgroundColor: '#133527' }]}>
                {getWalletIcon(selectedWallet?.type || 'bank', '#34D399', 18)}
              </View>

              <View style={styles.rowMainInfo}>
                <Text style={styles.rowSmallLabel}>
                  {activeTab === 'income' ? 'Deposit Into' : activeTab === 'transfer' ? 'From Account' : 'Paid From'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={styles.rowValueTitle} numberOfLines={1}>
                    {selectedWallet?.name || 'Account'}
                  </Text>
                  <View style={styles.balanceBadge}>
                    <Text style={styles.balanceBadgeText}>
                      Bal {currencySymbol}{Math.round(sourceBalance).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setPickerMode('source')}
                style={styles.changeBtn}
              >
                <Text style={styles.changeBtnText}>Change</Text>
                <ChevronDown size={14} color="#C4D7CC" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            {/* Row 1b: Destination Account (if Transfer) */}
            {activeTab === 'transfer' && (
              <View style={[styles.rowItem, { marginTop: 10 }]}>
                <View style={[styles.rowIconCircle, { backgroundColor: '#102E42' }]}>
                  {getWalletIcon(targetWallet?.type || 'bank', '#38BDF8', 18)}
                </View>

                <View style={styles.rowMainInfo}>
                  <Text style={styles.rowSmallLabel}>To Account (Destination)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={styles.rowValueTitle} numberOfLines={1}>
                      {targetWallet?.name || 'Account'}
                    </Text>
                    <View style={[styles.balanceBadge, { backgroundColor: '#143144' }]}>
                      <Text style={[styles.balanceBadgeText, { color: '#7DD3FC' }]}>
                        Bal {currencySymbol}{Math.round(targetBalance).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setPickerMode('target')}
                  style={styles.changeBtn}
                >
                  <Text style={styles.changeBtnText}>Change</Text>
                  <ChevronDown size={14} color="#C4D7CC" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              </View>
            )}

            {/* Row 2: Transaction Time */}
            <View style={[styles.rowItem, { marginTop: 10 }]}>
              <View style={[styles.rowIconCircle, { backgroundColor: '#162820' }]}>
                <Calendar size={18} color="#8BA699" />
              </View>

              <View style={styles.rowMainInfo}>
                <Text style={styles.rowSmallLabel}>Transaction Time</Text>
                <Text style={styles.rowValueTitle}>
                  {formattedDateTimeRow}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDatePicker(true)}
                style={styles.calendarIconBtn}
              >
                <Calendar size={16} color="#8BA699" />
              </TouchableOpacity>
            </View>

            {/* Row 3: Note / Description */}
            <View style={[styles.rowItem, { marginTop: 10 }]}>
              <View style={[styles.rowIconCircle, { backgroundColor: '#162820' }]}>
                <Edit3 size={18} color="#8BA699" />
              </View>

              <View style={styles.rowMainInfo}>
                <Text style={styles.rowSmallLabel}>Note / Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. Breakfast, Metro recharge..."
                  placeholderTextColor="#5B7869"
                  style={styles.noteInput}
                />
              </View>
            </View>
          </View>

          {/* 7. Toggles: Split or Add Due & Make Recurring */}
          <View style={styles.togglesCard}>
            <View style={styles.toggleRow}>
              <View style={[styles.toggleIconWrap, { backgroundColor: '#133527' }]}>
                <Users size={16} color="#34D399" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.toggleTitle}>Split or Add Due</Text>
                <Text style={styles.toggleSubtitle}>Link with shared settlement</Text>
              </View>
              <Switch
                value={splitDue}
                onValueChange={(val) => {
                  setSplitDue(val);
                  if (val) {
                    showToast('Split dues can be settled in Cash & Personal Settlements.', 'info');
                  }
                }}
                trackColor={{ false: '#162C22', true: '#34D399' }}
                thumbColor={splitDue ? '#FFFFFF' : '#8BA699'}
              />
            </View>

            <View style={styles.toggleDivider} />

            <View style={styles.toggleRow}>
              <View style={[styles.toggleIconWrap, { backgroundColor: '#1B3126' }]}>
                <Repeat size={16} color="#B4F06A" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.toggleTitle}>Make Recurring</Text>
                <Text style={styles.toggleSubtitle}>Monthly subscription or rent</Text>
              </View>
              <Switch
                value={makeRecurring}
                onValueChange={(val) => {
                  setMakeRecurring(val);
                  if (val) {
                    showToast('Will add reminder under Recurring Payments.', 'info');
                  }
                }}
                trackColor={{ false: '#162C22', true: '#B4F06A' }}
                thumbColor={makeRecurring ? '#0B291F' : '#8BA699'}
              />
            </View>
          </View>

          {/* 8. Custom Keypad */}
          <View style={styles.keypadContainer}>
            <View style={styles.keypadRow}>
              {['1', '2', '3'].map((key) => (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.7}
                  onPress={() => handleKeyPress(key)}
                  style={styles.keypadKey}
                >
                  <Text style={styles.keypadKeyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {['4', '5', '6'].map((key) => (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.7}
                  onPress={() => handleKeyPress(key)}
                  style={styles.keypadKey}
                >
                  <Text style={styles.keypadKeyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {['7', '8', '9'].map((key) => (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.7}
                  onPress={() => handleKeyPress(key)}
                  style={styles.keypadKey}
                >
                  <Text style={styles.keypadKeyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKeyPress('.')}
                style={styles.keypadKey}
              >
                <Text style={styles.keypadKeyText}>.</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKeyPress('0')}
                style={styles.keypadKey}
              >
                <Text style={styles.keypadKeyText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKeyPress('00')}
                style={styles.keypadKey}
              >
                <Text style={styles.keypadKeyText}>00</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 9. Bottom Primary Button */}
          <View style={styles.bottomCtaWrapper}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSave}
              disabled={loading}
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    activeTab === 'transfer' ? '#38BDF8' : '#C5F842',
                },
              ]}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  { color: activeTab === 'transfer' ? '#082536' : '#0B291F' },
                ]}
              >
                {ctaButtonTitle}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Account Selection Bottom Sheet Modal */}
      <Modal
        visible={pickerMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerMode(null)}
      >
        <TouchableWithoutFeedback onPress={() => setPickerMode(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheetCard}>
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetTitle}>
                      {pickerMode === 'target' ? 'Select Destination Account' : 'Select Payment Account'}
                    </Text>
                    <Text style={styles.sheetSubtitle}>
                      {pickerMode === 'target'
                        ? 'Account to receive the funds'
                        : 'Balance will be deducted from this account'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPickerMode(null)}
                    style={styles.sheetCloseBtn}
                  >
                    <X size={18} color="#8BA699" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 340 }}>
                  {wallets.map((w) => {
                    const isSelected =
                      pickerMode === 'target' ? w.id === targetWalletId : w.id === selectedWalletId;
                    const wBal = calculatedBalances[w.id] ?? w.currentBalance ?? 0;

                    return (
                      <TouchableOpacity
                        key={w.id}
                        activeOpacity={0.7}
                        onPress={() => {
                          try { Haptics.selectionAsync(); } catch {}
                          if (pickerMode === 'target') {
                            setTargetWalletId(w.id);
                          } else {
                            setSelectedWalletId(w.id);
                          }
                          setPickerMode(null);
                        }}
                        style={[
                          styles.accountOptionRow,
                          isSelected && styles.accountOptionRowSelected,
                        ]}
                      >
                        <View style={[styles.accountOptionIcon, { backgroundColor: `${w.color || '#34D399'}22` }]}>
                          {getWalletIcon(w.type, w.color || '#34D399', 20)}
                        </View>

                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.accountOptionName}>{w.name}</Text>
                            {w.isDefault && (
                              <View style={styles.accountDefaultBadge}>
                                <Text style={styles.accountDefaultBadgeText}>DEFAULT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.accountOptionType}>
                            {w.type.toUpperCase()} • Available: {currencySymbol}{Math.round(wBal).toLocaleString()}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={styles.checkCircle}>
                            <CheckCircle2 size={18} color="#B4F06A" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setPickerMode(null);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12261E',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginLeft: 10,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#12261E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 14,
  },
  fastEntryPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B4F06A',
    marginRight: 6,
  },
  fastEntryText: {
    color: '#9BB8AA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scanBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D3B2E',
    backgroundColor: '#0F261C',
  },
  scanBillText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F231A',
    borderRadius: 30,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
  },
  tabBtnActiveExpense: {
    backgroundColor: '#651212',
  },
  tabBtnActiveIncome: {
    backgroundColor: '#123D26',
  },
  tabBtnActiveTransfer: {
    backgroundColor: '#0F2C3F',
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountCard: {
    backgroundColor: '#12221A',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1B3528',
  },
  amountLabel: {
    color: '#8BAF9C',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    position: 'relative',
    width: '100%',
  },
  currencySymbol: {
    color: '#B4F06A',
    fontSize: 32,
    fontWeight: '800',
    marginRight: 4,
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cursorBlink: {
    width: 2.5,
    height: 34,
    backgroundColor: '#B4F06A',
    marginLeft: 4,
    borderRadius: 1,
  },
  backspaceIconBtn: {
    position: 'absolute',
    right: 0,
    padding: 6,
  },
  quickChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#172C21',
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F3E2F',
  },
  quickChipText: {
    color: '#D1E6DA',
    fontSize: 12,
    fontWeight: '700',
  },
  categorySection: {
    marginBottom: 18,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#F2FAF5',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryActiveSubtitle: {
    color: '#B4F06A',
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#11221A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#173024',
    padding: 6,
  },
  categoryCardSelected: {
    borderColor: '#26543C',
    backgroundColor: '#142C21',
  },
  catIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#162C22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  catIconCircleSelected: {
    backgroundColor: '#1C3E2E',
  },
  categoryLabel: {
    color: '#8BA699',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#B4F06A',
    fontWeight: '700',
  },
  detailsGroup: {
    marginBottom: 14,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11221A',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#183326',
  },
  rowIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rowSmallLabel: {
    color: '#8BAF9C',
    fontSize: 10,
    fontWeight: '600',
  },
  rowValueTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  balanceBadge: {
    backgroundColor: '#153325',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  balanceBadgeText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '700',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172E22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  changeBtnText: {
    color: '#E2EFE7',
    fontSize: 11,
    fontWeight: '600',
  },
  calendarIconBtn: {
    padding: 6,
  },
  noteInput: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
    marginTop: 2,
  },
  togglesCard: {
    backgroundColor: '#11221A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#183326',
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSubtitle: {
    color: '#8BAF9C',
    fontSize: 10,
    marginTop: 1,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: '#162C22',
    marginVertical: 4,
  },
  keypadContainer: {
    marginBottom: 18,
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  keypadKey: {
    flex: 1,
    height: 48,
    backgroundColor: '#12241C',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#173024',
  },
  keypadKeyText: {
    color: '#F2FAF5',
    fontSize: 20,
    fontWeight: '700',
  },
  bottomCtaWrapper: {
    marginTop: 6,
    marginBottom: 12,
  },
  saveButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C5F842',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#0F221A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: '#1B3B2E',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#8BAF9C',
    fontSize: 11,
    marginTop: 2,
  },
  sheetCloseBtn: {
    padding: 6,
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
    borderColor: '#34D399',
    backgroundColor: '#163327',
  },
  accountOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountOptionName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  accountDefaultBadge: {
    backgroundColor: '#B4F06A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  accountDefaultBadgeText: {
    color: '#0B291F',
    fontSize: 9,
    fontWeight: '800',
  },
  accountOptionType: {
    color: '#8BAF9C',
    fontSize: 11,
    marginTop: 2,
  },
  checkCircle: {
    marginLeft: 8,
  },
  addAccountLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  addAccountLinkText: {
    color: '#B4F06A',
    fontSize: 13,
    fontWeight: '700',
  },
});
