import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScanRecord {
  id: string;
  medicineName: string;
  status: 'Authentic' | 'Unverified' | 'Suspicious' | 'Expired';
  date: string;
  details: string;
  batchNumber?: string;
  expiryDate?: string;
}

const translations = {
  en: {
    scanHistory: 'Scan History',
    clearAll: 'Clear All',
    searchPlaceholder: 'Search medicine or batch...',
    all: 'All',
    authentic: 'Authentic',
    unverified: 'Unverified',
    suspicious: 'Suspicious',
    expired: 'Expired',
    noScansYet: 'No Scans Yet',
    noScansSubtitle: 'Your scanned medicines will appear here automatically once you verify them.',
    noResults: 'No Results Found',
    noResultsSubtitle: 'No matching scans found for your search or filter criteria.',
    viewDetails: 'View Details ›',
    scanReport: 'Scan Report',
    medicine: 'Medicine:',
    status: 'Status:',
    dateTime: 'Date & Time:',
    batchNo: 'Batch No:',
    expiryDate: 'Expiry Date:',
    verificationDetails: 'Verification Details:',
    deleteRecord: 'Delete Record',
    close: 'Close',
    unverifiedMedicine: 'Unverified Medicine',
    authenticMedicine: 'Authentic Medicine',
    batchNotFound: 'This batch number was not found in the official registry.',
  },
  ur: {
    scanHistory: 'اسکین ہسٹری',
    clearAll: 'سب صاف کریں',
    searchPlaceholder: 'دوائی یا بیچ تلاش کریں...',
    all: 'سب',
    authentic: 'اصل',
    unverified: 'غیر تصدیق شدہ',
    suspicious: 'مشکوک',
    expired: 'معطیل / ایکسپائرڈ',
    noScansYet: 'کوئی اسکین موجود نہیں',
    noScansSubtitle: 'آپ کی اسکین کردہ دوائیاں تصدیق کے بعد یہاں خود بخود ظاہر ہوں گی۔',
    noResults: 'کوئی نتیجہ نہیں ملا',
    noResultsSubtitle: 'آپ کی تلاش یا فلٹر کے مطابق کوئی اسکین نہیں ملا۔',
    viewDetails: 'تفصیلات دیکھیں ›',
    scanReport: 'اسکین رپورٹ',
    medicine: 'دوائی:',
    status: 'حیثیت:',
    dateTime: 'تاریخ اور وقت:',
    batchNo: 'بیچ نمبر:',
    expiryDate: 'معطلی کی تاریخ (Expiry):',
    verificationDetails: 'تصدیقی تفصیلات:',
    deleteRecord: 'ریکارڈ حذف کریں',
    close: 'بند کریں',
    unverifiedMedicine: 'غیر تصدیق شدہ دوائی',
    authenticMedicine: 'اصل دوائی',
    batchNotFound: 'یہ بیچ نمبر سرکاری رجسٹر میں نہیں پایا گیا۔',
  },
} as const;

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [historyList, setHistoryList] = useState<ScanRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScanRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ur'>('en');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  useFocusEffect(
    useCallback(() => {
      loadHistoryAndLanguage();
    }, [])
  );

  const loadHistoryAndLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang === 'ur' || savedLang === 'en') {
        setCurrentLang(savedLang);
      }

      const savedHistory = await AsyncStorage.getItem('scanHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        const updated = parsed.map((item: any) => ({
          ...item,
          status: item.status === 'Counterfeit' ? 'Unverified' : item.status
        }));
        setHistoryList(updated);
      } else {
        setHistoryList([]);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem('scanHistory');
      setHistoryList([]);
    } catch (error) {
      console.log('Error clearing history:', error);
    }
  };

  const deleteSpecificRecord = async (id: string) => {
    try {
      const updatedList = historyList.filter((item) => item.id !== id);
      setHistoryList(updatedList);
      await AsyncStorage.setItem('scanHistory', JSON.stringify(updatedList));
      setIsModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.log('Error deleting record:', error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Authentic':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399', icon: '✅' };
      case 'Unverified':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', icon: '❌' };
      case 'Expired':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#ef4444', icon: '⌛' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', icon: '⚠️' };
    }
  };

  const t = translations[currentLang];
  const isUrdu = currentLang === 'ur';

  // Helper to translate dynamic generic names instantly based on current language
  const getLocalizedMedicineName = (name: string) => {
    if (name === 'Unverified Medicine' || name === 'غیر تصدیق شدہ دوائی') {
      return t.unverifiedMedicine;
    }
    if (name === 'Authentic Medicine' || name === 'اصل دوائی') {
      return t.authenticMedicine;
    }
    return name;
  };

  const getLocalizedDetails = (details: string) => {
    if (details.includes('batch number was not found') || details.includes('بیچ نمبر سرکاری رجسٹر')) {
      return t.batchNotFound;
    }
    return details;
  };

  const filteredList = historyList.filter((item) => {
    const localizedName = getLocalizedMedicineName(item.medicineName);
    const matchesSearch = 
      localizedName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.batchNumber && item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'All') return matchesSearch;
    return matchesSearch && item.status === selectedFilter;
  });

  const renderItem = ({ item }: { item: ScanRecord }) => {
    const statusStyle = getStatusStyle(item.status);
    
    const statusLabels: Record<'Authentic' | 'Unverified' | 'Suspicious' | 'Expired', string> = {
      Authentic: t.authentic,
      Unverified: t.unverified,
      Suspicious: t.suspicious,
      Expired: t.expired,
    };
    const statusLabel = statusLabels[item.status] || item.status;
    const displayName = getLocalizedMedicineName(item.medicineName);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => {
          setSelectedItem(item);
          setIsModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.medicineIcon}>💊</Text>
            <Text style={[styles.medicineName, isUrdu && { textAlign: 'right' }]} numberOfLines={1}>{displayName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.icon} {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>📅 {item.date}</Text>
          <Text style={styles.viewDetailsText}>{t.viewDetails}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: 'All', label: t.all },
    { key: 'Authentic', label: t.authentic },
    { key: 'Unverified', label: t.unverified },
    { key: 'Suspicious', label: t.suspicious },
    { key: 'Expired', label: t.expired },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.contentContainer, { paddingTop: Math.max(insets.top + 10, 20) }]}>
          {/* Header - Title & Clear Button */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t.scanHistory}</Text>
            {historyList.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearAllHistory} activeOpacity={0.8}>
                <Text style={styles.clearBtnText}>{t.clearAll}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar & Horizontal Scrollable Filter Pills */}
          {historyList.length > 0 && (
            <View style={styles.filterSection}>
              <TextInput
                style={[styles.searchBar, isUrdu && { textAlign: 'right' }]}
                placeholder={t.searchPlaceholder}
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillContainer}
              >
                {filterButtons.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.pill,
                      selectedFilter === filter.key && styles.pillActive
                    ]}
                    onPress={() => setSelectedFilter(filter.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.pillText,
                      selectedFilter === filter.key && styles.pillTextActive
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* List or Empty State */}
          {historyList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>{t.noScansYet}</Text>
              <Text style={styles.emptySubtitle}>{t.noScansSubtitle}</Text>
            </View>
          ) : filteredList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>{t.noResults}</Text>
              <Text style={styles.emptySubtitle}>{t.noResultsSubtitle}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredList}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 6 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>

      {/* Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.scanReport}</Text>

            {selectedItem && (
              <View style={styles.modalBody}>
                <View style={[styles.modalRow, isUrdu && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.modalLabel, isUrdu && { textAlign: 'right' }]}>{t.medicine}</Text>
                  <Text style={[styles.modalValue, isUrdu && { textAlign: 'left' }]}>
                    {getLocalizedMedicineName(selectedItem.medicineName)}
                  </Text>
                </View>

                <View style={[styles.modalRow, isUrdu && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.modalLabel, isUrdu && { textAlign: 'right' }]}>{t.status}</Text>
                  <Text style={[styles.modalValue, { color: getStatusStyle(selectedItem.status).text }, isUrdu && { textAlign: 'left' }]}>
                    {selectedItem.status === 'Authentic' ? t.authentic : selectedItem.status === 'Unverified' ? t.unverified : selectedItem.status === 'Expired' ? t.expired : t.suspicious}
                  </Text>
                </View>

                <View style={[styles.modalRow, isUrdu && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.modalLabel, isUrdu && { textAlign: 'right' }]}>{t.dateTime}</Text>
                  <Text style={[styles.modalValue, isUrdu && { textAlign: 'left' }]}>{selectedItem.date}</Text>
                </View>

                {selectedItem.batchNumber && (
                  <View style={[styles.modalRow, isUrdu && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.modalLabel, isUrdu && { textAlign: 'right' }]}>{t.batchNo}</Text>
                    <Text style={[styles.modalValue, isUrdu && { textAlign: 'left' }]}>{selectedItem.batchNumber}</Text>
                  </View>
                )}

                {selectedItem.expiryDate && (
                  <View style={[styles.modalRow, isUrdu && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.modalLabel, isUrdu && { textAlign: 'right' }]}>{t.expiryDate}</Text>
                    <Text style={[styles.modalValue, { color: '#f87171' }, isUrdu && { textAlign: 'left' }]}>{selectedItem.expiryDate}</Text>
                  </View>
                )}

                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.modalLabel, isUrdu && { textAlign: 'right' }]}>{t.verificationDetails}</Text>
                  <Text style={[styles.detailBoxText, isUrdu && { textAlign: 'left' }]}>
                    {getLocalizedDetails(selectedItem.details)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.deleteRecordBtn}
                onPress={() => selectedItem && deleteSpecificRecord(selectedItem.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteRecordBtnText}>{t.deleteRecord}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeModalBtnText}>{t.close}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b19',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  clearBtn: {
    backgroundColor: 'rgba(255, 75, 75, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.35)',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '700',
  },
  filterSection: {
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 10,
  },
  pillContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  pillText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  medicineIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  detailBoxText: {
    fontSize: 13,
    color: '#cbd5e1',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteRecordBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  deleteRecordBtnText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  closeModalBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});