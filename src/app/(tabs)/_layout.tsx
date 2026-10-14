import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 14,
          left: 18,
          right: 18,
          backgroundColor: '#11382B', // Reference forest green dock
          borderRadius: 36,
          height: 62,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.28,
          shadowRadius: 16,
          paddingHorizontal: 8,
          paddingBottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <LayoutDashboard size={18} color={focused ? '#0B291F' : '#8CAFA0'} />
              {focused && <Text style={styles.tabText}>Home</Text>}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Receipt size={18} color={focused ? '#0B291F' : '#8CAFA0'} />
              {focused && <Text style={styles.tabText}>Records</Text>}
            </View>
          ),
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
              <View style={styles.addButton}>
                <Plus size={22} color="#0B291F" strokeWidth={2.6} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <PieChart size={18} color={focused ? '#0B291F' : '#8CAFA0'} />
              {focused && <Text style={styles.tabText}>Stats</Text>}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <User size={18} color={focused ? '#0B291F' : '#8CAFA0'} />
              {focused && <Text style={styles.tabText}>Profile</Text>}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 24,
  },
  tabItemActive: {
    backgroundColor: '#B4F06A', // Reference neon lime active indicator
    paddingHorizontal: 14,
  },
  tabText: {
    color: '#0B291F',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  addButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#B4F06A', // Neon lime center button
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B4F06A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
});
