import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.tint,
        headerShown: true,
        headerTitleAlign: 'center',
        headerRightContainerStyle: { paddingRight: 12 },
        headerStyle: { backgroundColor: palette.headerBackground },
        headerTintColor: palette.headerText,
        headerTitleStyle: { color: palette.headerText },
        headerRight: () => (
          <View style={{ marginRight: -4 }}>
            <ThemeToggleButton />
          </View>
        ),
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Arıza Raporlama Sistemi',
          headerShown: true,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
