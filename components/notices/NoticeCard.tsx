import { Card } from '@/components/common/Card';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'exam' | 'events' | 'fees' | 'holidays' | 'general';
  date: string;
  time: string;
  isRead?: boolean;
  author: string;
}

interface NoticeCardProps {
  notice: Notice;
  onPress: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onPress }) => {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <CategoryBadge category={notice.category} size="sm" />
        {!notice.isRead && <View style={styles.unreadDot} />}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {notice.title}
      </Text>

      <Text style={styles.content} numberOfLines={2}>
        {notice.content}
      </Text>

      <View style={styles.footer}>
        <View style={styles.authorInfo}>
          <Ionicons name="person-circle-outline" size={16} color={Colors.textTertiary} />
          <Text style={styles.author}>{notice.author}</Text>
        </View>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.date}>{notice.date}</Text>
          <Ionicons name="time-outline" size={14} color={Colors.textTertiary} style={styles.timeIcon} />
          <Text style={styles.time}>{notice.time}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  content: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  timeIcon: {
    marginLeft: Spacing.sm,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
});
