import { Card } from '@/components/common/Card';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string; // allow custom categories for faculty
  date: string;
  time: string;
  isRead?: boolean;
  author: string;
  status?: 'Pending' | 'Approved' | 'Rejected'; // for faculty approval flow
  imageUrl?: string; // image URL for the notice
}

interface NoticeCardProps {
  notice: Notice;
  onPress: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onPress }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <CategoryBadge category={notice.category as any} size="sm" />
        {!notice.isRead && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {notice.title}
      </Text>
      <Text style={styles.content} numberOfLines={2}>
        {notice.content}
      </Text>
      {/* Image Preview after description with popup */}
      {notice.imageUrl ? (
        <>
          <Pressable onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: notice.imageUrl }}
              style={{ width: '100%', height: undefined, aspectRatio: 1.8, borderRadius: 8, marginBottom: 12 }}
              resizeMode="contain"
            />
          </Pressable>
          <Modal visible={modalVisible} transparent animationType="fade">
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalVisible(false)}>
              <Image
                source={{ uri: notice.imageUrl }}
                style={{ width: '90%', height: '70%', borderRadius: 12 }}
                resizeMode="contain"
              />
            </Pressable>
          </Modal>
        </>
      ) : null}
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
