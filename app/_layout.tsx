import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="student-home" />
        <Stack.Screen name="student-profile" />
        <Stack.Screen name="admin-dashboard" />
        <Stack.Screen name="admin-create-notice" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
