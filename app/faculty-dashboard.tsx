import { Button } from '@/components/common/Button';
import { Notice, NoticeCard } from '@/components/notices/NoticeCard';
import { Colors } from '@/constants/colors';
import { auth, db } from '@/constants/firebase';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { useUserProfile } from '@/utils/useUserProfile';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function FacultyDashboard() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (!profileLoading && profile && auth.currentUser) {
      // Wait for profile to load
      const q = query(
        collection(db, 'notices'),
        where('createdBy', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: Notice[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title,
            content: d.description || d.content || '',
            category: d.category,
            date: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '',
            time: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            author: profile.name,
            status: d.status,
          };
        });
        setRecentNotices(data);
      });
      return () => unsubscribe();
    }
  }, [profile, profileLoading]);

  const quickActions = [
    { id: '1', icon: 'add-circle', title: 'Submit Notice', color: Colors.primary, route: '/faculty-create-notice' },
    { id: '2', icon: 'list', title: 'My Notices', color: Colors.secondary, route: '/faculty-my-notices' },
    { id: '3', icon: 'settings', title: 'Settings', color: Colors.warning, route: '/faculty-settings' },
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>

        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {profileLoading
              ? 'Loading...'
              : profile
                ? `Welcome, ${profile.name} (${profile.role})! 👋`
                : 'Welcome! 👋'}
          </Text>
          <Text style={styles.subtitle}>Submit notices for admin approval</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}> 
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Recent Notices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Submissions</Text>
            <TouchableOpacity onPress={() => router.push('/faculty-my-notices')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentNotices.length === 0 ? (
            <Text style={{ color: Colors.textTertiary, textAlign: 'center', marginVertical: 16 }}>No recent submissions.</Text>
          ) : (
            recentNotices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onPress={() => {
                  if (notice.status === 'Pending') {
                    router.push(`/faculty-edit-notice?id=${notice.id}`);
                  } else {
                    router.push(`/notice-detail?id=${notice.id}`);
                  }
                }}
              />
            ))
          )}
        </View>
        {/* Submit Notice Button */}
        <Button
          title="Submit New Notice"
          onPress={() => router.push('/faculty-create-notice')}
          size="lg"
          fullWidth
          style={styles.createButton}
        />
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
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.primary,
  },
  backButton: {
    marginRight: Spacing.lg,
    padding: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.9,
    marginTop: Spacing.xs,
  },
  profileButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  createButton: {
    marginBottom: Spacing.xxxl,
  },
});
