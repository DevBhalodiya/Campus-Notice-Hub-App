import { NoticeCard } from '@/components/notices/NoticeCard';
import { Colors } from '@/constants/colors';
import { auth, db } from '@/constants/firebase';
import { FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { useUserProfile } from '@/utils/useUserProfile';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FacultyBookmarks() {
  const router = useRouter();
  const [notices, setNotices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { profile, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'savedNotices')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const noticeIds = snapshot.docs.map((doc) => doc.id);
      if (noticeIds.length === 0) {
        setNotices([]);
        return;
      }
      // Fetch notices by IDs
      const noticePromises = noticeIds.map(async (id) => {
        const noticeDoc = await getDocs(query(collection(db, 'notices'), where('__name__', '==', id)));
        return noticeDoc.docs[0]?.data() ? { id, ...noticeDoc.docs[0].data() } : null;
      });
      const noticesData = (await Promise.all(noticePromises)).filter(Boolean);
      setNotices(noticesData);
    });
    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Notices</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {notices.length === 0 ? (
          <Text style={styles.emptyText}>No saved notices found.</Text>
        ) : (
          notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onPress={() => router.push({ pathname: '/notice-detail', params: { id: notice.id } })}
            />
          ))
        )}
        <View style={{ height: 32 }} />
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
    textAlign: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
    fontSize: FontSize.md,
  },
});
