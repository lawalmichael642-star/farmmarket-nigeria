import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, LocateFixed, Search, SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/market/ActionButton';
import { BrandHeader } from '@/components/market/BrandHeader';
import { ListingCard } from '@/components/market/ListingCard';
import { LocationSearch } from '@/components/market/LocationSearch';
import { Screen } from '@/components/market/Screen';
import { TextField } from '@/components/market/TextField';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { NIGERIAN_CROPS, POPULAR_NIGERIAN_CROPS } from '@/constants/crops';
import { useMarketTheme } from '@/context/market-theme-context';
import { useAuth } from '@/context/auth-context';
import { ApiError, api } from '@/services/api';
import type { Listing, LocationSearchResult } from '@/types/market';
import { getDeviceCoordinates, type Coordinates } from '@/utils/location';

const radiusOptions = [10, 30, 50, 100];

export default function MarketScreen() {
  const params = useLocalSearchParams<{ crop?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const [crop, setCrop] = useState(params.crop ?? '');
  const [radiusKm, setRadiusKm] = useState(30);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const cropOptions = crop.trim()
    ? NIGERIAN_CROPS.filter((item) => item.toLowerCase().includes(crop.trim().toLowerCase()))
      .slice(0, showAllCrops ? NIGERIAN_CROPS.length : 8)
    : showAllCrops ? NIGERIAN_CROPS : POPULAR_NIGERIAN_CROPS;

  async function searchMarket(nextCrop = crop, nextCoordinates = coordinates) {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const items = await api.getListings({
        crop: nextCrop.trim() || undefined,
        latitude: nextCoordinates?.latitude,
        longitude: nextCoordinates?.longitude,
        radiusKm: nextCoordinates ? radiusKm : undefined,
      });
      setListings(items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not load produce. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api.getListings({ crop: params.crop?.trim() || undefined })
      .then((items) => {
        if (!active) return;
        setListings(items);
        setSearched(true);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof ApiError ? cause.message : 'Could not load produce. Please try again.');
        setSearched(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [params.crop]);

  async function useMyLocation() {
    setLocating(true);
    setError('');
    try {
      const nextCoordinates = await getDeviceCoordinates();
      setCoordinates(nextCoordinates);
      setSelectedLocation('Current location');
      await searchMarket(crop, nextCoordinates);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read your location.');
    } finally {
      setLocating(false);
    }
  }

  return (
    <Screen>
      <BrandHeader locationLabel={selectedLocation || (coordinates ? 'Near you' : 'All regions')} />
      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>THE PRODUCE BOARD</Text>
        <Text style={styles.heading}>Source closer.</Text>
        <Text style={styles.subtitle}>Search available harvests by crop and farm distance.</Text>
      </View>

      <View style={styles.searchPanel}>
        <TextField
          label="Crop or produce"
          value={crop}
          onChangeText={setCrop}
          placeholder="Try cassava, tomatoes, maize..."
          returnKeyType="search"
          onSubmitEditing={() => searchMarket()}
          autoCapitalize="words"
        />
        <LocationSearch
          selectedLabel={selectedLocation}
          onSelect={(location: LocationSearchResult) => {
            const nextCoordinates = { latitude: location.latitude, longitude: location.longitude };
            setCoordinates(nextCoordinates);
            setSelectedLocation(location.label);
            void searchMarket(crop, nextCoordinates);
          }}
        />
        <View style={styles.cropBrowse}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showAllCrops }} onPress={() => setShowAllCrops((visible) => !visible)} style={styles.cropBrowseToggle}>
            <Text style={styles.cropBrowseLabel}>{showAllCrops ? 'Show popular crops' : `Browse Nigerian crops (${NIGERIAN_CROPS.length})`}</Text>
            <ChevronDown size={15} color={colors.forest} />
          </Pressable>
          <View style={styles.cropPills}>
            {cropOptions.map((item) => (
              <Pressable key={item} accessibilityRole="button" onPress={() => { setCrop(item); void searchMarket(item); }} style={[styles.cropPill, crop.trim().toLowerCase() === item.toLowerCase() && styles.cropPillSelected]}>
                <Text style={[styles.cropPillText, crop.trim().toLowerCase() === item.toLowerCase() && styles.cropPillTextSelected]}>{item}</Text>
              </Pressable>
            ))}
            {crop.trim() && cropOptions.length === 0 ? <Text style={styles.locationHint}>You can search any crop name.</Text> : null}
          </View>
        </View>
        <View style={styles.filterHead}><SlidersHorizontal size={15} color={colors.forest} /><Text style={styles.filterLabel}>Search radius</Text><Text style={styles.optional}>Optional location filter</Text></View>
        <View style={styles.radiusRow}>
          {radiusOptions.map((option) => (
            <Pressable key={option} onPress={() => setRadiusKm(option)} style={[styles.radiusChip, radiusKm === option && styles.radiusChipSelected]}>
              <Text style={[styles.radiusText, radiusKm === option && styles.radiusTextSelected]}>{option} km</Text>
            </Pressable>
          ))}
          <ActionButton title={locating ? 'Locating' : 'Use my location'} onPress={useMyLocation} variant="secondary" loading={locating} icon={!locating ? <LocateFixed size={15} color={colors.forest} /> : undefined} />
        </View>
        {coordinates ? <Text style={styles.locationHint}>Searching within {radiusKm} km of your location.</Text> : <Text style={styles.locationHint}>Allow location access to apply the selected radius.</Text>}
        <ActionButton title="Search produce" onPress={() => searchMarket()} icon={<Search size={16} color={colors.primaryText} />} loading={loading} />
      </View>

      <View style={styles.resultsTop}>
        <View><Text style={styles.resultsTitle}>{searched ? `${listings.length} available ${listings.length === 1 ? 'listing' : 'listings'}` : 'Available produce'}</Text><Text style={styles.resultsSubtitle}>{coordinates ? `Within ${radiusKm} km` : 'Across all locations'}</Text></View>
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color={colors.forest} /><Text style={styles.locationHint}>Searching farms...</Text></View> : error ? (
        <View style={styles.errorBox}><Text style={styles.errorTitle}>Could not load the market</Text><Text style={styles.errorText}>{error}</Text><ActionButton title="Try again" onPress={() => searchMarket()} variant="secondary" /></View>
      ) : listings.length ? (
        <View style={styles.resultsGrid}>{listings.map((listing) => {
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
        <View style={styles.empty}><View style={styles.emptyIcon}><Search size={19} color={colors.forest} /></View><Text style={styles.emptyTitle}>{crop ? `No ${crop.toLowerCase()} found` : 'No produce listed yet'}</Text><Text style={styles.emptyText}>Try another crop or broaden your search. New farm listings will appear here as soon as they are published.</Text></View>
      )}
    </Screen>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  headingBlock: { gap: 6, paddingTop: 8 },
  eyebrow: { color: colors.leaf, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.7 },
  heading: { color: colors.ink, fontFamily: FontFamily.display, fontSize: 34, lineHeight: 40 },
  subtitle: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19 },
  searchPanel: { padding: 16, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 13 },
  cropBrowse: { gap: 9 },
  cropBrowseToggle: { minHeight: 32, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5 },
  cropBrowseLabel: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 12 },
  cropPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cropPill: { minHeight: 34, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  cropPillSelected: { borderColor: colors.leaf, backgroundColor: colors.paleGreen },
  cropPillText: { color: colors.ink, fontFamily: FontFamily.medium, fontSize: 11 },
  cropPillTextSelected: { color: colors.forest, fontFamily: FontFamily.bold },
  filterHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  filterLabel: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 13 },
  optional: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11, marginLeft: 'auto' },
  radiusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  radiusChip: { minHeight: 39, minWidth: 54, paddingHorizontal: 9, borderRadius: 6, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  radiusChipSelected: { backgroundColor: colors.paleGreen, borderColor: colors.leaf },
  radiusText: { color: colors.muted, fontFamily: FontFamily.semibold, fontSize: 11 },
  radiusTextSelected: { color: colors.forest },
  locationHint: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11 },
  resultsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultsTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 16 },
  resultsSubtitle: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11, marginTop: 3 },
  loading: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 10 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  empty: { padding: 20, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 8, gap: 8 },
  emptyIcon: { width: 36, height: 36, borderRadius: 7, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 15 },
  emptyText: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
  errorBox: { gap: 10, padding: 17, borderRadius: 8, backgroundColor: colors.paleOrange },
  errorTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 14 },
  errorText: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 12, lineHeight: 18 },
  });
}