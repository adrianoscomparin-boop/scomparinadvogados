import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { users, cases, documents, transactions } from '../../data/mockData';
import { colors, caseStatusColors } from '../../theme';

export default function ClientDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clientId } = route.params;

  const client = users.find((u) => u.id === clientId);
  const clientCases = cases.filter((c) => c.clientId === clientId);
  const clientDocs = documents.filter((d) => d.clientId === clientId);
  const clientTransactions = transactions.filter((t) => t.clientId === clientId);
  const totalReceived = clientTransactions
    .filter((t) => t.type === 'receita' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);

  if (!client) return null;

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function formatCurrency(val: number) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{client.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{client.name}</Text>
        <Text style={styles.email}>{client.email}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.infoCard}>
          <InfoRow icon="call-outline" label="Telefone" value={client.phone || '—'} />
          <InfoRow icon="card-outline" label="CPF" value={client.cpf || '—'} />
          <InfoRow icon="briefcase-outline" label="Processos" value={`${clientCases.length} processo(s)`} />
          <InfoRow icon="cash-outline" label="Total pago" value={formatCurrency(totalReceived)} last />
        </View>

        <Text style={styles.sectionTitle}>Processos</Text>
        {clientCases.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.caseCard}
            onPress={() => navigation.navigate('CaseDetail', { caseId: c.id })}
            activeOpacity={0.8}
          >
            <View style={styles.caseHeader}>
              <Text style={styles.caseArea}>{c.area}</Text>
              <View style={[styles.statusBadge, { backgroundColor: caseStatusColors[c.status] + '20' }]}>
                <Text style={[styles.statusText, { color: caseStatusColors[c.status] }]}>{c.status}</Text>
              </View>
            </View>
            <Text style={styles.caseTitle}>{c.title}</Text>
            <Text style={styles.caseNumber}>{c.number}</Text>
            {c.nextHearing && (
              <Text style={styles.caseHearing}>Próxima audiência: {formatDate(c.nextHearing)}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Documentos ({clientDocs.length})</Text>
        {clientDocs.map((d) => (
          <View key={d.id} style={styles.docCard}>
            <Ionicons name="document-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.docName}>{d.name}</Text>
              <Text style={styles.docMeta}>{d.category} · {formatDate(d.uploadedAt)} · {d.size}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Ionicons name={icon as any} size={18} color={colors.primary} style={{ marginRight: 10 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backBtn: { position: 'absolute', top: 52, left: 16, padding: 4 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: colors.primary, fontSize: 28, fontWeight: '700' },
  name: { color: '#fff', fontSize: 20, fontWeight: '700' },
  email: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 32 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { flex: 1, color: colors.textSecondary, fontSize: 14 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  caseCard: {
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
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  caseArea: { fontSize: 12, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  caseTitle: { fontSize: 14, color: colors.text, fontWeight: '600', marginBottom: 4 },
  caseNumber: { fontSize: 11, color: colors.textSecondary },
  caseHearing: { fontSize: 12, color: colors.warning, marginTop: 4, fontWeight: '500' },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  docName: { fontSize: 13, color: colors.text, fontWeight: '500' },
  docMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
});
