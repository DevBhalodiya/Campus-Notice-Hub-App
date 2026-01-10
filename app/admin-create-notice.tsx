import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CategoryColors, Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Category = 'exam' | 'events' | 'fees' | 'holidays' | 'general';

export default function CreateNoticeScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');
  const [loading, setLoading] = useState(false);

  const categories: Category[] = ['exam', 'events', 'fees', 'holidays', 'general'];

  const handlePublish = () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Notice published successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Notice</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
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
            <Ionicons name="create-outline" size={20} color={Colors.textTertiary} style={styles.textAreaIcon} />
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

        {/* Preview Card */}
        <View style={styles.section}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View
                style={[
                  styles.previewBadge,
                  { backgroundColor: CategoryColors[selectedCategory].bg, borderColor: CategoryColors[selectedCategory].border },
                ]}
              >
                <Text style={[styles.previewBadgeText, { color: CategoryColors[selectedCategory].text }]}>
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.previewTitle}>{title || 'Notice Title'}</Text>
            <Text style={styles.previewContent}>{content || 'Notice content will appear here...'}</Text>
            <View style={styles.previewFooter}>
              <Text style={styles.previewDate}>Just now</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Save as Draft"
            onPress={() => {}}
            variant="outline"
            size="lg"
            style={styles.draftButton}
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
    </SafeAreaView>
  );
}

import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
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
    flexDirection: 'row',
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
    alignSelf: 'flex-start',
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
    flexDirection: 'row',
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
