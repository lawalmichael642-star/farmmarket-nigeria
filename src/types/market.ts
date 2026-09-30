export type UserRole = 'farmer' | 'trader' | 'driver';

export type MarketUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
};

export type Session = {
  token: string;
  user: MarketUser;
};

export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export type Listing = {
  _id: string;
  crop: string;
  description?: string;
  quantityKg: number;
  pricePerKg: number;
  location: GeoPoint;
  status: 'available' | 'reserved' | 'sold';
  farmer: string | { _id: string; name: string; phone?: string };
  createdAt: string;
};

export type ListingFilters = {
  crop?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
};

export type NewListing = {
  crop: string;
  description?: string;
  quantityKg: number;
  pricePerKg: number;
  location: GeoPoint;
};

export type LocationSearchResult = {
  label: string;
  name: string;
  region?: string;
  latitude: number;
  longitude: number;
};

export type Conversation = {
  _id: string;
  listing: { _id: string; crop: string; status: Listing['status'] };
  buyer: { _id: string; name: string };
  farmer: { _id: string; name: string };
  otherParticipant: { _id: string; name: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type ConversationMessage = {
  _id: string;
  conversation: string;
  sender: string | { _id: string; name?: string };
  body: string;
  createdAt: string;
};