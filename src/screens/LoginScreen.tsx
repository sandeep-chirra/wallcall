import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Spacing, Radii} from '../utils/theme';
import {useStore} from '../store';

export default function LoginScreen() {
  const login = useStore(s => s.login);
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (tab === 'signup' && !name) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({name: name || email.split('@')[0], email});
    }, 900);
  };

  const handleSocial = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({name: `${provider} User`, email: `demo@wallcal.app`});
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Text style={{fontSize: 36}}>📱</Text>
            </View>
            <Text style={styles.logoText}>WallCal</Text>
            <Text style={styles.logoSub}>Smart Reminder Wallpapers</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tab toggle */}
            <View style={styles.tabBar}>
              {(['login', 'signup'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
                  <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                    {t === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            {tab === 'signup' && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>YOUR NAME</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Sarah Johnson"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, {flex: 1, marginRight: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0}]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(v => !v)}
                  style={styles.eyeBtn}>
                  <Text style={{fontSize: 18}}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {tab === 'login' && (
              <TouchableOpacity style={{alignSelf: 'flex-end', marginBottom: 4}}>
                <Text style={{color: Colors.purple, fontSize: 13, fontWeight: '600'}}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.primaryBtn, {opacity: loading ? 0.7 : 1}]}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>
                    {tab === 'login' ? 'Sign In →' : 'Create Account →'}
                  </Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social */}
            <View style={styles.socialRow}>
              {[['🍎', 'Apple'], ['G', 'Google']].map(([icon, label]) => (
                <TouchableOpacity
                  key={label}
                  onPress={() => handleSocial(label)}
                  style={styles.socialBtn}>
                  <Text style={{
                    fontSize: label === 'Google' ? 13 : 18,
                    fontWeight: label === 'Google' ? '900' : '400',
                    color: label === 'Google' ? '#4285F4' : Colors.textPrimary,
                    marginRight: 6,
                  }}>{icon}</Text>
                  <Text style={{fontSize: 14, fontWeight: '600', color: Colors.textPrimary}}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.terms}>
            By continuing you agree to our{' '}
            <Text style={{color: Colors.purple}}>Terms</Text>
            {' & '}
            <Text style={{color: Colors.purple}}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.pageBg},
  scroll: {flexGrow: 1, paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center'},
  logoWrap: {alignItems: 'center', marginBottom: 32},
  logoIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.purple,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.purple, shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  logoText: {fontSize: 30, fontWeight: '900', letterSpacing: -1, color: Colors.textPrimary},
  logoSub: {color: Colors.textSecondary, fontSize: 14, marginTop: 4},
  card: {
    width: '100%', backgroundColor: Colors.cardBg, borderRadius: 24,
    padding: 24,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.surfaceBg,
    borderRadius: 12, padding: 4, marginBottom: 24,
  },
  tabBtn: {flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center'},
  tabBtnActive: {
    backgroundColor: Colors.cardBg,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  tabBtnText: {fontSize: 14, fontWeight: '400', color: Colors.textSecondary},
  tabBtnTextActive: {fontWeight: '700', color: Colors.textPrimary},
  fieldWrap: {marginBottom: 14},
  fieldLabel: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 6, letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.cardBg, borderWidth: 1.5, borderColor: Colors.borderLight,
    borderRadius: 14, color: Colors.textPrimary,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15,
  },
  passRow: {flexDirection: 'row', alignItems: 'center'},
  eyeBtn: {
    borderWidth: 1.5, borderLeftWidth: 0, borderColor: Colors.borderLight,
    borderTopRightRadius: 14, borderBottomRightRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: Colors.cardBg, justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.purple, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: {fontSize: 16, fontWeight: '800', color: '#ffffff'},
  divider: {flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10},
  dividerLine: {flex: 1, height: 1, backgroundColor: Colors.border},
  dividerText: {color: Colors.textMuted, fontSize: 12},
  socialRow: {flexDirection: 'row', gap: 10},
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceBg, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingVertical: 12,
  },
  terms: {color: Colors.textMuted, fontSize: 12, textAlign: 'center'},
});
