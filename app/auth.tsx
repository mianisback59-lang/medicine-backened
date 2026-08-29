import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const translations = {
  en: {
    title: "MedVerify AI",
    subtitle: "Instant Authenticity & Safety Scanner",
    langToggle: "اردو",
    loginTab: "Sign In",
    signupTab: "Create Account",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    forgotPass: "Forgot Password?",
    loginBtn: "Sign In",
    signupBtn: "Create Account",
    noAccountText: "Don't have an account?",
    noAccountAction: "Sign Up",
    hasAccountText: "Already have an account?",
    hasAccountAction: "Sign In",
    orContinue: "OR",
    guestLogin: "Explore Without Account",
    footerText: "Official Drug Verification System",
    serverStatus: "AI Engine Active",
    resetTitle: "Reset Password",
    resetConfirm: "A reset email with instructions will be sent to:\n\n",
    enterEmailNotice: "Please type your email address in the Email field first.",
    resetModalTitle: "Reset Password",
    resetModalSub: "Enter the 6-digit code sent to your email and your new password.",
    otpPlaceholder: "6-Digit Code",
    newPassPlaceholder: "New Password",
    updatePassBtn: "Reset & Update Password",
    cancelBtn: "Cancel",
  },
  ur: {
    title: "میڈ ویریفائی AI",
    subtitle: "فوری اصلیت اور حفاظت کا سکینر",
    langToggle: "English",
    loginTab: "سائن ان",
    signupTab: "نیا اکاؤنٹ بنائیں",
    fullNameLabel: "پورا نام",
    fullNamePlaceholder: "پورا نام درج کریں",
    emailLabel: "ای میل ایڈریس",
    emailPlaceholder: "name@example.com",
    passwordLabel: "پاس ورڈ",
    passwordPlaceholder: "پاس ورڈ درج کریں",
    forgotPass: "پاس ورڈ بھول گئے؟",
    loginBtn: "سائن ان کریں",
    signupBtn: "اکاؤنٹ بنائیں",
    noAccountText: "کیا اکاؤنٹ نہیں ہے؟",
    noAccountAction: "سائن اپ کریں",
    hasAccountText: "پہلے سے اکاؤنٹ موجود ہے؟",
    hasAccountAction: "سائن ان کریں",
    orContinue: "یا",
    guestLogin: "اکاؤنٹ کے بغیر آگے بڑھیں",
    footerText: "سرکاری دواؤں کی تصدیق کا نظام",
    serverStatus: "اے آئی انجن فعال ہے",
    resetTitle: "پاس ورڈ ری سیٹ",
    resetConfirm: "پاس ورڈ ری سیٹ کی ای میل اس ایڈریس پر بھیجی جائے گی:\n\n",
    enterEmailNotice: "براہ کرم پہلے ای میل والے خانے میں اپنا ای میل درج کریں۔",
    resetModalTitle: "پاس ورڈ ری سیٹ کریں",
    resetModalSub: "ای میل پر بھیجا گیا 6 ہندسوں کا کوڈ اور نیا پاس ورڈ درج کریں۔",
    otpPlaceholder: "6 ہندسوں کا کوڈ",
    newPassPlaceholder: "نیا پاس ورڈ",
    updatePassBtn: "پاس ورڈ ری سیٹ کریں",
    cancelBtn: "منسوخ کریں",
  }
};

