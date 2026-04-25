import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { documents } from '../../data/mockData';
import { colors } from '../../theme';
import { Document, DocumentCategory } from '../../types';

const CATEGORIES: (DocumentCategory | 'todos')[] = ['todos', 'petição', 'contrato', 'procuração', 'decisão', 'outros'];

const categoryIcons: Record<string, string> = {
  petição: 'document-text',
  contrato: 'reader',
  procuração: 'person-circle',
  decisão: 'hammer',
  outros: 'document',
};

export default function DocumentsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DocumentCategory | 'todos'>('todos');

  const filtered = documents.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.clientName?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCat = category === 'todos' || d.category === category;
    return matchSearch && matchCat;
  });

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function renderDocument({ item }: { item: Document }) {
    const icon = categoryIcons[item.category] || 'document';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => Alert.alert('Documento', `${item.name}\n\nCategoria: ${item.category}\nTamanho: ${item.size}`)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={(icon + '-outline') as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.docName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{item.category}</Text>
            </View>
            {item.clientName && <Text style={styles.meta}>{item.clientName}</Text>}
          </View>
          <Text style={styles.meta}>{formatDate(item.uploadedAt)} · {item.size}</Text>
        </View>
        <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Documentos</Text>
        <Text style={styles.subtitle}>{documents.length} documentos</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.search}
          placeholder="Buscar documento ou cliente..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.filterBtn, category === c && styles.filterBtnActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.filterText, category === c && styles.filterTextActive]}>
              {c === 'todos' ? 'Todos' : c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum documento encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  search: { flex: 1, color: colors.text, fontSize: 14 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  iconBox: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1, marginRight: 8 },
  docName: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  catBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: { fontSize: 11, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  meta: { fontSize: 11, color: colors.textSecondary },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
