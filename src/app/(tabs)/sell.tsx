import { Link, useRouter } from 'expo-router';
import { Check, MapPin, Wheat } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/market/ActionButton';
import { BrandHeader } from '@/components/market/BrandHeader';
import { LocationSearch } from '@/components/market/LocationSearch';
import { Screen } from '@/components/market/Screen';
import { TextField } from '@/components/market/TextField';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useMarketTheme } from '@/context/market-theme-context';
import { ApiError, api } from '@/services/api';
import type { LocationSearchResult } from '@/types/market';
import type { Coordinates } from '@/utils/location';
import { getDeviceCoordinates } from '@/utils/location';

export default function SellScreen() {
  const { user } = useAuth();
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function captureLocation() {
    setLocating(true);
    setMessage('');
    try {
      setCoordinates(await getDeviceCoordinates());
      setSelectedLocation('Current location');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not read your farm location.');
    } finally {
      setLocating(false);
    }
  }

  async function publish() {
    if (!crop.trim() || !Number(quantity) || Number(quantity) <= 0 || Number(price) < 0 || price === '') {
      setMessage('Enter a crop, positive quantity, and price per kilogram.');
      return;
    }
    if (!coordinates) {
      setMessage('Add your farm location before publishing.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await api.createListing({
        crop: crop.trim(),
        quantityKg: Number(quantity),
        pricePerKg: Number(price),
        description: description.trim() || undefined,
        location: { type: 'Point', coordinates: [coordinates.longitude, coordinates.latitude] },
      });
      setSuccess(true);
      setMessage('Your harvest is now visible in the marketplace.');
      setCrop('');
      setQuantity('');
      setPrice('');
      setDescription('');
      router.push('/(tabs)/market');
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof ApiError && error.status === 401
        ? 'Your session has expired. Sign in again to publish a harvest.'
        : error instanceof Error ? error.message : 'Could not publish this listing.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <BrandHeader locationLabel="Farmer tools" />
      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>FARMER WORKSPACE</Text>
        <Text style={styles.heading}>List your harvest.</Text>
        <Text style={styles.subtitle}>Put fresh produce in front of nearby buyers before it leaves the farm.</Text>
      </View>

      {!user ? (
        <View style={styles.gate}>
          <View style={styles.gateIcon}><Wheat size={23} color={colors.forest} /></View>
          <Text style={styles.gateTitle}>Sign in to publish</Text>
          <Text style={styles.gateCopy}>Farmer accounts can create crop listings with quantity, price, and farm location.</Text>
          <Link href="/login" asChild><View><ActionButton title="Sign in to continue" onPress={() => router.push('/login')} /></View></Link>
        </View>
      ) : user.role !== 'farmer' ? (
        <View style={styles.gate}>
          <View style={styles.gateIcon}><Wheat size={23} color={colors.forest} /></View>
          <Text style={styles.gateTitle}>Farmer account required</Text>
          <Text style={styles.gateCopy}>This account is registered as a {user.role}. A farmer account is needed to publish a harvest.</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.formHead}><Text style={styles.formTitle}>Harvest details</Text><Text style={styles.formStep}>01 / LISTING</Text></View>
          <TextField label="Crop name" value={crop} onChangeText={setCrop} placeholder="e.g. Cassava" autoCapitalize="words" />
          <View style={styles.rowFields}>
            <TextField label="Available quantity" value={quantity} onChangeText={setQuantity} placeholder="500" keyboardType="decimal-pad" />
            <TextField label="Price per kg (NGN)" value={price} onChangeText={setPrice} placeholder="250" keyboardType="decimal-pad" />
          </View>
          <TextField label="Notes for buyers" value={description} onChangeText={setDescription} placeholder="Harvest condition, pickup details..." multiline numberOfLines={3} style={styles.notes} />
          <View style={styles.locationPanel}>
            <View style={styles.locationTitleRow}><View style={styles.locationIcon}><MapPin size={17} color={colors.forest} /></View><View style={styles.locationCopy}><Text style={styles.locationTitle}>Farm location</Text><Text style={styles.locationNote}>Used to match your harvest with nearby buyers.</Text></View></View>
            <LocationSearch
              selectedLabel={selectedLocation}
              onSelect={(location: LocationSearchResult) => {
                setCoordinates({ latitude: location.latitude, longitude: location.longitude });
                setSelectedLocation(location.label);
              }}
            />
            {coordinates ? <View style={styles.captured}><Check size={15} color={colors.leaf} /><Text style={styles.capturedText}>Location added · {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}</Text></View> : null}
            <ActionButton title={locating ? 'Getting location' : coordinates ? 'Update farm location' : 'Use current location'} onPress={captureLocation} variant="secondary" loading={locating} icon={!locating ? <MapPin size={15} color={colors.forest} /> : undefined} />
          </View>
          {message ? <View style={[styles.message, success ? styles.successMessage : styles.errorMessage]}><Text style={styles.messageText}>{message}</Text></View> : null}
          <ActionButton title="Publish harvest" onPress={publish} loading={saving} icon={!saving ? <Wheat size={16} color={colors.primaryText} /> : undefined} />
          <Text style={styles.formFootnote}>Your listing will be visible to all marketplace buyers.</Text>
        </View>
      )}
    </Screen>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
  headingBlock: { gap: 6, paddingTop: 8 },
  eyebrow: { color: colors.leaf, fontFamily: FontFamily.bold, fontSize: 10, letterSpacing: 1.7 },
  heading: { color: colors.ink, fontFamily: FontFamily.display, fontSize: 34, lineHeight: 40 },
  subtitle: { maxWidth: 570, color: colors.muted, fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19 },
  gate: { padding: 20, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'flex-start', gap: 10 },
  gateIcon: { width: 42, height: 42, borderRadius: 8, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  gateTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 17 },
  gateCopy: { maxWidth: 480, color: colors.muted, fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19 },
  form: { padding: 18, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 17 },
  formHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  formTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 16 },
  formStep: { color: colors.leaf, fontFamily: FontFamily.bold, fontSize: 9, letterSpacing: 1.1 },
  rowFields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  notes: { minHeight: 74, textAlignVertical: 'top' },
  locationPanel: { padding: 13, borderRadius: 7, backgroundColor: colors.canvas, gap: 11 },
  locationTitleRow: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  locationIcon: { width: 34, height: 34, borderRadius: 7, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, gap: 2 },
  locationTitle: { color: colors.ink, fontFamily: FontFamily.semibold, fontSize: 13 },
  locationNote: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11, lineHeight: 16 },
  captured: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  capturedText: { flex: 1, color: colors.leaf, fontFamily: FontFamily.medium, fontSize: 11 },
  message: { padding: 11, borderRadius: 6 },
  successMessage: { backgroundColor: colors.paleGreen },
  errorMessage: { backgroundColor: colors.paleOrange },
  messageText: { color: colors.ink, fontFamily: FontFamily.medium, fontSize: 12, lineHeight: 18 },
  formFootnote: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 11, textAlign: 'center' },
  });
}