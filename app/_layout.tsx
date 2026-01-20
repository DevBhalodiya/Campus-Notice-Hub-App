import { getCurrentUserRole } from "@/components/auth/authHelpers";
import { auth } from "@/constants/firebase";
import { getSigningUp } from "@/utils/authStateManager";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, reload, signOut } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);
  const navigationRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[LAYOUT] Auth state changed. User:", user?.email || "none");

      // If user is being created during signup, ignore this auth state change
      if (getSigningUp()) {
        console.log("[LAYOUT] Signup in progress, ignoring auth state change");
        return;
      }

      // If no user, redirect to login
      if (!user) {
        console.log("[LAYOUT] No user, redirecting to login");
        if (segments[0] !== "login" && segments[0] !== "signup") {
          router.replace("/login");
        }
        setChecking(false);
        return;
      }

      try {
        // Reload user to get latest email verification status
        await reload(user);

        console.log("[LAYOUT] Email verified:", user.emailVerified);

        // If email is not verified, sign them out
        if (!user.emailVerified) {
          console.log("[LAYOUT] Email not verified, signing out");
          await signOut(auth);
          if (segments[0] !== "login" && segments[0] !== "signup") {
            router.replace("/login");
          }
          setChecking(false);
          return;
        }

        // Get user role and navigate to appropriate dashboard
        const role = await getCurrentUserRole(user.uid);
        console.log("[LAYOUT] User role:", role);

        let route = "/student-home";
        if (role === "faculty") route = "/faculty-dashboard";
        else if (role === "admin") route = "/admin-dashboard";

        // Only navigate if we're not already on a dashboard and haven't navigated yet
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
      unsubscribe();
      navigationRef.current = false;
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
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
