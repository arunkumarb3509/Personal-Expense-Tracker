import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  PieChart,
  User,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const handleAddPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push('/add-transaction');
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddPress}
              style={styles.addButtonWrapper}
            >
              <View
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
              >
                <Plus size={26} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButtonWrapper: {
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
