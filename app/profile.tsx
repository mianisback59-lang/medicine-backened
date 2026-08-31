import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Translations for Multilingual Support (English & Urdu)
const translations = {
  en: {
    title: "User Profile",
    subtitle: "Manage your account & preferences",
    personalInfo: "Personal Information",
    name: "Dr. Ahmed Khan",
    email: "ahmed.khan@medverify.ai",
    phone: "+92 300 1234567",
    role: "Verified Pharmacist / Inspector",
    settings: "Preferences",
    language: "Urdu Language (اردو)",
    notifications: "Push Notifications",
    privacy: "Privacy Policy",
    about: "About MedVerify AI",
    logout: "Log Out",
    navScan: "Scan",
    navHistory: "History",
    navProfile: "Profile",
    changePhoto: "Tap to change photo",
  },
  ur: {
    title: "یوزر پروفائل",
    subtitle: "اپنا اکاؤنٹ اور ترجیحات مینیج کریں",
    personalInfo: "ذاتی معلومات",
    name: "ڈاکٹر احمد خان",
    email: "ahmed.khan@medverify.ai",
    phone: "+92 300 1234567",
    role: "تصدیق شدہ فارماسسٹ / انسپکٹر",
    settings: "ترجیحات",
    language: "اردو زبان (Urdu)",
    notifications: "نوٹیفیکیشنز",
    privacy: "پراائیویسی پالیسی",
    about: "میڈ ویریفائی اے آئی کے بارے میں",
    logout: "لاگ آؤٹ",
    navScan: "اسکین",
    navHistory: "ہسٹری",
    navProfile: "پروفائل",
    changePhoto: "تصویر تبدیل کرنے کے لیے ٹیپ کریں",
  },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // State for Language, Notifications & Profile Image
  const [isUrdu, setIsUrdu] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const t = isUrdu ? translations.ur : translations.en;

  // Function to pick image from gallery
  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        isUrdu ? "اجازت درکار ہے" : "Permission Required",
        isUrdu ? "گیلری تک رسائی کی اجازت ضروری ہے!" : "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      isUrdu ? "لاگ آؤٹ" : "Log Out",
      isUrdu ? "کیا آپ واقعی اکاؤنٹ سے باہر نکلنا चाहते हैं؟" : "Are you sure you want to log out?",
      [
        { text: isUrdu ? "نہیں" : "Cancel", style: "cancel" },
        { text: isUrdu ? "ہاں" : "Logout", onPress: () => router.replace('/') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 20), paddingBottom: 140 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.headerTitle}>{t.title}</Text>
              <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
            </View>
          </View>

          {/* Profile Card with Image Picker */}
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>👨‍⚕️</Text>
              )}
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>📷</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.userName}>{t.name}</Text>
            <Text style={styles.userEmail}>{t.email}</Text>
            <Text style={styles.userPhone}>{t.phone}</Text>
            
            <Text style={styles.photoHintText}>{t.changePhoto}</Text>

            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{t.role}</Text>
            </View>
          </View>

          {/* Settings Section */}
          <Text style={styles.sectionTitle}>{t.settings}</Text>

          {/* Language Toggle */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>🌐 {t.language}</Text>
            <Switch
              value={isUrdu}
              onValueChange={(val) => setIsUrdu(val)}
              trackColor={{ false: '#334155', true: '#2563eb' }}
              thumbColor={isUrdu ? '#ffffff' : '#cbd5e1'}
            />
          </View>

          {/* Notifications Toggle */}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>🔔 {t.notifications}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(val) => setNotificationsEnabled(val)}
              trackColor={{ false: '#334155', true: '#2563eb' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#cbd5e1'}
            />
          </View>

          {/* Options Buttons */}
          <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert(t.privacy, "MedVerify AI ensures complete data security & DRAP compliance.")}>
            <Text style={styles.optionButtonText}>🔒 {t.privacy}</Text>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert(t.about, "MedVerify AI v1.0.0\nInstant Authenticity & Safety Scanner for Medicines.")}>
            <Text style={styles.optionButtonText}>ℹ️ {t.about}</Text>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 {t.logout}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 🌟 GLOWING & PROFESSIONAL FOOTER (Matched with Scan Page) */}
        <View style={styles.floatingFooterBackground}>
          <View style={[styles.floatingFooterContainer, { bottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.floatingNavBar}>
              
              {/* Scan Tab */}
              <TouchableOpacity 
                style={styles.navItem} 
                activeOpacity={0.85}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.navIcon}>🛡️</Text>
                <Text style={styles.navText}>{t.navScan}</Text>
              </TouchableOpacity>

              {/* History Tab */}
              <TouchableOpacity 
                style={styles.navItem} 
                activeOpacity={0.85}
                onPress={() => router.replace('/history')}
              >
                <Text style={styles.navIcon}>🕒</Text>
                <Text style={styles.navText}>{t.navHistory}</Text>
              </TouchableOpacity>

              {/* Profile Tab (Active) */}
              <TouchableOpacity 
                style={[styles.navItem, styles.activeNavItem]} 
                activeOpacity={0.85}
              >
                <Text style={styles.navIcon}>👤</Text>
                <Text style={[styles.navText, styles.activeNavText]}>{t.navProfile}</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b19',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 36,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  editBadgeText: {
    fontSize: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
  },
  photoHintText: {
    fontSize: 11,
    color: '#60a5fa',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  badgeContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.4)',
  },
  badgeText: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  arrowText: {
    fontSize: 18,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#f87171',
    fontWeight: 'bold',
  },
  
  // 🌟 GLOWING & PROFESSIONAL FOOTER STYLES
  floatingFooterBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 105,
    backgroundColor: '#070b19',
    zIndex: 98,
  },
  floatingFooterContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 99,
  },
  floatingNavBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 6,
    width: '100%',
    justifyContent: 'space-between',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  activeNavItem: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  navIcon: {
    fontSize: 16,
  },
  navText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  activeNavText: {
    color: '#60A5FA',
  },
});