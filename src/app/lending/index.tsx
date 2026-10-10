import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { PersonCard } from '@/components/lending/PersonCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Card } from '@/components/common/Card';
import { Person } from '@/types/lending';
import { HandCoins, Plus, Search, X, CheckCircle2 } from 'lucide-react-native';

export default function LendingBorrowingScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { people, totalReceivable, totalPayable } = useData();
  const { format } = useCurrency();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'given' | 'borrowed'>('given');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'settled'>('all');

  // Filter people based on tab, search, and status
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!p.name.toLowerCase().includes(q) && !(p.phone || '').includes(q)) {
          return false;
        }
      }

      // Check whether person has activity in the active tab
      const hasGivenActivity = p.totalGiven > 0;
      const hasBorrowedActivity = p.totalBorrowed > 0;

      if (activeTab === 'given' && !hasGivenActivity) return false;
      if (activeTab === 'borrowed' && !hasBorrowedActivity) return false;

      // Status filter
      const remaining = activeTab === 'given' ? p.remainingReceivable : p.remainingPayable;
      if (filterStatus === 'pending' && remaining <= 0) return false;
      if (filterStatus === 'settled' && remaining > 0) return false;

      return true;
    });
  }, [people, activeTab, searchQuery, filterStatus]);

  const handlePersonPress = (person: Person) => {
    router.push({
      pathname: '/lending/person-detail',
      params: { personId: person.id, mode: activeTab },
    });
  };

  const handleQuickRepay = (person: Person) => {
    router.push({
      pathname: '/lending/person-detail',
      params: { personId: person.id, mode: activeTab, autoOpenRepay: 'true' },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Header
        title="Lending & Borrowing"
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/lending/add-record')}
            style={[
              styles.addBtn,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
          >
            <Plus size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Summary Total Card */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.xs }}>
        <Card variant="elevated" padding={spacing.lg} style={shadows.sm}>
          <View style={styles.summaryTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
                Total to Receive (Given)
              </Text>
              <Text
                style={{
                  color: colors.lend,
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.bold,
                  marginTop: 2,
                }}
              >
                {format(totalReceivable)}
              </Text>
            </View>

            <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />

            <View style={{ flex: 1, paddingLeft: spacing.md }}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
                Total to Pay (Borrowed)
              </Text>
              <Text
                style={{
                  color: colors.borrow,
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.bold,
                  marginTop: 2,
                }}
              >
                {format(totalPayable)}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Segmented Mode Selector */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.sm }}>
        <SegmentedControl
          options={[
            { value: 'given', label: 'Money Given (To Receive)' },
            { value: 'borrowed', label: 'Money Borrowed (To Pay)' },
          ]}
          selectedValue={activeTab}
          onValueChange={(tab) => setActiveTab(tab as any)}
        />
      </View>

      {/* Search and Status Pills */}
      <View style={[styles.filtersRow, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: radius.lg,
              flex: 1,
            },
          ]}
        >
          <Search size={16} color={colors.textTertiary} style={{ marginRight: 6 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search person..."
            placeholderTextColor={colors.textTertiary}
            style={{ color: colors.text, fontSize: typography.sizes.xs, flex: 1, paddingVertical: 6 }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Toggle */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            setFilterStatus(
              filterStatus === 'all' ? 'pending' : filterStatus === 'pending' ? 'settled' : 'all'
            )
          }
          style={[
            styles.statusPill,
            {
              backgroundColor:
                filterStatus !== 'all' ? colors.primaryLight : colors.surfaceSecondary,
              borderColor: filterStatus !== 'all' ? colors.primary : colors.border,
              borderRadius: radius.lg,
              marginLeft: spacing.sm,
            },
          ]}
        >
          <Text
            style={{
              color: filterStatus !== 'all' ? colors.primary : colors.textSecondary,
              fontSize: typography.sizes.xs,
              fontWeight: '700',
              textTransform: 'capitalize',
            }}
          >
            {filterStatus === 'all' ? 'Status: All' : filterStatus}
          </Text>
        </TouchableOpacity>
      </View>

      {/* People List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
      >
        {filteredPeople.length > 0 ? (
          filteredPeople.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              mode={activeTab}
              onPress={handlePersonPress}
              onRecordRepay={handleQuickRepay}
            />
          ))
        ) : (
          <EmptyState
            type={activeTab === 'given' ? 'lending' : 'borrowing'}
            title={activeTab === 'given' ? 'No money given records' : 'No money borrowed records'}
            description={
              activeTab === 'given'
                ? 'Keep track of money lent to friends or family.'
                : 'Keep track of money borrowed with repayment tracking.'
            }
            actionTitle="Add New Record"
            onActionPress={() => router.push('/lending/add-record')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vertDivider: {
    width: 1,
    height: 36,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
});
