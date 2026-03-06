// app/notifications-settings.tsx
import { Colors } from "@/constants/colors";
import { auth, db } from "@/constants/firebase";
import {
    BorderRadius,
    FontSize,
    FontWeight,
    Spacing,
} from "@/constants/spacing";
import {
    cancelAllNotifications,
    scheduleDailyReminder,
    sendLocalNotification,
} from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationPrefs {
  enabled: boolean;
  newNotices: boolean;
  taskReminders: boolean;
  appUpdates: boolean;
  reminderHour: number;
  reminderMinute: number;
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  newNotices: true,
  taskReminders: true,
  appUpdates: true,
  reminderHour: 8,
  reminderMinute: 0,
};

export default function NotificationsSettings() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load saved prefs from Firestore ─────────────────────────────────────
  useEffect(() => {
    async function load() {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists() && snap.data().notificationPrefs) {
        setPrefs({ ...DEFAULT_PREFS, ...snap.data().notificationPrefs });
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggle = useCallback((key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ── Save and apply ───────────────────────────────────────────────────────
  async function handleSave() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setSaving(true);
    try {
      // Persist to Firestore
      await setDoc(
        doc(db, "users", uid),
        { notificationPrefs: prefs, updatedAt: serverTimestamp() },
        { merge: true },
      );

      // Cancel all existing scheduled local notifications
      await cancelAllNotifications();

      // Re-schedule daily reminder if both master toggle and task reminders are on
      if (prefs.enabled && prefs.taskReminders) {
        await scheduleDailyReminder(
          "📚 Campus Notice Hub",
          "Check the latest campus notices for today!",
          prefs.reminderHour,
          prefs.reminderMinute,
        );
      }

      Alert.alert("Saved", "Notification preferences updated.");
    } catch (err) {
      Alert.alert("Error", "Failed to save preferences. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // ── Test notification ────────────────────────────────────────────────────
  async function handleTest() {
    try {
      await sendLocalNotification(
        "🔔 Test Notification",
        "Notifications are working correctly on your device!",
        { type: "test" },
      );
      Alert.alert(
        "Sent",
        "A test notification was sent. If the app is in foreground you should see a banner.",
      );
    } catch {
      Alert.alert("Error", "Could not send test notification.");
    }
  }

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  function cycleReminderTime() {
    // Simple time picker: cycle through common times for demo purposes
    const times = [
      { h: 7, m: 0 },
      { h: 8, m: 0 },
      { h: 9, m: 0 },
      { h: 12, m: 0 },
      { h: 17, m: 0 },
      { h: 20, m: 0 },
    ];
    const current = times.findIndex(
      (t) => t.h === prefs.reminderHour && t.m === prefs.reminderMinute,
    );
    const next = times[(current + 1) % times.length];
    setPrefs((prev) => ({
      ...prev,
      reminderHour: next.h,
      reminderMinute: next.m,
    }));
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GENERAL</Text>
          <View style={[styles.row, styles.rowFirst]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: Colors.primaryLight + "20" },
                ]}
              >
                <Ionicons
                  name="notifications"
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View>
                <Text style={styles.rowTitle}>Enable Notifications</Text>
                <Text style={styles.rowSub}>
                  Master switch for all notifications
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.enabled}
              onValueChange={() => toggle("enabled")}
              trackColor={{
                false: Colors.gray200,
                true: Colors.primary + "80",
              }}
              thumbColor={prefs.enabled ? Colors.primary : Colors.gray400}
            />
          </View>
        </View>

        {/* Per-type toggles */}
        <View style={[styles.section, !prefs.enabled && styles.disabled]}>
          <Text style={styles.sectionLabel}>NOTIFICATION TYPES</Text>

          <View style={[styles.row, styles.rowFirst]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: Colors.info + "20" },
                ]}
              >
                <Ionicons
                  name="newspaper-outline"
                  size={20}
                  color={Colors.info}
                />
              </View>
              <View>
                <Text style={styles.rowTitle}>New Notices</Text>
                <Text style={styles.rowSub}>When a new notice is posted</Text>
              </View>
            </View>
            <Switch
              value={prefs.enabled && prefs.newNotices}
              onValueChange={() => toggle("newNotices")}
              disabled={!prefs.enabled}
              trackColor={{ false: Colors.gray200, true: Colors.info + "80" }}
              thumbColor={
                prefs.newNotices && prefs.enabled ? Colors.info : Colors.gray400
              }
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: Colors.warning + "20" },
                ]}
              >
                <Ionicons
                  name="alarm-outline"
                  size={20}
                  color={Colors.warning}
                />
              </View>
              <View>
                <Text style={styles.rowTitle}>Task Reminders</Text>
                <Text style={styles.rowSub}>
                  Daily reminder about upcoming tasks
                </Text>
              </View>
            </View>
            <Switch
              value={prefs.enabled && prefs.taskReminders}
              onValueChange={() => toggle("taskReminders")}
              disabled={!prefs.enabled}
              trackColor={{
                false: Colors.gray200,
                true: Colors.warning + "80",
              }}
              thumbColor={
                prefs.taskReminders && prefs.enabled
                  ? Colors.warning
                  : Colors.gray400
              }
            />
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: Colors.success + "20" },
                ]}
              >
                <Ionicons
                  name="refresh-circle-outline"
                  size={20}
                  color={Colors.success}
                />
              </View>
              <View>
                <Text style={styles.rowTitle}>App Updates</Text>
                <Text style={styles.rowSub}>Important app announcements</Text>
              </View>
            </View>
            <Switch
              value={prefs.enabled && prefs.appUpdates}
              onValueChange={() => toggle("appUpdates")}
              disabled={!prefs.enabled}
              trackColor={{
                false: Colors.gray200,
                true: Colors.success + "80",
              }}
              thumbColor={
                prefs.appUpdates && prefs.enabled
                  ? Colors.success
                  : Colors.gray400
              }
            />
          </View>
        </View>

        {/* Daily Reminder Time */}
        {prefs.enabled && prefs.taskReminders && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DAILY REMINDER TIME</Text>
            <TouchableOpacity
              style={[styles.row, styles.rowFirst, styles.rowLast]}
              onPress={cycleReminderTime}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: Colors.secondary + "20" },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={Colors.secondary}
                  />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Reminder Time</Text>
                  <Text style={styles.rowSub}>
                    Tap to change (cycles common times)
                  </Text>
                </View>
              </View>
              <Text style={styles.timeText}>
                {formatTime(prefs.reminderHour, prefs.reminderMinute)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIONS</Text>

          <TouchableOpacity
            style={[styles.row, styles.rowFirst]}
            onPress={handleTest}
          >
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: Colors.primaryLight + "20" },
                ]}
              >
                <Ionicons
                  name="send-outline"
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View>
                <Text style={styles.rowTitle}>Send Test Notification</Text>
                <Text style={styles.rowSub}>
                  Verify notifications work on your device
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.rowLast]}
            onPress={() =>
              Alert.alert(
                "Cancel All Reminders",
                "This will cancel all scheduled local reminders.",
                [
                  { text: "No", style: "cancel" },
                  {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => cancelAllNotifications(),
                  },
                ],
              )
            }
          >
            <View style={styles.rowLeft}>
              <View
                style={[styles.iconBox, { backgroundColor: Colors.errorLight }]}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={Colors.error}
                />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: Colors.error }]}>
                  Cancel All Reminders
                </Text>
                <Text style={styles.rowSub}>
                  Remove all scheduled local notifications
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* Platform note */}
        <Text style={styles.note}>
          {Platform.OS === "android"
            ? "On Android 13+ you may need to allow notifications in system settings."
            : "On iOS, notifications require explicit permission. Check Settings if not working."}
        </Text>
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backButton: { padding: Spacing.xs },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  placeholder: { width: 40 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  section: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  disabled: { opacity: 0.5 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  rowFirst: {
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  rowLast: {
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    borderBottomColor: "transparent",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  rowSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  timeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  note: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
