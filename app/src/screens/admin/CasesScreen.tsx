import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { cases } from '../../data/mockData';
import { colors, caseStatusColors } from '../../theme';
import { Case, CaseStatus } from '../../types';

const STATUS_FILTERS: (CaseStatus | 'todos')[] = ['todos', 'ativo', 'aguardando', 'arquivado', 'encerrado'];

export default function CasesScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'todos'>('todos');

  const filtered = cases.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.number.includes(search);
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function renderCase({ item }: { item: Case }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.caseArea}>{item.area}</Text>
            <Text style={styles.caseTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.caseClient}>{item.clientName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: caseStatusColors[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: caseStatusColors[item.status] }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Ionicons name="document-text-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.caseNumber}> {item.number}</Text>
          {item.nextHearing && (
            <>
              <Text style={styles.separator}> · </Text>
              <Ionicons name="calendar-outline" size={13} color={colors.warning} />
              <Text style={[styles.caseNumber, { color: colors.warning }]}> {formatDate(item.nextHearing)}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Processos</Text>
        <Text style={styles.subtitle}>{cases.length} processos no total</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.search}
          placeholder="Buscar por título, cliente ou número..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>
              {s === 'todos' ? 'Todos' : s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderCase}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum processo encontrado.</Text>}
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
  filtersRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
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
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  caseArea: { fontSize: 11, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  caseTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  caseClient: { fontSize: 12, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardBottom: { flexDirection: 'row', alignItems: 'center' },
  caseNumber: { fontSize: 11, color: colors.textSecondary },
  separator: { color: colors.textSecondary, fontSize: 11 },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
