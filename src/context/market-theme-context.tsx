import { createContext, useContext, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { DarkMarketColors, MarketColors, type MarketPalette } from '@/constants/theme';

type ThemeMode = 'light' | 'dark';

type MarketTheme = {
  mode: ThemeMode;
  colors: MarketPalette;
  toggleMode: () => void;
};

const MarketThemeContext = createContext<MarketTheme | null>(null);

export function MarketThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [selectedMode, setSelectedMode] = useState<ThemeMode | null>(null);
  const mode = selectedMode ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
  const colors = mode === 'dark' ? DarkMarketColors : MarketColors;

  return (
    <MarketThemeContext.Provider value={{
      mode,
      colors,
      toggleMode: () => setSelectedMode(mode === 'dark' ? 'light' : 'dark'),
    }}>
      {children}
    </MarketThemeContext.Provider>
  );
}

export function useMarketTheme() {
  const theme = useContext(MarketThemeContext);
  if (!theme) throw new Error('useMarketTheme must be used within MarketThemeProvider.');
  return theme;
}