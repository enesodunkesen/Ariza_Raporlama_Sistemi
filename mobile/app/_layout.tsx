import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Colors } from '@/constants/theme';
import { ColorSchemeProvider } from '@/context/color-scheme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({});

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ColorSchemeProvider>
          <RootNavigation />
        </ColorSchemeProvider>
      </SafeAreaProvider>
    </View>
  );
}

function RootNavigation() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerRight: () => <ThemeToggleButton />,
          headerStyle: { backgroundColor: palette.headerBackground },
          headerTintColor: palette.headerText,
          headerTitleStyle: { color: palette.headerText },
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="reports/pending" options={{ headerShown: true, title: 'Beklemede Olan Raporlarım' }} />
        <Stack.Screen name="reports/in-progress" options={{ headerShown: true, title: 'İşleme Alınan Raporlarım' }} />
        <Stack.Screen name="reports/completed" options={{ headerShown: true, title: 'Tamamlanan Raporlarım' }} />
        <Stack.Screen name="new-report" options={{ headerShown: true, title: 'Yeni Rapor Ekle' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
