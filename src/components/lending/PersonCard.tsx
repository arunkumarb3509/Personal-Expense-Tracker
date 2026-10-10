import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Person } from '@/types/lending';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { HandCoins, ChevronRight, Phone } from 'lucide-react-native';

export interface PersonCardProps {
  person: Person;
  mode?: 'given' | 'borrowed';
  onPress: (person: Person) => void;
  onRecordRepay?: (person: Person) => void;
}

export function PersonCard({
  person,
  mode = 'given',
  onPress,
  onRecordRepay,
}: PersonCardProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { format } = useCurrency();

  const isGiven = mode === 'given';
  const remaining = isGiven ? person.remainingReceivable : person.remainingPayable;
  const totalPrincipal = isGiven ? person.totalGiven : person.totalBorrowed;
  const totalRepaid = isGiven ? person.totalReceived : person.totalRepaid;

  let badgeVariant: 'success' | 'warning' | 'error' = 'error';
  let badgeLabel = 'UNPAID';

  if (remaining === 0 && totalPrincipal > 0) {
    badgeVariant = 'success';
    badgeLabel = 'SETTLED / PAID';
  } else if (totalRepaid > 0 && remaining > 0) {
    badgeVariant = 'warning';
    badgeLabel = 'PARTIALLY PAID';
  }

  const highlightColor = isGiven ? colors.lend : colors.borrow;

  return (
    <Card
      variant="outlined"
      padding={spacing.md}
      onPress={() => onPress(person)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.personInfo}>
          <Avatar name={person.name} size={40} />
          <View style={{ marginLeft: 12 }}>
            <Text
              style={[
                styles.name,
                {
                  color: colors.text,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.bold,
                },
              ]}
              numberOfLines={1}
            >
              {person.name}
            </Text>
            {person.phone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Phone size={10} color={colors.textTertiary} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.xxs }}>
                  {person.phone}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Badge label={badgeLabel} variant={badgeVariant} size="sm" />
      </View>

      {/* Balance Details */}
      <View
        style={[
          styles.balanceGrid,
          {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.lg,
            padding: spacing.sm,
            marginTop: spacing.sm,
          },
        ]}
      >
        <View style={styles.gridCol}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>
            {isGiven ? 'Total Lent' : 'Total Borrowed'}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
              marginTop: 2,
            }}
          >
            {format(totalPrincipal)}
          </Text>
        </View>

        <View style={styles.gridCol}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>
            {isGiven ? 'Repaid' : 'Paid Back'}
          </Text>
          <Text
            style={{
              color: colors.income,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
              marginTop: 2,
            }}
          >
            {format(totalRepaid)}
          </Text>
        </View>

        <View style={styles.gridCol}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs }}>
            {isGiven ? 'Receivable' : 'Payable'}
          </Text>
          <Text
            style={{
              color: remaining > 0 ? highlightColor : colors.income,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.bold,
              marginTop: 2,
            }}
          >
            {format(remaining)}
          </Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={[styles.footerRow, { marginTop: spacing.sm }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPress(person)}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
            }}
          >
            View History
          </Text>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>

        {remaining > 0 && onRecordRepay && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onRecordRepay(person)}
            style={[
              styles.repayBtn,
              {
                backgroundColor: highlightColor,
                borderRadius: radius.full,
              },
            ]}
          >
            <HandCoins size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: typography.sizes.xxs,
                fontWeight: typography.weights.bold,
              }}
            >
              {isGiven ? 'Receive Repayment' : 'Pay Repayment'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    letterSpacing: -0.2,
  },
  balanceGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
