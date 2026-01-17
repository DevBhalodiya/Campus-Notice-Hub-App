import { Notice, NoticeCard } from '@/components/notices/NoticeCard';
import { Colors } from '@/constants/colors';
import { Spacing, FontSize, FontWeight } from '@/constants/spacing';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockMyNotices: Notice[] = [
  {
    id: '1',
    title: 'Faculty Seminar Proposal',
    content: 'A new seminar proposal has been submitted for review.',
    category: 'seminar',
    date: '11 Jan',
    time: '10:00 AM',
    author: 'Prof. Faculty',
    status: 'Pending',
  },
  {
    id: '2',
    title: 'Research Paper Submission',
    content: 'Research paper submitted for admin approval.',
    category: 'research',
    date: '10 Jan',
    time: '03:00 PM',
    author: 'Prof. Faculty',
    status: 'Approved',
  },
];

export default function FacultyMyNotices() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notices</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mockMyNotices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            onPress={() => router.push(`/faculty-edit-notice?id=${notice.id}`)}
          />
        ))}
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
