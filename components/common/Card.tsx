import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, elevated = true }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, elevated && styles.elevated, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  elevated: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});
