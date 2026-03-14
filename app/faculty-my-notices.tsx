
import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { auth, db } from '@/constants/firebase';
import { FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { useSavedNoticeIds } from '@/utils/useSavedNoticeIds';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MyNotice = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt?: any;
};


export default function FacultyMyNotices() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<'approved' | 'pending' | 'rejected' | 'draft'>('approved');
  const [notices, setNotices] = useState<MyNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const savedNoticeIds = useSavedNoticeIds();

  const noticeStatuses = [
    { key: 'approved', label: 'Approved', color: Colors.success, bg: Colors.successLight },
    { key: 'pending', label: 'Pending', color: Colors.warning, bg: Colors.warningLight },
    { key: 'rejected', label: 'Rejected', color: Colors.error, bg: Colors.errorLight },
    { key: 'draft', label: 'Draft', color: Colors.textTertiary, bg: Colors.gray200 },
  ];

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);
    const q = query(
      collection(db, 'notices'),
      where('createdBy', '==', auth.currentUser.uid),
      where('status', '==', selectedStatus),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: MyNotice[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || '',
          description: d.description || '',
          category: d.category || '',
          status: d.status || '',
          createdAt: d.createdAt,
        };
      });
      setNotices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedStatus]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Notices</Text>
      </View>
      <View style={styles.tabs}>
        {noticeStatuses.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[styles.tab, selectedStatus === status.key && { backgroundColor: status.color + '20' }]}
            onPress={() => setSelectedStatus(status.key as any)}
          >
            <Text style={[styles.tabText, selectedStatus === status.key && { color: status.color, fontWeight: FontWeight.bold }]}> 
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : notices.length === 0 ? (
          <Text style={styles.emptyText}>No {selectedStatus} notices found.</Text>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} style={styles.noticeCard}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/notice-detail', params: { id: notice.id } })}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDesc} numberOfLines={2}>{notice.description}</Text>
                <View style={styles.noticeMeta}>
                  <Text
                    style={[styles.statusBadge, {
                      backgroundColor: noticeStatuses.find(s => s.key === notice.status)?.bg || Colors.gray200,
                      color: noticeStatuses.find(s => s.key === notice.status)?.color || Colors.textPrimary,
                    }]}
                  >
                    {noticeStatuses.find(s => s.key === notice.status)?.label || notice.status}
                  </Text>
                  <Ionicons
                    name={savedNoticeIds.includes(notice.id) ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={savedNoticeIds.includes(notice.id) ? Colors.primary : Colors.textTertiary}
                    style={{ marginLeft: 8 }}
                  />
                  <Ionicons name="eye-outline" size={18} color={Colors.primary} style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            </Card>
          ))
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
  },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: Colors.surface,
      paddingVertical: Spacing.sm,
      marginBottom: Spacing.md,
    },
    tab: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      borderRadius: 9999,
    },
    tabText: { fontSize: FontSize.md, color: Colors.textSecondary },
    loadingText: { textAlign: 'center', marginTop: 32, color: Colors.textSecondary },
    emptyText: { textAlign: 'center', marginTop: 32, color: Colors.textSecondary },
    noticeCard: { marginBottom: Spacing.lg, padding: Spacing.lg },
    noticeTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
    noticeDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginVertical: Spacing.xs },
    noticeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
    statusBadge: {
      fontSize: FontSize.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: 9999,
      overflow: 'hidden',
      marginRight: 8,
    },
  backButton: {
    marginRight: Spacing.lg,
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
});
