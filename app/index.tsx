import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  DeviceEventEmitter,
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

interface Medicine {
  id?: number;
  medicine_name?: string;
  brand_name?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  qr_hash?: string;
  status?: string;
}

interface VerificationResult {
  status: 'AUTHENTIC' | 'EXPIRED' | 'FAKE' | 'SUSPICIOUS';
  title: string;
  color: string;
  msg: string;
  data?: Medicine;
  batch?: string;
}

const translations = {
  en: {
    appTitle: "MedVerify AI",
    appSubtitle: "Instant Authenticity & Safety Scanner",
    langToggle: "اردو",
    flashOn: "💡 Flash ON",
    flashOff: "🔦 Flash OFF",
    placeholder: "Enter Batch No or Medicine Name",
    verifyBtn: "Verify",
    scanPrompt: "Point your camera at a QR code or barcode to scan.",
    reportMedicine: "REPORT MEDICINE",
    scanAnother: "SCAN ANOTHER MEDICINE",
    modalTitle: "Report Counterfeit Medicine",
    reportingBatch: "Reporting Batch: ",
    reasonLabel: "Reason for Reporting *",
    reasonPlaceholder: "e.g. Broken seal, wrong packaging, fake QR code",
    storeLabel: "Medical Store Name / Location (Optional)",
    storePlaceholder: "e.g. City Pharmacy, Lahore",
    submitReport: "Submit Report to DRAP",
    submitting: "Submitting...",
    cancel: "Cancel",
    reportSuccess: "Report Submitted!",
    done: "Done",
  },
  ur: {
    appTitle: "میڈ ویریفائی AI",
    appSubtitle: "فوری اصلیت اور حفاظت کا سکینر",
    langToggle: "English",
    flashOn: "💡 فلیش آن",
    flashOff: "🔦 فلیش آف",
    placeholder: "بیچ نمبر یا دوائی کا نام درج کریں",
    verifyBtn: "تصدیق کریں",
    scanPrompt: "کیمرے کو QR یا بارکوڈ کی طرف کریں۔",
    reportMedicine: "دوائی کی شکایت درج کریں",
    scanAnother: "دوسری دوائی سکین کریں",
    modalTitle: "جعلی دوائی کی رپورٹ کریں",
    reportingBatch: "رپورٹ شدہ بیچ: ",
    reasonLabel: "شکایت کی وجہ *",
    reasonPlaceholder: "مثلاً ٹوٹی ہوئی سیل، غلط پیکنگ، جعلی کیو آر کوڈ",
    storeLabel: "میڈیکل سٹور کا نام / مقام (اختیاری)",
    storePlaceholder: "مثلاً سٹی فارمیسی، لاہور",
    submitReport: "ڈریپ (DRAP) کو رپورٹ بھیجیں",
    submitting: "جمع ہو رہا ہے...",
    cancel: "منسوخ کریں",
    reportSuccess: "رپورٹ جمع ہو گئی!",
    done: "مکمل",
  }
};

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const t = translations[lang];

  const scrollViewRef = useRef<ScrollView>(null);

  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [torch, setTorch] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  const [isReportModalVisible, setIsReportModalVisible] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [storeInfo, setStoreInfo] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  useEffect(() => {
    checkUserLogin();
    warmUpServerAndSpeech();
  }, []);

  const checkUserLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang === 'ur' || savedLang === 'en') {
        setLang(savedLang);
      }
      if (!token) {
        router.replace('/auth');
      }
    } catch (e) {
      console.log('Auth Check Error:', e);
    } finally {
      setCheckingAuth(false);
    }
  };

  const warmUpServerAndSpeech = async () => {
    try {
      fetch('https://medicine-backened.vercel.app/')
        .then(() => console.log('Server warmed up successfully'))
        .catch(() => {});

      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        Speech.speak('', { rate: 1.0 });
      }
    } catch (error) {
      console.log('Warm-up error:', error);
    }
  };

  const playVoiceAlert = (status: string) => {
    try {
      Speech.stop();
      let speechText = '';
      let speechLang = lang === 'ur' ? 'ur-PK' : 'en-US';

      if (status === 'FAKE' || status === 'SUSPICIOUS') {
        speechText = lang === 'ur' ? 'خطرہ! یہ دوائی جعلی یا غیر مصدقہ ہے۔' : 'Warning! Fake or unverified medicine detected.';
      } else if (status === 'EXPIRED') {
        speechText = lang === 'ur' ? 'خبردار! اس دوائی کی معیاد ختم ہو چکی ہے۔' : 'Warning! Expired medicine detected.';
      }

      if (speechText) {
        Speech.speak(speechText, { language: speechLang, pitch: 1.1, rate: 0.85 });
      }
    } catch (error) {
      console.log('Error playing voice alert:', error);
    }
  };

  const saveScanToHistory = async (medicineName: string, status: string, details: string, batchNo: string) => {
    try {
      let mappedStatus: 'Authentic' | 'Counterfeit' | 'Suspicious' = 'Suspicious';
      if (status === 'AUTHENTIC') mappedStatus = 'Authentic';
      else if (status === 'FAKE' || status === 'EXPIRED') mappedStatus = 'Counterfeit';

      const newRecord = {
        id: Date.now().toString(),
        medicineName: medicineName || 'Unknown Medicine',
        status: mappedStatus,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        details: details || 'No additional details provided.',
        batchNumber: batchNo,
      };

      const existingHistory = await AsyncStorage.getItem('scanHistory');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      const updatedHistory = [newRecord, ...historyArray];
      
      await AsyncStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.log('Error saving scan history:', error);
    }
  };

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (checkingAuth) {
    return (
      <View style={styles.containerCenter}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!permission || !permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.permissionText}>Camera permission is required to verify medicine authenticity.</Text>
        <Button onPress={requestPermission} title="Grant Permission" color="#2563EB" />
      </View>
    );
  }

  const extractCleanBatch = (rawCode: string): string => {
    if (!rawCode) return '';
    let cleaned = String(rawCode).replace(/[\r\n]+/g, '').trim();

    if (cleaned.includes('http://') || cleaned.includes('https://') || cleaned.includes('exp://')) {
      const parts = cleaned.split('/');
      cleaned = parts[parts.length - 1] || cleaned;
    }

    if (cleaned.length <= 15) return cleaned;

    if (cleaned.includes('10')) {
      const match = cleaned.match(/10([A-Za-z0-9\-]{3,15}?)(11|17|21|240|[A-Za-z\s\/]|$)/);
      if (match && match[1]) return match[1];
    }

    return cleaned;
  };

  const verifyCode = async (code: string) => {
    Keyboard.dismiss();

    if (!code || code.trim() === '') {
      Alert.alert('Notice', 'Please enter or scan a valid batch code or medicine name.');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    setResult(null);

    const searchTarget = extractCleanBatch(code);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://medicine-backened.vercel.app/api/verify/${encodeURIComponent(searchTarget)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const apiResponse = await response.json();
      const isOk = response.ok && apiResponse.success === true;

      if (!isOk || !apiResponse.data || apiResponse.status === 'FAKE') {
        const fakeMsg = lang === 'ur' ? 'یہ بیچ نمبر یا دوائی سرکاری ریکارڈ میں نہیں ملی۔' : (apiResponse?.message || 'This medicine or batch number was not found in the official registry.');
        
        setResult({
          status: 'FAKE',
          title: lang === 'ur' ? '🚨 جعلی / غیر مصدقہ پروڈکٹ' : (apiResponse.title || '🚨 UNVERIFIED / COUNTERFEIT'),
          color: '#EF4444',
          batch: searchTarget,
          msg: fakeMsg,
        });
        playVoiceAlert('FAKE');

        await saveScanToHistory('Unverified Medicine', 'FAKE', fakeMsg, searchTarget);

      } else {
        const rawStatus = apiResponse.status || 'AUTHENTIC';
        const statusColor = rawStatus === 'AUTHENTIC' ? '#10B981' : rawStatus === 'EXPIRED' ? '#F59E0B' : '#EF4444';
        const successMsg = lang === 'ur' ? 'محفوظ اور اصل پروڈکٹ ہے۔' : (apiResponse.message || 'Guaranteed original product and safe for consumption.');

        setResult({
          status: rawStatus as any,
          title: lang === 'ur' 
            ? (rawStatus === 'EXPIRED' ? '⚠️ معیاد ختم شدہ دوائی' : '✅ اصلی اور تصدیق شدہ')
            : (apiResponse.title || (rawStatus === 'EXPIRED' ? '⚠️ EXPIRED MEDICINE' : '✅ VERIFIED AUTHENTIC')),
          color: statusColor,
          data: apiResponse.data,
          batch: apiResponse.data.batch_number || searchTarget,
          msg: successMsg,
        });
        playVoiceAlert(rawStatus);

        await saveScanToHistory(
          apiResponse.data.medicine_name || 'Medicine', 
          rawStatus, 
          successMsg, 
          apiResponse.data.batch_number || searchTarget
        );
      }

    } catch (error: any) {
      const errorMsg = lang === 'ur' ? 'تصدیق کرنے میں ناکامی یا کوڈ ڈیٹا بیس میں رجسٹرڈ نہیں۔' : 'Unable to verify or code not registered in database.';
      
      setResult({
        status: 'FAKE',
        title: lang === 'ur' ? '🚨 جعلی / غیر مصدقہ پروڈکٹ' : '🚨 UNVERIFIED / COUNTERFEIT',
        color: '#EF4444',
        batch: searchTarget,
        msg: errorMsg,
      });
      playVoiceAlert('FAKE');

      await saveScanToHistory('Unverified Medicine', 'FAKE', errorMsg, searchTarget);

    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult): void => {
    if (!isProcessing && !result && data) {
      verifyCode(data);
    }
  };

  const activeBatch = result?.data?.batch_number || result?.batch || manualCode || 'N/A';

  const handleReportSubmit = async () => {
    if (isSubmittingReport) return;

    if (!reportReason.trim() || reportReason.trim().length < 5) {
      Alert.alert('Required Field', 'Please enter a valid reason for reporting (minimum 5 characters).');
      return;
    }

    setIsSubmittingReport(true);

    try {
      const response = await fetch('https://medicine-backened.vercel.app/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_number: activeBatch,
          reason: reportReason.trim(),
          store_location: storeInfo.trim() || 'Not specified',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        Alert.alert('Submission Error', errorData.message || 'Failed to submit report.');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not reach server. Please check your internet connection.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const closeReportModal = () => {
    setIsReportModalVisible(false);
    setIsSubmitted(false);
    setReportReason('');
    setStoreInfo('');
  };

  const topPadding = Platform.OS === 'android'
    ? Math.max(insets.top, StatusBar.currentHeight || 24) + 16
    : insets.top + 16;

  const isUrdu = lang === 'ur';

  return (
    <View style={[styles.safeContainer, { paddingTop: topPadding }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1D" translucent={true} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          <View style={[styles.headerContainer, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}>
            <View style={[styles.titleArea, { alignItems: isUrdu ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.appTitle, { textAlign: isUrdu ? 'right' : 'left' }]}>{t.appTitle}</Text>
              <Text 
                style={[styles.appSubtitle, { textAlign: isUrdu ? 'right' : 'left' }]} 
                numberOfLines={1} 
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {t.appSubtitle}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.premiumLangBtn} 
              activeOpacity={0.8}
              onPress={async () => {
                const newLang = lang === 'en' ? 'ur' : 'en';
                setLang(newLang);
                await AsyncStorage.setItem('appLanguage', newLang);
                DeviceEventEmitter.emit('languageChanged');
              }}
            >
              <Text style={styles.langIcon}>🌐</Text>
              <Text style={styles.langBtnText}>{t.langToggle}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cameraWrapper}>
            <View style={styles.cameraCard}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={torch}
                onBarcodeScanned={isProcessing || result ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'code128', 'ean13', 'ean8', 'datamatrix', 'pdf417'],
                }}
              />
              <View style={styles.overlayFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>

              <TouchableOpacity style={styles.torchBtn} onPress={() => setTorch(!torch)}>
                <Text style={styles.torchBtnText}>{torch ? t.flashOff : t.flashOn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Manual Search Box - Clean, Linter-Error Free & Fully Responsive */}
          <View style={[styles.manualSearchBox, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}>
            <TextInput
              style={[
                styles.input, 
                { textAlign: isUrdu ? 'right' : 'left' }
              ]}
              placeholder={t.placeholder}
              placeholderTextColor="#94A3B8"
              value={manualCode}
              onChangeText={setManualCode}
            />
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={() => {
                if (manualCode.trim().length > 0) {
                  verifyCode(manualCode);
                } else {
                  Alert.alert('Notice', 'Please enter a batch number or medicine name first.');
                }
              }}
            >
              <Text style={styles.verifyBtnText}>{t.verifyBtn}</Text>
            </TouchableOpacity>
          </View>

          {result ? (
            <View style={[styles.resultCard, { borderColor: result.color }]}>
              <View style={[styles.badge, { backgroundColor: result.color, alignSelf: isUrdu ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.badgeText}>{result.status}</Text>
              </View>
              <Text style={[styles.resultTitle, { color: result.color, textAlign: isUrdu ? 'right' : 'left' }]}>{result.title}</Text>
              <Text style={[styles.resultMsg, { textAlign: isUrdu ? 'right' : 'left' }]}>{result.msg}</Text>

              {result.data && (result.status === 'AUTHENTIC' || result.status === 'EXPIRED') && (
                <View style={styles.detailsContainer}>
                  <View style={[styles.detailRow, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { textAlign: isUrdu ? 'right' : 'left', marginLeft: isUrdu ? 8 : 0, marginRight: isUrdu ? 0 : 8 }]}>{lang === 'ur' ? 'دوائی کا نام' : 'Medicine Name'}</Text>
                    <Text style={[styles.detailValue, { textAlign: isUrdu ? 'left' : 'right' }]} numberOfLines={1} ellipsizeMode="tail">{result.data.medicine_name || 'N/A'}</Text>
                  </View>
                  <View style={[styles.detailRow, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { textAlign: isUrdu ? 'right' : 'left', marginLeft: isUrdu ? 8 : 0, marginRight: isUrdu ? 0 : 8 }]}>{lang === 'ur' ? 'کمپنی / برانڈ' : 'Brand / Manufacturer'}</Text>
                    <Text style={[styles.detailValue, { textAlign: isUrdu ? 'left' : 'right' }]} numberOfLines={1} ellipsizeMode="tail">{result.data.brand_name || 'N/A'}</Text>
                  </View>
                  <View style={[styles.detailRow, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { textAlign: isUrdu ? 'right' : 'left', marginLeft: isUrdu ? 8 : 0, marginRight: isUrdu ? 0 : 8 }]}>{lang === 'ur' ? 'بیچ کوڈ' : 'Batch Code'}</Text>
                    <Text style={[styles.detailValue, { textAlign: isUrdu ? 'left' : 'right' }]} numberOfLines={1} ellipsizeMode="tail">{result.data.batch_number || activeBatch}</Text>
                  </View>
                  <View style={[styles.detailRow, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { textAlign: isUrdu ? 'right' : 'left', marginLeft: isUrdu ? 8 : 0, marginRight: isUrdu ? 0 : 8 }]}>{lang === 'ur' ? 'تیاری کی تاریخ' : 'Manufacturing Date'}</Text>
                    <Text style={[styles.detailValue, { textAlign: isUrdu ? 'left' : 'right' }]} numberOfLines={1} ellipsizeMode="tail">{result.data.manufacturing_date || 'N/A'}</Text>
                  </View>
                  <View style={[styles.detailRow, { flexDirection: isUrdu ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.detailLabel, { textAlign: isUrdu ? 'right' : 'left', marginLeft: isUrdu ? 8 : 0, marginRight: isUrdu ? 0 : 8 }]}>{lang === 'ur' ? 'تاریخِ میعاد' : 'Expiry Date'}</Text>
                    <Text style={[styles.detailValue, { textAlign: isUrdu ? 'left' : 'right' }]} numberOfLines={1} ellipsizeMode="tail">{result.data.expiry_date || 'N/A'}</Text>
                  </View>
                </View>
              )}

              {(result.status === 'FAKE' || result.status === 'SUSPICIOUS') && (
                <TouchableOpacity style={styles.reportBtn} onPress={() => setIsReportModalVisible(true)}>
                  <Text style={styles.reportBtnText}>{t.reportMedicine}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setIsProcessing(false);
                  setResult(null);
                  setManualCode('');
                }}
              >
                <Text style={styles.resetBtnText}>{t.scanAnother}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.scannerIconPlaceholder}>📷</Text>
              <Text style={[styles.placeholderText, { textAlign: 'center' }]}>{t.scanPrompt}</Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isReportModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {!isSubmitted ? (
              <>
                <Text style={[styles.modalTitle, { textAlign: isUrdu ? 'right' : 'left' }]}>{t.modalTitle}</Text>
                <Text style={[styles.modalSub, { textAlign: isUrdu ? 'right' : 'left' }]}>
                  {t.reportingBatch} <Text style={{ fontWeight: '800' }}>#{activeBatch}</Text>
                </Text>

                <Text style={[styles.inputLabel, { textAlign: isUrdu ? 'right' : 'left' }]}>{t.reasonLabel}</Text>
                <TextInput
                  style={[styles.modalInput, { textAlign: isUrdu ? 'right' : 'left' }]}
                  placeholder={t.reasonPlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={reportReason}
                  onChangeText={setReportReason}
                />

                <Text style={[styles.inputLabel, { textAlign: isUrdu ? 'right' : 'left' }]}>{t.storeLabel}</Text>
                <TextInput
                  style={[styles.modalInput, { textAlign: isUrdu ? 'right' : 'left' }]}
                  placeholder={t.storePlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={storeInfo}
                  onChangeText={setStoreInfo}
                />

                <TouchableOpacity
                  style={[styles.submitReportBtn, isSubmittingReport && { backgroundColor: '#94A3B8' }]}
                  onPress={handleReportSubmit}
                  disabled={isSubmittingReport}
                >
                  <Text style={styles.submitReportText}>
                    {isSubmittingReport ? t.submitting : t.submitReport}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeReportModal}>
                  <Text style={styles.cancelText}>{t.cancel}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
                <Text style={[styles.modalTitle, { textAlign: 'center' }]}>{t.reportSuccess}</Text>
                <Text style={[styles.modalSub, { textAlign: 'center', marginTop: 8 }]}>
                  Batch / Medicine <Text style={{ fontWeight: '800' }}>#{activeBatch}</Text> has been flagged and sent to Drug Regulatory Authority.
                </Text>
                <Text style={styles.refCode}>Ref ID: DRAP-2026-{Math.floor(1000 + Math.random() * 9000)}</Text>

                <TouchableOpacity style={[styles.submitReportBtn, { width: '100%', marginTop: 20 }]} onPress={closeReportModal}>
                  <Text style={styles.submitReportText}>{t.done}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#0A0F1D' },
  container: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 150 
  },
  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0A0F1D' },
  permissionText: { fontSize: 16, textAlign: 'center', color: '#94A3B8', marginBottom: 20 },
  
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleArea: { flex: 1, marginRight: 10 },
  appTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 11.5, color: '#94A3B8', marginTop: 2 },
  
  premiumLangBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(30, 41, 59, 0.8)', 
    borderWidth: 1, 
    borderColor: 'rgba(59, 130, 246, 0.4)', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 22, 
    elevation: 4,
    gap: 4
  },
  langIcon: { fontSize: 13 },
  langBtnText: { color: '#60A5FA', fontWeight: '800', fontSize: 11 },

  cameraWrapper: { 
    borderRadius: 24, 
    borderWidth: 1.5, 
    borderColor: 'rgba(59, 130, 246, 0.3)', 
    shadowColor: '#3B82F6', 
    shadowOpacity: 0.25, 
    shadowRadius: 12, 
    elevation: 6, 
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  cameraCard: { height: 210, width: '100%', position: 'relative' },
  overlayFrame: { flex: 1, margin: 24, borderWidth: 1.5, borderColor: 'rgba(59, 130, 246, 0.6)', borderRadius: 16, backgroundColor: 'transparent', position: 'relative' },
  
  corner: { position: 'absolute', width: 16, height: 16, borderColor: '#3B82F6' },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },

  torchBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15, 23, 42, 0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  torchBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  
  manualSearchBox: { marginTop: 14, marginBottom: 14, gap: 10 },
  input: { flex: 1, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 10, fontSize: 11, color: '#FFFFFF', height: 48 },
  verifyBtn: { backgroundColor: '#2563EB', justifyContent: 'center', paddingHorizontal: 18, borderRadius: 14, height: 48, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  verifyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  
  placeholderBox: { marginTop: 4, padding: 16, borderRadius: 20, backgroundColor: '#111827', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#334155', alignItems: 'center' },
  scannerIconPlaceholder: { fontSize: 22, marginBottom: 4 },
  placeholderText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', fontWeight: '500' },
  
  resultCard: { backgroundColor: '#111827', marginTop: 10, padding: 20, borderRadius: 22, borderWidth: 1.5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, marginBottom: 10 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  resultTitle: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  resultMsg: { fontSize: 13, color: '#94A3B8', marginBottom: 16, lineHeight: 18 },
  detailsContainer: { backgroundColor: '#1E293B', padding: 14, borderRadius: 14, gap: 10, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#334155' },
  detailLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '500', flex: 1, marginRight: 8 },
  detailValue: { fontSize: 12, fontWeight: '700', color: '#F8FAFC', flex: 1.2, textAlign: 'right' },
  reportBtn: { backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10, shadowColor: '#EF4444', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  reportBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  resetBtn: { backgroundColor: '#334155', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  resetBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 15, 29, 0.85)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#111827', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#334155', elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  modalSub: { fontSize: 13, color: '#94A3B8', marginTop: 4, marginBottom: 18 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#CBD5E1', marginBottom: 6 },
  modalInput: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: '#FFFFFF' },
  submitReportBtn: { backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitReportText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  cancelText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  refCode: { fontSize: 12, fontWeight: '800', color: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 12, overflow: 'hidden' },
});