/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useMarketTheme } from '@/context/market-theme-context';

export function useTheme() {
  const { mode } = useMarketTheme();
  return Colors[mode];
}
