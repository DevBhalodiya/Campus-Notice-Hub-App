import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Spacing } from '@/constants/spacing';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FacultySettings() {
  const router = require('expo-router').useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Faculty Settings</Text>
        <View style={{ width: 32 }} />
      </View>
      <Text style={styles.text}>Settings page for faculty (profile, preferences, etc.).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginRight: Spacing.lg,
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
