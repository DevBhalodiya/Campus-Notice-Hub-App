// screens/CreateNoticeScreen.js

import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db as firestore } from '../constants/firebase';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';

const CreateNoticeScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user role.');
      }
    };
    fetchUserRole();
  }, []);

  const askPermission = async (type) => {
    let result;
    if (type === 'camera') {
      result = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!result.granted) {
      setHasPermission(false);
      Alert.alert('Permission Denied', `Permission to access ${type} is required.`);
      return false;
    }
    setHasPermission(true);
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
    if (role === 'student') {
      Alert.alert('Permission Denied', 'Students cannot upload notices.');
      return;
    }
    if (!title || !description || !category) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    let imageUrl = '';
    try {
      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }
      const user = auth.currentUser;
      await addDoc(collection(firestore, 'notices'), {
        title,
        description,
        category,
        status: 'pending',
        creatorRole: role,
        createdBy: user.uid,
        imageUrl: imageUrl || '',
        createdAt: new Date(),
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setImageUri(null);
      Alert.alert('Success', 'Notice submitted successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create Notice</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.submitButton, role === 'student' && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading || role === 'student'}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Notice</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 14,
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  button: {
    flex: 1,
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#388e3c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
});

export default CreateNoticeScreen;
