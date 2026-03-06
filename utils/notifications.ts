// utils/notifications.ts
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Foreground notification display behaviour ───────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Android notification channel ────────────────────────────────────────────
export async function configureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Campus Notices",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366F1",
      sound: "default",
    });
  }
}

// ─── Permission request ───────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn("Push notifications only work on physical devices.");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Get Expo push token ──────────────────────────────────────────────────────
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenData.data;
  } catch (err) {
    console.error("Failed to get push token:", err);
    return null;
  }
}

// ─── Schedule a ONE-TIME local notification ───────────────────────────────────
export async function scheduleOneTimeNotification(
  title: string,
  body: string,
  triggerDate: Date,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: { type: "one-time" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
  return id;
}

// ─── Schedule a DAILY reminder ────────────────────────────────────────────────
export async function scheduleDailyReminder(
  title: string,
  body: string,
  hour: number,
  minute: number,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: { type: "daily-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

// ─── Send an IMMEDIATE local notification ────────────────────────────────────
export async function sendLocalNotification(
  title: string,
  body: string,
  data: Record<string, unknown> = {},
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data,
    },
    trigger: null, // fires immediately
  });
  return id;
}

// ─── Cancel a specific scheduled notification ─────────────────────────────────
export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// ─── Cancel ALL scheduled notifications ──────────────────────────────────────
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Listener helpers (call in components, return cleanup function) ───────────
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
