import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { CategoryColors, Colors } from "@/constants/colors";
import { auth, db } from "@/constants/firebase";
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from "@/constants/spacing";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload";

type Category = "exam" | "events" | "fees" | "holidays" | "general";

export default function FacultyCreateNotice() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("general");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const categories: Category[] = [
    "exam",
    "events",
    "fees",
    "holidays",
    "general",
  ];

  const askPermission = async (type: "camera" | "gallery") => {
    let result;
    if (type === "camera") {
      result = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!result.granted) {
      Alert.alert(
        "Permission Denied",
        `Permission to access ${type} is required.`,
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const granted = await askPermission("gallery");
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
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const takePhoto = async () => {
    const granted = await askPermission("camera");
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
      Alert.alert("Error", "Failed to take photo.");
    }
  };


  const handleSaveDraft = async () => {
    if (!title && !content) {
      Alert.alert('Error', 'Please enter a title or content to save as draft.');
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
        category: selectedCategory,
        createdBy: auth.currentUser?.uid,
        creatorRole: 'faculty',
        status: 'draft',
        approvedBy: null,
        approvedAt: null,
        createdAt: serverTimestamp(),
        imageUrl: imageUrl || '',
      });
      setTitle('');
      setContent('');
      setImageUri(null);
      Alert.alert('Saved', 'Notice saved as draft!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save draft.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    let imageUrl = "";
    try {
      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }
      await addDoc(collection(db, "notices"), {
        title: title.trim(),
        description: content.trim(),
        category: selectedCategory,
        createdBy: auth.currentUser?.uid,
        creatorRole: "faculty",
        status: "pending",
        approvedBy: null,
        approvedAt: null,
        createdAt: serverTimestamp(),
        imageUrl: imageUrl || "",
      });
      setTitle("");
      setContent("");
      setImageUri(null);
      Alert.alert("Success", "Notice sent for admin approval!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit notice.");
    } finally {
      setLoading(false);
    }
  };

  // Get all user tokens and send push to each
  async function notifyAllUsers(noticeTitle: string, noticeId: string) {
    const { getDocs, collection } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, "users"));

    const tokens: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (
        data.expoPushToken &&
        data.notificationPrefs?.enabled !== false &&
        data.notificationPrefs?.newNotices !== false
      ) {
        tokens.push(data.expoPushToken);
      }
    });

    if (tokens.length === 0) return;

    // Send using Expo Push API (no backend server needed for small apps)
    const messages = tokens.map((to) => ({
      to,
      title: "📢 New Campus Notice",
      body: noticeTitle,
      data: { noticeId },
      sound: "default",
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(messages),
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Back Button */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.gray100,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((category) => {
                const colors = CategoryColors[category];
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.text : colors.bg,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isSelected ? Colors.white : colors.text },
                      ]}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Title Input */}
          <Input
            label="Notice Title *"
            placeholder="Enter notice title"
            value={title}
            onChangeText={setTitle}
            icon="document-text-outline"
          />

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Content *</Text>
            <View style={styles.textAreaContainer}>
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.textTertiary}
                style={styles.textAreaIcon}
              />
              <TextInput
                style={styles.textArea}
                placeholder="Write your notice content here..."
                placeholderTextColor={Colors.textTertiary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Image Preview */}
          {imageUri && (
            <View style={styles.section}>
              <Text style={styles.label}>Image Preview</Text>
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 8,
                  marginBottom: 14,
                }}
              />
            </View>
          )}

          {/* Image Picker Buttons */}
          <View style={styles.actions}>
            <Button
              title="Pick Image"
              onPress={pickImage}
              variant="outline"
              size="lg"
              style={styles.draftButton}
            />
            <Button
              title="Take Photo"
              onPress={takePhoto}
              variant="outline"
              size="lg"
              style={styles.draftButton}
            />
          </View>

          {/* Preview Card */}
          <View style={styles.section}>
            <Text style={styles.label}>Preview</Text>
            <View style={styles.previewCard}>
              <View
                style={[
                  styles.previewBadge,
                  {
                    backgroundColor: CategoryColors[selectedCategory].bg,
                    borderColor: CategoryColors[selectedCategory].border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewBadgeText,
                    { color: CategoryColors[selectedCategory].text },
                  ]}
                >
                  {selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1)}
                </Text>
              </View>
              <Text style={styles.previewTitle}>{title || "Notice Title"}</Text>
              <Text style={styles.previewContent}>
                {content || "Notice content will appear here..."}
              </Text>
              <View style={styles.previewFooter}>
                <Text style={styles.previewDate}>Just now</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Save as Draft"
              onPress={handleSaveDraft}
              variant="outline"
              size="lg"
              style={styles.draftButton}
              loading={loading}
            />
            <Button
              title="Publish Notice"
              onPress={handlePublish}
              loading={loading}
              size="lg"
              style={styles.publishButton}
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  categoriesScroll: {
    flexDirection: "row",
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  textAreaContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    padding: Spacing.md,
    minHeight: 200,
  },
  textAreaIcon: {
    marginBottom: Spacing.xs,
  },
  textArea: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  previewHeader: {
    marginBottom: Spacing.sm,
  },
  previewBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  previewBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  previewTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  previewContent: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  previewFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: Spacing.sm,
  },
  previewDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  draftButton: {
    flex: 1,
  },
  publishButton: {
    flex: 1,
  },
});
