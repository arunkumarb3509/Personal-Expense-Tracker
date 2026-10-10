import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Wallet } from '@/types/wallet';
import {
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  PiggyBank,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface WalletPickerProps {
  label?: string;
  wallets: Wallet[];
  selectedWalletId: string;
  onSelectWallet: (wallet: Wallet) => void;
  error?: string;
}

export function WalletPicker({
  label = 'Select Account / Wallet',
  wallets,
  selectedWalletId,
  onSelectWallet,
  error,
}: WalletPickerProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { format } = useCurrency();

  const getWalletIcon = (type: string, color: string) => {
    const size = 18;
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

  const handleSelect = (wallet: Wallet) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    onSelectWallet(wallet);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.walletScroll, { paddingBottom: spacing.xs }]}
      >
        {wallets.map((wallet) => {
          const isSelected = wallet.id === selectedWalletId;
          const wColor = wallet.color || colors.primary;

          return (
            <TouchableOpacity
              key={wallet.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(wallet)}
              style={[
                styles.walletPill,
                {
                  backgroundColor: isSelected ? `${wColor}18` : colors.surfaceSecondary,
                  borderColor: isSelected ? wColor : colors.border,
                  borderWidth: isSelected ? 1.5 : 1,
                  borderRadius: radius.xl,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginRight: spacing.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isSelected ? wColor : colors.surfaceHighlight,
                    borderRadius: radius.md,
                    marginRight: 8,
                  },
                ]}
              >
                {getWalletIcon(wallet.type, isSelected ? '#FFFFFF' : colors.textSecondary)}
              </View>

              <View>
                <Text
                  style={{
                    color: isSelected ? colors.text : colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                  }}
                  numberOfLines={1}
                >
                  {wallet.name}
                </Text>
                <Text
                  style={{
                    color: isSelected ? wColor : colors.textTertiary,
                    fontSize: typography.sizes.xxs,
                    fontWeight: typography.weights.semibold,
                    marginTop: 1,
                  }}
                >
                  {format(wallet.currentBalance)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error && (
        <Text
          style={{
            color: colors.error,
            fontSize: typography.sizes.xs,
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {},
  walletScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 110,
  },
  iconCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