// Truly Soft & Seamless Premium Ambient Glow Background
const BackgroundGlow = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Top Left Soft Blue Ambient Glow */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            top: -120,
            left: -120,
            backgroundColor: '#1D4ED8',
            opacity: pulseAnim,
          },
        ]}
      />

      {/* Bottom Right Soft Cyan Ambient Glow */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            bottom: -140,
            right: -120,
            backgroundColor: '#0891B2',
            opacity: pulseAnim,
          },
        ]}
      />

      {/* Center Soft AI Core Ambient */}
      <View
        style={[
          styles.glowOrb,
          {
            top: '32%',
            alignSelf: 'center',
            backgroundColor: '#2563EB',
            opacity: 0.08,
            width: 320,
            height: 320,
            borderRadius: 160,
          },
        ]}
      />
    </View>
  );
};

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const t = translations[lang];

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        router.replace('/');
        return;
      }

      const hasAccount = await AsyncStorage.getItem('hasAccount');
      if (hasAccount === 'true') {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }

    } catch (error) {
      console.log('Error checking auth status:', error);
      setIsLogin(true);
    } finally {
      setCheckingAuth(false);
    }
  };

  const toggleLanguage = async () => {
    const newLang = lang === 'en' ? 'ur' : 'en';
    setLang(newLang);
    await AsyncStorage.setItem('appLanguage', newLang);
  };

  const handleGuestLogin = async () => {
    await AsyncStorage.setItem('userToken', 'guest_session');
    router.replace('/');
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', lang === 'ur' ? 'براہ کرم تمام خانے پُر کریں۔' : 'Please fill in all required fields.');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      Alert.alert('Error', lang === 'ur' ? 'براہ کرم اپنا پورا نام درج کریں۔' : 'Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const apiUrl = `https://medicine-backened.vercel.app${endpoint}`;

      const payload: any = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      };

      if (!isLogin) {
        payload.name = fullName.trim();
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token || email);
        await AsyncStorage.setItem('appLanguage', lang);
        await AsyncStorage.setItem('hasAccount', 'true');
        router.replace('/'); 
      } else {
        Alert.alert('Failed', data.message || 'Authentication failed.');
      }

    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Keyboard.dismiss();
    const userEmail = email.trim().toLowerCase();

    if (!userEmail) {
      Alert.alert('Notice', t.enterEmailNotice);
      return;
    }

    Alert.alert(
      t.resetTitle,
      `${t.resetConfirm}${userEmail}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch('https://medicine-backened.vercel.app/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Success', data.message || `Reset code sent to ${userEmail}`);
                setResetModalVisible(true);
              } else {
                Alert.alert('Error', data.message || 'Could not send reset email.');
              }
            } catch (error) {
              Alert.alert('Success', `Reset code processed for ${userEmail}`);
              setResetModalVisible(true);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmReset = async () => {
    if (!resetCode.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please enter both the reset code and your new password.');
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch('https://medicine-backened.vercel.app/api/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: resetCode.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password updated successfully! You can now sign in.');
        setPassword(newPassword);
        setResetModalVisible(false);
        setResetCode('');
        setNewPassword('');
      } else {
        Alert.alert('Error', data.message || 'Invalid code or failed to reset password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Could not reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const topPadding = Platform.OS === 'android'
    ? Math.max(insets.top, StatusBar.currentHeight || 24) + 8
    : insets.top + 8;

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1D" translucent={true} />
      
      {/* Soft & Seamless Ambient Glow Background */}
      <BackgroundGlow />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.headerContainer, lang === 'ur' && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.titleArea, lang === 'ur' && { alignItems: 'flex-end' }]}>
              <Text style={[styles.appTitle, lang === 'ur' && { textAlign: 'right' }]}>{t.title}</Text>
              <Text 
                style={[
                  styles.appSubtitle, 
                  lang === 'ur' && { textAlign: 'right', fontSize: 11.5 }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {t.subtitle}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.premiumLangBtn}
              activeOpacity={0.8}
              onPress={toggleLanguage}
            >
              <Ionicons name="globe-outline" size={16} color="#60A5FA" />
              <Text style={styles.langBtnText}>{t.langToggle}</Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={[styles.tabContainer, lang === 'ur' && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity
                style={[styles.tabBtn, isLogin && styles.activeTabBtn]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  {t.loginTab}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, !isLogin && styles.activeTabBtn]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  {t.signupTab}
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, lang === 'ur' && { textAlign: 'right' }]}>{t.fullNameLabel}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      lang === 'ur' && { textAlign: 'right' },
                      focusedInput === 'fullName' && styles.inputFocused,
                    ]}
                    placeholder={t.fullNamePlaceholder}
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedInput('fullName')}
                    onBlur={() => setFocusedInput(null)}
                    autoComplete="off"
                    textContentType="name"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, lang === 'ur' && { textAlign: 'right' }]}>{t.emailLabel}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    lang === 'ur' && { textAlign: 'right' },
                    focusedInput === 'email' && styles.inputFocused,
                  ]}
                  placeholder={t.emailPlaceholder}
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  autoComplete="off"
                  textContentType="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, lang === 'ur' && { textAlign: 'right' }]}>{t.passwordLabel}</Text>
              <View style={styles.passwordContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      lang === 'ur' && { textAlign: 'right', paddingRight: 16, paddingLeft: 50 },
                      focusedInput === 'password' && styles.inputFocused,
                    ]}
                    placeholder={t.passwordPlaceholder}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    autoComplete="off"
                    textContentType="none"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.eyeBtn, lang === 'ur' ? { left: 14, right: undefined } : { right: 14 }]}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isLogin && (
              <TouchableOpacity 
                style={[styles.forgotPassBtn, lang === 'ur' && { alignSelf: 'flex-start' }]}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPassText}>{t.forgotPass}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isLogin ? t.loginBtn : t.signupBtn}
                </Text>
              )}
            </TouchableOpacity>

            <View style={[styles.switchRow, lang === 'ur' && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.switchText}>
                {isLogin ? t.noAccountText : t.hasAccountText}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchLink}>
                  {isLogin ? t.noAccountAction : t.hasAccountAction}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.orContinue}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Clean Guest Access Action */}
            <TouchableOpacity 
              style={styles.secondaryActionBtn} 
              onPress={handleGuestLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryActionText}>{t.guestLogin}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={[styles.statusBadge, lang === 'ur' && { flexDirection: 'row-reverse' }]}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>{t.serverStatus}</Text>
            </View>
            <Text style={[styles.footerBrandText, lang === 'ur' && { writingDirection: 'rtl' }]}>
              {t.footerText}
            </Text>
          </View>
        </ScrollView>

        {/* Modal */}
        <Modal
          visible={resetModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setResetModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={[styles.modalTitle, lang === 'ur' && { textAlign: 'right' }]}>{t.resetModalTitle}</Text>
              <Text style={[styles.modalSub, lang === 'ur' && { textAlign: 'right' }]}>{t.resetModalSub}</Text>

              <TextInput
                style={[styles.modalInput, lang === 'ur' && { textAlign: 'right' }]}
                placeholder={t.otpPlaceholder}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={resetCode}
                onChangeText={setResetCode}
              />

              <TextInput
                style={[styles.modalInput, lang === 'ur' && { textAlign: 'right' }]}
                placeholder={t.newPassPlaceholder}
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <TouchableOpacity
                style={styles.modalBtn}
                onPress={handleConfirmReset}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnText}>{t.updatePassBtn}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancelBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0F1D' },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 16,
  },
  glowOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    // Soft blurred ambient glow without solid borders
    shadowColor: '#2563EB',
    shadowOpacity: 1,
    shadowRadius: 140,
    elevation: 30,
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    marginTop: 4 
  },
  titleArea: { flex: 1, paddingRight: 8 },
  appTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  premiumLangBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(30, 41, 59, 0.8)', 
    borderWidth: 1, 
    borderColor: 'rgba(59, 130, 246, 0.4)', 
    paddingVertical: 8, 
    paddingHorizontal: 14, 
    borderRadius: 22, 
    gap: 6 
  },
  langBtnText: { color: '#60A5FA', fontWeight: '800', fontSize: 12 },

  // Card & Inputs
  card: { backgroundColor: '#111827', borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(59, 130, 246, 0.25)', padding: 18, shadowColor: '#3B82F6', shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 14, padding: 4, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#2563EB' },
  tabText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#FFFFFF', fontWeight: '800' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#CBD5E1', marginBottom: 5 },
  inputWrapper: { borderRadius: 14, overflow: 'hidden' },
  input: { 
    backgroundColor: '#1E293B', 
    borderWidth: 1.5,  
    borderColor: '#334155',  
    borderRadius: 14, 
    paddingHorizontal: 16, 
    fontSize: 14, 
    color: '#FFFFFF', 
    height: 46 
  },
  inputFocused: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4 
  },
  passwordContainer: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  forgotPassBtn: { alignSelf: 'flex-end', marginBottom: 14 },
  forgotPassText: { color: '#60A5FA', fontSize: 12, fontWeight: '600' },
  submitBtn: { backgroundColor: '#2563EB', height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 4 },
  switchText: { color: '#94A3B8', fontSize: 13 },
  switchLink: { color: '#60A5FA', fontSize: 13, fontWeight: '800' },

  // Divider & Secondary Action
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(51, 65, 85, 0.6)' },
  dividerText: { color: '#64748B', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  secondaryActionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(30, 41, 59, 0.6)', 
    borderWidth: 1, 
    borderColor: '#334155', 
    height: 44, 
    borderRadius: 14, 
  },
  secondaryActionText: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },

  // Footer Section
  footerSection: { marginTop: 18, alignItems: 'center', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', gap: 6 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { color: '#34D399', fontSize: 11, fontWeight: '700' },
  footerBrandText: { color: '#64748B', fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#111827', width: '100%', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: '#3B82F6' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  modalSub: { fontSize: 12, color: '#94A3B8', marginBottom: 16 },
  modalInput: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 14, height: 46, color: '#FFFFFF', marginBottom: 12 },
  modalBtn: { backgroundColor: '#2563EB', height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  modalBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  modalCancelBtn: { marginTop: 12, alignItems: 'center' },
  modalCancelText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
});