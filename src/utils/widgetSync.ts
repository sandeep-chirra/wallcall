import {NativeModules, Platform} from 'react-native';
import {WallCalEvent} from '../data/types';

type WidgetBridgeModule = {
  saveEvents: (payload: string) => Promise<void>;
  reloadTimelines: () => Promise<void>;
};

const widgetBridge: WidgetBridgeModule | null =
  Platform.OS === 'ios' ? NativeModules.WallCalWidgetBridge ?? null : null;

function serializeEvents(events: WallCalEvent[]) {
  return JSON.stringify({
    syncedAt: new Date().toISOString(),
    events: events.map(event => ({
      id: event.id,
      title: event.title,
      person: event.person,
      category: event.category,
      date: event.date,
      notifyDays: event.notifyDays,
      theme: event.theme,
      storeName: event.storeName ?? null,
      storeId: event.storeId ?? null,
      returnDeadline: event.returnDeadline ?? null,
    })),
  });
}

export async function syncWidgetEvents(events: WallCalEvent[]) {
  if (!widgetBridge) {
    return;
  }

  try {
    await widgetBridge.saveEvents(serializeEvents(events));
    await widgetBridge.reloadTimelines();
  } catch (error) {
    console.warn('Widget sync failed', error);
  }
}
