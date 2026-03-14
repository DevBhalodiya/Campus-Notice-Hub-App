import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { db } from '@/constants/firebase';
import { FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const categories = [
  'exam',
  'events',
  'fees',
  'holidays',
  'general',
  // Add more categories as needed
];


type Notice = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt?: any;
};

export default function StudentAllNotices() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = query(
      collection(db, 'notices'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((doc) => {
        const d = doc.data() as Notice;
        return {
          id: doc.id,
          title: d.title || '',
          description: d.description || '',
          category: d.category || '',
          status: d.status || '',
          createdAt: d.createdAt,
        };
      });
      if (selectedCategory !== 'all') {
        data = data.filter((n) => n.category === selectedCategory);
      }
      setNotices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/student-home')}>
          <Ionicons name="arrow-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Notices</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
        <TouchableOpacity
          style={[styles.categoryTab, selectedCategory === 'all' && styles.selectedCategoryTab]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'all' && styles.selectedCategoryText]}>All</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryTab, selectedCategory === cat && styles.selectedCategoryTab]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedCategoryText]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : notices.length === 0 ? (
          <Text style={styles.emptyText}>No notices found.</Text>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} style={styles.noticeCard}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/student-notice-detail', params: { id: notice.id } })}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDesc} numberOfLines={2}>{notice.description}</Text>
                <View style={styles.noticeMeta}>
                  <Text style={[styles.statusBadge, { backgroundColor: Colors.successLight, color: Colors.success }]}>Approved</Text>
                </View>
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#F6F8FB',
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
    marginLeft: 0,
  },
  categoryBar: {
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    marginTop: 4,
  },
  categoryTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E9E9F7',
  },
  selectedCategoryTab: {
    backgroundColor: Colors.primary + '20',
  },
  categoryText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  loadingText: { textAlign: 'center', marginTop: 32, color: Colors.textSecondary },
  emptyText: { textAlign: 'center', marginTop: 32, color: Colors.textSecondary },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 0,
  },
  noticeCard: {
    marginBottom: 20,
    padding: Spacing.lg,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  noticeTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  noticeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: FontSize.xs,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 9999,
    overflow: 'hidden',
    marginRight: 8,
    fontWeight: 'bold',
    minWidth: 70,
    textAlign: 'center',
  },
});
