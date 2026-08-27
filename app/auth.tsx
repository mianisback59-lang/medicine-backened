import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const translations = {
  en: {
    badge: "AI SECURE SYSTEM",
    title: "MedVerify AI",
    subtitle: "Instant Authenticity & Safety Scanner",
    langToggle: "اردو",
    loginTab: "Sign In",
    signupTab: "Create Account",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: " ",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: " ",
    forgotPass: "Forgot Password?",
    loginBtn: "Sign In",
    signupBtn: "Create Account",
    noAccount: "Don't have an account? ",
    hasAccount: "Already have an account? ",
    toggleSignUp: "Sign Up",
    toggleSignIn: "Sign In",
  },
  ur: {
    badge: "AI سیکور سسٹم",
    title: "میڈ ویریفائی اے آئی",
    subtitle: "فوری اصلیت اور حفاظت کا سکینر",
    langToggle: "English",
    loginTab: "سائن ان",
    signupTab: "نیا اکاؤنٹ بنائیں",
    fullNameLabel: "پورا نام",
    fullNamePlaceholder: " ",
    emailLabel: "ای میل ایڈریس",
    emailPlaceholder: "name@example.com",
    passwordLabel: "پاس ورڈ",
    passwordPlaceholder: " ",
    forgotPass: "پاس ورڈ بھول گئے؟",
    loginBtn: "سائن ان کریں",
    signupBtn: "اکاؤنٹ بنائیں",
    noAccount: "کیا اکاؤنٹ نہیں ہے؟ ",
    hasAccount: "پہلے سے اکاؤنٹ موجود ہے؟ ",
    toggleSignUp: "سائن اپ کریں",
    toggleSignIn: "سائن ان کریں",
  }
};

export default function AuthScreen() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const t = translations[lang];

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        // Agar pehle se logged in hai, toh scanner page par bhej dein
        router.replace('/');
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Language toggle karne par state update ho gi
  const toggleLanguage = async () => {
    const newLang = lang === 'en' ? 'ur' : 'en';
    setLang(newLang);
    // Language preference ko local storage mein save kar liya
    await AsyncStorage.setItem('appLanguage', newLang);
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
        // Save user token
        await AsyncStorage.setItem('userToken', data.token || email);
        
        // Ensure language is also saved before redirecting
        await AsyncStorage.setItem('appLanguage', lang);

        router.replace('/'); 
      } else {
        Alert.alert('Failed', data.message || 'Authentication failed. Please check your details.');
      }

    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.titleArea}>
            <View style={styles.badgeRow}>
              <View style={styles.aiDot} />
              <Text style={styles.aiBadgeText}>{t.badge}</Text>
            </View>
            <Text style={styles.appTitle}>{t.title}</Text>
            <Text style={styles.appSubtitle}>{t.subtitle}</Text>
          </View>

          {/* Language Toggle Button */}
          <TouchableOpacity
            style={styles.premiumLangBtn}
            activeOpacity={0.8}
            onPress={toggleLanguage}
          >
            <Text style={styles.langIcon}>🌐</Text>
            <Text style={styles.langBtnText}>{t.langToggle}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
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
              <TextInput
                style={[styles.input, lang === 'ur' && { textAlign: 'right' }]}
                placeholder={t.fullNamePlaceholder}
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, lang === 'ur' && { textAlign: 'right' }]}>{t.emailLabel}</Text>
            <TextInput
              style={[styles.input, lang === 'ur' && { textAlign: 'right' }]}
              placeholder={t.emailPlaceholder}
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, lang === 'ur' && { textAlign: 'right' }]}>{t.passwordLabel}</Text>
            <TextInput
              style={[styles.input, lang === 'ur' && { textAlign: 'right' }]}
              placeholder={t.passwordPlaceholder}
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassBtn}>
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

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isLogin ? t.noAccount : t.hasAccount}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchLink}>
                {isLogin ? t.toggleSignUp : t.toggleSignIn}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0F1D' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  titleArea: { flex: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6' },
  aiBadgeText: { fontSize: 10, fontWeight: '800', color: '#3B82F6', letterSpacing: 1 },
  appTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  premiumLangBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.8)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.4)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 22, gap: 6 },
  langIcon: { fontSize: 14 },
  langBtnText: { color: '#60A5FA', fontWeight: '800', fontSize: 12 },
  card: { backgroundColor: '#111827', borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(59, 130, 246, 0.3)', padding: 22, shadowColor: '#3B82F6', shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 14, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#2563EB' },
  tabText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  activeTabText: { color: '#FFFFFF', fontWeight: '800' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#CBD5E1', marginBottom: 6 },
  input: { backgroundColor: '#1E293B', borderStyle: 'solid', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 16, fontSize: 14, color: '#FFFFFF', height: 48 },
  forgotPassBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPassText: { color: '#60A5FA', fontSize: 12, fontWeight: '600' },
  submitBtn: { backgroundColor: '#2563EB', height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, marginTop: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  switchText: { color: '#94A3B8', fontSize: 13 },
  switchLink: { color: '#60A5FA', fontSize: 13, fontWeight: '800' },
});