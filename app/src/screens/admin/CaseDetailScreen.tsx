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
import { cases, documents } from '../../data/mockData';
import { colors, caseStatusColors } from '../../theme';

export default function CaseDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { caseId } = route.params;

  const caseItem = cases.find((c) => c.id === caseId);
  if (!caseItem) return null;

  const caseDocs = documents.filter((d) => d.caseId === caseId);

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.areaBadge]}>
          <Text style={styles.areaText}>{caseItem.area}</Text>
        </View>
        <Text style={styles.caseTitle} numberOfLines={2}>{caseItem.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: caseStatusColors[caseItem.status] + '30' }]}>
          <Text style={[styles.statusText, { color: caseStatusColors[caseItem.status] }]}>{caseItem.status}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Cliente" value={caseItem.clientName} />
          <InfoRow icon="document-text-outline" label="Número" value={caseItem.number} />
          {caseItem.court && <InfoRow icon="business-outline" label="Vara" value={caseItem.court} />}
          {caseItem.judge && <InfoRow icon="person-circle-outline" label="Juiz" value={caseItem.judge} />}
          <InfoRow icon="calendar-outline" label="Abertura" value={formatDate(caseItem.openedAt)} />
          <InfoRow icon="refresh-outline" label="Atualização" value={formatDate(caseItem.updatedAt)} />
          {caseItem.nextHearing && (
            <InfoRow icon="alarm-outline" label="Próx. Audiência" value={formatDate(caseItem.nextHearing)} last />
          )}
        </View>

        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.descCard}>
          <Text style={styles.description}>{caseItem.description}</Text>
        </View>

        <Text style={styles.sectionTitle}>Histórico de Atualizações</Text>
        {caseItem.updates.map((u, idx) => (
          <View key={u.id} style={styles.updateCard}>
            <View style={styles.updateTimeline}>
              <View style={styles.updateDot} />
              {idx < caseItem.updates.length - 1 && <View style={styles.updateLine} />}
            </View>
            <View style={styles.updateContent}>
              <Text style={styles.updateDate}>{formatDate(u.date)}</Text>
              <Text style={styles.updateDesc}>{u.description}</Text>
              <Text style={styles.updateAuthor}>{u.author}</Text>
            </View>
          </View>
        ))}

        {caseDocs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Documentos ({caseDocs.length})</Text>
            {caseDocs.map((d) => (
              <View key={d.id} style={styles.docCard}>
                <Ionicons name="document-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{d.name}</Text>
                  <Text style={styles.docMeta}>{d.category} · {formatDate(d.uploadedAt)} · {d.size}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Ionicons name={icon as any} size={16} color={colors.primary} style={{ marginRight: 8 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
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
  },
  backBtn: { marginBottom: 16 },
  areaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary + '30',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  areaText: { color: colors.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  caseTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12, lineHeight: 24 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
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
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { flex: 1, color: colors.textSecondary, fontSize: 13 },
  infoValue: { color: colors.text, fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  descCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  description: { color: colors.text, fontSize: 14, lineHeight: 22 },
  updateCard: { flexDirection: 'row', marginBottom: 4 },
  updateTimeline: { alignItems: 'center', marginRight: 12 },
  updateDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
  updateLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 },
  updateContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  updateDate: { fontSize: 12, color: colors.primary, fontWeight: '700', marginBottom: 4 },
  updateDesc: { fontSize: 13, color: colors.text, lineHeight: 20 },
  updateAuthor: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
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
