import { RoleToggle } from '@/components/auth/RoleToggle';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser, resendVerificationEmail, UserRole } from '@/components/auth/authHelpers';

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'student' | 'faculty'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const { role: userRole, emailVerified } = await loginUser(email, password);
      if (!emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in. Check your inbox and spam folder. If you did not receive the email, you can resend it below.'
        );
        setLoading(false);
        return;
      }
      if (userRole !== role) {
        Alert.alert('Role Mismatch', 'Selected role does not match your account role.');
        setLoading(false);
        return;
      }
      let route = '/student-home';
      if (userRole === 'faculty') route = '/faculty-dashboard';
      else if (userRole === 'admin') route = '/admin-dashboard';
      router.replace(route);
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      Alert.alert('Verification Email Sent', 'A new verification email has been sent. Please check your inbox and spam folder.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="notifications" size={32} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Campus Notice Hub</Text>
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
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              icon="lock-closed-outline"
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />
            <Button
              title="Resend Verification Email"
              onPress={handleResendVerification}
              style={{ marginTop: 12 }}
              variant="outline"
              size="md"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
    paddingTop: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  roleToggle: {
    marginBottom: Spacing.xxxl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotPasswordText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
