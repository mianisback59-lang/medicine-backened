
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Yeh wahi exact footer component hai jo index file se nikaala gaya tha
function AppFooter() {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerTitle}>MedVerify AI</Text>
      <Text style={styles.footerText}>
        Instant Authenticity & Safety Scanner for Pharmaceuticals.
      </Text>
      <Text style={styles.footerCopy}>
        © {new Date().getFullYear()} DRAP Verified System. All Rights Reserved.
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#070b19' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          animationDuration: 0,
          contentStyle: { 
            backgroundColor: '#070b19' // Yeh zaroori hai jo white flash ko rokey ga
          },
        }}
      />
      <AppFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    width: '100%',
    backgroundColor: '#0A0F1D',
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#60A5FA',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 6,
  },
  footerCopy: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
});