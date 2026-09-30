import { LockKeyhole, ShieldCheck, Wallet } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/market/ActionButton';
import { BrandHeader } from '@/components/market/BrandHeader';
import { Screen } from '@/components/market/Screen';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useMarketTheme } from '@/context/market-theme-context';
import { useRouter } from 'expo-router';

export default function WalletScreen() {
  const { user } = useAuth();
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  return (
    <Screen>
      <BrandHeader locationLabel="Payments" />
      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>YOUR FARM MARKET</Text>
        <Text style={styles.heading}>Wallet & payouts.</Text>
        <Text style={styles.subtitle}>Payment status and farmer payouts will be shown here.</Text>
      </View>

      <View style={styles.balancePanel}>
        <View style={styles.balanceHeader}><View style={styles.walletIcon}><Wallet size={19} color={colors.primary} /></View><Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text></View>
        <Text style={styles.balance}>Not connected</Text>
        <Text style={styles.balanceNote}>Your balance will appear when payments are enabled.</Text>
        <View style={styles.divider} />
        <View style={styles.protection}><ShieldCheck size={17} color={colors.lime} /><Text style={styles.protectionText}>Secure payment setup is required before any funds can be held or transferred.</Text></View>
      </View>

      <View style={styles.statusPanel}>
        <View style={styles.statusIcon}><LockKeyhole size={18} color={colors.orange} /></View>
        <View style={styles.statusTextBlock}><Text style={styles.statusTitle}>Payment provider not connected</Text><Text style={styles.statusCopy}>This backend currently returns a setup notice for payment initialization. No wallet balance, escrow, or bank payout is available yet.</Text></View>
      </View>

      <View style={styles.nextPanel}>
        <Text style={styles.nextTitle}>What will be available here</Text>
        <View style={styles.bulletRow}><View style={styles.bullet} /><Text style={styles.bulletText}>Escrow status for each produce order</Text></View>
        <View style={styles.bulletRow}><View style={styles.bullet} /><Text style={styles.bulletText}>Delivery confirmation and payout history</Text></View>
        <View style={styles.bulletRow}><View style={styles.bullet} /><Text style={styles.bulletText}>Bank withdrawal setup for farmers</Text></View>
      </View>

      {!user ? <ActionButton title="Sign in to your account" onPress={() => router.push('/login')} /> : null}
    </Screen>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  headingBlock: { gap: 6, paddingTop: 8 },
  eyebrow: { color: colors.leaf, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.7 },
  heading: { color: colors.ink, fontFamily: FontFamily.display, fontSize: 34, lineHeight: 40 },
  subtitle: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19 },
  balancePanel: { padding: 20, borderRadius: 8, backgroundColor: colors.primary, gap: 10 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  walletIcon: { width: 35, height: 35, borderRadius: 7, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  balanceLabel: { color: '#E1EADF', fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.3 },
  balance: { color: colors.primaryText, fontFamily: FontFamily.display, fontSize: 28, marginTop: 5 },
  balanceNote: { color: '#DBE6DB', fontFamily: FontFamily.body, fontSize: 12 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 5 },
  protection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  protectionText: { flex: 1, color: '#E9F0E8', fontFamily: FontFamily.body, fontSize: 11, lineHeight: 17 },
  statusPanel: { padding: 15, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paleOrange, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  statusIcon: { width: 35, height: 35, borderRadius: 7, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  statusTextBlock: { flex: 1, gap: 5 },
  statusTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 13 },
  statusCopy: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
  nextPanel: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: 13 },
  nextTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 14 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.leaf },
  bulletText: { color: colors.muted, fontFamily: FontFamily.medium, fontSize: 12 },
  });
}