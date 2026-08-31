import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

const translations = {
  en: {
    title: "User Profile",
    subtitle: "Manage your account & preferences",
    personalInfo: "Personal Information",
    role: "Verified Pharmacist / Inspector",
    settings: "Preferences",
    language: "Urdu Language (اردو)",
    notifications: "Push Notifications",
    privacy: "Privacy Policy",
    about: "About MedVerify AI",
    logout: "Log Out",
    changePhoto: "Tap to change photo",
    photoSourceTitle: "Profile Photo",
    photoSourceMsg: "Choose a source to update your profile picture",
    camera: "Camera",
    gallery: "Gallery",
    cancel: "Cancel",
  },
  ur: {
    title: "یوزر پروفائل",
    subtitle: "اپنا اکاؤنٹ اور ترجیحات مینیج کریں",
    personalInfo: "ذاتی معلومات",
    role: "تصدیق شدہ فارماسسٹ / انسپکٹر",
    settings: "ترجیحات",
    language: "اردو زبان (Urdu)",
    notifications: "نوٹیفیکیشنز",
    privacy: "پراائیویسی پالیسی",
    about: "میڈ ویریفائی اے آئی کے بارے میں",
    logout: "لاگ آؤٹ",
    changePhoto: "تصویر تبدیل کرنے کے لیے ٹیپ کریں",
    photoSourceTitle: "پروفائل تصویر",
    photoSourceMsg: "اپنی پروفائل تصویر اپ ڈیٹ کرنے کے لیے ذریعہ منتخب کریں",
    camera: "کیمرہ",
    gallery: "گیلری",
    cancel: "منسوخ کریں",
  },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [isUrdu, setIsUrdu] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Real User Data States
  const [userName, setUserName] = useState('Dr. Ahmed Khan');
  const [userEmail, setUserEmail] = useState('ahmed.khan@medverify.ai');
  const [userPhone, setUserPhone] = useState('+92 300 1234567');

  const t = isUrdu ? translations.ur : translations.en;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('userName');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPhone = await AsyncStorage.getItem('userPhone');
      const savedImage = await AsyncStorage.getItem('profileImage');
      const savedLang = await AsyncStorage.getItem('appLanguage');

      if (savedName) setUserName(savedName);
      if (savedEmail) setUserEmail(savedEmail);
      if (savedPhone) setUserPhone(savedPhone);
      if (savedImage) setProfileImage(savedImage);
      if (savedLang === 'ur') setIsUrdu(true);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  // Function to handle Image selection (Camera or Gallery)
  const handleImagePickerOptions = () => {
    Alert.alert(
      t.photoSourceTitle,
      t.photoSourceMsg,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.gallery, onPress: () => pickImage('gallery') },
        { text: t.camera, onPress: () => pickImage('camera') },
      ]
    );
  };

  const pickImage = async (sourceType: 'camera' | 'gallery') => {
    try {
      let permissionResult;
      if (sourceType === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert(
          isUrdu ? "اجازت درکار ہے" : "Permission Required",
          isUrdu ? "کیمرے یا گیلری تک رسائی کی اجازت ضروری ہے!" : "Permission to access camera or gallery is required!"
        );
        return;
      }

      let result;
      if (sourceType === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem('profileImage', uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      isUrdu ? "لاگ آؤٹ" : "Log Out",
      isUrdu ? "کیا آپ واقعی اکاؤنٹ سے باہر نکلنا چاہتے ہیں؟" : "Are you sure you want to log out?",
      [
        { text: isUrdu ? "نہیں" : "Cancel", style: "cancel" },
        { 
          text: isUrdu ? "ہاں" : "Logout", 
          onPress: async () => {
            try {
              // Clear authentication tokens and session data
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userName');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userPhone');
            } catch (e) {
              console.log('Logout error:', e);
            }
            requestAnimationFrame(() => {
              router.replace('/auth');
            });
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 20), paddingBottom: 130 }
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

          {/* Profile Card with Real Camera & Gallery Support */}
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={handleImagePickerOptions} style={styles.avatarContainer} activeOpacity={0.8}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>👨‍⚕️</Text>
              )}
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>📷</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            <Text style={styles.userPhone}>{userPhone}</Text>
            
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
              onValueChange={async (val) => {
                setIsUrdu(val);
                await AsyncStorage.setItem('appLanguage', val ? 'ur' : 'en');
              }}
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
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 2,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 6,
    textAlign: 'center',
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
});