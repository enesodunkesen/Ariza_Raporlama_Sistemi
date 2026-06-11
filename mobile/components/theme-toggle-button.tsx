import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorSchemeContext } from '@/context/color-scheme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ThemeToggleButton() {
  const colorScheme = useColorScheme() ?? 'light';
  const { toggleColorScheme } = useColorSchemeContext();
  const palette = Colors[colorScheme];

  return (
    <Pressable
      onPress={toggleColorScheme}
      accessibilityRole="button"
      accessibilityLabel="Tema değiştir"
      style={[
        styles.button,
        {
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
        },
      ]}
      hitSlop={8}>
      <Feather name={colorScheme === 'dark' ? 'sun' : 'moon'} size={18} color={palette.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});


