import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function NoticeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock notice data - In real app, fetch based on params.id
  const notice = {
    id: params.id as string,
    title: 'Mid-Semester Examination Schedule Released',
    content: `The schedule for mid-semester examinations has been released. Students are advised to check their registered courses and exam timings on the student portal.

Important Points:
• All exams will be conducted in offline mode
• Students must carry their ID cards
• Reporting time is 30 minutes before exam
• No electronic devices allowed in exam hall
• Results will be declared within 15 days

For any queries, please contact the examination cell.

Best regards,
Examination Department`,
    category: 'exam' as const,
    date: '10 Jan 2026',
    time: '09:30 AM',
    author: 'Dr. Admin',
    authorRole: 'Examination Head',
    views: 234,
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${notice.title}\n\n${notice.content}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notice Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Badge */}
        <CategoryBadge category={notice.category} />

        {/* Title */}
        <Text style={styles.title}>{notice.title}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{notice.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{notice.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{notice.views} views</Text>
          </View>
        </View>

        {/* Author Info */}
        <View style={styles.authorCard}>
          <View style={styles.authorAvatar}>
            <Ionicons name="person" size={24} color={Colors.primary} />
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{notice.author}</Text>
            <Text style={styles.authorRole}>{notice.authorRole}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentCard}>
          <Text style={styles.noticeContent}>{notice.content}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
            onPress={() => setIsBookmarked(!isBookmarked)}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.actionText, isBookmarked && styles.actionTextActive]}>
              {isBookmarked ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  shareButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  authorRole: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  noticeContent: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  actionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  actionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  actionTextActive: {
    color: Colors.primary,
  },
});
