import { Link, useRouter } from 'expo-router';
import { ArrowLeft, BriefcaseBusiness, Tractor, Truck } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/market/ActionButton';
import { Screen } from '@/components/market/Screen';
import { TextField } from '@/components/market/TextField';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useMarketTheme } from '@/context/market-theme-context';
import type { UserRole } from '@/types/market';

const roleChoices: { value: UserRole; title: string; description: string; Icon: typeof Tractor }[] = [
  { value: 'farmer', title: 'Farmer', description: 'List a harvest', Icon: Tractor },
  { value: 'trader', title: 'Trader', description: 'Source produce', Icon: BriefcaseBusiness },
  { value: 'driver', title: 'Driver', description: 'Move local goods', Icon: Truck },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name.trim() || !emailOrPhone.trim() || password.length < 8) {
      setError('Add your name, email or phone, and a password of at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp({ name: name.trim(), emailOrPhone: emailOrPhone.trim(), password, role });
      router.replace('/(tabs)');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><ArrowLeft size={18} color={colors.forest} /><Text style={styles.backLabel}>Back</Text></Pressable>
      <View style={styles.intro}><Text style={styles.eyebrow}>JOIN THE LOCAL MARKET</Text><Text style={styles.heading}>Let’s get started.</Text><Text style={styles.subtitle}>Choose how you’ll take part in FarmMarket.</Text></View>
      <View style={styles.form}>
        <View style={styles.roles}>
          {roleChoices.map(({ value, title, description, Icon }) => {
            const selected = role === value;
            return (
              <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => setRole(value)} style={[styles.roleCard, selected && styles.roleCardSelected]}>
                <View style={[styles.roleIcon, selected && styles.roleIconSelected]}><Icon size={18} color={selected ? colors.primaryText : colors.forest} /></View>
                <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>{title}</Text>
                <Text style={[styles.roleDescription, selected && styles.roleDescriptionSelected]}>{description}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextField label="Your name" value={name} onChangeText={setName} placeholder="Full name" autoCapitalize="words" />
        <TextField label="Email address or phone" value={emailOrPhone} onChangeText={setEmailOrPhone} placeholder="you@example.com or phone number" autoCapitalize="none" />
        <TextField label="Create password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />
        {error ? <View style={styles.errorBox}><Text style={styles.error}>{error}</Text></View> : null}
        <ActionButton title="Create account" onPress={submit} loading={loading} />
        <View style={styles.switchRow}><Text style={styles.switchText}>Already have an account?</Text><Link href="/login" asChild><Pressable><Text style={styles.switchLink}>Sign in</Text></Pressable></Link></View>
      </View>
    </Screen>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', minHeight: 38 },
  backLabel: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 12 },
  intro: { gap: 6, paddingTop: 10 },
  eyebrow: { color: colors.leaf, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.6 },
  heading: { color: colors.ink, fontFamily: FontFamily.display, fontSize: 34, lineHeight: 40 },
  subtitle: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 13 },
  form: { maxWidth: 640, padding: 18, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 15 },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleCard: { flex: 1, minWidth: 125, minHeight: 116, padding: 11, borderRadius: 7, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: 6 },
  roleCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  roleIcon: { width: 31, height: 31, borderRadius: 6, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  roleIconSelected: { backgroundColor: 'rgba(255,255,255,0.16)' },
  roleTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 13 },
  roleTitleSelected: { color: colors.primaryText },
  roleDescription: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 10 },
  roleDescriptionSelected: { color: '#DCE8DE' },
  errorBox: { padding: 11, borderRadius: 6, backgroundColor: colors.paleOrange },
  error: { color: colors.danger, fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 18 },
  switchRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 5 },
  switchText: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12 },
  switchLink: { color: colors.forest, fontFamily: FontFamily.bold, fontSize: 12 },
  });
}