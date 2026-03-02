import { Button } from '@/components/common/Button';
import { Colors } from '@/constants/colors';
import { auth, db } from '@/constants/firebase';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

export default function FacultyCreateNotice() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

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
    let imageUrl = '';
    try {
      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }
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
        imageUrl: imageUrl || '',
      });
      setTitle('');
      setContent('');
      setCategory('');
      setImageUri(null);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
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
            <View style={{ marginVertical: 16 }}>
              {imageUri && (
                <View>
                  <Text style={styles.label}>Image Preview</Text>
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180, borderRadius: 8, marginBottom: 14 }} />
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Button title="Pick Image" onPress={pickImage} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Take Photo" onPress={takePhoto} style={{ flex: 1, marginLeft: 8 }} />
            </View>
            <Button
              title={loading ? 'Submitting...' : 'Submit for Approval'}
              onPress={handleSubmit}
              size="lg"
              fullWidth
              style={styles.submitButton}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
