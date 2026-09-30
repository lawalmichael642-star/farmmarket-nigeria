import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Sprout } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/market/ActionButton';
import { Screen } from '@/components/market/Screen';
import { TextField } from '@/components/market/TextField';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useMarketTheme } from '@/context/market-theme-context';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!emailOrPhone.trim() || !password) {
      setError('Enter your email or phone number and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(emailOrPhone.trim(), password);
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><ArrowLeft size={18} color={colors.forest} /><Text style={styles.backLabel}>Back to market</Text></Pressable>
      <View style={styles.brand}><View style={styles.mark}><Sprout size={22} color={colors.lime} /></View><Text style={styles.wordmark}>FarmMarket Nigeria</Text></View>
      <View style={styles.intro}><Text style={styles.heading}>Welcome back.</Text><Text style={styles.subtitle}>Sign in to continue to your local market.</Text></View>
      <View style={styles.form}>
        <TextField label="Email address or phone" value={emailOrPhone} onChangeText={setEmailOrPhone} placeholder="you@example.com or phone number" autoCapitalize="none" keyboardType="email-address" returnKeyType="next" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry returnKeyType="done" onSubmitEditing={submit} />
        {error ? <View style={styles.errorBox}><Text style={styles.error}>{error}</Text></View> : null}
        <ActionButton title="Sign in" onPress={submit} loading={loading} />
        <View style={styles.switchRow}><Text style={styles.switchText}>New to FarmMarket?</Text><Link href="/register" asChild><Pressable><Text style={styles.switchLink}>Create an account</Text></Pressable></Link></View>
      </View>
      <Text style={styles.footnote}>A direct connection between the people who grow food and the people who bring it to market.</Text>
    </Screen>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', minHeight: 38 },
  backLabel: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  mark: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  wordmark: { color: colors.ink, fontFamily: FontFamily.bold, fontSize: 15 },
  intro: { gap: 6, marginTop: 12 },
  heading: { color: colors.ink, fontFamily: FontFamily.display, fontSize: 34, lineHeight: 40 },
  subtitle: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 13 },
  form: { maxWidth: 600, padding: 18, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 16 },
  errorBox: { padding: 11, borderRadius: 6, backgroundColor: colors.paleOrange },
  error: { color: colors.danger, fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 18 },
  switchRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 5, paddingTop: 2 },
  switchText: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12 },
  switchLink: { color: colors.forest, fontFamily: FontFamily.bold, fontSize: 12 },
  footnote: { maxWidth: 460, color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 19, paddingTop: 4 },
  });
}