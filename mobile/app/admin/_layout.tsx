import { Stack } from 'expo-router';
import React from 'react';

import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminStackLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerRight: () => <ThemeToggleButton />,
        headerStyle: { backgroundColor: palette.headerBackground },
        headerTintColor: palette.headerText,
        headerTitleStyle: { color: palette.headerText },
      }}>
      <Stack.Screen name="index" options={{ title: 'Arıza Raporlama Sistemi' }} />
      <Stack.Screen name="requests" options={{ title: 'Taleplerim' }} />
      <Stack.Screen name="reports" options={{ title: 'Rapor Durumları' }} />
      <Stack.Screen name="reports/pending" options={{ title: 'Beklemede Olan Raporlar' }} />
      <Stack.Screen name="reports/in-progress" options={{ title: 'İşleme Alınan Raporlar' }} />
      <Stack.Screen name="reports/completed" options={{ title: 'Tamamlanan Raporlar' }} />
      <Stack.Screen name="create-request" options={{ title: 'Talep Oluştur' }} />
    </Stack>
  );
}
