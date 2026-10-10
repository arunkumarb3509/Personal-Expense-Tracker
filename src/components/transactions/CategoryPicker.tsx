import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Category } from '@/types/transaction';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  Wallet,
  Laptop,
  TrendingUp,
  LineChart,
  Gift,
  ArrowDownLeft,
  MoreHorizontal,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface CategoryPickerProps {
  type: 'expense' | 'income';
  selectedCategoryId: string;
  selectedSubcategory?: string;
  onSelectCategory: (category: Category, subcategory?: string) => void;
}

export function CategoryPicker({
  type,
  selectedCategoryId,
  selectedSubcategory,
  onSelectCategory,
}: CategoryPickerProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const [customSub, setCustomSub] = useState('');
  const [showAddCustomSub, setShowAddCustomSub] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const getIcon = (iconName: string, iconColor: string) => {
    const size = 18;
    switch (iconName) {
      case 'Utensils':
        return <Utensils size={size} color={iconColor} />;
      case 'Car':
        return <Car size={size} color={iconColor} />;
      case 'ShoppingBag':
        return <ShoppingBag size={size} color={iconColor} />;
      case 'Zap':
        return <Zap size={size} color={iconColor} />;
      case 'Film':
        return <Film size={size} color={iconColor} />;
      case 'HeartPulse':
        return <HeartPulse size={size} color={iconColor} />;
      case 'GraduationCap':
        return <GraduationCap size={size} color={iconColor} />;
      case 'Briefcase':
        return <Briefcase size={size} color={iconColor} />;
      case 'Users':
        return <Users size={size} color={iconColor} />;
      case 'Calendar':
        return <Calendar size={size} color={iconColor} />;
      case 'Wallet':
        return <Wallet size={size} color={iconColor} />;
      case 'Laptop':
        return <Laptop size={size} color={iconColor} />;
      case 'TrendingUp':
        return <TrendingUp size={size} color={iconColor} />;
      case 'LineChart':
        return <LineChart size={size} color={iconColor} />;
      case 'Gift':
        return <Gift size={size} color={iconColor} />;
      default:
        return <MoreHorizontal size={size} color={iconColor} />;
    }
  };

  const handleSelectCat = (cat: Category) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    const firstSub = cat.subcategories && cat.subcategories.length > 0 ? cat.subcategories[0] : '';
    onSelectCategory(cat, firstSub);
  };

  const handleSelectSub = (sub: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    onSelectCategory(currentCategory, sub);
  };

  const handleAddCustomSub = () => {
    if (customSub.trim()) {
      onSelectCategory(currentCategory, customSub.trim());
      setCustomSub('');
      setShowAddCustomSub(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionLabel,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            marginBottom: spacing.sm,
          },
        ]}
      >
        Select Category
      </Text>

      {/* Categories Horizontal Scroll / Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.categoryScroll, { paddingBottom: spacing.xs }]}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategoryId;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.7}
              onPress={() => handleSelectCat(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? `${cat.color}20` : colors.surfaceSecondary,
                  borderColor: isSelected ? cat.color : colors.border,
                  borderRadius: radius.xl,
                  borderWidth: isSelected ? 1.5 : 1,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginRight: spacing.sm,
                },
              ]}
            >
              <View style={{ marginRight: 6 }}>
                {getIcon(cat.icon, isSelected ? cat.color : colors.textSecondary)}
              </View>
              <Text
                style={{
                  color: isSelected ? cat.color : colors.text,
                  fontSize: typography.sizes.xs,
                  fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                }}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Subcategories Chips if available */}
      {currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.medium,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Subcategory
          </Text>
          <View style={styles.subcategoriesWrap}>
            {currentCategory.subcategories.map((sub) => {
              const isSubSelected = sub === selectedSubcategory;
              return (
                <TouchableOpacity
                  key={sub}
                  activeOpacity={0.7}
                  onPress={() => handleSelectSub(sub)}
                  style={[
                    styles.subChip,
                    {
                      backgroundColor: isSubSelected ? colors.primary : colors.surfaceSecondary,
                      borderColor: isSubSelected ? colors.primary : colors.border,
                      borderRadius: radius.full,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 6,
                      marginRight: 6,
                      marginBottom: 6,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSubSelected ? colors.primaryForeground : colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      fontWeight: isSubSelected ? typography.weights.bold : typography.weights.medium,
                    }}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom Subcategory input toggle */}
            {!showAddCustomSub ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowAddCustomSub(true)}
                style={[
                  styles.subChip,
                  {
                    backgroundColor: 'transparent',
                    borderColor: colors.border,
                    borderStyle: 'dashed',
                    borderRadius: radius.full,
                    paddingHorizontal: spacing.md,
                    paddingVertical: 6,
                    marginBottom: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >
                <Plus size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                  }}
                >
                  + Custom
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.customSubInputRow, { borderColor: colors.primary, borderRadius: radius.full }]}>
                <TextInput
                  value={customSub}
                  onChangeText={setCustomSub}
                  placeholder="Subcategory..."
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.xs,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    minWidth: 90,
                  }}
                />
                <TouchableOpacity
                  onPress={handleAddCustomSub}
                  style={{ backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4 }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>OK</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionLabel: {},
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  subChip: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSubInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 6,
  },
});
