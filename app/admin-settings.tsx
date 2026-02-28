import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { auth } from '@/constants/firebase';
import { useUserProfile } from '@/utils/useUserProfile';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminSettings() {
  const { profile, loading } = useUserProfile();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            // Try router.canGoBack, fallback to dashboard
            try {
              if (router.canGoBack && router.canGoBack()) {
                router.back();
              } else {
                router.replace('/admin-dashboard');
              }
            } catch {
              router.replace('/admin-dashboard');
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>
      <Card style={styles.card}>
        {loading ? <Text>Loading...</Text> : profile ? (
          <>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{profile.name}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{profile.role}</Text>
          </>
        ) : <Text>No profile data.</Text>}
      </Card>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 32,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    textAlignVertical: 'center',
  },
  card: { padding: 16, marginBottom: 32 },
  label: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
  value: { fontSize: 18, color: Colors.textPrimary, fontWeight: 'bold' },
  logoutButton: { backgroundColor: Colors.error, padding: 16, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});
