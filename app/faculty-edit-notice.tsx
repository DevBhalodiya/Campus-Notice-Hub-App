import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FacultyEditNotice() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  // Mocked notice data for editing
  const [title, setTitle] = useState('Sample Notice Title');
  const [content, setContent] = useState('Sample notice content.');
  const [category, setCategory] = useState('general');

  const handleUpdate = () => {
    Alert.alert('Notice Updated', 'Your changes have been sent to admin for approval.', [
      { text: 'OK', onPress: () => router.push('/faculty-my-notices') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color={Colors.primary} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Edit Notice</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter notice title"
        />
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter notice content"
          multiline
        />
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g. events, exam, general"
        />
        <Button
          title="Update Notice"
          onPress={handleUpdate}
          size="lg"
          fullWidth
          style={styles.submitButton}
        />
      </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginLeft: Spacing.md,
  },
  form: {
    flex: 1,
    padding: Spacing.xl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
});
