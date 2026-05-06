import React, {useMemo} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useStore} from '../store';
import {useShallow} from 'zustand/react/shallow';
import {Colors} from '../utils/theme';
import {getDaysUntil, formatEventDate, getCategoryColor, getCategoryIcon} from '../utils/helpers';
import {STORE_POLICIES} from '../data/constants';
import {WallCalEvent} from '../data/types';

type Nav = NativeStackNavigationProp<any>;

function EventCard({event, onPreview, onEdit, onDelete}: {
  event: WallCalEvent;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const days = getDaysUntil(event);
  const isUrgent = days !== null && days <= (event.notifyDays ?? 1);
  const catColor = getCategoryColor(event.category);
  const catIcon = getCategoryIcon(event.category);
  const store = event.storeId ? STORE_POLICIES[event.storeId] : null;
  const tone = store?.color ?? catColor;

  return (
    <View style={[styles.card, isUrgent && {borderColor: tone + '55'}]}>
      <View style={[styles.cardGlow, {backgroundColor: tone + '14'}]} />
      {isUrgent && (
        <View style={[styles.urgentBadge, {backgroundColor: tone}]}>
          <Text style={styles.urgentText}>{days === 0 ? 'Today' : `${days}d • urgent`}</Text>
        </View>
      )}
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, {backgroundColor: tone + '15', borderColor: tone + '20'}]}>
          <Text style={[styles.iconText, store && {color: store.color, fontWeight: '900', fontSize: 13}]}>
            {store ? store.logo : catIcon}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTopLine}>
            <Text style={styles.cardTitle} numberOfLines={1}>{event.title}</Text>
            <View style={[styles.typeBadge, {backgroundColor: tone + '12'}]}>
              <Text style={[styles.typeBadgeText, {color: tone}]}>
                {store ? 'Return' : event.category}
              </Text>
            </View>
          </View>
          {!!event.person && <Text style={styles.cardSub} numberOfLines={1}>{event.person}</Text>}
          <View style={styles.cardMetaRow}>
            <Text style={[styles.cardDate, {color: tone}]}>
              {formatEventDate(event)}
            </Text>
            {days !== null && (
              <View style={styles.daysBadge}>
                <Text style={styles.daysBadgeText}>{days === 0 ? 'Today' : `${days} days left`}</Text>
              </View>
            )}
          </View>
          {!!event.userImageUri && (
            <Text style={styles.cardHint}>Personal wallpaper photo attached</Text>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={onPreview} style={styles.previewAction}>
          <Text style={styles.previewActionText}>Preview</Text>
        </TouchableOpacity>
        <View style={styles.secondaryActions}>
          <TouchableOpacity onPress={onEdit} style={styles.secondaryActionBtn}>
            <Text style={styles.secondaryActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.secondaryActionBtn}>
            <Text style={[styles.secondaryActionText, {color: Colors.rose}]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const {events, user, deleteEvent} = useStore(useShallow(s => ({
    events: s.events,
    user: s.user,
    deleteEvent: s.deleteEvent,
  })));

  const upcomingEvents = useMemo(
    () => [...events].sort((a, b) => (getDaysUntil(a) ?? 999) - (getDaysUntil(b) ?? 999)),
    [events],
  );

  const returnEvents = useMemo(() => events.filter(e => e.category === 'return'), [events]);
  const urgentCount = useMemo(
    () => upcomingEvents.filter(e => (getDaysUntil(e) ?? 999) <= (e.notifyDays ?? 1)).length,
    [upcomingEvents],
  );
  const expiringReturns = returnEvents.filter(e => {
    const d = getDaysUntil(e);
    return d !== null && d <= 7;
  }).length;
  const nextEvent = upcomingEvents[0];

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => deleteEvent(id)},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.heroCard}>
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />
          <View style={styles.heroTopRow}>
            <View style={styles.headerCopy}>
              <View style={styles.headerRow}>
                <View style={styles.logoBox}><Text style={{fontSize: 18}}>📱</Text></View>
                <View style={{flex: 1}}>
                  <Text style={styles.headerEyebrow}>Smart reminder wallpapers</Text>
                  <Text style={styles.headerTitle}>WallCal</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerBtns}>
              <TouchableOpacity
                style={styles.headerBtnGhost}
                onPress={() => nav.navigate('Returns')}>
                <Text style={styles.headerBtnGhostText}>↩ Returns</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtnPrimary}
                onPress={() => nav.navigate('AddEvent')}>
                <Text style={styles.headerBtnPrimaryText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.headerSub}>Hey {user?.name ?? 'there'} • Keep life dates elegant, visible, and impossible to miss.</Text>

          <View style={styles.statRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{events.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{urgentCount}</Text>
              <Text style={styles.statLabel}>Urgent</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{returnEvents.length}</Text>
              <Text style={styles.statLabel}>Returns</Text>
            </View>
          </View>

          {!!nextEvent && (
            <View style={styles.nextEventCard}>
              <Text style={styles.nextEventLabel}>Next up</Text>
              <Text style={styles.nextEventTitle} numberOfLines={1}>{nextEvent.title}</Text>
              <Text style={styles.nextEventMeta}>
                {formatEventDate(nextEvent)} • {Math.max(getDaysUntil(nextEvent) ?? 0, 0)}d remaining
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Reminders banner */}
        {urgentCount > 0 && (
          <View style={styles.bannerPurple}>
            <View style={styles.bannerIconShell}>
              <Text style={{fontSize: 18}}>🔔</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.bannerTitle}>Upcoming Reminders</Text>
              <Text style={styles.bannerSub}>{urgentCount} event(s) need your attention</Text>
            </View>
            <Text style={styles.bannerArrow}>→</Text>
          </View>
        )}

        {/* Returns banner */}
        {expiringReturns > 0 && (
          <TouchableOpacity style={styles.bannerRose} onPress={() => nav.navigate('Returns')}>
            <View style={[styles.bannerIconShell, {backgroundColor: Colors.rose + '18'}]}>
              <Text style={{fontSize: 18}}>↩️</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.bannerTitle, {color: Colors.rose}]}>Return Deadlines Soon!</Text>
              <Text style={styles.bannerSub}>{expiringReturns} return(s) expiring within 7 days</Text>
            </View>
            <Text style={[styles.bannerArrow, {color: Colors.rose}]}>→</Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>All events</Text>
          <Text style={styles.sectionCount}>{events.length} total</Text>
        </View>

        {upcomingEvents.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{fontSize: 48}}>📅</Text>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySub}>Tap + Add or ↩ Returns to get started</Text>
          </View>
        ) : (
          upcomingEvents.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              onPreview={() => nav.navigate('EventPreview', {eventId: ev.id})}
              onEdit={() => nav.navigate('AddEvent', {editId: ev.id})}
              onDelete={() => confirmDelete(ev.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.pageBg},
  header: {
    backgroundColor: Colors.headerBg,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  heroCard: {
    backgroundColor: '#1b1421',
    borderRadius: 28,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d2337',
    shadowColor: '#120c18',
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  heroGlowTop: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: '#8b5cf620',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -36,
    left: -18,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: '#fb718520',
  },
  heroTopRow: {flexDirection: 'row', gap: 12, alignItems: 'flex-start'},
  headerCopy: {flex: 1, minWidth: 0},
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  logoBox: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: '#7c3aed',
    alignItems: 'center', justifyContent: 'center',
  },
  headerEyebrow: {
    color: '#c9c0d3',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {fontSize: 28, fontWeight: '800', letterSpacing: -0.8, color: '#fff', marginTop: 2},
  headerSub: {color: '#d7d1df', fontSize: 14, lineHeight: 20, marginTop: 14, maxWidth: '92%'},
  headerBtns: {gap: 8, flexShrink: 0},
  headerBtnGhost: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff12',
    borderWidth: 1,
    borderColor: '#ffffff14',
  },
  headerBtnGhostText: {color: '#f6f1ff', fontWeight: '700', fontSize: 13},
  headerBtnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#8b5cf6',
  },
  headerBtnPrimaryText: {color: '#fff', fontWeight: '800', fontSize: 13},
  statRow: {flexDirection: 'row', gap: 10, marginTop: 16},
  statChip: {
    flex: 1,
    backgroundColor: '#ffffff10',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  statValue: {color: '#fff', fontSize: 18, fontWeight: '800'},
  statLabel: {color: '#b9b0c5', fontSize: 11, marginTop: 2},
  nextEventCard: {
    marginTop: 14,
    backgroundColor: '#f6efe7',
    borderRadius: 18,
    padding: 14,
  },
  nextEventLabel: {
    color: '#7a6c61',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nextEventTitle: {color: '#1a1612', fontSize: 18, fontWeight: '800', marginTop: 3},
  nextEventMeta: {color: '#6b6560', fontSize: 12, marginTop: 3},
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: 16, paddingTop: 14, gap: 12, paddingBottom: 40},
  bannerPurple: {
    backgroundColor: '#f3eeff', borderWidth: 1, borderColor: '#dfd0ff',
    borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  bannerRose: {
    backgroundColor: '#fff0f3', borderWidth: 1, borderColor: '#ffc8d3',
    borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  bannerIconShell: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#7c3aed18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {fontWeight: '800', fontSize: 15, color: Colors.textPrimary},
  bannerSub: {color: Colors.textSecondary, fontSize: 12, marginTop: 2},
  bannerArrow: {fontSize: 18, color: Colors.purple, fontWeight: '700'},
  sectionHeader: {flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8},
  sectionLabel: {
    fontSize: 20, fontWeight: '800', color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionCount: {fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1},
  card: {
    backgroundColor: '#fffdfb',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8dfd5',
    shadowColor: '#1a1612',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -12,
    width: 120,
    height: 120,
    borderRadius: 999,
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  urgentText: {color: '#fff', fontSize: 10, fontWeight: '800'},
  cardRow: {flexDirection: 'row', alignItems: 'center', gap: 14},
  iconBox: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  iconText: {fontSize: 22},
  cardBody: {flex: 1, gap: 4, paddingRight: 6},
  cardTopLine: {flexDirection: 'row', alignItems: 'center', gap: 8},
  cardTitle: {flex: 1, fontSize: 16, fontWeight: '800', color: Colors.textPrimary},
  typeBadge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999},
  typeBadgeText: {fontSize: 10, fontWeight: '800', textTransform: 'uppercase'},
  cardSub: {fontSize: 13, color: Colors.textSecondary},
  cardMetaRow: {flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  cardDate: {fontSize: 13, fontWeight: '700'},
  daysBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#efe8de',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  daysBadgeText: {fontSize: 11, fontWeight: '700', color: '#6f665e'},
  cardHint: {fontSize: 11, color: Colors.textMuted},
  cardActions: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14},
  previewAction: {
    backgroundColor: '#121826',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  previewActionText: {fontSize: 12, fontWeight: '800', color: '#fff'},
  secondaryActions: {flexDirection: 'row', gap: 8},
  secondaryActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f5efe8',
  },
  secondaryActionText: {fontSize: 12, fontWeight: '700', color: Colors.textSecondary},
  empty: {alignItems: 'center', paddingVertical: 60, gap: 8},
  emptyTitle: {fontWeight: '700', fontSize: 16, color: Colors.textPrimary},
  emptySub: {fontSize: 13, color: Colors.textSecondary},
});
