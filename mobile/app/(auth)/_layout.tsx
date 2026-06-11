import { Stack } from 'expo-router';
import React from 'react';

import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerRightContainerStyle: { paddingRight: 12 },
        headerRight: () => <ThemeToggleButton />,
        headerStyle: { backgroundColor: palette.headerBackground },
        headerTintColor: palette.headerText,
        headerTitleStyle: { color: palette.headerText },
      }}>
      <Stack.Screen name="sign-in" options={{ title: 'Giriş' }} />
    </Stack>
  );
}
