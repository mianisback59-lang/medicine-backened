import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade', // 'none' ki jagah 'fade' lagane se screen switch bilkul smooth lagti hai
        contentStyle: { backgroundColor: '#070b19' }, // Background color match karne ke liye taake white flash na ho
      }}
    />
  );
}