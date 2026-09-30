import { MapPin, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/market/ActionButton';
import { TextField } from '@/components/market/TextField';
import { FontFamily, type MarketPalette } from '@/constants/theme';
import { useMarketTheme } from '@/context/market-theme-context';
import { ApiError, api } from '@/services/api';
import type { LocationSearchResult } from '@/types/market';

type Props = {
  onSelect: (location: LocationSearchResult) => void;
  selectedLabel?: string;
};

export function LocationSearch({ onSelect, selectedLabel }: Props) {
  const { colors } = useMarketTheme();
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  async function search() {
    if (query.trim().length < 2) {
      setError('Enter at least 2 characters to search Nigerian locations.');
      setResults([]);
      return;
    }
    setSearching(true);
    setError('');
    try {
      const result = await api.searchLocations(query.trim());
      setResults(result.locations);
      if (!result.locations.length) setError('No Nigerian places found. Try a town, city, or state name.');
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Could not search locations. Try again.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextField
        label="Find a Nigerian town or area"
        value={query}
        onChangeText={setQuery}
        placeholder="e.g. Abeokuta, Ogun"
        returnKeyType="search"
        onSubmitEditing={() => { void search(); }}
        autoCapitalize="words"
      />
      <ActionButton title="Search places" onPress={() => { void search(); }} loading={searching} variant="secondary" icon={!searching ? <Search size={15} color={colors.forest} /> : undefined} />
      {selectedLabel ? <Text style={styles.selected}>Selected: {selectedLabel}</Text> : null}
      {results.map((location, index) => (
        <Pressable key={`${location.label}-${location.latitude}-${index}`} accessibilityRole="button" onPress={() => { onSelect(location); setResults([]); }} style={styles.result}>
          <MapPin size={16} color={colors.forest} />
          <Text style={styles.resultLabel}>{location.label}</Text>
        </Pressable>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.attribution}>Location data © OpenStreetMap contributors</Text>
    </View>
  );
}

function createStyles(colors: MarketPalette) {
  return StyleSheet.create({
    container: { gap: 9 },
    selected: { color: colors.forest, fontFamily: FontFamily.semibold, fontSize: 12 },
    result: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 6, backgroundColor: colors.surface },
    resultLabel: { flex: 1, color: colors.ink, fontFamily: FontFamily.medium, fontSize: 12 },
    error: { color: colors.danger, fontFamily: FontFamily.medium, fontSize: 12 },
    attribution: { color: colors.muted, fontFamily: FontFamily.body, fontSize: 10 },
  });
}