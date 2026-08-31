import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        animationDuration: 0,
        contentStyle: { 
          backgroundColor: '#070b19' // Yeh sab se zaroori hai jo white flash ko rokey ga
        },
      }}
    />
  );
}