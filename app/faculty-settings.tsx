
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { useUserProfile } from '@/utils/useUserProfile';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FacultySettings() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  const profileOptions = [
    { id: '1', icon: 'person-outline', title: 'Edit Profile', route: '/edit-profile' },
    { id: '2', icon: 'notifications-outline', title: 'Notifications', route: '/notifications-settings' },
    { id: '3', icon: 'bookmark-outline', title: 'Saved Notices', route: '/faculty-bookmarks' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {profileLoading ? 'Loading...' : profile ? profile.name : 'Name'}
          </Text>
          <Text style={styles.email}>
            {profileLoading ? '' : profile ? profile.email : 'Email'}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {profileLoading ? '' : profile ? profile.role : 'Role'}
            </Text>
          </View>
        </View>
        {/* Options */}
        <View style={styles.optionsSection}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.option}
              onPress={() => router.push(option.route as any)}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name={option.icon as any} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
    maxWidth: 220,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    marginTop: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  optionsSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerBackIcon: {
    marginRight: 12,
    padding: 4,
    alignSelf: 'center',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionTitle: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  logoutButton: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
