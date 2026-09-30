import { Tabs } from 'expo-router';
import { CircleDollarSign, House, Map, MessageCircle, Plus, type LucideIcon } from 'lucide-react-native';
import { Platform } from 'react-native';

import { FontFamily } from '@/constants/theme';
import { useMarketTheme } from '@/context/market-theme-context';

const tabIcons: Record<string, LucideIcon> = {
  index: House,
  market: Map,
  sell: Plus,
  messages: MessageCircle,
  wallet: CircleDollarSign,
};

export default function MarketplaceTabs() {
  const { colors } = useMarketTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: Platform.OS === 'web' ? 62 : 68,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 10 : 7,
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: FontFamily.semibold, fontSize: 10 },
        tabBarIcon: ({ color, size }) => {
          const Icon = tabIcons[route.name] ?? House;
          return <Icon color={color} size={size} strokeWidth={2} />;
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="market" options={{ title: 'Market' }} />
      <Tabs.Screen name="sell" options={{ title: 'List harvest' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
    </Tabs>
  );
}