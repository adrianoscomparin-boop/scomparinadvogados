import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { documents } from '../../data/mockData';
import { colors } from '../../theme';
import { Document } from '../../types';

const categoryIcons: Record<string, string> = {
  petição: 'document-text',
  contrato: 'reader',
  procuração: 'person-circle',
  decisão: 'hammer',
  outros: 'document',
};

export default function ClientDocumentsScreen() {
  const { user } = useAuth();
  const myDocs = documents.filter((d) => d.clientId === user?.id);

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function renderDocument({ item }: { item: Document }) {
    const icon = categoryIcons[item.category] || 'document';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => Alert.alert('Documento', `${item.name}\n\nCategoria: ${item.category}\nData: ${formatDate(item.uploadedAt)}\nTamanho: ${item.size}`)}
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
            {item.caseNumber && (
              <Text style={styles.caseNum} numberOfLines={1}>{item.caseNumber}</Text>
            )}
          </View>
          <Text style={styles.meta}>{formatDate(item.uploadedAt)} · {item.size}</Text>
        </View>
        <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Meus Documentos</Text>
        <Text style={styles.subtitle}>{myDocs.length} documento(s)</Text>
      </View>
      <FlatList
        data={myDocs}
        keyExtractor={(i) => i.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Nenhum documento disponível.</Text>
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
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
  list: { padding: 16, paddingBottom: 24 },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  catBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: { fontSize: 11, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  caseNum: { fontSize: 10, color: colors.textSecondary, maxWidth: 180 },
  meta: { fontSize: 11, color: colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: colors.textSecondary, fontSize: 14, marginTop: 12 },
});
