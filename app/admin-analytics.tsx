import { Card } from '@/components/common/Card';
import { Colors } from '@/constants/colors';
import { db } from '@/constants/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyPosts, setDailyPosts] = useState<{ date: string, count: number }[]>([]);
  const [viewsData, setViewsData] = useState<{ title: string, views: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Listen for notices
    const unsub = onSnapshot(collection(db, 'notices'), (snapshot) => {
      const notices = snapshot.docs.map(doc => doc.data());
      // Posts per day
      const postsByDate: Record<string, number> = {};
      notices.forEach(notice => {
        const createdAt = notice.createdAt?.toDate?.() || notice.createdAt;
        if (createdAt) {
          const dateStr = new Date(createdAt).toLocaleDateString();
          postsByDate[dateStr] = (postsByDate[dateStr] || 0) + 1;
        }
      });
      const dailyPostsArr = Object.entries(postsByDate).map(([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDailyPosts(dailyPostsArr);
      // Views per notice
      setViewsData(notices.map(n => ({ title: n.title, views: n.views || 0 })));
      setLoading(false);
    }, (err) => {
      setError('Failed to fetch analytics');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.title}>Analytics</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color={Colors.primary} /> : error ? <Text style={styles.error}>{error}</Text> : (
        <>
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Posts Per Day</Text>
            {dailyPosts.length > 0 ? (
              <LineChart
                data={{
                  labels: dailyPosts.map(d => d.date),
                  datasets: [{ data: dailyPosts.map(d => d.count) }],
                }}
                width={320}
                height={220}
                chartConfig={{
                  backgroundColor: Colors.surface,
                  backgroundGradientFrom: Colors.surface,
                  backgroundGradientTo: Colors.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => Colors.primary,
                  labelColor: (opacity = 1) => Colors.textPrimary,
                }}
                style={{ borderRadius: 16 }}
              />
            ) : <Text>No data available.</Text>}
          </Card>
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Views Per Notice</Text>
            {viewsData.length > 0 ? (
              viewsData.map((v, idx) => (
                <View key={idx} style={styles.viewsRow}>
                  <Text style={styles.noticeTitle}>{v.title}</Text>
                  <Text style={styles.viewsCount}>{v.views} views</Text>
                </View>
              ))
            ) : <Text>No data available.</Text>}
          </Card>
        </>
      )}
    </ScrollView>
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
  error: { color: Colors.error, marginVertical: 16 },
  card: { marginBottom: 24, padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: Colors.textPrimary },
  viewsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  noticeTitle: { fontSize: 16, color: Colors.textPrimary },
  viewsCount: { fontSize: 16, color: Colors.info },
});
