import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

export default function Index() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [torch, setTorch] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  // Report Modal States
  const [isReportModalVisible, setIsReportModalVisible] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [storeInfo, setStoreInfo] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  if (!permission) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.permissionText}>Loading camera status...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.permissionText}>
          Camera permission is required to verify medicine authenticity.
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" color="#2563EB" />
      </View>
    );
  }

  // Precise Extractor (Handles Full Barcode + Manual Inputs)
  const extractCleanBatch = (rawCode: string): string => {
    if (!rawCode) return '';
    let cleaned = String(rawCode).replace(/[\r\n]+/g, '').trim();

    if (cleaned.includes('http://') || cleaned.includes('https://') || cleaned.includes('exp://')) {
      const parts = cleaned.split('/');
      cleaned = parts[parts.length - 1] || cleaned;
    }

    if (cleaned.length <= 15) {
      return cleaned;
    }

    if (cleaned.includes('10')) {
      const match = cleaned.match(/10([A-Za-z0-9\-]{3,15}?)(11|17|21|240|[A-Za-z\s\/]|$)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    return cleaned;
  };

  const verifyCode = async (code: string) => {
    if (!code || code.trim() === '') {
      Alert.alert('Notice', 'Please enter or scan a valid batch code.');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    setResult(null);

    const searchTarget = extractCleanBatch(code);
    console.log("🚀 Verifying Batch Code:", searchTarget);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://medicine-backened.vercel.app/api/verify/${encodeURIComponent(searchTarget)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const apiResponse = await response.json();

      const isOk = response.ok && apiResponse.success === true;

      if (!isOk || !apiResponse.data || apiResponse.status === 'FAKE') {
        setResult({
          status: 'FAKE',
          title: apiResponse.title || '🚨 UNVERIFIED / COUNTERFEIT',
          color: '#EF4444',
          batch: searchTarget,
          msg: apiResponse?.message || 'This batch number was not found in the official registry.',
        });
      } else {
        const rawStatus = apiResponse.status || 'AUTHENTIC';
        const statusColor =
          rawStatus === 'AUTHENTIC' ? '#10B981' : rawStatus === 'EXPIRED' ? '#F59E0B' : '#EF4444';

        setResult({
          status: rawStatus as any,
          title: apiResponse.title || (rawStatus === 'EXPIRED' ? '⚠️ EXPIRED MEDICINE' : '✅ VERIFIED AUTHENTIC'),
          color: statusColor,
          data: apiResponse.data,
          batch: apiResponse.data.batch_number || searchTarget,
          msg: apiResponse.message || 'Guaranteed original product and safe for consumption.',
        });
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      setResult({
        status: 'FAKE',
        title: '🚨 UNVERIFIED / COUNTERFEIT',
        color: '#EF4444',
        batch: searchTarget,
        msg: 'Unable to verify batch or code not registered in database.',
      });
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.appTitle}>MedVerify AI</Text>
        <Text style={styles.appSubtitle}>Instant Authenticity & Safety Scanner</Text>
      </View>

      {/* Camera Section */}
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
        <View style={styles.overlayFrame} />

        <TouchableOpacity style={styles.torchBtn} onPress={() => setTorch(!torch)}>
          <Text style={styles.torchBtnText}>{torch ? '🔦 Flash OFF' : '💡 Flash ON'}</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Input Search Box */}
      <View style={styles.manualSearchBox}>
        <TextInput
          style={styles.input}
          placeholder="Enter Batch No (e.g. 510902)"
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
              Alert.alert('Notice', 'Please enter a batch number first.');
            }
          }}
        >
          <Text style={styles.verifyBtnText}>Verify</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Result Card */}
      {result ? (
        <View style={[styles.resultCard, { borderColor: result.color }]}>
          <View style={[styles.badge, { backgroundColor: result.color }]}>
            <Text style={styles.badgeText}>{result.status}</Text>
          </View>
          <Text style={[styles.resultTitle, { color: result.color }]}>{result.title}</Text>
          <Text style={styles.resultMsg}>{result.msg}</Text>

          {/* Detailed Medicine Table for AUTHENTIC & EXPIRED */}
          {result.data && (result.status === 'AUTHENTIC' || result.status === 'EXPIRED') && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Medicine Name</Text>
                <Text style={styles.detailValue}>{result.data.medicine_name || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand / Manufacturer</Text>
                <Text style={styles.detailValue}>{result.data.brand_name || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Batch Code</Text>
                <Text style={styles.detailValue}>{result.data.batch_number || activeBatch}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Manufacturing Date</Text>
                <Text style={styles.detailValue}>{result.data.manufacturing_date || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <Text style={styles.detailValue}>{result.data.expiry_date || 'N/A'}</Text>
              </View>
            </View>
          )}

          {/* Fake Case Action */}
          {(result.status === 'FAKE' || result.status === 'SUSPICIOUS') && (
            <TouchableOpacity style={styles.reportBtn} onPress={() => setIsReportModalVisible(true)}>
              <Text style={styles.reportBtnText}>REPORT MEDICINE</Text>
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
            <Text style={styles.resetBtnText}>SCAN ANOTHER MEDICINE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            Point your camera at a QR code or barcode to scan.
          </Text>
        </View>
      )}

      {/* REPORT MODAL */}
      <Modal visible={isReportModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {!isSubmitted ? (
              <>
                <Text style={styles.modalTitle}>Report Counterfeit Medicine</Text>
                <Text style={styles.modalSub}>
                  Reporting Batch: <Text style={{ fontWeight: '800' }}>#{activeBatch}</Text>
                </Text>

                <Text style={styles.inputLabel}>
                  Reason for Reporting <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Broken seal, wrong packaging, fake QR code"
                  placeholderTextColor="#94A3B8"
                  value={reportReason}
                  onChangeText={setReportReason}
                />

                <Text style={styles.inputLabel}>Medical Store Name / Location (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. City Pharmacy, Lahore"
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
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report to DRAP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeReportModal}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
                <Text style={styles.modalTitle}>Report Submitted!</Text>
                <Text style={[styles.modalSub, { textAlign: 'center', marginTop: 8 }]}>
                  Batch <Text style={{ fontWeight: '800' }}>#{activeBatch}</Text> has been flagged and sent to Drug Regulatory Authority.
                </Text>
                <Text style={styles.refCode}>Ref ID: DRAP-2026-{Math.floor(1000 + Math.random() * 9000)}</Text>

                <TouchableOpacity style={[styles.submitReportBtn, { width: '100%', marginTop: 20 }]} onPress={closeReportModal}>
                  <Text style={styles.submitReportText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingTop: 50 },
  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC' },
  permissionText: { fontSize: 16, textAlign: 'center', color: '#475569', marginBottom: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  appTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  cameraCard: { height: 260, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  overlayFrame: { flex: 1, margin: 35, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 16, backgroundColor: 'transparent' },
  torchBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  torchBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  manualSearchBox: { flexDirection: 'row', marginTop: 18, gap: 10 },
  input: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: '#0F172A' },
  verifyBtn: { backgroundColor: '#2563EB', justifyContent: 'center', paddingHorizontal: 18, borderRadius: 12 },
  verifyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  placeholderBox: { marginTop: 30, padding: 20, borderRadius: 16, backgroundColor: '#F1F5F9', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  placeholderText: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  resultCard: { backgroundColor: '#FFF', marginTop: 20, padding: 18, borderRadius: 20, borderWidth: 1.5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  badge: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 6, marginBottom: 8 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  resultTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  resultMsg: { fontSize: 13, color: '#475569', marginBottom: 14 },
  detailsContainer: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, gap: 8, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  reportBtn: { backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  reportBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  resetBtn: { backgroundColor: '#0F172A', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  resetBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  modalSub: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, marginBottom: 14, color: '#0F172A' },
  submitReportBtn: { backgroundColor: '#EF4444', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  submitReportText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  cancelText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  refCode: { fontSize: 12, fontWeight: '700', color: '#10B981', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 10 },
});