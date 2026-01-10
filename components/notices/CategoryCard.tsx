import { CategoryColors, Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Category = 'exam' | 'events' | 'fees' | 'holidays' | 'general';

interface CategoryCardProps {
  category: Category;
  count: number;
  onPress: () => void;
}

const categoryIcons: Record<Category, keyof typeof Ionicons.glyphMap> = {
  exam: 'document-text',
  events: 'calendar',
  fees: 'cash',
  holidays: 'sunny',
  general: 'information-circle',
};

const categoryLabels: Record<Category, string> = {
  exam: 'Exams',
  events: 'Events',
  fees: 'Fees',
  holidays: 'Holidays',
  general: 'General',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, count, onPress }) => {
  const colors = CategoryColors[category];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.text + '20' }]}>
        <Ionicons name={categoryIcons[category]} size={24} color={colors.text} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{categoryLabels[category]}</Text>
      <Text style={[styles.count, { color: colors.text }]}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.xs,
  },
  count: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
});
