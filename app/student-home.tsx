import { CategoryCard } from '@/components/notices/CategoryCard';
import { Notice, NoticeCard } from '@/components/notices/NoticeCard';
import { SearchBar } from '@/components/notices/SearchBar';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, IconSize, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/constants/firebase';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type ApprovedNotice = {
  id: string;
  title: string;
  description: string;
  category?: string;
  createdAt?: any;
  creatorRole?: string;
};

export default function StudentHome() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<ApprovedNotice[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'notices'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ApprovedNotice[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as ApprovedNotice);
      setNotices(data);
    });
    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Optionally, you can compute category counts from notices
  const categoryCounts = notices.reduce(
    (acc, n) => {
      const cat = n.category || 'general';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    { exam: 0, events: 0, fees: 0, holidays: 0, general: 0 } as Record<string, number>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Student! 👋</Text>
          <Text style={styles.subtitle}>Stay updated with campus notices</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/student-profile')}>
          <Ionicons name="person-circle" size={IconSize.xl} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilter={() => {}}
        />
        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/student-categories')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            <CategoryCard category="exam" count={categoryCounts.exam} onPress={() => {}} />
            <View style={styles.categoryGap} />
            <CategoryCard category="events" count={categoryCounts.events} onPress={() => {}} />
          </View>
          <View style={styles.categoriesGrid}>
            <CategoryCard category="fees" count={categoryCounts.fees} onPress={() => {}} />
            <View style={styles.categoryGap} />
            <CategoryCard category="holidays" count={categoryCounts.holidays} onPress={() => {}} />
          </View>
        </View>
        {/* Recent Notices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            <TouchableOpacity onPress={() => router.push('/student-all-notices')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={{
                id: notice.id,
                title: notice.title,
                content: notice.description,
                category: notice.category || 'general',
                date: notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleDateString() : '',
                time: notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                author: notice.creatorRole === 'admin' ? 'Admin' : 'Faculty',
              }}
              onPress={() => router.push(`/notice-detail?id=${notice.id}`)}
            />
          ))}
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={Colors.primary} />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/student-categories')}>
          <Ionicons name="grid-outline" size={24} color={Colors.textTertiary} />
          <Text style={styles.navText}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/student-bookmarks')}>
          <Ionicons name="bookmark-outline" size={24} color={Colors.textTertiary} />
          <Text style={styles.navText}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/student-profile')}>
          <Ionicons name="person-outline" size={24} color={Colors.textTertiary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  profileButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
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
  categoriesGrid: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  categoryGap: {
    width: Spacing.md,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  navText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  navTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
