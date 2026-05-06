import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ScrollView, Alert, Modal, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useStore} from '../store';
import {useShallow} from 'zustand/react/shallow';
import {Colors} from '../utils/theme';
import {STORE_LIST, STORE_POLICIES, NOTIFY_OPTIONS} from '../data/constants';
import {todayStr, addDaysToDate, getDaysUntil, formatEventDate} from '../utils/helpers';
import {requestNativePermission} from './AddEventScreen';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseDateInput(value: string) {
  return new Date(value + 'T00:00:00');
}

export default function ReturnsScreen() {
  const nav = useNavigation();
  const {events, deleteEvent, addEvent} = useStore(useShallow(s => ({
    events: s.events,
    deleteEvent: s.deleteEvent,
    addEvent: s.addEvent,
  })));
  const returnEvents = events.filter(e => e.category === 'return');

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedPolicyIdx, setSelectedPolicyIdx] = useState<number | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemNote, setItemNote] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayStr());
  const [manualDeadline, setManualDeadline] = useState('');
  const [notifyDays, setNotifyDays] = useState(3);
  const [receiptImageUri, setReceiptImageUri] = useState<string | null>(null);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showManualDeadlinePicker, setShowManualDeadlinePicker] = useState(false);
  const [draftPurchaseDate, setDraftPurchaseDate] = useState(parseDateInput(purchaseDate));
  const [draftManualDeadline, setDraftManualDeadline] = useState(
    manualDeadline ? parseDateInput(manualDeadline) : parseDateInput(todayStr()),
  );

  const store = selectedStoreId ? STORE_POLICIES[selectedStoreId] : null;
  const policy = selectedPolicyIdx !== null && store ? store.policies[selectedPolicyIdx] : null;
  const returnDays = manualMode ? null : (policy?.days ?? store?.defaultDays ?? 30);
  const isNoLimit = !manualMode && returnDays === 0;
  const deadlineDate = manualMode ? manualDeadline : (isNoLimit ? '' : addDaysToDate(purchaseDate, returnDays ?? 30));

  const stepLabels = ['Store', 'Policy', 'Details', 'Confirm'];

  const handleSave = () => {
    if (!store || !itemName) return;
    addEvent({
      title: `Return: ${itemName}`,
      person: `${store.name}${itemNote ? ' · ' + itemNote : ''}`,
      category: 'return',
      date: isNoLimit ? addDaysToDate(purchaseDate, 365) : (deadlineDate || addDaysToDate(purchaseDate, 30)),
      notifyDays,
      theme: 'return',
      overlayPos: 'bottom',
      overlayOpacity: 0.75,
      storeName: store.name,
      storeId: selectedStoreId,
      returnDeadline: !isNoLimit,
      receiptImageUri,
    });
    nav.goBack();
  };

  const handlePickReceipt = async () => {
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
      setReceiptImageUri(nextUri);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Return', 'Remove this return reminder?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => deleteEvent(id)},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Return Wizard</Text>
        <Text style={styles.sub}>Create one-time return reminders with auto wallpaper urgency.</Text>

        {/* Active returns */}
        {returnEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACTIVE RETURNS · {returnEvents.length}</Text>
            {returnEvents.map(ev => {
              const d = getDaysUntil(ev);
              const s = ev.storeId ? STORE_POLICIES[ev.storeId] : null;
              return (
                <View key={ev.id} style={[styles.returnCard, d !== null && d <= 3 && {borderColor: Colors.rose + '66', backgroundColor: Colors.rose + '08'}]}>
                  {s && (
                    <View style={[styles.storeLogoBox, {backgroundColor: s.color + '22'}]}>
                      <Text style={[styles.storeLogoText, {color: s.color}]}>{s.logo}</Text>
                    </View>
                  )}
                  <View style={{flex: 1}}>
                    <Text style={styles.returnTitle}>{ev.title.replace('Return: ', '')}</Text>
                    <Text style={styles.returnPerson}>{ev.person}</Text>
                    <Text style={[styles.returnDays, d !== null && d <= 3 && {color: Colors.rose}]}>
                      {d === 0 ? '🚨 Due TODAY!' : d !== null && d <= 3 ? `⚠ ${d} day${d !== 1 ? 's' : ''} left!` : `${d ?? ''} days · ${formatEventDate(ev)}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmDelete(ev.id)} style={styles.deleteBtn}>
                    <Text style={{color: Colors.rose, fontSize: 16}}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <View style={styles.divider} />
          </View>
        )}

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {stepLabels.map((label, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot,
                  step > i + 1 && {backgroundColor: Colors.rose},
                  step === i + 1 && {backgroundColor: Colors.purple},
                  step < i + 1 && {backgroundColor: Colors.pillInactive},
                ]}>
                  <Text style={[styles.stepNum, step >= i + 1 && {color: '#fff'}]}>
                    {step > i + 1 ? '✓' : i + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, step === i + 1 && {color: Colors.rose, fontWeight: '700'}]}>{label}</Text>
              </View>
              {i < 3 && <View style={[styles.stepLine, {backgroundColor: step > i + 1 ? Colors.rose : Colors.border}]} />}
            </React.Fragment>
          ))}
        </View>

        {/* STEP 1 — Store */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Store</Text>
            <View style={styles.storeGrid}>
              {STORE_LIST.map(s => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => {setSelectedStoreId(s.id); setSelectedPolicyIdx(null); setStep(2);}}
                  style={[styles.storeBtn, selectedStoreId === s.id && {borderColor: s.color}]}>
                  <View style={[styles.storeLogoBox, {backgroundColor: s.color + '22'}]}>
                    <Text style={[styles.storeLogoText, {color: s.color}]}>{s.logo}</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.storeName}>{s.name}</Text>
                    <Text style={styles.storeDays}>{s.defaultDays === 0 ? 'No time limit' : `Up to ${Math.max(...s.policies.map(p => p.days || 0))} days`}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2 — Policy */}
        {step === 2 && store && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{store.name} Return Policy</Text>
            <Text style={styles.stepSub}>Select item category</Text>
            {store.policies.map((p, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {setSelectedPolicyIdx(i); setManualMode(false);}}
                style={[styles.policyBtn, selectedPolicyIdx === i && !manualMode && {borderColor: store.color, backgroundColor: store.color + '11'}]}>
                <View style={{flex: 1}}>
                  <Text style={styles.policyCategory}>{p.category}</Text>
                  <Text style={styles.policyNotes}>{p.notes}</Text>
                </View>
                <View style={[styles.daysBox, {backgroundColor: (p.days === 0 ? '#34D399' : store.color) + '22'}]}>
                  <Text style={[styles.daysNum, {color: p.days === 0 ? '#34D399' : store.color}]}>{p.days === 0 ? '∞' : p.days}</Text>
                  <Text style={styles.daysLabel}>{p.days === 0 ? 'no limit' : 'days'}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {setManualMode(true); setSelectedPolicyIdx(null);}}
              style={[styles.policyBtn, manualMode && {borderColor: Colors.purple, backgroundColor: Colors.purple + '11'}]}>
              <Text style={styles.policyCategory}>✏️ Set deadline manually</Text>
              <Text style={styles.policyNotes}>Pick any return date yourself</Text>
            </TouchableOpacity>
            <View style={[styles.tipBox, {borderColor: store.color + '33', backgroundColor: store.color + '0d'}]}>
              <Text style={[styles.tipLabel, {color: store.color}]}>💡 Tip</Text>
              <Text style={styles.tipText}>{store.tips}</Text>
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextBtn, (selectedPolicyIdx === null && !manualMode) && styles.nextBtnDisabled]}
                disabled={selectedPolicyIdx === null && !manualMode}
                onPress={() => setStep(3)}>
                <Text style={styles.nextBtnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3 — Details */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Item Details</Text>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>ITEM NAME *</Text>
              <TextInput style={styles.input} value={itemName} onChangeText={setItemName} placeholder="e.g. Blue Jacket, 65' TV…" placeholderTextColor={Colors.textMuted} />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>ORDER # / NOTE <Text style={{color: Colors.textMuted, fontWeight: '400'}}>optional</Text></Text>
              <TextInput style={styles.input} value={itemNote} onChangeText={setItemNote} placeholder="e.g. Order #112-345, defective" placeholderTextColor={Colors.textMuted} />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>PURCHASE DATE</Text>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => {
                  setDraftPurchaseDate(parseDateInput(purchaseDate));
                  setShowPurchaseDatePicker(true);
                }}>
                <Text style={styles.dateBtnText}>{formatDate(parseDateInput(purchaseDate))}</Text>
                <Text style={styles.changeDateText}>Change</Text>
              </TouchableOpacity>
            </View>
            {!manualMode && policy && (
              <View style={[styles.deadlineBox, {borderColor: isNoLimit ? '#34D39966' : Colors.rose + '66', backgroundColor: isNoLimit ? '#34D39911' : Colors.rose + '11'}]}>
                <Text style={{color: Colors.textSecondary, fontSize: 12}}>Return deadline based on policy:</Text>
                {isNoLimit
                  ? <Text style={{color: '#34D399', fontWeight: '800', fontSize: 18, marginTop: 4}}>♾ No time limit — anytime!</Text>
                  : <>
                    <Text style={{color: Colors.rose, fontWeight: '800', fontSize: 20, marginTop: 4}}>
                      {deadlineDate ? new Date(deadlineDate + 'T00:00:00').toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) : '—'}
                    </Text>
                    <Text style={{color: Colors.textSecondary, fontSize: 12, marginTop: 2}}>{policy.days} days from purchase · {policy.category}</Text>
                  </>
                }
              </View>
            )}
            {manualMode && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>RETURN DEADLINE</Text>
                <TouchableOpacity
                  style={[styles.dateBtn, {borderColor: Colors.rose + '66'}]}
                  onPress={() => {
                    setDraftManualDeadline(manualDeadline ? parseDateInput(manualDeadline) : parseDateInput(purchaseDate));
                    setShowManualDeadlinePicker(true);
                  }}>
                  <Text style={styles.dateBtnText}>
                    {manualDeadline ? formatDate(parseDateInput(manualDeadline)) : 'Choose a deadline'}
                  </Text>
                  <Text style={styles.changeDateText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>RECEIPT PHOTO · optional</Text>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickReceipt}>
                <Text style={styles.imagePickerTitle}>{receiptImageUri ? 'Change receipt photo' : 'Add receipt photo'}</Text>
                <Text style={styles.imagePickerSub}>Keep a quick reference image with this return reminder.</Text>
              </TouchableOpacity>
              {receiptImageUri && (
                <View style={styles.imagePreviewCard}>
                  <Image source={{uri: receiptImageUri}} style={styles.imagePreview} />
                  <TouchableOpacity onPress={() => setReceiptImageUri(null)} style={styles.removeImageBtn}>
                    <Text style={styles.removeImageText}>Remove photo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>REMIND ME</Text>
              <View style={styles.pillRow}>
                {NOTIFY_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setNotifyDays(opt.value)}
                    style={[styles.pill, notifyDays === opt.value && {backgroundColor: Colors.rose + '33', borderColor: Colors.rose}]}>
                    <Text style={styles.pillText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextBtn, (!itemName || (!isNoLimit && !deadlineDate)) && styles.nextBtnDisabled]}
                disabled={!itemName || (!isNoLimit && !deadlineDate)}
                onPress={() => setStep(4)}>
                <Text style={styles.nextBtnText}>Preview →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 4 — Confirm */}
        {step === 4 && store && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirm & Save</Text>
            <View style={styles.confirmCard}>
              <View style={styles.confirmHeader}>
                <View style={[styles.storeLogoBox, {backgroundColor: store.color + '22'}]}>
                  <Text style={[styles.storeLogoText, {color: store.color}]}>{store.logo}</Text>
                </View>
                <View>
                  <Text style={styles.confirmTitle}>Return: {itemName}</Text>
                  <Text style={styles.confirmSub}>{store.name}{itemNote ? ' · ' + itemNote : ''}</Text>
                </View>
              </View>
              <View style={styles.confirmGrid}>
                {[
                  ['📅 Purchased', purchaseDate ? new Date(purchaseDate + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '—'],
                  ['⚠ Deadline', isNoLimit ? 'No limit ♾' : (deadlineDate ? new Date(deadlineDate + 'T00:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '—')],
                  ['🔔 Remind', NOTIFY_OPTIONS.find(n => n.value === notifyDays)?.label ?? 'On the day'],
                  ['🏪 Policy', policy ? policy.category : 'Manual'],
                ].map(([k, v]) => (
                  <View key={k} style={styles.confirmCell}>
                    <Text style={styles.confirmCellKey}>{k}</Text>
                    <Text style={styles.confirmCellVal}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(3)}>
                <Text style={styles.backBtnText}>← Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>💾 Save Return Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Modal visible={showPurchaseDatePicker} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Choose purchase date</Text>
              <DateTimePicker
                value={draftPurchaseDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDraftPurchaseDate(selectedDate);
                  }
                }}
                accentColor={Colors.rose}
                themeVariant="light"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowPurchaseDatePicker(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setPurchaseDate(draftPurchaseDate.toISOString().split('T')[0]);
                    setShowPurchaseDatePicker(false);
                  }}
                  style={styles.modalDoneBtn}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showManualDeadlinePicker} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Choose return deadline</Text>
              <DateTimePicker
                value={draftManualDeadline}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDraftManualDeadline(selectedDate);
                  }
                }}
                accentColor={Colors.rose}
                themeVariant="light"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowManualDeadlinePicker(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setManualDeadline(draftManualDeadline.toISOString().split('T')[0]);
                    setShowManualDeadlinePicker(false);
                  }}
                  style={styles.modalDoneBtn}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.pageBg},
  scroll: {padding: 20, paddingBottom: 40, gap: 14},
  heading: {fontSize: 26, fontWeight: '800', color: Colors.textPrimary},
  sub: {fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: -6},
  section: {gap: 8},
  sectionLabel: {fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1},
  returnCard: {
    backgroundColor: Colors.cardBg, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  returnTitle: {fontWeight: '700', fontSize: 14, color: Colors.textPrimary},
  returnPerson: {color: Colors.textSecondary, fontSize: 12},
  returnDays: {color: Colors.textSecondary, fontSize: 12, marginTop: 2},
  deleteBtn: {padding: 4},
  divider: {height: 1, backgroundColor: Colors.border, marginTop: 4},
  stepRow: {flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4},
  stepItem: {alignItems: 'center', gap: 4},
  stepDot: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: {fontSize: 11, fontWeight: '700', color: Colors.textSecondary},
  stepLabel: {fontSize: 9, color: Colors.textSecondary, textAlign: 'center'},
  stepLine: {flex: 1, height: 2, marginTop: 13, marginHorizontal: 4},
  stepContent: {gap: 12},
  stepTitle: {fontSize: 18, fontWeight: '700', color: Colors.textPrimary},
  stepSub: {fontSize: 13, color: Colors.textSecondary, marginTop: -6},
  storeGrid: {gap: 10},
  storeBtn: {
    backgroundColor: Colors.cardBg, borderWidth: 2, borderColor: Colors.border,
    borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  storeLogoBox: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  storeLogoText: {fontWeight: '900', fontSize: 13},
  storeName: {fontWeight: '700', fontSize: 13, color: Colors.textPrimary},
  storeDays: {fontSize: 11, color: Colors.textSecondary, marginTop: 1},
  policyBtn: {
    backgroundColor: Colors.cardBg, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  policyCategory: {fontWeight: '700', fontSize: 14, color: Colors.textPrimary},
  policyNotes: {color: Colors.textSecondary, fontSize: 12, marginTop: 2},
  daysBox: {borderRadius: 10, padding: 8, alignItems: 'center', minWidth: 48},
  daysNum: {fontWeight: '800', fontSize: 16},
  daysLabel: {fontSize: 9, color: Colors.textMuted},
  tipBox: {borderWidth: 1, borderRadius: 12, padding: 12},
  tipLabel: {fontSize: 12, fontWeight: '600'},
  tipText: {color: Colors.textSecondary, fontSize: 12, marginTop: 3},
  fieldWrap: {gap: 6},
  fieldLabel: {fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.5},
  input: {
    backgroundColor: Colors.cardBg, borderWidth: 1.5, borderColor: Colors.borderLight,
    borderRadius: 14, color: Colors.textPrimary, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15,
  },
  dateBtn: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBtnText: {fontSize: 15, color: Colors.textPrimary},
  changeDateText: {fontSize: 14, fontWeight: '700', color: Colors.rose},
  deadlineBox: {borderWidth: 1, borderRadius: 14, padding: 14},
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
  pillRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  pill: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1.5, borderColor: Colors.borderLight, backgroundColor: Colors.cardBg,
  },
  pillText: {fontSize: 12, fontWeight: '600', color: Colors.textPrimary},
  navRow: {flexDirection: 'row', gap: 10, marginTop: 4},
  backBtn: {
    flex: 1, backgroundColor: Colors.cardBg, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  backBtnText: {fontWeight: '700', fontSize: 14, color: Colors.textSecondary},
  nextBtn: {
    flex: 2, backgroundColor: Colors.rose, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  nextBtnDisabled: {backgroundColor: Colors.pillInactive},
  nextBtnText: {color: '#fff', fontWeight: '800', fontSize: 14},
  confirmCard: {
    backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  confirmHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  confirmTitle: {fontWeight: '700', color: Colors.textPrimary, fontSize: 15},
  confirmSub: {color: Colors.textSecondary, fontSize: 12},
  confirmGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  confirmCell: {
    backgroundColor: Colors.surfaceBg, borderRadius: 10, padding: 10,
    width: '47%',
  },
  confirmCellKey: {color: Colors.textSecondary, fontSize: 10},
  confirmCellVal: {color: Colors.textPrimary, fontWeight: '700', fontSize: 12, marginTop: 2},
  saveBtn: {
    flex: 2, backgroundColor: Colors.rose, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  saveBtnText: {color: '#fff', fontWeight: '800', fontSize: 14},
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
  modalDoneBtn: {flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.rose, alignItems: 'center'},
  modalDoneText: {fontWeight: '700', color: '#fff', fontSize: 15},
});
