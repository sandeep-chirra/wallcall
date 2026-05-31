import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WallCalEvent, User} from '../data/types';
import {SAMPLE_EVENTS} from '../data/constants';
import {getDaysUntil, generateId} from '../utils/helpers';
import {syncWidgetEvents} from '../utils/widgetSync';

interface WallCalStore {
  user: User | null;
  events: WallCalEvent[];
  globalNotifyDays: number;
  defaultTheme: string;
  autoWallpaper: boolean;

  // Auth
  login: (user: User) => void;
  logout: () => void;

  // Events
  addEvent: (event: Omit<WallCalEvent, 'id'>) => void;
  updateEvent: (id: string, patch: Partial<WallCalEvent>) => void;
  deleteEvent: (id: string) => void;
  getUpcomingEvents: () => WallCalEvent[];
  getReturnEvents: () => WallCalEvent[];

  // Settings
  setGlobalNotifyDays: (days: number) => void;
  setDefaultTheme: (theme: string) => void;
  setAutoWallpaper: (val: boolean) => void;
}

export const useStore = create<WallCalStore>()(
  persist(
    (set, get) => ({
      user: null,
      events: SAMPLE_EVENTS,
      globalNotifyDays: 1,
      defaultTheme: 'dark',
      autoWallpaper: true,

      login: (user) => set({user}),
      logout: () => set({user: null}),

      addEvent: (event) => {
        set(s => ({events: [...s.events, {...event, id: generateId()}]}));
        void syncWidgetEvents(get().events);
      },

      updateEvent: (id, patch) => {
        set(s => ({
          events: s.events.map(e => (e.id === id ? {...e, ...patch} : e)),
        }));
        void syncWidgetEvents(get().events);
      },

      deleteEvent: (id) => {
        set(s => ({events: s.events.filter(e => e.id !== id)}));
        void syncWidgetEvents(get().events);
      },

      getUpcomingEvents: () =>
        [...get().events].sort(
          (a, b) => (getDaysUntil(a) ?? 999) - (getDaysUntil(b) ?? 999),
        ),

      getReturnEvents: () => get().events.filter(e => e.category === 'return'),

      setGlobalNotifyDays: (days) => set({globalNotifyDays: days}),
      setDefaultTheme: (theme) => set({defaultTheme: theme}),
      setAutoWallpaper: (val) => set({autoWallpaper: val}),
    }),
    {
      name: 'remember-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.events) {
          void syncWidgetEvents(state.events);
        }
      },
    },
  ),
);
