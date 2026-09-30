/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#19251F',
    background: '#F5F7F1',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E6ECE4',
    textSecondary: '#64736A',
  },
  dark: {
    text: '#F5F7F1',
    background: '#17231D',
    backgroundElement: '#223129',
    backgroundSelected: '#34483B',
    textSecondary: '#A9B8AC',
  },
} as const;

export const MarketColors = {
  ink: '#19251F',
  forest: '#214D39',
  leaf: '#477B4F',
  lime: '#D7E87A',
  canvas: '#F5F7F1',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  line: '#E0E7DF',
  muted: '#64736A',
  orange: '#D86C45',
  paleGreen: '#E8F0E5',
  paleYellow: '#F6F0D7',
  paleOrange: '#F8E9E1',
  danger: '#B84235',
  primary: '#214D39',
  primaryText: '#FFFFFF',
};

export const DarkMarketColors = {
  ink: '#EEF3EE',
  forest: '#A4D4AA',
  leaf: '#9BC49A',
  lime: '#D7E87A',
  canvas: '#141E18',
  white: '#FFFFFF',
  surface: '#223129',
  line: '#3B4B40',
  muted: '#A4B2A7',
  orange: '#F19A75',
  paleGreen: '#293B2F',
  paleYellow: '#423B25',
  paleOrange: '#462F28',
  danger: '#FF9A90',
  primary: '#315840',
  primaryText: '#FFFFFF',
} as const;

export type MarketPalette = { [Key in keyof typeof MarketColors]: string };

export const FontFamily = {
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  display: 'Fraunces_600SemiBold',
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
