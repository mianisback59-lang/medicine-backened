import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
    title: "Profile",
    subtitle: "Manage your credentials and preferences",
    role: "Verified Account",
    verifiedTitle: "Account Verification",
    verifiedDesc: "Your account is fully secured, encrypted, and verified via registered email and phone credentials.",
    accountSettings: "Account Settings",
    preferences: "Preferences",
    language: "Language (Urdu / English)",
    pushNotifications: "Push Notifications",
    privacy: "Privacy Policy",
    about: "About MedVerify AI",
    deleteAccount: "Delete Account",
    logout: "Sign Out",
    photoSourceTitle: "Profile Picture",
    photoSourceMsg: "Choose an option to update your photo",
    camera: "Take Photo via Camera",
    gallery: "Choose from Gallery",
    removePhoto: "Remove Current Photo",
    cancel: "Cancel",
    editProfile: "Edit Profile",
    save: "Save Changes",
    editTitle: "Edit Profile Details",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    logoutTitle: "Sign Out",
    logoutMsg: "Are you sure you want to sign out?",
    deleteTitle: "Delete Account",
    deleteMsg: "Are you sure you want to delete your account? All your saved scans, profile details, and history will be permanently erased. You will need to create a new account to use the app again.",
    deleteConfirmBtn: "Delete Forever",
    infoTitle: "Information",
    ok: "OK",
    privacyDesc: "MedVerify AI ensures complete data security & privacy standards. Your scanned records and details remain encrypted and secure.",
    aboutDesc: "MedVerify AI v1.0.0\nInstant Medicine Authenticity & Safety Scanner. Designed to protect users from counterfeit pharmaceutical products.",
  },
  ur: {
    title: "پروفائل",
    subtitle: "اپنی معلومات اور ترجیحات کا انتظام کریں",
    role: "تصدیق شدہ اکاؤنٹ",
    verifiedTitle: "اکاؤنٹ کی تصدیق",
    verifiedDesc: "آپ کا اکاؤنٹ مکمل طور پر محفوظ ہے اور رجسٹرڈ ای میل اور فون کے ذریعے تصدیق شدہ ہے۔",
    accountSettings: "اکاؤنٹ کی سیٹنگز",
    preferences: "ترجیحات",
    language: "زبان (اردو / انگریزی)",
    pushNotifications: "پش نوٹیفیکیشنز",
    privacy: "پراائیویسی پالیسی",
    about: "میڈ ویریفائی اے آئی کے بارے میں",
    deleteAccount: "اکاؤنٹ ڈیلیٹ کریں",
    logout: "سائن آؤٹ",
    photoSourceTitle: "پروفائل تصویر",
    photoSourceMsg: "تصویر اپ ڈیٹ کرنے کے لیے آپشن منتخب کریں",
    camera: "کیمرے سے تصویر لیں",
    gallery: "گیلری سے منتخب کریں",
    removePhoto: "موجودہ تصویر ہٹائیں۔",
    cancel: "منسوخ",
    editProfile: "پروفائل ایڈٹ کریں",
    save: "محفوظ کریں",
    editTitle: "پروفائل میں ترمیم کریں",
    nameLabel: "پورا نام",
    emailLabel: "ای میل ایڈریس",
    phoneLabel: "فون نمبر",
    logoutTitle: "سائن آؤٹ",
    logoutMsg: "کیا آپ واقعی اکاؤنٹ سے باہر نکلنا چاہتے ہیں؟",
    deleteTitle: "اکاؤنٹ حذف کریں",
    deleteMsg: "کیا آپ واقعی اپنا اکاؤنٹ حذف کرنا چاہتے ہیں؟ آپ کا تمام ڈیٹا، اسکین ہسٹری اور پروفائل ہمیشہ کے لیے ختم ہو جائے گا۔ دوبارہ استعمال کے لیے آپ کو نیا اکاؤنٹ بنانا ہوگا۔",
    deleteConfirmBtn: "ہمیشہ کے لیے ڈیلیٹ کریں",
    infoTitle: "معلومات",
    ok: "ٹھیک ہے",
    privacyDesc: "میڈ ویریفائی اے آئی آپ کے ڈیٹا کی مکمل سیکیورٹی اور پرائیویسی کو یقینی بناتا ہے۔ آپ کے تمام ریکارڈز اور معلومات مکمل طور پر محفوظ ہیں۔",
    aboutDesc: "میڈ ویریفائی اے آئی v1.0.0\nجعلی ادویات سے بچاؤ اور ان کی اصلیت کی فوری جانچ کے لیے تیار کردہ جدید اسکینر۔",
  },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [isUrdu, setIsUrdu] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  
  const [infoModalData, setInfoModalData] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });
  
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPhone, setTempPhone] = useState('');

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
      const savedNotif = await AsyncStorage.getItem('pushNotifications');

      if (savedName) { setUserName(savedName); setTempName(savedName); }
      if (savedEmail) { setUserEmail(savedEmail); setTempEmail(savedEmail); }
      if (savedPhone) { setUserPhone(savedPhone); setTempPhone(savedPhone); }
      if (savedImage) setProfileImage(savedImage);
      if (savedLang === 'ur') setIsUrdu(true);
      if (savedNotif === 'false') setIsNotificationsEnabled(false);
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
      setInfoModalData({
        visible: true,
        title: isUrdu ? "کامیابی" : "Success",
        message: isUrdu ? "پروفائل کامیابی سے اپ ڈیٹ ہو گئی ہے" : "Profile updated successfully!",
      });
    } catch (error) {
      console.log('Error saving profile:', error);
    }
  };

  const pickImage = async (sourceType: 'camera' | 'gallery') => {
    setIsPhotoModalVisible(false);
    try {
      let permissionResult;
      if (sourceType === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        setInfoModalData({
          visible: true,
          title: isUrdu ? "اجازت درکار ہے" : "Permission Required",
          message: isUrdu ? "کیمرے یا گیلری تک رسائی کی اجازت ضروری ہے!" : "Permission access is required!",
        });
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

  const removePhoto = async () => {
    setIsPhotoModalVisible(false);
    setProfileImage(null);
    await AsyncStorage.removeItem('profileImage');
  };

  const executeLogout = async () => {
    setIsLogoutModalVisible(false);
    try {
      await AsyncStorage.removeItem('userToken');
    } catch (e) {
      console.log('Logout error:', e);
    }
    requestAnimationFrame(() => {
      router.replace('/auth');
    });
  };

  const executeDeleteAccount = async () => {
    setIsDeleteModalVisible(false);
    try {
      const emailToDelete = userEmail || (await AsyncStorage.getItem('userEmail'));

      if (emailToDelete) {
        await fetch('https://medicine-backened.vercel.app/api/delete-account', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToDelete.trim().toLowerCase() }),
        });
      }

      await AsyncStorage.clear();
    } catch (e) {
      console.log('Delete account error:', e);
    }
    requestAnimationFrame(() => {
      router.replace('/auth');
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top, 16) + 8, paddingBottom: 130 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileHeroCard}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity onPress={() => setIsPhotoModalVisible(true)} style={styles.avatarContainer} activeOpacity={0.85}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>👤</Text>
                )}
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeText}>📷</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.heroInfoContainer}>
                <Text style={styles.userName} numberOfLines={1}>{userName || (isUrdu ? 'نام درج نہیں ہے' : 'No Name Set')}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{userEmail || (isUrdu ? 'ای میل درج نہیں ہے' : 'No Email Set')}</Text>
                {userPhone ? <Text style={styles.userPhone}>{userPhone}</Text> : null}
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroBottomRow}>
              <TouchableOpacity 
                style={styles.badgeContainer} 
                onPress={() => setInfoModalData({
                  visible: true,
                  title: t.verifiedTitle,
                  message: t.verifiedDesc,
                })}
                activeOpacity={0.8}
              >
                <Text style={styles.badgeText}>🛡️ {t.role}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditModalVisible(true)} activeOpacity={0.8}>
                <Text style={styles.editProfileBtnText}>✏️ {t.editProfile}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences */}
          <Text style={styles.sectionTitle}>{t.preferences}</Text>

          <View style={styles.cardGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelRow}>
                <View style={styles.iconWrapper}>
                  <Text style={styles.settingIcon}>🌐</Text>
                </View>
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
                <View style={styles.iconWrapper}>
                  <Text style={styles.settingIcon}>🔔</Text>
                </View>
                <Text style={styles.settingText}>{t.pushNotifications || "پش نوٹیفیکیشنز"}</Text>
              </View>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={async (val) => {
                  setIsNotificationsEnabled(val);
                  await AsyncStorage.setItem('pushNotifications', val ? 'true' : 'false');
                }}
                trackColor={{ false: '#334155', true: '#2563eb' }}
                thumbColor={isNotificationsEnabled ? '#ffffff' : '#cbd5e1'}
              />
            </View>
          </View>

          {/* Account Settings */}
          <Text style={styles.sectionTitle}>{t.accountSettings}</Text>

          <View style={styles.cardGroup}>
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => setInfoModalData({
                visible: true, 
                title: t.privacy, 
                message: t.privacyDesc
              })} 
              activeOpacity={0.8}
            >
              <View style={styles.settingLabelRow}>
                <View style={styles.iconWrapper}>
                  <Text style={styles.settingIcon}>🔒</Text>
                </View>
                <Text style={styles.optionButtonText}>{t.privacy}</Text>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => setInfoModalData({
                visible: true, 
                title: t.about, 
                message: t.aboutDesc
              })} 
              activeOpacity={0.8}
            >
              <View style={styles.settingLabelRow}>
                <View style={styles.iconWrapper}>
                  <Text style={styles.settingIcon}>ℹ️</Text>
                </View>
                <Text style={styles.optionButtonText}>{t.about}</Text>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionButton, { borderBottomWidth: 0 }]} 
              onPress={() => setIsDeleteModalVisible(true)} 
              activeOpacity={0.8}
            >
              <View style={styles.settingLabelRow}>
                <View style={[styles.iconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Text style={styles.settingIcon}>⚠️</Text>
                </View>
                <Text style={[styles.optionButtonText, { color: '#f87171' }]}>{t.deleteAccount}</Text>
              </View>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => setIsLogoutModalVisible(true)} activeOpacity={0.8}>
            <Text style={styles.logoutButtonText}>🚪 {t.logout}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Custom Dark Photo Picker Modal */}
      <Modal
        visible={isPhotoModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.photoSourceTitle}</Text>
            <Text style={styles.modalSubtitleText}>{t.photoSourceMsg}</Text>

            <TouchableOpacity style={styles.photoOptionBtn} onPress={() => pickImage('camera')} activeOpacity={0.8}>
              <Text style={styles.photoOptionText}>📸 {t.camera}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoOptionBtn} onPress={() => pickImage('gallery')} activeOpacity={0.8}>
              <Text style={styles.photoOptionText}>🖼️ {t.gallery}</Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity style={[styles.photoOptionBtn, { borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} onPress={removePhoto} activeOpacity={0.8}>
                <Text style={[styles.photoOptionText, { color: '#f87171' }]}>🗑️ {t.removePhoto}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.modalCancelBtnFull} onPress={() => setIsPhotoModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.modalCancelText}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Dark Sign Out Modal */}
      <Modal
        visible={isLogoutModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.logoutTitle}</Text>
            <Text style={styles.modalSubtitleText}>{t.logoutMsg}</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsLogoutModalVisible(false)} activeOpacity={0.8}>
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: '#ef4444' }]} onPress={executeLogout} activeOpacity={0.8}>
                <Text style={styles.modalSaveText}>{t.logout}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Dark Delete Account Modal */}
      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={[styles.modalTitle, { color: '#f87171' }]}>{t.deleteTitle}</Text>
            <Text style={styles.modalSubtitleText}>{t.deleteMsg}</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsDeleteModalVisible(false)} activeOpacity={0.8}>
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: '#ef4444' }]} onPress={executeDeleteAccount} activeOpacity={0.8}>
                <Text style={styles.modalSaveText}>{t.deleteConfirmBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Info / Privacy / About Modal */}
      <Modal
        visible={infoModalData.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setInfoModalData({ ...infoModalData, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{infoModalData.title}</Text>
            <Text style={[styles.modalSubtitleText, { marginVertical: 12, lineHeight: 20 }]}>{infoModalData.message}</Text>

            <TouchableOpacity style={styles.infoOkButton} onPress={() => setInfoModalData({ ...infoModalData, visible: false })} activeOpacity={0.8}>
              <Text style={styles.infoOkButtonText}>{t.ok}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              onChangeText={setUserEmail}
              placeholder="Enter Email"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>{t.phoneLabel}</Text>
            <TextInput
              style={styles.inputField}
              value={tempPhone}
              onChangeText={setUserPhone}
              placeholder="Enter Phone"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsEditModalVisible(false)} activeOpacity={0.8}>
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProfile} activeOpacity={0.8}>
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
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  profileHeroCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
    borderWidth: 2.5,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  editBadgeText: {
    fontSize: 10,
  },
  heroInfoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#94a3b8',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    flexShrink: 1,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#60a5fa',
    fontWeight: '600',
  },
  editProfileBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  editProfileBtnText: {
    fontSize: 11,
    color: '#60a5fa',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
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
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  settingIcon: {
    fontSize: 14,
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
    padding: 14,
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
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitleText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  photoOptionBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    marginBottom: 10,
  },
    photoOptionText: {
    fontSize: 14,
    color: '#60a5fa',
    fontWeight: '600',
  },
  modalCancelBtnFull: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  inputLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
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
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  infoOkButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  infoOkButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});