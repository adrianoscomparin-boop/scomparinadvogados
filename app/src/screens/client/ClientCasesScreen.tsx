import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { cases } from '../../data/mockData';
import { colors, caseStatusColors } from '../../theme';
import { Case } from '../../types';

export default function ClientCasesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const myCases = cases.filter((c) => c.clientId === user?.id);

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function renderCase({ item }: { item: Case }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ClientCaseDetail', { caseId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={styles.areaBadge}>
            <Text style={styles.areaText}>{item.area}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: caseStatusColors[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: caseStatusColors[item.status] }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.number}>{item.number}</Text>
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="business-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.footerText}> {item.court || 'Não informado'}</Text>
          </View>
          {item.nextHearing && (
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={13} color={colors.warning} />
              <Text style={[styles.footerText, { color: colors.warning }]}> {formatDate(item.nextHearing)}</Text>
            </View>
          )}
        </View>
        <View style={styles.updatesRow}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.updatesText}> {item.updates.length} atualização(ões) · Último em {formatDate(item.updatedAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Processos</Text>
        <Text style={styles.headerSub}>{myCases.length} processo(s)</Text>
      </View>
      <FlatList
        data={myCases}
        keyExtractor={(i) => i.id}
        renderItem={renderCase}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Nenhum processo encontrado.</Text>
          </View>
        }
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
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
  list: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  areaBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  areaText: { fontSize: 12, color: colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  number: { fontSize: 11, color: colors.textSecondary, marginBottom: 10 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 12, color: colors.textSecondary },
  updatesRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  updatesText: { fontSize: 12, color: colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: colors.textSecondary, fontSize: 14, marginTop: 12 },
});
