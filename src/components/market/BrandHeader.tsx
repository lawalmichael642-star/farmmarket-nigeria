import { Link, useRouter } from 'expo-router';
import { ArrowRight, Moon, Sprout, Sun, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useMarketTheme } from '@/context/market-theme-context';
import { initials } from '@/utils/format';

export function BrandHeader({ locationLabel }: { locationLabel?: string }) {
  const { user, signOut } = useAuth();
  const { mode, colors, toggleMode } = useMarketTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.mark}><Sprout size={21} color={colors.lime} strokeWidth={2.2} /></View>
        <View>
          <Text style={styles.wordmark}>FarmMarket</Text>
          <Text style={styles.submark}>NIGERIA</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {locationLabel ? <Text numberOfLines={1} style={styles.location}>{locationLabel}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          onPress={toggleMode}
          style={styles.themeToggle}>
          {mode === 'dark' ? <Sun size={17} color={colors.ink} /> : <Moon size={17} color={colors.ink} />}
        </Pressable>
        {user ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sign out ${user.name}`}
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
            style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.name)}</Text>
          </Pressable>
        ) : (
          <Link href="/login" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Sign in" style={styles.accountButton}>
              <UserRound size={18} color={colors.forest} />
              <Text style={styles.signIn}>Sign in</Text>
              <ArrowRight size={14} color={colors.forest} />
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { color: colors.ink, fontFamily: FontFamily.bold, fontSize: 16 },
  submark: { color: colors.muted, fontFamily: FontFamily.bold, fontSize: 8, letterSpacing: 1.5, marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: { width: 38, height: 38, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleGreen },
  location: { maxWidth: 126, color: colors.muted, fontFamily: FontFamily.medium, fontSize: 12 },
  accountButton: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: colors.paleGreen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  signIn: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontFamily: FontFamily.bold, fontSize: 13 },
  });
}