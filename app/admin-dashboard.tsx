import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const categories = ['Exam', 'Events', 'Fees', 'Holidays'];

const AdminDashboard = () => {
  const [notice, setNotice] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [notices, setNotices] = useState([
    { id: '1', title: 'Exam Timetable Released', category: 'Exam' },
    { id: '2', title: 'Annual Fest on 20th Jan', category: 'Events' },
  ]);

  const postNotice = () => {
    if (notice.trim()) {
      setNotices([
        { id: Date.now().toString(), title: notice, category },
        ...notices,
      ]);
      setNotice('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Notice</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter notice..."
          value={notice}
          onChangeText={setNotice}
        />
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, category === cat && styles.selectedCategory]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.postButton} onPress={postNotice}>
          <Text style={styles.postText}>Post Notice</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Posted Notices</Text>
      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noticeItem}>
            <Text style={styles.noticeTitle}>{item.title}</Text>
            <Text style={styles.noticeCategory}>{item.category}</Text>
          </View>
        )}
        style={styles.noticeList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222f3e',
    marginBottom: 24,
    alignSelf: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#222f3e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d8e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#f7f7f7',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#d1d8e0',
    marginHorizontal: 2,
  },
  selectedCategory: {
    backgroundColor: '#3867d6',
  },
  categoryText: {
    color: '#222f3e',
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#3867d6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  postText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222f3e',
  },
  noticeList: {
    flex: 1,
  },
  noticeItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  noticeTitle: {
    fontWeight: '600',
    color: '#222f3e',
    flex: 1,
  },
  noticeCategory: {
    color: '#3867d6',
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default AdminDashboard;
