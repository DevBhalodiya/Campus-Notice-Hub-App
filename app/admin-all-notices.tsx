import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { db } from '@/constants/firebase';
import { FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type Notice = {
  id: string;
  title: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected' | 'draft' | string;
  [key: string]: any;
};

const noticeStatuses = [
  { key: 'approved', label: 'Approved', color: Colors.success, bg: Colors.successLight },
  { key: 'pending', label: 'Pending', color: Colors.warning, bg: Colors.warningLight },
  { key: 'rejected', label: 'Rejected', color: Colors.error, bg: Colors.errorLight },
  { key: 'draft', label: 'Draft', color: Colors.textTertiary, bg: Colors.gray200 },
];



export default function AdminAllNotices() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<'approved' | 'pending' | 'rejected' | 'draft'>('approved');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'notices'), where('status', '==', selectedStatus));
    const unsub = onSnapshot(q, (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice)));
      setLoading(false);
    });
    return () => unsub();
  }, [selectedStatus]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Notices</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.tabs}>
        {noticeStatuses.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[styles.tab, selectedStatus === status.key && { backgroundColor: status.color + '20' }]}
            onPress={() => setSelectedStatus(status.key as 'approved' | 'pending' | 'rejected' | 'draft')}
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  backButton: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
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
  content: { flex: 1, paddingHorizontal: Spacing.xl },
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
});
