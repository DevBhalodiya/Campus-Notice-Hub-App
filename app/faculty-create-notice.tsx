import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/constants/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FacultyCreateNotice() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to create a notice.');
      return;
    }
    if (!title.trim() || !content.trim() || !category.trim()) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'notices'), {
        title: title.trim(),
        description: content.trim(),
        category: category.trim(),
        createdBy: auth.currentUser.uid,
        creatorRole: 'faculty',
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setContent('');
      setCategory('');
      Alert.alert('Notice sent for admin approval', '', [
        { text: 'OK', onPress: () => router.push('/faculty-dashboard') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit notice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color={Colors.primary} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Submit Notice</Text>
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
          title={loading ? 'Submitting...' : 'Submit for Approval'}
          onPress={handleSubmit}
          size="lg"
          fullWidth
          style={styles.submitButton}
          disabled={loading}
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
