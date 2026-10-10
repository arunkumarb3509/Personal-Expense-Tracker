import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Wallet } from '@/types/wallet';
import { useRouter } from 'expo-router';
import {
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  PiggyBank,
  Wallet as WalletIcon,
  Plus,
} from 'lucide-react-native';

export interface WalletCarouselProps {
  wallets: Wallet[];
}

export function WalletCarousel({ wallets }: WalletCarouselProps) {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { format } = useCurrency();
  const router = useRouter();

  const getWalletIcon = (type: string, color: string) => {
    switch (type) {
      case 'upi':
        return <Smartphone size={20} color={color} />;
      case 'bank':
        return <Building2 size={20} color={color} />;
      case 'cash':
        return <Banknote size={20} color={color} />;
      case 'credit_card':
        return <CreditCard size={20} color={color} />;
      case 'savings':
        return <PiggyBank size={20} color={color} />;
      default:
        return <WalletIcon size={20} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { paddingHorizontal: spacing.lg }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.bold,
            },
          ]}
        >
          My Wallets & Accounts
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/wallets')}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
            }}
          >
            Manage All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
      >
        {wallets.map((wallet) => {
          const wColor = wallet.color || colors.primary;
          return (
            <TouchableOpacity
              key={wallet.id}
              activeOpacity={0.8}
              onPress={() => router.push('/wallets')}
              style={[
                styles.walletCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  marginRight: spacing.md,
                },
                shadows.sm,
              ]}
            >
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: `${wColor}18`,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  {getWalletIcon(wallet.type, wColor)}
                </View>
                {wallet.isDefault && (
                  <View
                    style={[
                      styles.defaultBadge,
                      {
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: typography.sizes.xxs,
                        fontWeight: typography.weights.bold,
                      }}
                    >
                      MAIN
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.walletName,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.medium,
                    marginTop: spacing.sm,
                  },
                ]}
                numberOfLines={1}
              >
                {wallet.name}
              </Text>

              <Text
                style={[
                  styles.walletBalance,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                    marginTop: 2,
                  },
                ]}
              >
                {format(wallet.currentBalance)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Add Wallet Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/wallets/add-wallet')}
          style={[
            styles.addWalletCard,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.addIconCircle,
              {
                backgroundColor: colors.surfaceHighlight,
                borderRadius: radius.full,
              },
            ]}
          >
            <Plus size={20} color={colors.textSecondary} />
          </View>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
              marginTop: spacing.sm,
            }}
          >
            Add Wallet
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  walletCard: {
    width: 140,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  walletName: {},
  walletBalance: {
    letterSpacing: -0.2,
  },
  addWalletCard: {
    width: 110,
    minHeight: 110,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
