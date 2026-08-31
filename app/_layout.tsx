import { Stack, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0F1D' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          animationDuration: 0,
          contentStyle: { 
            backgroundColor: '#0A0F1D'
          },
        }}
      />
      
      <View style={styles.floatingFooterBackground}>
        <View style={[styles.floatingFooterContainer, { bottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.floatingNavBar}>
            
            <TouchableOpacity 
              style={[styles.navItem, pathname === '/' && styles.activeNavItem]} 
              activeOpacity={1}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.navIcon}>🛡️</Text>
              <Text style={[styles.navText, pathname === '/' && styles.activeNavText]}>Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navItem, pathname === '/history' && styles.activeNavItem]} 
              activeOpacity={1}
              onPress={() => router.replace('/history')}
            >
              <Text style={styles.navIcon}>🕒</Text>
              <Text style={[styles.navText, pathname === '/history' && styles.activeNavText]}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navItem, pathname === '/profile' && styles.activeNavItem]} 
              activeOpacity={1}
              onPress={() => router.replace('/profile')}
            >
              <Text style={styles.navIcon}>👤</Text>
              <Text style={[styles.navText, pathname === '/profile' && styles.activeNavText]}>Profile</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingFooterBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 105,
    backgroundColor: '#0A0F1D',
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