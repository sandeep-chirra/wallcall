export type CategoryId =
  | 'birthday'
  | 'anniversary'
  | 'appointment'
  | 'payment'
  | 'loan'
  | 'reminder'
  | 'return';

export type ThemeId = 'dark' | 'warm' | 'nature' | 'ocean' | 'return';
export type OverlayPos = 'top' | 'center' | 'bottom';

export interface WallCalEvent {
  id: string;
  title: string;
  person: string;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  notifyDays: number;
  theme: ThemeId;
  userImageUri?: string | null;
  overlayPos: OverlayPos;
  overlayOpacity: number;
  // Return-specific
  storeName?: string;
  storeId?: string;
  returnDeadline?: boolean;
  receiptImageUri?: string | null;
}

export interface User {
  name: string;
  email: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
  repeat: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface StorePolicy {
  category: string;
  days: number;
  notes: string;
}

export interface Store {
  id: string;
  name: string;
  icon: string;
  color: string;
  accentColor: string;
  logo: string;
  defaultDays: number;
  policies: StorePolicy[];
  tips: string;
}
