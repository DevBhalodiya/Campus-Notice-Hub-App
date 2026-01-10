import { CategoryColors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Category = 'exam' | 'events' | 'fees' | 'holidays' | 'general';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const colors = CategoryColors[category];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
          size === 'sm' && styles.textSm,
        ]}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  textSm: {
    fontSize: FontSize.xs,
  },
});
