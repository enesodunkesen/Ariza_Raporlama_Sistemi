import { useColorSchemeContext } from '@/context/color-scheme-context';

export function useColorScheme() {
  const { colorScheme } = useColorSchemeContext();
  return colorScheme;
}
