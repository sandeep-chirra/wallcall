import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ImageBackground, ViewStyle,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useStore} from '../store';
import {useShallow} from 'zustand/react/shallow';
import {Colors} from '../utils/theme';
import {getDaysUntil, formatEventDate, getCategoryColor, getCategoryIcon} from '../utils/helpers';
import {WALLPAPER_THEMES, STORE_LIST, NOTIFY_OPTIONS} from '../data/constants';

function WallpaperShell({
  imageUri,
  backgroundColor,
  children,
  fullWidth = false,
}: {
  imageUri?: string | null;
  backgroundColor: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const sharedStyle: ViewStyle[] = [styles.wallCard, {backgroundColor}];
  if (fullWidth) {
    sharedStyle.push({width: '100%'});
  }

  if (!imageUri) {
    return <View style={sharedStyle}>{children}</View>;
  }

  return (
    <ImageBackground source={{uri: imageUri}} imageStyle={styles.wallBgImage} style={sharedStyle}>
      <View style={styles.wallImageOverlay} />
      {children}
    </ImageBackground>
  );
}

// ─── PreviewScreen ────────────────────────────────────────────────────────────
export function PreviewScreen() {
  const events = useStore(s => s.events);
  const [selectedId, setSelectedId] = useState(events[0]?.id ?? null);
  const selectedEvent = events.find(e => e.id === selectedId) ?? events[0];

  if (!selectedEvent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyCenter}>
          <Text style={{fontSize: 48}}>📱</Text>
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptySub}>Add an event to see the wallpaper preview</Text>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = getCategoryColor(selectedEvent.category);
  const catIcon = getCategoryIcon(selectedEvent.category);
  const theme = WALLPAPER_THEMES.find(t => t.id === selectedEvent.theme) ?? WALLPAPER_THEMES[0];
  const days = getDaysUntil(selectedEvent);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>WALLPAPER PREVIEW</Text>

        {/* Event selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SELECT EVENT</Text>
          <View style={styles.pillRow}>
            {events.map(ev => {
              const ec = getCategoryColor(ev.category);
              return (
                <TouchableOpacity
                  key={ev.id}
                  onPress={() => setSelectedId(ev.id)}
                  style={[styles.pill, selectedId === ev.id && {backgroundColor: ec + '22', borderColor: ec}]}>
                  <Text style={styles.pillText}>
                    {getCategoryIcon(ev.category)} {ev.title.replace('Return: ', '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Wallpaper preview */}
        <WallpaperShell imageUri={selectedEvent.userImageUri} backgroundColor={theme.bg}>
          <View style={[styles.wallAccent, {backgroundColor: catColor}]} />
          <View style={styles.wallIconCircle}>
            <Text style={{fontSize: 44}}>{catIcon}</Text>
          </View>
          <View style={[styles.wallCatPill, {backgroundColor: catColor + '33'}]}>
            <Text style={[styles.wallCatText, {color: catColor}]}>{selectedEvent.category.toUpperCase()}</Text>
          </View>
          <Text style={[styles.wallTitle, {color: theme.fg}]}>{selectedEvent.title}</Text>
          {!!selectedEvent.person && (
            <Text style={[styles.wallPerson, {color: theme.fg + 'aa'}]}>{selectedEvent.person}</Text>
          )}
          <Text style={[styles.wallDate, {color: catColor}]}>{formatEventDate(selectedEvent)}</Text>
          {days !== null && (
            <Text style={[styles.wallDays, {color: theme.fg + '88'}]}>
              {days === 0 ? 'Today!' : `${days} days away`}
            </Text>
          )}
          <Text style={styles.wallWatermark}>WallCal • Smart Reminder Wallpaper</Text>
        </WallpaperShell>

        {/* How it works */}
        <View style={styles.card}>
          <Text style={[styles.cardLabel, {marginBottom: 8, color: Colors.textPrimary}]}>📲 How it works</Text>
          {['1. Screenshot or save this wallpaper preview', '2. Set as lock screen or home screen background', '3. WallCal auto-updates before each event'].map(t => (
            <Text key={t} style={styles.howTo}>{t}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function WidgetScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header banner */}
        <View style={styles.purpleBanner}>
          <View style={styles.purpleBannerRow}>
            <View style={styles.purpleBannerIcon}><Text style={{fontSize: 18}}>📱</Text></View>
            <View>
              <Text style={styles.purpleBannerTitle}>WidgetKit Guide</Text>
              <Text style={styles.purpleBannerSub}>iOS Lock Screen Widgets — Swift Code</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            {[['iOS 16+', '#34D399'], ['WidgetKit', Colors.purple], ['Swift 5.9+', '#F97316'], ['Xcode 15+', Colors.blue]].map(([l, c]) => (
              <View key={l} style={[styles.badge, {backgroundColor: c + '22', borderColor: c + '44'}]}>
                <Text style={[styles.badgeText, {color: c}]}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Widget families */}
        <View style={styles.card}>
          <Text style={[styles.cardLabel, {marginBottom: 10}]}>4 WIDGET FAMILIES</Text>
          {[
            ['.accessoryRectangular', 'Most space · shows icon + title + date'],
            ['.accessoryCircular', 'Compact · days countdown ring'],
            ['.accessoryInline', 'Top of lock screen · one-liner'],
            ['.accessoryCorner', 'Bottom corners · gauge style'],
          ].map(([id, desc]) => (
            <View key={id} style={styles.widgetFamilyRow}>
              <View style={styles.dot} />
              <View>
                <Text style={styles.widgetFamilyId}>{id}</Text>
                <Text style={styles.widgetFamilyDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Swift files */}
        <View style={styles.card}>
          <Text style={[styles.cardLabel, {marginBottom: 10}]}>⚙️ SWIFT FILES — WHAT EACH DOES</Text>
          {[
            ['TimelineEntry', 'Defines the data snapshot shown in the widget at any moment — next event, urgent event, count.'],
            ['TimelineProvider', 'Fetches events from App Group storage and tells WidgetKit when to refresh (midnight daily).'],
            ['RectangularView', 'The wide lock screen widget — shows category icon, title, person, and days remaining.'],
            ['CircularView', 'The round widget — countdown ring with days number and category emoji in the center.'],
            ['InlineView', 'The single-line widget at the very top of the lock screen — "🎂 Wife\'s Birthday in 2d".'],
            ['WidgetBundle', 'Registers all three widget types with iOS so they appear in the widget picker.'],
            ['App Group / Data', 'Shared UserDefaults between the main app and widget. Call saveEvents() after every change.'],
          ].map(([title, desc]) => (
            <View
              key={title}
              style={{paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ede9e6'}}>
              <Text style={{fontWeight: '700', fontSize: 13, color: '#1a1612', fontFamily: 'Courier'}}>{title}</Text>
              <Text style={{fontSize: 12, color: '#6b6560', marginTop: 3, lineHeight: 18}}>{desc}</Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={styles.card}>
          <Text style={[styles.cardLabel, {marginBottom: 12}]}>🛠 INTEGRATION STEPS</Text>
          {[
            ['1', 'Create Widget Extension in Xcode', 'File → New → Target → Widget Extension. Name it WallCalWidget.', Colors.purple],
            ['2', 'Enable App Groups on both targets', 'Main app + Widget Extension both need the same App Group ID.', Colors.blue],
            ['3', 'Add WallCalDataStore to main app', 'Call saveEvents() on every event change to sync to widget.', '#4ECDC4'],
            ['4', 'Test on a real device', 'Long-press lock screen → Customize → Add Widgets → WallCal.', '#34D399'],
          ].map(([step, title, detail, color]) => (
            <View key={step} style={styles.integrationStep}>
              <View style={[styles.stepCircle, {backgroundColor: color + '22', borderColor: color + '55'}]}>
                <Text style={[styles.stepCircleText, {color}]}>{step}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepDetail}>{detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SettingsScreen ───────────────────────────────────────────────────────────
export function SettingsScreen() {
  const {user, logout, globalNotifyDays, setGlobalNotifyDays, defaultTheme, setDefaultTheme, autoWallpaper, setAutoWallpaper, events} = useStore(useShallow(s => ({
    user: s.user, logout: s.logout,
    globalNotifyDays: s.globalNotifyDays, setGlobalNotifyDays: s.setGlobalNotifyDays,
    defaultTheme: s.defaultTheme, setDefaultTheme: s.setDefaultTheme,
    autoWallpaper: s.autoWallpaper, setAutoWallpaper: s.setAutoWallpaper,
    events: s.events,
  })));

  const returnEvents = events.filter(e => e.category === 'return');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.sub}>Tune reminder and wallpaper defaults.</Text>

        {/* Automation */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Automation</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Wallpaper</Text>
            <Switch
              value={autoWallpaper}
              onValueChange={setAutoWallpaper}
              trackColor={{false: Colors.border, true: Colors.purple}}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Defaults */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Defaults</Text>
          <Text style={styles.cardLabel}>DEFAULT NOTIFY DAYS BEFORE</Text>
          <View style={styles.pillRow}>
            {NOTIFY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setGlobalNotifyDays(opt.value)}
                style={[styles.pill, globalNotifyDays === opt.value && {backgroundColor: Colors.purple + '33', borderColor: Colors.purple}]}>
                <Text style={styles.pillText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.cardLabel, {marginTop: 14}]}>DEFAULT THEME</Text>
          <View style={styles.themeRow}>
            {WALLPAPER_THEMES.map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setDefaultTheme(t.id)}
                style={[styles.themeBtn, {backgroundColor: t.bg, borderColor: defaultTheme === t.id ? Colors.purple : 'transparent'}]}>
                <Text style={[styles.themeBtnText, {color: t.fg}]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Return policy DB */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏪 Return Policy Database</Text>
          {STORE_LIST.map((s, i) => (
            <View key={s.id} style={[styles.storeRow, i < STORE_LIST.length - 1 && {borderBottomWidth: 1, borderBottomColor: Colors.border}]}>
              <View style={[styles.storeLogoBox, {backgroundColor: s.color + '22'}]}>
                <Text style={[styles.storeLogoText, {color: s.color}]}>{s.logo}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.storeName}>{s.name}</Text>
                <Text style={styles.storeCats}>{s.policies.length} return categories</Text>
              </View>
              <Text style={[styles.storeDays, {color: s.defaultDays === 0 ? '#34D399' : Colors.textSecondary}]}>
                {s.defaultDays === 0 ? '∞ No limit' : `Up to ${Math.max(...s.policies.map(p => p.days || 0))}d`}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={[styles.card, {backgroundColor: Colors.purpleBannerBg, borderColor: Colors.purple + '33'}]}>
          <Text style={styles.sectionTitle}>📊 Your Stats</Text>
          <View style={styles.statsGrid}>
            {[
              ['Total Events', events.length],
              ['Returns', returnEvents.length],
              ['Payments', events.filter(e => e.category === 'payment' || e.category === 'loan').length],
              ['Upcoming', events.filter(e => (getDaysUntil(e) ?? 999) <= 7).length],
            ].map(([label, val]) => (
              <View key={label as string} style={styles.statCell}>
                <Text style={styles.statVal}>{val}</Text>
                <Text style={styles.statLabel}>{label as string}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.loggedInAs}>Signed in as {user?.email}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── EventPreviewScreen ───────────────────────────────────────────────────────
export function EventPreviewScreen() {
  const route = useRoute<any>();
  const nav = useNavigation();
  const events = useStore(s => s.events);
  const event = events.find(e => e.id === route.params?.eventId);

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyCenter}>
          <Text style={{fontSize: 48}}>📅</Text>
          <Text style={styles.emptyTitle}>Event not found</Text>
          <TouchableOpacity onPress={() => nav.goBack()} style={{marginTop: 12, padding: 12}}>
            <Text style={{color: Colors.purple, fontWeight: '700'}}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = getCategoryColor(event.category);
  const catIcon = getCategoryIcon(event.category);
  const theme = WALLPAPER_THEMES.find(t => t.id === event.theme) ?? WALLPAPER_THEMES[0];
  const days = getDaysUntil(event);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scrollContent, {alignItems: 'center'}]}>
        <WallpaperShell imageUri={event.userImageUri} backgroundColor={theme.bg} fullWidth>
          <View style={[styles.wallAccent, {backgroundColor: catColor}]} />
          <View style={styles.wallIconCircle}>
            <Text style={{fontSize: 52}}>{catIcon}</Text>
          </View>
          <View style={[styles.wallCatPill, {backgroundColor: catColor + '33'}]}>
            <Text style={[styles.wallCatText, {color: catColor}]}>{event.category.toUpperCase()}</Text>
          </View>
          <Text style={[styles.wallTitle, {color: theme.fg}]}>{event.title}</Text>
          {!!event.person && (
            <Text style={[styles.wallPerson, {color: theme.fg + 'aa'}]}>{event.person}</Text>
          )}
          <Text style={[styles.wallDate, {color: catColor}]}>{formatEventDate(event)}</Text>
          {days !== null && (
            <Text style={[styles.wallDays, {color: theme.fg + '88'}]}>
              {days === 0 ? 'Today!' : days < 0 ? 'Passed' : `${days} days away`}
            </Text>
          )}
          <Text style={styles.wallWatermark}>WallCal • Smart Reminder Wallpaper</Text>
        </WallpaperShell>
        <View style={[styles.card, {width: '100%', marginTop: 16}]}>
          <Text style={styles.cardLabel}>HOW TO USE THIS WALLPAPER</Text>
          {['1. Screenshot this preview', '2. Go to Settings → Wallpaper', '3. Set as lock screen background'].map(t => (
            <Text key={t} style={styles.howTo}>{t}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.pageBg},
  scrollContent: {padding: 16, paddingBottom: 40, gap: 14},
  sectionLabel: {fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1},
  heading: {fontSize: 26, fontWeight: '800', color: Colors.textPrimary},
  sub: {fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: -6},
  card: {
    backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardLabel: {fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase'},
  emptyCenter: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: Colors.textPrimary},
  emptySub: {fontSize: 14, color: Colors.textSecondary},
  pillRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  pill: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.cardBg,
  },
  pillText: {fontSize: 12, fontWeight: '600', color: Colors.textPrimary},

  // Preview screen
  wallCard: {
    borderRadius: 28, padding: 28, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 8, overflow: 'hidden',
  },
  wallBgImage: {borderRadius: 28},
  wallImageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 10, 0.35)',
  },
  wallAccent: {position: 'absolute', top: 0, left: 0, right: 0, height: 4},
  wallIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginVertical: 8,
  },
  wallCatPill: {borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5},
  wallCatText: {fontSize: 11, fontWeight: '700'},
  wallTitle: {fontSize: 22, fontWeight: '800', textAlign: 'center'},
  wallPerson: {fontSize: 14, textAlign: 'center'},
  wallDate: {fontSize: 18, fontWeight: '700'},
  wallDays: {fontSize: 13},
  wallWatermark: {color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 8},
  howTo: {fontSize: 13, color: Colors.textSecondary, lineHeight: 22},

  // Widget screen
  purpleBanner: {
    backgroundColor: Colors.purpleBannerBg, borderWidth: 1,
    borderColor: Colors.purple + '33', borderRadius: 16, padding: 16, gap: 10,
  },
  purpleBannerRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  purpleBannerIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  purpleBannerTitle: {fontWeight: '800', fontSize: 17, color: Colors.textPrimary},
  purpleBannerSub: {color: Colors.textSecondary, fontSize: 12},
  badgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  badge: {borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3},
  badgeText: {fontSize: 11, fontWeight: '700'},
  widgetFamilyRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.border},
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.purple, marginTop: 5},
  widgetFamilyId: {fontSize: 11, fontWeight: '600', color: Colors.textPrimary, fontFamily: 'Courier'},
  widgetFamilyDesc: {fontSize: 10, color: Colors.textSecondary},
  integrationStep: {flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 6},
  stepCircle: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleText: {fontSize: 11, fontWeight: '800'},
  stepTitle: {fontWeight: '700', fontSize: 13, color: Colors.textPrimary},
  stepDetail: {color: Colors.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 18},

  // Settings screen
  sectionTitle: {fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8},
  settingRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  settingLabel: {fontSize: 15, color: Colors.textPrimary},
  themeRow: {flexDirection: 'row', gap: 8},
  themeBtn: {flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 2, alignItems: 'center'},
  themeBtnText: {fontSize: 11, fontWeight: '600'},
  storeRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8},
  storeLogoBox: {width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  storeLogoText: {fontWeight: '900', fontSize: 11},
  storeName: {fontWeight: '600', fontSize: 13, color: Colors.textPrimary},
  storeCats: {color: Colors.textSecondary, fontSize: 11},
  storeDays: {fontSize: 11, fontWeight: '600'},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  statCell: {backgroundColor: Colors.cardBg, borderRadius: 10, padding: 12, width: '47%'},
  statVal: {fontSize: 22, fontWeight: '800', color: Colors.purple},
  statLabel: {fontSize: 11, color: Colors.textSecondary},
  logoutBtn: {
    backgroundColor: Colors.rose + '22', borderWidth: 1.5, borderColor: Colors.rose + '66',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  logoutText: {color: Colors.rose, fontWeight: '700', fontSize: 15},
  loggedInAs: {textAlign: 'center', fontSize: 12, color: Colors.textMuted},
});
