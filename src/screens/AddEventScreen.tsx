import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ScrollView, Alert, Modal, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useStore} from '../store';
import {useShallow} from 'zustand/react/shallow';
import {Colors} from '../utils/theme';
import {CATEGORIES, WALLPAPER_THEMES, NOTIFY_OPTIONS} from '../data/constants';
import {CategoryId, ThemeId, OverlayPos} from '../data/types';

// ── Permissions Banner ────────────────────────────────────────────────────────
const PERMS_STORAGE_KEY = 'wallcal_perms_granted';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function requestNativePermission(kind: 'photo' | 'notification') {
  try {
    const perms = require('react-native-permissions');
    const {
      request,
      requestNotifications,
      PERMISSIONS,
      RESULTS,
    } = perms;

    if (kind === 'notification') {
      const {status} =
        Platform.OS === 'ios'
          ? await requestNotifications(['alert', 'sound'])
          : await requestNotifications();

      return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

    const status = await request(permission);
    return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
  } catch {
    Alert.alert(
      'Permissions package missing',
      'Install react-native-permissions to request this permission from the app.',
    );
    return false;
  }
}

function PermissionsBanner({onDismiss}: {onDismiss: () => void | Promise<void>}) {
  const [photoGranted, setPhotoGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const allGranted = photoGranted && notifGranted;

  const handlePhotoAllow = async () => {
    const granted = await requestNativePermission('photo');
    setPhotoGranted(granted);
  };

  const handleNotifAllow = async () => {
    const granted = await requestNativePermission('notification');
    setNotifGranted(granted);
  };

  return (
    <View style={permStyles.banner}>
      <View style={permStyles.headerRow}>
        <View style={permStyles.icon}><Text style={{fontSize: 16}}>🔐</Text></View>
        <View style={{flex: 1}}>
          <Text style={permStyles.title}>App Permissions</Text>
          <Text style={permStyles.sub}>Needed for wallpaper & reminders</Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={{color: Colors.textMuted, fontSize: 20}}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Photos */}
      <View style={permStyles.permRow}>
        <View style={[permStyles.permIcon, {backgroundColor: photoGranted ? '#34D39922' : Colors.surfaceBg}]}>
          <Text style={{fontSize: 18}}>🖼️</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={permStyles.permTitle}>Photos Access</Text>
          <Text style={permStyles.permSub}>Save wallpapers to your library</Text>
        </View>
        {photoGranted
          ? <Text style={permStyles.granted}>✓ Granted</Text>
          : <TouchableOpacity style={permStyles.allowBtn} onPress={handlePhotoAllow}>
              <Text style={permStyles.allowBtnText}>Allow</Text>
            </TouchableOpacity>
        }
      </View>

      {/* Notifications */}
      <View style={[permStyles.permRow, {marginTop: 8}]}>
        <View style={[permStyles.permIcon, {backgroundColor: notifGranted ? '#34D39922' : Colors.surfaceBg}]}>
          <Text style={{fontSize: 18}}>🔔</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={permStyles.permTitle}>Notifications</Text>
          <Text style={permStyles.permSub}>Get reminders before events</Text>
        </View>
        {notifGranted
          ? <Text style={permStyles.granted}>✓ Granted</Text>
          : <TouchableOpacity style={permStyles.allowBtn} onPress={handleNotifAllow}>
              <Text style={permStyles.allowBtnText}>Allow</Text>
            </TouchableOpacity>
        }
      </View>

      {allGranted && (
        <View style={permStyles.successRow}>
          <Text style={{fontSize: 16}}>🎉</Text>
          <Text style={permStyles.successText}>All set! You're ready to create events.</Text>
          <TouchableOpacity style={permStyles.doneBtn} onPress={onDismiss}>
            <Text style={permStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const permStyles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.purpleBannerBg, borderWidth: 1,
    borderColor: Colors.purple + '33', borderRadius: 16, padding: 16, marginBottom: 4,
  },
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12},
  icon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {fontWeight: '700', fontSize: 14, color: Colors.textPrimary},
  sub: {color: Colors.textSecondary, fontSize: 11},
  permRow: {
    backgroundColor: Colors.cardBg, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  permIcon: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  permTitle: {fontWeight: '600', fontSize: 13, color: Colors.textPrimary},
  permSub: {color: Colors.textSecondary, fontSize: 11},
  granted: {color: '#34D399', fontWeight: '700', fontSize: 12},
  allowBtn: {
    backgroundColor: Colors.purple, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  allowBtnText: {color: '#fff', fontWeight: '700', fontSize: 12},
  successRow: {
    marginTop: 10, backgroundColor: '#34D39922', borderWidth: 1,
    borderColor: '#34D39966', borderRadius: 10, padding: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  successText: {flex: 1, color: '#059669', fontWeight: '600', fontSize: 13},
  doneBtn: {backgroundColor: '#34D399', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5},
  doneBtnText: {color: '#fff', fontWeight: '700', fontSize: 12},
});

// ── Add Event Screen ──────────────────────────────────────────────────────────
export default function AddEventScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const editId = route.params?.editId;

  const {addEvent, updateEvent, events} = useStore(useShallow(s => ({
    addEvent: s.addEvent,
    updateEvent: s.updateEvent,
    events: s.events,
  })));

  const existing = editId ? events.find(e => e.id === editId) : null;

  const [showPerms, setShowPerms] = useState(false);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [person, setPerson] = useState(existing?.person ?? '');
  const [category, setCategory] = useState<CategoryId>(existing?.category ?? 'birthday');
  const [date, setDate] = useState<Date>(
    existing?.date ? new Date(existing.date + 'T00:00:00') : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draftDate, setDraftDate] = useState(date);
  const [notifyDays, setNotifyDays] = useState(existing?.notifyDays ?? 1);
  const [theme, setTheme] = useState<ThemeId>(existing?.theme ?? 'dark');
  const [userImageUri, setUserImageUri] = useState(existing?.userImageUri ?? null);

  useEffect(() => {
    if (editId) {
      setShowPerms(false);
      return;
    }

    AsyncStorage.getItem(PERMS_STORAGE_KEY).then(val => {
      setShowPerms(val !== 'true');
    });
  }, [editId]);

  const handlePermsDone = async () => {
    await AsyncStorage.setItem(PERMS_STORAGE_KEY, 'true');
    setShowPerms(false);
  };

  const handleSave = () => {
    if (!title) {
      Alert.alert('Missing title', 'Please enter an event name.');
      return;
    }
    const dateStr = date.toISOString().split('T')[0];
    const payload = {
      title,
      person,
      category,
      date: dateStr,
      notifyDays,
      theme,
      userImageUri,
      overlayPos: 'bottom' as OverlayPos,
      overlayOpacity: 0.7,
    };

    if (editId) {
      updateEvent(editId, payload);
    } else {
      addEvent(payload);
    }
    nav.goBack();
  };

  const openDatePicker = () => {
    setDraftDate(date);
    setShowDatePicker(true);
  };

  const handleDateDone = () => {
    setDate(draftDate);
    setShowDatePicker(false);
  };

  const handlePickImage = async () => {
    const granted = await requestNativePermission('photo');
    if (!granted) {
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorMessage) {
      Alert.alert('Photo picker error', result.errorMessage);
      return;
    }

    const nextUri = result.assets?.[0]?.uri ?? null;
    if (nextUri) {
      setUserImageUri(nextUri);
    }
  };

  const catRepeat = CATEGORIES.find(c => c.id === category)?.repeat;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{editId ? 'Edit Event' : 'Add New Event'}</Text>
        <Text style={styles.subheading}>Create reminders that drive wallpaper updates automatically.</Text>

        {/* Permissions banner — only on new event */}
        {showPerms && <PermissionsBanner onDismiss={handlePermsDone} />}

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.filter(c => c.id !== 'return').map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  category === cat.id && {backgroundColor: cat.color + '22', borderColor: cat.color},
                ]}>
                <Text style={styles.categoryPillText}>{cat.icon} {cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => nav.navigate('Returns' as never)}>
            <Text style={styles.returnBtnText}>↩️ Add a Return Reminder instead →</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>EVENT NAME *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Wife's Birthday, AMEX Payment…"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Person */}
        <View style={styles.section}>
          <Text style={styles.label}>PERSON / NOTE</Text>
          <TextInput
            style={styles.input}
            value={person}
            onChangeText={setPerson}
            placeholder="e.g. Sarah, Dr. Patel, HDFC Bank…"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>DATE *</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={openDatePicker}>
            <Text style={styles.dateBtnText}>{formatDate(date)}</Text>
            <Text style={{color: Colors.purple, fontWeight: '700'}}>Change</Text>
          </TouchableOpacity>
          {catRepeat === 'yearly' && (
            <Text style={styles.repeatHint}>🔄 Repeats every year automatically</Text>
          )}
          {catRepeat === 'monthly' && (
            <Text style={[styles.repeatHint, {color: '#34D399'}]}>🔄 Repeats every month automatically</Text>
          )}
        </View>

        <Modal visible={showDatePicker} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Choose date</Text>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDraftDate(selectedDate);
                  }
                }}
                accentColor={Colors.purple}
                themeVariant="light"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDateDone} style={styles.modalDoneBtn}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.section}>
          <Text style={styles.label}>WALLPAPER PHOTO · optional</Text>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
            <Text style={styles.imagePickerTitle}>{userImageUri ? 'Change photo' : 'Add photo'}</Text>
            <Text style={styles.imagePickerSub}>
              {userImageUri ? 'Use your own image in the wallpaper preview.' : 'Pick a photo from your library for this event.'}
            </Text>
          </TouchableOpacity>
          {userImageUri && (
            <View style={styles.imagePreviewCard}>
              <Image source={{uri: userImageUri}} style={styles.imagePreview} />
              <TouchableOpacity onPress={() => setUserImageUri(null)} style={styles.removeImageBtn}>
                <Text style={styles.removeImageText}>Remove photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.label}>WALLPAPER THEME</Text>
          <View style={styles.themeRow}>
            {WALLPAPER_THEMES.filter(t => t.id !== 'return').map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTheme(t.id as ThemeId)}
                style={[styles.themeBtn, {backgroundColor: t.bg, borderColor: theme === t.id ? Colors.purple : 'transparent'}]}>
                <Text style={[styles.themeBtnText, {color: t.fg}]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notify */}
        <View style={styles.section}>
          <Text style={styles.label}>NOTIFY DAYS BEFORE</Text>
          <View style={styles.pillRow}>
            {NOTIFY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setNotifyDays(opt.value)}
                style={[styles.pill, notifyDays === opt.value && {backgroundColor: Colors.purple + '33', borderColor: Colors.purple}]}>
                <Text style={styles.pillText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => nav.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, !title && styles.saveBtnDisabled]}
            onPress={handleSave}>
            <Text style={styles.saveBtnText}>💾 Save Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.pageBg},
  scroll: {padding: 20, gap: 16, paddingBottom: 40},
  heading: {fontSize: 26, fontWeight: '800', color: Colors.textPrimary},
  subheading: {fontSize: 14, color: Colors.textSecondary, marginTop: -8, lineHeight: 20},
  section: {gap: 8},
  label: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.cardBg, borderWidth: 1.5, borderColor: Colors.borderLight,
    borderRadius: 14, color: Colors.textPrimary,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15,
  },
  dateBtn: {
    backgroundColor: Colors.cardBg, borderWidth: 1.5, borderColor: Colors.borderLight,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dateBtnText: {fontSize: 15, color: Colors.textPrimary},
  repeatHint: {fontSize: 11, color: Colors.purple},
  categoryGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  categoryPill: {
    width: '31%',
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {fontSize: 12, fontWeight: '700', color: Colors.textPrimary},
  pillRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1.5, borderColor: Colors.borderLight,
    backgroundColor: Colors.cardBg,
  },
  pillText: {fontSize: 13, fontWeight: '600', color: Colors.textPrimary},
  imagePickerBtn: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: 14,
    padding: 14,
  },
  imagePickerTitle: {fontSize: 15, fontWeight: '700', color: Colors.textPrimary},
  imagePickerSub: {fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18},
  imagePreviewCard: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  imagePreview: {width: '100%', height: 180, borderRadius: 12, backgroundColor: Colors.surfaceBg},
  removeImageBtn: {alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.rose + '22'},
  removeImageText: {fontSize: 12, fontWeight: '700', color: Colors.rose},
  themeRow: {flexDirection: 'row', gap: 8},
  themeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 2, alignItems: 'center',
  },
  themeBtnText: {fontSize: 11, fontWeight: '600'},
  returnBtn: {
    backgroundColor: Colors.rose + '22', borderWidth: 1.5,
    borderColor: Colors.rose + '44', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center',
  },
  returnBtnText: {color: Colors.rose, fontWeight: '700', fontSize: 13},
  actionRow: {flexDirection: 'row', gap: 10, marginTop: 8},
  cancelBtn: {
    flex: 1, backgroundColor: Colors.cardBg, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center',
  },
  cancelBtnText: {fontWeight: '700', fontSize: 15, color: Colors.textSecondary},
  saveBtn: {
    flex: 2, backgroundColor: Colors.purple, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  saveBtnDisabled: {backgroundColor: Colors.pillInactive},
  saveBtnText: {fontWeight: '800', fontSize: 15, color: '#fff'},
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%'},
  modalTitle: {fontWeight: '700', fontSize: 18, color: Colors.textPrimary, marginBottom: 8},
  modalActions: {flexDirection: 'row', gap: 10, marginTop: 12},
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {fontWeight: '600', color: Colors.textSecondary, fontSize: 15},
  modalDoneBtn: {flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.purple, alignItems: 'center'},
  modalDoneText: {fontWeight: '700', color: '#fff', fontSize: 15},
});
