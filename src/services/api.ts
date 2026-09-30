import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { readSession } from '@/services/session';
import type { Conversation, ConversationMessage, Listing, ListingFilters, LocationSearchResult, MarketUser, NewListing, Session, UserRole } from '@/types/market';

function getDevelopmentBaseUrl() {
  if (Platform.OS === 'web') {
    const hostname = typeof window === 'undefined' ? 'localhost' : window.location.hostname;
    return `http://${hostname}:5000/api`;
  }

  const developmentHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const hostname = developmentHost || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
  return `http://${hostname}:5000/api`;
}

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
export const API_BASE_URL = configuredBaseUrl || (__DEV__ ? getDevelopmentBaseUrl() : '');

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('Production API URL is missing. Set EXPO_PUBLIC_API_URL to your deployed HTTPS backend and rebuild the app.', 0);
  }

  let apiUrl: URL;
  try {
    apiUrl = new URL(API_BASE_URL);
  } catch {
    throw new ApiError('EXPO_PUBLIC_API_URL must be a valid absolute URL ending in /api.', 0);
  }

  if (!apiUrl.pathname.replace(/\/$/, '').endsWith('/api')) {
    throw new ApiError('EXPO_PUBLIC_API_URL must point to the backend /api path.', 0);
  }

  if (!__DEV__ && apiUrl.protocol !== 'https:') {
    throw new ApiError('Production API connections must use HTTPS.', 0);
  }

  const session = await readSession();
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    response = await fetch(`${apiUrl.toString().replace(/\/$/, '')}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('The FarmMarket API took too long to respond. Check that the backend and database are running.', 408);
    }
    throw new ApiError(`Can't reach the FarmMarket API at ${apiUrl.origin}.`, 0);
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => ({})) as { message?: string } & T;
  if (!response.ok) throw new ApiError(body.message || 'Something went wrong. Try again.', response.status);
  return body;
}

export const api = {
  getConversations: async () => {
    const result = await request<{ conversations: Conversation[] }>('/messages');
    return result.conversations;
  },

  startConversation: (payload: { listingId: string; body: string }) =>
    request<{ conversation: Conversation; message: ConversationMessage }>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  findListingConversation: (listingId: string) =>
    request<{ conversation: Conversation | null }>(`/messages/listing/${encodeURIComponent(listingId)}`),

  getConversation: (conversationId: string) =>
    request<{ conversation: Conversation; messages: ConversationMessage[] }>(`/messages/${encodeURIComponent(conversationId)}`),

  sendMessage: (conversationId: string, body: string) =>
    request<{ message: ConversationMessage }>(`/messages/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  searchLocations: async (query: string) => {
    const params = new URLSearchParams({ q: query });
    const result = await request<{ locations: LocationSearchResult[]; attribution: string }>(`/locations/search?${params}`);
    return result;
  },

  login: (credentials: { emailOrPhone: string; password: string }) => {
    const isEmail = credentials.emailOrPhone.includes('@');
    return request<{ token: string; user: MarketUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        [isEmail ? 'email' : 'phone']: credentials.emailOrPhone,
        password: credentials.password,
      }),
    });
  },

  register: (details: {
    name: string;
    emailOrPhone: string;
    password: string;
    role: UserRole;
  }): Promise<Session> => {
    const isEmail = details.emailOrPhone.includes('@');
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: details.name,
        [isEmail ? 'email' : 'phone']: details.emailOrPhone,
        password: details.password,
        role: details.role,
      }),
    });
  },

  getListings: async (filters: ListingFilters = {}) => {
    const query = new URLSearchParams();
    if (filters.crop) query.set('crop', filters.crop);
    if (filters.latitude !== undefined) query.set('latitude', String(filters.latitude));
    if (filters.longitude !== undefined) query.set('longitude', String(filters.longitude));
    if (filters.radiusKm !== undefined) query.set('radiusKm', String(filters.radiusKm));
    const suffix = query.size ? `?${query.toString()}` : '';
    const result = await request<{ listings: Listing[] }>(`/listings${suffix}`);
    return result.listings;
  },

  createListing: async (listing: NewListing) => {
    const result = await request<{ listing: Listing }>('/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
    return result.listing;
  },

  initializePayment: (payload: { listingId: string; amount: number }) =>
    request<{ message: string }>('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};