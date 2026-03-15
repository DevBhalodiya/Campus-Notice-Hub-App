import { getCurrentUserRole } from "@/components/auth/authHelpers";
import { auth, db } from "@/constants/firebase";
import { getSigningUp } from "@/utils/authStateManager";
import {
    addNotificationResponseListener,
    configureAndroidChannel,
    getExpoPushToken,
    requestNotificationPermission,
} from "@/utils/notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, reload, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);
  const navigationRef = useRef(false);

  // ── Notification bootstrap (runs once on mount) ──────────────────────────
  useEffect(() => {
    let responseSubscription: ReturnType<
      typeof addNotificationResponseListener
    >;

    async function initNotifications(uid: string) {
      await configureAndroidChannel();

      const granted = await requestNotificationPermission();
      if (!granted) return;

      const token = await getExpoPushToken();
      if (token) {
        await setDoc(
          doc(db, "users", uid),
          { expoPushToken: token, tokenUpdatedAt: serverTimestamp() },
          { merge: true },
        );
      }

      // Navigate to relevant screen when user taps a notification
      responseSubscription = addNotificationResponseListener((response) => {
        const data = response.notification.request.content.data as Record<
          string,
          unknown
        >;
        if (data?.noticeId) {
          router.push({
            pathname: "/notice-detail",
            params: { id: data.noticeId as string },
          });
        }
      });
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("[LAYOUT] Auth state changed. User:", user?.email || "none");

      if (getSigningUp()) {
        console.log("[LAYOUT] Signup in progress, ignoring auth state change");
        return;
      }

      if (!user) {
        console.log("[LAYOUT] No user, redirecting to login");
        if (segments[0] !== "login" && segments[0] !== "signup" && segments[0] !== "splash") {
          router.replace("/login");
        }
        setChecking(false);
        return;
      }

      try {
        await reload(user);
        console.log("[LAYOUT] Email verified:", user.emailVerified);

        if (!user.emailVerified) {
          console.log("[LAYOUT] Email not verified, signing out");
          await signOut(auth);
          if (segments[0] !== "login" && segments[0] !== "signup") {
            router.replace("/login");
          }
          setChecking(false);
          return;
        }

        // Init notifications for authenticated user
        await initNotifications(user.uid);

        const role = await getCurrentUserRole(user.uid);
        console.log("[LAYOUT] User role:", role);

        let route = "/student-home";
        if (role === "faculty") route = "/faculty-dashboard";
        else if (role === "admin") route = "/admin-dashboard";

        const isOnDashboard =
          segments[0] === "student-home" ||
          segments[0] === "faculty-dashboard" ||
          segments[0] === "admin-dashboard" ||
          segments[0] === "notice-detail" ||
          segments[0] === "student-profile";

        if (!isOnDashboard && !navigationRef.current) {
          console.log("[LAYOUT] Navigating to:", route);
          navigationRef.current = true;
          router.replace(route);
        }
      } catch (error) {
        console.error("[LAYOUT] Error:", error);
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    });

    return () => {
      unsubscribeAuth();
      navigationRef.current = false;
      responseSubscription?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="student-home" />
        <Stack.Screen name="student-profile" />
        <Stack.Screen name="notice-detail" />
        <Stack.Screen name="admin-dashboard" />
        <Stack.Screen name="admin-create-notice" />
        <Stack.Screen name="faculty-dashboard" />
        <Stack.Screen name="faculty-create-notice" />
        <Stack.Screen name="faculty-my-notices" />
        <Stack.Screen name="faculty-edit-notice" />
        <Stack.Screen name="faculty-settings" />
        <Stack.Screen name="notifications-settings" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
