import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilter?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilter,
  placeholder = 'Search notices...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textTertiary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {onFilter && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilter}>
          <Ionicons name="options-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  filterButton: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.primaryLight + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
