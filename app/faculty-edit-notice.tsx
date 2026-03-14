
import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { auth, db } from '@/constants/firebase';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

export default function FacultyEditNotice() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

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
        setImageUri(data.imageUrl || null);
        setOriginalImageUrl(data.imageUrl || null);
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
      let imageUrl = originalImageUrl;
      if (imageUri && imageUri !== originalImageUrl) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }
      if (!imageUri) {
        imageUrl = '';
      }
      const noticeRef = doc(db, 'notices', id as string);
      await updateDoc(noticeRef, {
        title: title.trim(),
        description: content.trim(),
        category: category.trim(),
        status: 'pending',
        imageUrl: imageUrl || '',
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

  const askPermission = async (type: 'camera' | 'gallery') => {
    let result;
    if (type === 'camera') {
      result = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!result.granted) {
      Alert.alert('Permission Denied', `Permission to access ${type} is required.`);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const granted = await askPermission('gallery');
    if (!granted) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const takePhoto = async () => {
    const granted = await askPermission('camera');
    if (!granted) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo.');
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
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
            {/* Image Preview and Actions */}
            {imageUri ? (
              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 8 }} />
                <TouchableOpacity onPress={() => setImageUri(null)} style={{ marginBottom: 8 }}>
                  <Text style={{ color: Colors.error }}>Remove Image</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <Button title="Pick Image" onPress={pickImage} variant="outline" size="md" style={{ flex: 1 }} />
              <Button title="Take Photo" onPress={takePhoto} variant="outline" size="md" style={{ flex: 1 }} />
            </View>
            <Button
              title={submitting ? 'Updating...' : 'Update Notice'}
              onPress={handleUpdate}
              size="lg"
              fullWidth
              style={styles.submitButton}
              disabled={submitting}
            />
          </View>
        </ScrollView>
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
