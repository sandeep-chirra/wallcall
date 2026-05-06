import {Category, Store} from './types';

export const CATEGORIES: Category[] = [
  {id: 'birthday', label: 'Birthday', icon: '🎂', color: '#FF6B6B', repeat: 'yearly'},
  {id: 'anniversary', label: 'Anniversary', icon: '💍', color: '#A78BFA', repeat: 'yearly'},
  {id: 'appointment', label: 'Appointment', icon: '🏥', color: '#4ECDC4', repeat: 'once'},
  {id: 'payment', label: 'Payment', icon: '💳', color: '#FFE66D', repeat: 'monthly'},
  {id: 'loan', label: 'Loan/EMI', icon: '🏦', color: '#34D399', repeat: 'monthly'},
  {id: 'reminder', label: 'Reminder', icon: '📌', color: '#F97316', repeat: 'once'},
  {id: 'return', label: 'Return', icon: '↩️', color: '#F43F5E', repeat: 'once'},
];

export const WALLPAPER_THEMES = [
  {id: 'dark', label: 'Dark', bg: '#0f0f1a', fg: '#ffffff'},
  {id: 'warm', label: 'Warm', bg: '#1a0f0a', fg: '#fde68a'},
  {id: 'nature', label: 'Nature', bg: '#0a1a0f', fg: '#86efac'},
  {id: 'ocean', label: 'Ocean', bg: '#0a0f1a', fg: '#93c5fd'},
  {id: 'return', label: 'Return', bg: '#1a0a0f', fg: '#fda4af'},
];

export const NOTIFY_OPTIONS = [
  {value: 0, label: 'On the day'},
  {value: 1, label: '1 day before'},
  {value: 2, label: '2 days before'},
  {value: 3, label: '3 days before'},
  {value: 7, label: '1 week before'},
];

export const OVERLAY_POSITIONS = [
  {id: 'top', label: 'Top'},
  {id: 'center', label: 'Center'},
  {id: 'bottom', label: 'Bottom'},
];

