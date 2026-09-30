import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { ArrowRight, ArrowUpRight, MapPin, Search, ShieldCheck, Truck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ActionButton } from '@/components/market/ActionButton';
import { BrandHeader } from '@/components/market/BrandHeader';
import { ListingCard } from '@/components/market/ListingCard';
import { Screen } from '@/components/market/Screen';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { POPULAR_NIGERIAN_CROPS } from '@/constants/crops';
import { useMarketTheme } from '@/context/market-theme-context';
import { useAuth } from '@/context/auth-context';
import { ApiError, api } from '@/services/api';
import type { Listing } from '@/types/market';

const marketImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=90';
const quickCrops = POPULAR_NIGERIAN_CROPS;

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    api.getListings()
      .then((items) => {
        if (mounted) setListings(items.slice(0, 3));
      })
      .catch((error: unknown) => {
        if (mounted) setApiMessage(error instanceof ApiError ? error.message : 'Marketplace is temporarily unavailable.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const greeting = user ? `Good to see you, ${user.name.split(' ')[0]}.` : 'A better market starts nearby.';

  return (
    <Screen>
      <BrandHeader locationLabel="Nigeria" />

      <Animated.View entering={FadeInDown.duration(420)} style={styles.intro}>
        <Text style={styles.eyebrow}>FARM GATE TO MARKET</Text>
        <Text style={styles.heading}>{greeting}</Text>
        <Text style={styles.supporting}>Fresh harvests, fair prices, and shorter journeys between the people who grow and sell our food.</Text>
      </Animated.View>

      <View style={styles.hero}>
        <Image source={{ uri: marketImage }} contentFit="cover" style={styles.heroImage} transition={250} />
        <View style={styles.imageWash} />
        <View style={styles.heroContent}>
          <View style={styles.heroPill}><MapPin size={13} color={colors.forest} /><Text style={styles.heroPillText}>OGUN STATE AND BEYOND</Text></View>
          <Text style={styles.heroTitle}>Harvests that{ '\n' }find their way.</Text>
          <Text style={styles.heroCopy}>Find fresh local produce by crop and distance.</Text>
          <Pressable onPress={() => router.push('/(tabs)/market')} style={styles.heroAction}>
            <Search size={17} color={colors.forest} />
            <Text style={styles.heroActionText}>Explore the market</Text>
            <ArrowRight size={16} color={colors.forest} />
          </Pressable>
        </View>
      </View>

      <View style={styles.quickSearch}>
        <View style={styles.sectionHeadingRow}>
          <View>
            <Text style={styles.sectionTitle}>What are you sourcing?</Text>
            <Text style={styles.sectionNote}>Start with a crop, then narrow by distance.</Text>
          </View>
          <Search size={20} color={colors.leaf} />
        </View>
        <View style={styles.cropPills}>
          {quickCrops.map((crop) => (
            <Link key={crop} href={{ pathname: '/(tabs)/market', params: { crop } }} asChild>
              <Pressable style={styles.cropPill}><Text style={styles.cropPillText}>{crop}</Text><ArrowUpRight size={13} color={colors.forest} /></Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={styles.marketHeader}>
        <View>
          <Text style={styles.sectionTitle}>Fresh from nearby farms</Text>
          <Text style={styles.sectionNote}>Available produce listed by local farmers</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/market')} style={styles.textLink}>
          <Text style={styles.textLinkLabel}>View market</Text><ArrowRight size={14} color={colors.forest} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.forest} /><Text style={styles.sectionNote}>Finding fresh listings...</Text></View>
      ) : apiMessage ? (
        <View style={styles.notice}><Text style={styles.noticeTitle}>Marketplace connection needed</Text><Text style={styles.noticeCopy}>{apiMessage}</Text></View>
      ) : listings.length ? (
        <View style={styles.listingGrid}>{listings.map((listing) => {
          const farmerId = typeof listing.farmer === 'string' ? listing.farmer : listing.farmer._id;
          const farmerName = typeof listing.farmer === 'string' ? 'Local farmer' : listing.farmer.name;
          return (
            <ListingCard
              key={listing._id}
              listing={listing}
              onMessage={farmerId === user?.id ? undefined : () => {
                if (!user) {
                  router.push('/login');
                  return;
                }
                router.push({ pathname: '/(tabs)/messages', params: { listingId: listing._id, listingCrop: listing.crop, farmerName } });
              }}
            />
          );
        })}</View>
      ) : (
        <View style={styles.empty}><View style={styles.emptyIcon}><MapPin size={20} color={colors.forest} /></View><Text style={styles.emptyTitle}>The first harvest is waiting</Text><Text style={styles.emptyCopy}>No available listings yet. Farmers can add their harvest and make it discoverable here.</Text></View>
      )}

      <View style={styles.promiseStrip}>
        <View style={styles.promiseItem}><View style={styles.promiseIcon}><ShieldCheck size={17} color={colors.forest} /></View><View style={styles.promiseText}><Text style={styles.promiseTitle}>Direct connections</Text><Text style={styles.promiseNote}>Source from farmers, not layers of middlemen.</Text></View></View>
        <View style={styles.promiseItem}><View style={[styles.promiseIcon, styles.truckIcon]}><Truck size={17} color={colors.orange} /></View><View style={styles.promiseText}><Text style={styles.promiseTitle}>Local pickup</Text><Text style={styles.promiseNote}>Keep harvest journeys closer to home.</Text></View></View>
      </View>

      {!user ? <View style={styles.joinBand}><View style={styles.joinCopy}><Text style={styles.joinTitle}>Grow your market.</Text><Text style={styles.joinNote}>Create an account to list harvests or buy direct.</Text></View><ActionButton title="Join FarmMarket" onPress={() => router.push('/register')} icon={<ArrowRight size={15} color={colors.primaryText} />} /></View> : null}
    </Screen>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  intro: { gap: 8, paddingTop: 8 },
  eyebrow: { color: colors.leaf, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.8 },
  heading: { maxWidth: 650, color: colors.ink, fontFamily: FontFamily.display, fontSize: 34, lineHeight: 40 },
  supporting: { maxWidth: 610, color: colors.muted, fontFamily: FontFamily.body, fontSize: 14, lineHeight: 21 },
  hero: { minHeight: 260, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.primary, justifyContent: 'center' },
  heroImage: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.48 },
  imageWash: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(17, 44, 31, 0.38)' },
  heroContent: { paddingHorizontal: 22, paddingVertical: 23, alignItems: 'flex-start', gap: 10 },
  heroPill: { backgroundColor: colors.lime, borderRadius: 4, flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 9, paddingVertical: 6 },
  heroPillText: { color: colors.primary, fontFamily: FontFamily.bold, fontSize: 9, letterSpacing: 1 },
  heroTitle: { color: colors.white, fontFamily: FontFamily.display, fontSize: 32, lineHeight: 36 },
  heroCopy: { maxWidth: 320, color: '#F5F7F1', fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 19 },
  heroAction: { minHeight: 42, marginTop: 3, paddingHorizontal: 12, borderRadius: 6, backgroundColor: colors.lime, flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroActionText: { color: colors.primary, fontFamily: FontFamily.bold, fontSize: 12 },
  quickSearch: { gap: 13 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 17 },
  sectionNote: { marginTop: 3, color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 17 },
  cropPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cropPill: { minHeight: 40, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 8 },
  cropPillText: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 12 },
  marketHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 3 },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  textLinkLabel: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 12 },
  loading: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 10 },
  listingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  notice: { padding: 15, borderRadius: 7, backgroundColor: colors.paleYellow, gap: 5 },
  noticeTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 14 },
  noticeCopy: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
  empty: { padding: 20, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'flex-start', gap: 7 },
  emptyIcon: { width: 36, height: 36, borderRadius: 7, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 15 },
  emptyCopy: { maxWidth: 520, color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
  promiseStrip: { padding: 15, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  promiseItem: { flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 10 },
  promiseIcon: { width: 34, height: 34, borderRadius: 7, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  truckIcon: { backgroundColor: colors.paleOrange },
  promiseText: { flex: 1, gap: 2 },
  promiseTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 12 },
  promiseNote: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11, lineHeight: 16 },
  joinBand: { padding: 17, borderRadius: 8, backgroundColor: colors.paleGreen, gap: 14 },
  joinCopy: { gap: 4 },
  joinTitle: { color: colors.forest, fontFamily: FontFamily.display, fontSize: 21 },
  joinNote: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12 },
  });
}