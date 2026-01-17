import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface RoleToggleProps {
  selectedRole: 'admin' | 'student' | 'faculty';
  onRoleChange: (role: 'admin' | 'student' | 'faculty') => void;
  style?: ViewStyle;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ selectedRole, onRoleChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.leftButton,
          selectedRole === 'student' && styles.selectedButton,
        ]}
        onPress={() => onRoleChange('student')}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, selectedRole === 'student' && styles.selectedText]}>
          Student
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          selectedRole === 'faculty' && styles.selectedButton,
        ]}
        onPress={() => onRoleChange('faculty')}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, selectedRole === 'faculty' && styles.selectedText]}>
          Faculty
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          styles.rightButton,
          selectedRole === 'admin' && styles.selectedButton,
        ]}
        onPress={() => onRoleChange('admin')}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, selectedRole === 'admin' && styles.selectedText]}>
          Admin
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftButton: {
    borderTopLeftRadius: BorderRadius.sm,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  rightButton: {
    borderTopRightRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.white,
  },
});
