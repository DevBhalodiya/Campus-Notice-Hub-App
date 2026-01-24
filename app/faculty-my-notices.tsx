
import { NoticeCard } from '@/components/notices/NoticeCard';
import { Colors } from '@/constants/colors';
import { auth, db } from '@/constants/firebase';
import { FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [notices, setNotices] = useState<MyNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'notices'),
      where('createdBy', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: MyNotice[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as MyNotice);
      setNotices(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getStatusBadge = (status: string) => {
    let color = Colors.gray400;
    let label = status;
    if (status === 'pending') {
      color = Colors.warning;
      label = 'Pending';
    } else if (status === 'approved') {
      color = Colors.success;
      label = 'Approved';
    } else if (status === 'rejected') {
      color = Colors.error;
      label = 'Rejected';
    }
    return (
      <View style={{ backgroundColor: color + '30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 6 }}>
        <Text style={{ color, fontWeight: 'bold', fontSize: 12 }}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notices</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {notices.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 32, color: Colors.textSecondary }}>No notices found.</Text>
          ) : (
            notices.map((notice) => (
              <View key={notice.id} style={{ marginBottom: 16 }}>
                {getStatusBadge(notice.status)}
                <NoticeCard
                  notice={{
                    id: notice.id,
                    title: notice.title,
                    content: notice.description,
                    category: notice.category || 'general',
                    date: '',
                    time: '',
                    author: '',
                  }}
                  onPress={
                    notice.status === 'pending'
                      ? () => router.push(`/faculty-edit-notice?id=${notice.id}`)
                      : undefined
                  }
                />
                {/* Edit button only for pending */}
                {notice.status === 'pending' && (
                  <TouchableOpacity
                    style={{ alignSelf: 'flex-end', marginTop: -8, marginBottom: 8 }}
                    onPress={() => router.push(`/faculty-edit-notice?id=${notice.id}`)}
                  >
                    <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 14 }}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
});
