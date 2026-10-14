import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { Person } from '@/types/lending';
import { Plus, HandCoins, ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export function QuickSettlementsRow() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { people, totalReceivable, totalPayable } = useData();
  const { format } = useCurrency();
  const router = useRouter();

  const handlePersonPress = (person: Person) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/lending/person-detail',
      params: { personId: person.id },
    });
  };

  const handleAddPerson = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    router.push('/lending/add-record');
  };

  return (
    <View style={[styles.container, { marginVertical: spacing.sm }]}>
      {/* Header Row */}
      <View style={[styles.headerRow, { paddingHorizontal: spacing.lg, marginBottom: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <HandCoins size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: typography.sizes.md,
                fontWeight: '700',
              },
            ]}
          >
            Quick Settlements & Cash Dues
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/lending')}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.sizes.xs,
              fontWeight: '600',
              marginRight: 2,
            }}
          >
            See All
          </Text>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Card with Contact Avatars */}
      <View
        style={[
          styles.rowCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius['2xl'],
            marginHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
          },
          shadows.sm,
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', paddingRight: spacing.sm }}
        >
          {/* Add New Person Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleAddPerson}
            style={styles.contactItem}
          >
            <View
              style={[
                styles.addCircle,
                {
                  backgroundColor: colors.lime,
                  borderColor: colors.forestDark,
                },
              ]}
            >
              <Plus size={22} color="#0B291F" strokeWidth={2.5} />
            </View>
            <Text
              style={[
                styles.contactName,
                {
                  color: colors.text,
                  fontSize: typography.sizes.xs,
                  fontWeight: '600',
                },
              ]}
              numberOfLines={1}
            >
              Add Person
            </Text>
          </TouchableOpacity>

          {/* Contact Person Avatars */}
          {people.slice(0, 8).map((person) => {
            const hasReceivable = person.remainingReceivable > 0;
            const hasPayable = person.remainingPayable > 0;
            const firstName = person.name.split(' ')[0] || person.name;

            return (
              <TouchableOpacity
                key={person.id}
                activeOpacity={0.75}
                onPress={() => handlePersonPress(person)}
                style={styles.contactItem}
              >
                <View style={styles.avatarWrapper}>
                  <Avatar name={person.name} size={46} />
                  {hasReceivable && (
                    <View
                      style={[
                        styles.indicatorDot,
                        { backgroundColor: colors.lend, borderColor: colors.card },
                      ]}
                    />
                  )}
                  {hasPayable && !hasReceivable && (
                    <View
                      style={[
                        styles.indicatorDot,
                        { backgroundColor: colors.borrow, borderColor: colors.card },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.contactName,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.xs,
                      fontWeight: '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {firstName}
                </Text>
                {hasReceivable && (
                  <Text
                    style={{
                      color: colors.lend,
                      fontSize: typography.sizes.xxs,
                      fontWeight: '700',
                    }}
                    numberOfLines={1}
                  >
                    +{format(person.remainingReceivable)}
                  </Text>
                )}
                {hasPayable && !hasReceivable && (
                  <Text
                    style={{
                      color: colors.borrow,
                      fontSize: typography.sizes.xxs,
                      fontWeight: '700',
                    }}
                    numberOfLines={1}
                  >
                    -{format(person.remainingPayable)}
                  </Text>
                )}
                {!hasReceivable && !hasPayable && (
                  <Text
                    style={{
                      color: colors.textTertiary,
                      fontSize: typography.sizes.xxs,
                    }}
                  >
                    Settled
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {people.length === 0 && (
            <View style={{ paddingLeft: 8, justifyContent: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                Track cash given or received with friends & colleagues
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  rowCard: {
    borderWidth: 1,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 62,
  },
  addCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  indicatorDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  contactName: {
    textAlign: 'center',
    width: 64,
  },
});
