import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScanRecord {
  id: string;
  medicineName: string;
  status: 'Authentic' | 'Unverified' | 'Suspicious';
  date: string;
  details: string;
  batchNumber?: string;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [historyList, setHistoryList] = useState<ScanRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScanRecord | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('scanHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // Purane 'Counterfeit' status ko 'Unverified' mein safe mapping dene ke liye
        const updated = parsed.map((item: any) => ({
          ...item,
          status: item.status === 'Counterfeit' ? 'Unverified' : item.status
        }));
        setHistoryList(updated);
      } else {
        setHistoryList([]);
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('scanHistory');
      setHistoryList([]);
    } catch (error) {
      console.log('Error clearing history:', error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Authentic':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399', icon: '✅' };
      case 'Unverified':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', icon: '❌' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', icon: '⚠️' };
    }
  };

  const renderItem = ({ item }: { item: ScanRecord }) => {
    const statusStyle = getStatusStyle(item.status);
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
            <Text style={styles.medicineName} numberOfLines={1}>{item.medicineName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.icon} {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>📅 {item.date}</Text>
          <Text style={styles.viewDetailsText}>View Details ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.contentContainer, { paddingTop: Math.max(insets.top, 16) }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.headerTitle}>Scan History</Text>
              <Text style={styles.headerSubtitle}>Review your previous medicine verifications safely</Text>
            </View>
            {historyList.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearHistory} activeOpacity={0.8}>
                <Text style={styles.clearBtnText}>Clear History</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List or Empty State */}
          {historyList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Scans Yet</Text>
              <Text style={styles.emptySubtitle}>Your scanned medicines will appear here automatically once you verify them.</Text>
            </View>
          ) : (
            <FlatList
              data={historyList}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
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
            <Text style={styles.modalTitle}>Scan Report</Text>

            {selectedItem && (
              <View style={styles.modalBody}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Medicine:</Text>
                  <Text style={styles.modalValue}>{selectedItem.medicineName}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <Text style={[styles.modalValue, { color: getStatusStyle(selectedItem.status).text }]}>
                    {selectedItem.status}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Date & Time:</Text>
                  <Text style={styles.modalValue}>{selectedItem.date}</Text>
                </View>

                {selectedItem.batchNumber && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Batch No:</Text>
                    <Text style={styles.modalValue}>{selectedItem.batchNumber}</Text>
                  </View>
                )}

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.modalLabel}>Verification Details:</Text>
                  <Text style={styles.detailBoxText}>{selectedItem.details}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setIsModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  clearBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#f87171',
    fontWeight: '700',
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
  closeModalBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});