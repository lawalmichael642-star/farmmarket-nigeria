import { Image } from 'expo-image';
import { ArrowUpRight, MapPin, MessageCircle, PackageCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useMarketTheme } from '@/context/market-theme-context';
import type { Listing } from '@/types/market';
import { formatNaira, formatQuantity } from '@/utils/format';

const cropImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85';

export function ListingCard({ listing, onMessage }: { listing: Listing; onMessage?: () => void }) {
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const farmerName = typeof listing.farmer === 'string' ? 'Local farmer' : listing.farmer.name;
  const marketValue = listing.quantityKg * listing.pricePerKg;

  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        <Image source={{ uri: cropImage }} contentFit="cover" style={styles.image} transition={180} />
        <View style={styles.status}><PackageCheck size={12} color={colors.forest} /><Text style={styles.statusText}>Available</Text></View>
      </View>
      <View style={styles.details}>
        <View style={styles.topLine}>
          <Text style={styles.crop} numberOfLines={1}>{listing.crop}</Text>
          <ArrowUpRight size={17} color={colors.muted} />
        </View>
        <Text style={styles.farmer} numberOfLines={1}>{farmerName}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.quantity}>{formatQuantity(listing.quantityKg)}</Text>
          <View style={styles.dot} />
          <MapPin size={13} color={colors.muted} />
          <Text style={styles.area}>Farm-gate pickup</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatNaira(listing.pricePerKg)}<Text style={styles.unit}> / kg</Text></Text>
          <Text style={styles.total}>{formatNaira(marketValue)} total</Text>
        </View>
        {onMessage ? (
          <Pressable accessibilityRole="button" onPress={onMessage} style={({ pressed }) => [styles.messageAction, pressed && styles.pressed]}>
            <MessageCircle size={15} color={colors.forest} />
            <Text style={styles.messageActionText}>Message farmer</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  card: { flex: 1, minWidth: 240, maxWidth: 520, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  imageFrame: { height: 150, overflow: 'hidden', backgroundColor: colors.paleGreen },
  image: { width: '100%', height: '100%' },
  status: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 5, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusText: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 11 },
  details: { padding: 14, gap: 8 },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  crop: { flex: 1, color: colors.ink, fontFamily: FontFamily.display, fontSize: 20, textTransform: 'capitalize' },
  farmer: { color: colors.muted, fontFamily: FontFamily.medium, fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quantity: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 12 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted },
  area: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11 },
  priceRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 },
  price: { color: colors.forest, fontFamily: FontFamily.bold, fontSize: 16 },
  unit: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11 },
  total: { color: colors.muted, fontFamily: FontFamily.medium, fontSize: 11 },
  messageAction: { minHeight: 38, marginTop: 2, borderRadius: 6, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  messageActionText: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 12 },
  pressed: { opacity: 0.88 },
  });
}