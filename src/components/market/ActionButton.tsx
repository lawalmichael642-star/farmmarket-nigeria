import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useMarketTheme } from '@/context/market-theme-context';

type Props = {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'quiet';
  disabled?: boolean;
  loading?: boolean;
};

export function ActionButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
}: Props) {
  const primary = variant === 'primary';
  const quiet = variant === 'quiet';
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : quiet ? styles.quiet : styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && !(disabled || loading) && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? colors.primaryText : colors.forest} size="small" />
      ) : (
        <>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  quiet: { backgroundColor: 'transparent' },
  label: { fontSize: 14, fontFamily: FontFamily.semibold },
  primaryLabel: { color: colors.primaryText },
  secondaryLabel: { color: colors.forest },
  icon: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  });
}