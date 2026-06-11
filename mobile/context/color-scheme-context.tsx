import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

type ColorSchemeContextValue = {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
};

const defaultScheme = (useRNColorScheme() ?? 'light') as ColorScheme;

const ColorSchemeContext = createContext<ColorSchemeContextValue>({
  colorScheme: defaultScheme,
  toggleColorScheme: () => {},
  setColorScheme: () => {},
});

export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>((systemColorScheme ?? 'light') as ColorScheme);
  const [isManuallyOverridden, setIsManuallyOverridden] = useState(false);

  useEffect(() => {
    if (!isManuallyOverridden && systemColorScheme) {
      setColorSchemeState(systemColorScheme as ColorScheme);
    }
  }, [isManuallyOverridden, systemColorScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setIsManuallyOverridden(true);
    setColorSchemeState(scheme);
  }, []);

  const toggleColorScheme = useCallback(() => {
    setIsManuallyOverridden(true);
    setColorSchemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ColorSchemeContextValue>(
    () => ({
      colorScheme,
      toggleColorScheme,
      setColorScheme,
    }),
    [colorScheme, toggleColorScheme, setColorScheme]
  );

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}

export function useColorSchemeContext() {
  return useContext(ColorSchemeContext);
}

