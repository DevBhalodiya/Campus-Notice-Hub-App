
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { auth, db } from '@/constants/firebase';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FacultyEditNotice() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid notice ID.');
        setLoading(false);
        return;
      }
      if (!auth.currentUser) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }
      try {
        const noticeRef = doc(db, 'notices', id);
        const snap = await getDoc(noticeRef);
        if (!snap.exists()) {
          setError('Notice not found.');
          setLoading(false);
          return;
        }
        const data = snap.data();
        if (data.createdBy !== auth.currentUser.uid) {
          setError('You do not have permission to edit this notice.');
          setLoading(false);
          return;
        }
        if (data.status !== 'pending') {
          setError('Only pending notices can be edited.');
          setLoading(false);
          return;
        }
        setTitle(data.title || '');
        setContent(data.description || '');
        setCategory(data.category || '');
        setLoading(false);
      } catch (e) {
        setError('Failed to fetch notice.');
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  const handleUpdate = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }
    if (!title.trim() || !content.trim() || !category.trim()) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const noticeRef = doc(db, 'notices', id as string);
      // Only update title, description, category, keep status as 'pending'
      await updateDoc(noticeRef, {
        title: title.trim(),
        description: content.trim(),
        category: category.trim(),
        status: 'pending',
      });
      Alert.alert('Notice Updated', 'Your changes have been sent to admin for approval.', [
        { text: 'OK', onPress: () => router.push('/faculty-my-notices') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to update notice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color={Colors.primary} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Edit Notice</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: Colors.error, fontSize: 16, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : (
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
            title={submitting ? 'Updating...' : 'Update Notice'}
            onPress={handleUpdate}
            size="lg"
            fullWidth
            style={styles.submitButton}
            disabled={submitting}
          />
        </View>
      )}
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
