import { Colors } from '@/constants/colors';
import { Spacing, FontSize, FontWeight } from '@/constants/spacing';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FacultySettings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Settings</Text>
      <Text style={styles.text}>Settings page for faculty (profile, preferences, etc.).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