export const STORE_POLICIES: Record<string, Store> = {
  walmart: {
    id: 'walmart', name: 'Walmart', icon: '🛒', color: '#0071CE', accentColor: '#FFC220', logo: 'W', defaultDays: 90,
    policies: [
      {category: 'General Merchandise', days: 90, notes: 'Most items with receipt'},
      {category: 'Electronics', days: 30, notes: 'TV, computers, tablets, cameras'},
      {category: 'Phones', days: 14, notes: 'Prepaid & postpaid phones'},
      {category: 'Marketplace (3rd party)', days: 30, notes: 'Sold & shipped by Walmart'},
      {category: 'Grocery / Consumables', days: 90, notes: 'Unopened items preferred'},
      {category: 'Seasonal / Holiday', days: 30, notes: 'After holiday period'},
    ],
    tips: 'Items without receipt may receive store credit at current selling price.',
  },
  costco: {
    id: 'costco', name: 'Costco', icon: '🏪', color: '#005DAA', accentColor: '#E31837', logo: 'C', defaultDays: 0,
    policies: [
      {category: 'Most Items', days: 0, notes: 'Satisfaction guarantee — anytime, no time limit'},
      {category: 'Electronics (TV, projector, computer)', days: 90, notes: 'From date of purchase'},
      {category: 'Cell Phones', days: 90, notes: 'From date of purchase'},
      {category: 'Diamonds (1ct+)', days: 48, notes: '48 months with quality certification'},
    ],
    tips: "Costco's satisfaction guarantee is among the most generous — no receipt needed for members.",
  },
  amazon: {
    id: 'amazon', name: 'Amazon', icon: '📦', color: '#FF9900', accentColor: '#232F3E', logo: 'A', defaultDays: 30,
    policies: [
      {category: 'Most Items', days: 30, notes: 'Items shipped by Amazon'},
      {category: 'Amazon Devices (Echo, Kindle)', days: 30, notes: 'From delivery date'},
      {category: 'Baby Items', days: 90, notes: 'Extended return window'},
      {category: 'Wedding Registry', days: 180, notes: 'From registry event date'},
      {category: 'Digital Games / Software', days: 0, notes: 'No returns once activated'},
      {category: '3rd Party Sellers', days: 30, notes: 'Policy may vary by seller'},
    ],
    tips: "Amazon typically offers free return shipping via UPS, Whole Foods, or Kohl's drop-off.",
  },
  target: {
    id: 'target', name: 'Target', icon: '🎯', color: '#CC0000', accentColor: '#FFCC00', logo: 'T', defaultDays: 90,
    policies: [
      {category: 'Most Items', days: 90, notes: 'With receipt or Target Circle'},
      {category: 'Target-owned Brands', days: 365, notes: '1 year return window'},
      {category: 'Electronics & Entertainment', days: 30, notes: 'Unopened only after 30 days'},
      {category: 'Apple Products', days: 15, notes: 'From purchase date'},
      {category: 'RedCard Holders', days: 120, notes: '+30 days extra on most items'},
    ],
    tips: 'RedCard members get an extra 30 days on most return windows.',
  },
  bestbuy: {
    id: 'bestbuy', name: 'Best Buy', icon: '💻', color: '#003087', accentColor: '#FFE000', logo: 'BB', defaultDays: 15,
    policies: [
      {category: 'Most Items', days: 15, notes: 'Standard return window'},
      {category: 'My Best Buy Plus/Total Members', days: 30, notes: 'Extended for members'},
      {category: 'Activatable Devices (phones)', days: 15, notes: 'Must be deactivated'},
      {category: 'Major Appliances', days: 15, notes: 'Must be in original packaging'},
      {category: 'Opened Software / Games', days: 15, notes: 'Exchange for same title only'},
    ],
    tips: 'Elite and Elite Plus members get 30–45 day return windows on most items.',
  },
  homeDepot: {
    id: 'homeDepot', name: 'Home Depot', icon: '🔨', color: '#F96302', accentColor: '#000000', logo: 'HD', defaultDays: 180,
    policies: [
      {category: 'Most Items', days: 180, notes: '90 days without receipt'},
      {category: 'Power Tools & Hand Tools', days: 90, notes: 'With receipt'},
      {category: 'Major Appliances', days: 48, notes: '48 hours from delivery'},
      {category: 'Plants (perennials, trees, shrubs)', days: 365, notes: '1-year guarantee'},
    ],
    tips: 'Most purchases can be returned up to 180 days with a receipt.',
  },
  kohls: {
    id: 'kohls', name: "Kohl's", icon: '🏬', color: '#3A1078', accentColor: '#E8175D', logo: 'K', defaultDays: 180,
    policies: [
      {category: 'Most Items', days: 180, notes: 'With or without receipt'},
      {category: 'Premium Electronics', days: 30, notes: 'Must be in original packaging'},
      {category: 'Beauty (opened)', days: 60, notes: 'Even if opened/used'},
    ],
    tips: "Kohl's accepts Amazon returns in-store — no box or label needed.",
  },
  macys: {
    id: 'macys', name: "Macy's", icon: '⭐', color: '#E31837', accentColor: '#000000', logo: 'M', defaultDays: 90,
    policies: [
      {category: 'Most Items', days: 90, notes: 'Free return by mail or in store'},
      {category: 'Furniture & Mattresses', days: 0, notes: 'All sales final unless defective'},
      {category: 'Area Rugs', days: 30, notes: 'Must be in original condition'},
    ],
    tips: 'Free return shipping with receipt via USPS.',
  },
  apple: {
    id: 'apple', name: 'Apple Store', icon: '🍎', color: '#555555', accentColor: '#0071E3', logo: '🍎', defaultDays: 14,
    policies: [
      {category: 'All Apple Products', days: 14, notes: 'From purchase date'},
      {category: 'iPhone', days: 14, notes: 'Must be factory reset'},
      {category: 'Apple Watch', days: 14, notes: 'Bands can be returned within 14 days'},
    ],
    tips: 'Apple-certified refurbished items have the same 14-day return window.',
  },
  samsclub: {
    id: 'samsclub', name: "Sam's Club", icon: '🏢', color: '#0067A0', accentColor: '#FFC220', logo: 'SC', defaultDays: 0,
    policies: [
      {category: 'Most Items', days: 0, notes: 'Satisfaction guarantee — no time limit'},
      {category: 'Electronics', days: 90, notes: 'TVs, computers, cameras, projectors'},
      {category: 'Cell Phones', days: 14, notes: 'Activated phones only'},
    ],
    tips: "Similar to Costco — Sam's Club offers an exceptional no-time-limit return policy.",
  },
};

export const STORE_LIST = Object.values(STORE_POLICIES);

export const SAMPLE_EVENTS = [
  {id: '1', title: "Wife's Birthday", person: 'Sarah', category: 'birthday' as const, date: '2026-08-10', notifyDays: 2, theme: 'warm' as const, overlayPos: 'bottom' as const, overlayOpacity: 0.7},
  {id: '2', title: 'Doctor Appointment', person: 'Younger Son – Dr. Patel', category: 'appointment' as const, date: '2026-06-15', notifyDays: 1, theme: 'ocean' as const, overlayPos: 'bottom' as const, overlayOpacity: 0.7},
  {id: '3', title: 'AMEX Payment', person: 'Credit Card Bill', category: 'payment' as const, date: '2026-05-20', notifyDays: 3, theme: 'dark' as const, overlayPos: 'bottom' as const, overlayOpacity: 0.7},
  {id: '4', title: 'Return: AirPods Pro', person: 'Best Buy · Defective mic', category: 'return' as const, date: '2026-05-18', notifyDays: 3, theme: 'return' as const, storeName: 'Best Buy', storeId: 'bestbuy', returnDeadline: true, overlayPos: 'bottom' as const, overlayOpacity: 0.75},
];
