

import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, signOut, reload } from 'firebase/auth';
import { getCurrentUserRole } from '@/components/auth/authHelpers';
import { auth } from '@/constants/firebase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (segments[0] !== 'login' && segments[0] !== 'signup') {
          router.replace('/login');
        }
        setChecking(false);
        return;
      }
      try {
        await reload(user); // Ensure latest emailVerified status
        if (!user.emailVerified) {
          await signOut(auth);
          if (segments[0] !== 'login') {
            router.replace('/login');
          }
          setChecking(false);
          return;
        }
        const role = await getCurrentUserRole(user.uid);
        let route = '/student-home';
        if (role === 'faculty') route = '/faculty-dashboard';
        else if (role === 'admin') route = '/admin-dashboard';
        // Only allow access to dashboards if verified
        if (!segments[0] || (segments[0] !== 'student-home' && segments[0] !== 'faculty-dashboard' && segments[0] !== 'admin-dashboard')) {
          router.replace(route);
        }
      } catch {
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) return null;

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
        <Stack.Screen name="faculty-dashboard" />
        <Stack.Screen name="faculty-create-notice" />
        <Stack.Screen name="faculty-my-notices" />
        <Stack.Screen name="faculty-edit-notice" />
        <Stack.Screen name="faculty-settings" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
