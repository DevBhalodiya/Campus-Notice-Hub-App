import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Notice, NoticeCard } from '@/components/notices/NoticeCard';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockNotices: Notice[] = [
  {
    id: '1',
    title: 'Mid-Semester Examination Schedule Released',
    content: 'The schedule for mid-semester examinations has been released.',
    category: 'exam',
    date: '10 Jan',
    time: '09:30 AM',
    author: 'Dr. Admin',
  },
  {
    id: '2',
    title: 'Annual Tech Fest 2026 - Registration Open',
    content: 'Join us for the biggest tech fest of the year!',
    category: 'events',
    date: '09 Jan',
    time: '02:15 PM',
    author: 'Dr. Admin',
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  const stats = [
    { id: '1', label: 'Total Notices', value: '48', icon: 'document-text', color: Colors.primary },
    { id: '2', label: 'Active Students', value: '1,234', icon: 'people', color: Colors.success },
    { id: '3', label: 'Today\'s Posts', value: '5', icon: 'calendar', color: Colors.warning },
    { id: '4', label: 'Total Views', value: '12.5K', icon: 'eye', color: Colors.info },
  ];

  const quickActions = [
    { id: '1', icon: 'add-circle', title: 'New Notice', color: Colors.primary, route: '/admin-create-notice' },
    { id: '2', icon: 'list', title: 'All Notices', color: Colors.secondary, route: '/admin-all-notices' },
    { id: '3', icon: 'bar-chart', title: 'Analytics', color: Colors.success, route: '/admin-analytics' },
    { id: '4', icon: 'settings', title: 'Settings', color: Colors.warning, route: '/admin-settings' },
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
        <View>
          <Text style={styles.greeting}>Welcome, Admin! 👋</Text>
          <Text style={styles.subtitle}>Manage campus notices</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <Card key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

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
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            <TouchableOpacity onPress={() => router.push('/admin-all-notices')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {mockNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onPress={() => router.push(`/admin-edit-notice?id=${notice.id}`)}
            />
          ))}
        </View>

        {/* Create Notice Button */}
        <Button
          title="Create New Notice"
          onPress={() => router.push('/admin-create-notice')}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.primary,
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
