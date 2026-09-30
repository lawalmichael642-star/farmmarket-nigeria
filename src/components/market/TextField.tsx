import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useMarketTheme } from '@/context/market-theme-context';

type Props = TextInputProps & {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
};

export function TextField({ label, error, trailing, style, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.focused, error && styles.invalid]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="#8C9990"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, style]}
          {...inputProps}
        />
        {trailing}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  group: { gap: 8 },
  label: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 13 },
  inputWrap: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  focused: { borderColor: colors.leaf },
  invalid: { borderColor: colors.danger },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    color: colors.ink,
    fontFamily: FontFamily.body,
    fontSize: 15,
  },
  error: { color: colors.danger, fontFamily: FontFamily.medium, fontSize: 12 },
  });
}