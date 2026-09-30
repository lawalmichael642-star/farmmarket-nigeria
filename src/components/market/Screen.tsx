import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MarketPalette } from '@/constants/theme';
import { useMarketTheme } from '@/context/market-theme-context';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  scrollContent: { flexGrow: 1, paddingBottom: 36 },
  content: {
    width: '100%',
    maxWidth: 1080,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    alignSelf: 'center',
    gap: 22,
  },
  });
}