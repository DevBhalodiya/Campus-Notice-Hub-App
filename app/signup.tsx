import { RoleToggle } from "@/components/auth/RoleToggle";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Colors } from "@/constants/colors";
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from "@/constants/spacing";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { signupUser } from "@/components/auth/authHelpers";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "student" | "faculty">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    console.log("Starting signup for role:", role);
    console.log("Email:", email);

    try {
      await signupUser(fullName, email, password, role);

      // Stop loading immediately after successful signup
      setLoading(false);

      // Show success alert with navigation
      Alert.alert(
        "Success! 🎉",
        `A verification email has been sent to ${email}.\n\nPlease verify your email before logging in.\n\nCheck your inbox and spam folder.`,
        [
          {
            text: "Go to Login",
            onPress: () => {
              // Use replace to prevent going back to signup
              router.replace("/login");
            },
          },
        ],
        { cancelable: false }, // Prevent dismissing without clicking button
      );
    } catch (error: any) {
      setLoading(false); // Stop loading on error

      console.error("=== SIGNUP ERROR ===");
      console.error("Error object:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      let errorMessage = "An error occurred during signup.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (
        error.code === "permission-denied" ||
        (error.message && error.message.includes("permission"))
      ) {
        errorMessage =
          "Permission denied while creating user profile. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Signup Failed", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={loading ? Colors.textSecondary : Colors.textPrimary}
              />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons
                  name="notifications"
                  size={32}
                  color={Colors.primary}
                />
              </View>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Campus Notice Hub today</Text>
          </View>

          {/* Role Toggle */}
          <RoleToggle
            selectedRole={role}
            onRoleChange={setRole}
            style={styles.roleToggle}
          />

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              icon="person-outline"
              editable={!loading}
            />
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              editable={!loading}
            />
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              isPassword
              icon="lock-closed-outline"
              editable={!loading}
            />
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              icon="lock-closed-outline"
              editable={!loading}
            />

            <Button
              title={loading ? "Creating Account..." : "Create Account"}
              onPress={handleSignup}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()} disabled={loading}>
              <Text
                style={[
                  styles.loginLink,
                  loading && { color: Colors.textSecondary },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: Spacing.sm,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  roleToggle: {
    marginBottom: Spacing.xxl,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
