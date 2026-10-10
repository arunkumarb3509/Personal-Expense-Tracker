import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput, AmountInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { WALLET_TYPES } from '@/constants/wallets';
import { WalletType } from '@/types/wallet';
import {
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  PiggyBank,
  Wallet as WalletIcon,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AddWalletModal() {
  const { colors, typography, radius, spacing } = useTheme();
  const { createWallet } = useData();
  const { currencyCode, currencySymbol } = useCurrency();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<WalletType>('bank');
  const [walletName, setWalletName] = useState(WALLET_TYPES.bank.defaultName);
  const [openingBalance, setOpeningBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const typeList = Object.values(WALLET_TYPES);

  const getWalletIcon = (type: string, color: string) => {
    const size = 20;
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

  const handleSelectType = (typeInfo: (typeof typeList)[0]) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedType(typeInfo.type);
    if (!walletName || typeList.some((t) => t.defaultName === walletName)) {
      setWalletName(typeInfo.defaultName);
    }
  };

  const handleCreate = async () => {
    setNameError('');
    if (!walletName.trim()) {
      setNameError('Please enter a name for this wallet.');
      return;
    }

    const typeConfig = WALLET_TYPES[selectedType];
    const initialBalance = parseFloat(openingBalance) || 0;

    try {
      setLoading(true);
      await createWallet({
        name: walletName.trim(),
        type: selectedType,
        openingBalance: initialBalance,
        currency: currencyCode,
        color: typeConfig.color,
        icon: typeConfig.icon,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Add New Wallet / Account" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Account Type Selector Grid */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.bold,
                marginTop: spacing.sm,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Select Account Type
          </Text>

          <View style={styles.typesGrid}>
            {typeList.map((item) => {
              const isSelected = selectedType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  activeOpacity={0.7}
                  onPress={() => handleSelectType(item)}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: isSelected ? `${item.color}18` : colors.surfaceSecondary,
                      borderColor: isSelected ? item.color : colors.border,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderRadius: radius.xl,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isSelected ? item.color : colors.surfaceHighlight,
                        borderRadius: radius.lg,
                      },
                    ]}
                  >
                    {getWalletIcon(item.type, isSelected ? '#FFFFFF' : colors.textSecondary)}
                  </View>
                  <Text
                    style={{
                      color: isSelected ? item.color : colors.text,
                      fontSize: typography.sizes.xs,
                      fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                      marginTop: 6,
                    }}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Wallet Name */}
          <View style={{ marginTop: spacing.lg }}>
            <TextInput
              label="Wallet / Account Name"
              value={walletName}
              onChangeText={(txt) => {
                setWalletName(txt);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. HDFC Bank, GPay, Pocket Cash"
              error={nameError}
            />
          </View>

          {/* Opening Balance Input */}
          <AmountInput
            label="Initial / Opening Balance"
            value={openingBalance}
            onChangeText={setOpeningBalance}
            currencySymbol={currencySymbol}
          />

          {/* Save Button */}
          <View style={{ marginTop: spacing.xl, marginBottom: 32 }}>
            <Button
              title="Create Account"
              onPress={handleCreate}
              variant="primary"
              size="lg"
              loading={loading}
              icon={<CheckCircle2 size={20} color="#FFFFFF" />}
              iconPosition="right"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
