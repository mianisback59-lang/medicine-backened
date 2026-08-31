import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const translations = {
  en: {
    title: "Account & Profile",
    subtitle: "Manage your credentials and app preferences",
    personalInfo: "Personal Information",
    role: "Verified Pharmacist / Inspector",
    accountSettings: "Account Settings",
    preferences: "Preferences",
    language: "Language (Urdu / English)",
    notifications: "Push Notifications",
    privacy: "Privacy Policy",
    about: "About MedVerify AI",
    logout: "Sign Out",
    changePhoto: "Change Profile Photo",
    photoSourceTitle: "Profile Picture",
    photoSourceMsg: "Select an option to update your avatar",
    camera: "Take Photo",
    gallery: "Choose from Gallery",
    removePhoto: "Remove Photo",
    cancel: "Cancel",
    editProfile: "Edit Profile Details",
    save: "Save Changes",
    editTitle: "Edit Profile",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
  },
  ur: {
    title: "اکاؤنٹ اور پروفائل",
    subtitle: "اپنی معلومات اور ترجیحات کا انتظام کریں",
    personalInfo: "ذاتی معلومات",
    role: "تصدیق شدہ فارماسسٹ / انسپکٹر",
    accountSettings: "اکاؤنٹ کی سیٹنگز",
    preferences: "ترجیحات",
    language: "زبان (اردو / انگریزی)",
    notifications: "نوٹیفیکیشنز",
    privacy: "پراائیویسی پالیسی",
    about: "میڈ ویریفائی اے آئی کے بارے میں",
    logout: "سائن آؤٹ",
    changePhoto: "تصویر تبدیل کریں",
    photoSourceTitle: "پروفائل تصویر",
    photoSourceMsg: "تصویر اپ ڈیٹ کرنے کے لیے ذریعہ منتخب کریں",
    camera: "کیمرہ",
    gallery: "گیلری",
    removePhoto: "تصویر ہٹائیں",
    cancel: "منسوخ",
    editProfile: "پروفائل ایڈٹ کریں",
    save: "محفوظ کریں",
    editTitle: "پروفائل میں ترمیم کریں",
    nameLabel: "पूرا نام",
    emailLabel: "ای میل ایڈریس",
    phoneLabel: "فون نمبر",
  },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [isUrdu, setIsUrdu] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [userName, setUserName] = useState('Dr. Ahmed Khan');
  const [userEmail, setUserEmail] = useState('ahmed.khan@medverify.ai');
  const [userPhone, setUserPhone] = useState('+92 300 1234567');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempPhone, setTempPhone] = useState(userPhone);

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

      if (savedName) { setUserName(savedName); setTempName(savedName); }
      if (savedEmail) { setUserEmail(savedEmail); setTempEmail(savedEmail); }
      if (savedPhone) { setUserPhone(savedPhone); setTempPhone(savedPhone); }
      if (savedImage) setProfileImage(savedImage);
      if (savedLang === 'ur') setIsUrdu(true);
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await AsyncStorage.setItem('userName', tempName);
      await AsyncStorage.setItem('userEmail', tempEmail);
      await AsyncStorage.setItem('userPhone', tempPhone);
      setUserName(tempName);
      setUserEmail(tempEmail);
      setUserPhone(tempPhone);
      setIsEditModalVisible(false);
      Alert.alert(isUrdu ? "کامیابی" : "Success", isUrdu ? "پروفائل کامیابی سے اپ ڈیٹ ہو گئی ہے" : "Profile updated successfully!");
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  const handleImagePickerOptions = () => {
    Alert.alert(
      t.photoSourceTitle,
      t.photoSourceMsg,
      [
        { text: t.cancel, style: 'cancel' },
        ...(profileImage ? [{ text: t.removePhoto, style: 'destructive' as const, onPress: async () => {
            setProfileImage(null);
            await AsyncStorage.removeItem('profileImage');
          }}] : []),
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
          isUrdu ? "کیمرے یا گیلری تک رسائی کی اجازت ضروری ہے!" : "Permission access is required!"
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
      isUrdu ? "لاگ آؤٹ" : "Sign Out",
      isUrdu ? "کیا آپ واقعی اکاؤنٹ سے باہر نکلना چاہتے ہیں؟" : "Are you sure you want to sign out?",
      [
        { text: isUrdu ? "نہیں" : "Cancel", style: "cancel" },
        { 
          text: isUrdu ? "ہاں" : "Sign Out", 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
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
            { paddingTop: Math.max(insets.top, 16), paddingBottom: 130 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>

          {/* Professional Hero Profile Card */}
          <View style={styles.profileHeroCard}>
            <View style={styles.heroTopRow}>
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

              <View style={styles.heroInfoContainer}>
                <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{userEmail}</Text>
                <Text style={styles.userPhone}>{userPhone}</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroBottomRow}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>🛡️ {t.role}</Text>
              </View>

              <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditModalVisible(true)}>
                <Text style={styles.editProfileBtnText}>✏️ {t.editProfile}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences Section */}
          <Text style={styles.sectionTitle}>{t.preferences}</Text>

          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelRow}>
                <Text style={styles.settingIcon}>🌐</Text>
                <Text style={styles.settingText}>{t.language}</Text>
              </View>
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

            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingLabelRow}>
                <Text style={styles.settingIcon}>🔔</Text>
                <Text style={styles.settingText}>{t.notifications}</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(val) => setNotificationsEnabled(val)}
                trackColor={{ false: '#334155', true: '#2563eb' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#cbd5e1'}
              />
            </View>
          </View>

          {/* About & Legal Section */}
          <Text style={styles.sectionTitle}>{t.accountSettings}</Text>

          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert(t.privacy, "MedVerify AI ensures complete data security & DRAP compliance standards.")}>
              <View style={styles.settingLabelRow}>
                <Text style={styles.settingIcon}>🔒</Text>
                <Text style={styles.optionButtonText}>{t.privacy}</Text>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionButton, { borderBottomWidth: 0 }]} onPress={() => Alert.alert(t.about, "MedVerify AI v1.0.0\nProfessional Pharmaceutical Tracking & Verification System.")}>
              <View style={styles.settingLabelRow}>
                <Text style={styles.settingIcon}>ℹ️</Text>
                <Text style={styles.optionButtonText}>{t.about}</Text>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Action Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutButtonText}>🚪 {t.logout}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.editTitle}</Text>

            <Text style={styles.inputLabel}>{t.nameLabel}</Text>
            <TextInput
              style={styles.inputField}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter Name"
              placeholderTextColor="#64748b"
            />

            <Text style={styles.inputLabel}>{t.emailLabel}</Text>
            <TextInput
              style={styles.inputField}
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="Enter Email"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>{t.phoneLabel}</Text>
            <TextInput
              style={styles.inputField}
              value={tempPhone}
              onChangeText={setTempPhone}
              placeholder="Enter Phone"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProfile}>
                <Text style={styles.modalSaveText}>{t.save}</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  profileHeroCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginBottom: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 32,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  editBadgeText: {
    fontSize: 9,
  },
  heroInfoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#94a3b8',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    color: '#60a5fa',
    fontWeight: '600',
  },
  editProfileBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  editProfileBtnText: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  settingText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  arrowText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginTop: 4,
  },
  logoutButtonText: {
    fontSize: 15,
    color: '#f87171',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
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
  inputLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputField: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});