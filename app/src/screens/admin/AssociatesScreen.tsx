import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../contexts/PermissionsContext';
import { LawyerPermissions } from '../../types';
import { colors } from '../../theme';

type PermissionKey = keyof LawyerPermissions;

interface PermissionGroup {
  title: string;
  icon: string;
  items: { key: PermissionKey; label: string; description: string }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: 'Clientes',
    icon: 'people',
    items: [
      { key: 'viewClients', label: 'Visualizar clientes', description: 'Ver lista e detalhes dos clientes' },
      { key: 'editClients', label: 'Editar clientes', description: 'Cadastrar e editar dados dos clientes' },
    ],
  },
  {
    title: 'Processos',
    icon: 'briefcase',
    items: [
      { key: 'viewCases', label: 'Visualizar processos', description: 'Ver lista e detalhes dos processos' },
      { key: 'editCases', label: 'Editar processos', description: 'Criar e editar processos e atualizações' },
      { key: 'assignedCasesOnly', label: 'Somente processos atribuídos', description: 'Ver apenas processos onde foi designado' },
    ],
  },
  {
    title: 'Finanças',
    icon: 'cash',
    items: [
      { key: 'viewFinance', label: 'Visualizar financeiro', description: 'Ver receitas, despesas e relatórios' },
      { key: 'editFinance', label: 'Editar financeiro', description: 'Lançar e editar transações financeiras' },
    ],
  },
  {
    title: 'Documentos',
    icon: 'document-text',
    items: [
      { key: 'viewDocuments', label: 'Visualizar documentos', description: 'Ver e baixar documentos' },
      { key: 'uploadDocuments', label: 'Enviar documentos', description: 'Fazer upload de novos documentos' },
    ],
  },
  {
    title: 'Agenda',
    icon: 'calendar',
    items: [
      { key: 'viewCalendar', label: 'Visualizar agenda', description: 'Ver eventos e compromissos' },
      { key: 'editCalendar', label: 'Editar agenda', description: 'Criar e editar eventos na agenda' },
    ],
  },
  {
    title: 'Mensagens',
    icon: 'chatbubbles',
    items: [
      { key: 'viewMessages', label: 'Visualizar mensagens', description: 'Ver conversas com clientes' },
      { key: 'sendMessages', label: 'Enviar mensagens', description: 'Enviar mensagens para clientes' },
    ],
  },
];

export default function AssociatesScreen() {
  const { associates, getPermissions, updatePermissions } = usePermissions();
  const [selectedAssociate, setSelectedAssociate] = useState<string | null>(
    associates.length > 0 ? associates[0].id : null
  );

  const currentAssociate = associates.find((a) => a.id === selectedAssociate);
  const permissions = selectedAssociate ? getPermissions(selectedAssociate) : null;

  function togglePermission(key: PermissionKey) {
    if (!selectedAssociate || !permissions) return;
    const updated = { ...permissions, [key]: !permissions[key] };
    updatePermissions(selectedAssociate, updated);
    Alert.alert('Permissão atualizada', `"${key}" foi ${!permissions[key] ? 'habilitada' : 'desabilitada'} para ${currentAssociate?.name}.`);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Advogados Associados</Text>
        <Text style={styles.subtitle}>Gerencie permissões de acesso</Text>
      </View>

      {associates.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>Nenhum advogado associado cadastrado.</Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.associatePicker} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 12 }}>
            {associates.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.associateChip, selectedAssociate === a.id && styles.associateChipActive]}
                onPress={() => setSelectedAssociate(a.id)}
              >
                <View style={[styles.chipAvatar, selectedAssociate === a.id && { backgroundColor: '#fff' }]}>
                  <Text style={[styles.chipAvatarText, selectedAssociate === a.id && { color: colors.primary }]}>
                    {a.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.chipName, selectedAssociate === a.id && { color: '#fff' }]}>{a.name}</Text>
                  {a.oab && <Text style={[styles.chipOab, selectedAssociate === a.id && { color: 'rgba(255,255,255,0.7)' }]}>OAB {a.oab}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {permissions && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={18} color={colors.info} style={{ marginRight: 8 }} />
                <Text style={styles.infoText}>
                  As permissões abaixo se aplicam somente a <Text style={{ fontWeight: '700' }}>{currentAssociate?.name}</Text>. Alterações têm efeito imediato.
                </Text>
              </View>

              {PERMISSION_GROUPS.map((group) => (
                <View key={group.title} style={styles.groupCard}>
                  <View style={styles.groupHeader}>
                    <Ionicons name={(group.icon + '-outline') as any} size={18} color={colors.primary} />
                    <Text style={styles.groupTitle}>{group.title}</Text>
                  </View>
                  {group.items.map((item, idx) => (
                    <View key={item.key} style={[styles.permRow, idx < group.items.length - 1 && styles.permRowBorder]}>
                      <View style={styles.permInfo}>
                        <Text style={styles.permLabel}>{item.label}</Text>
                        <Text style={styles.permDesc}>{item.description}</Text>
                      </View>
                      <Switch
                        value={!!permissions[item.key]}
                        onValueChange={() => togglePermission(item.key)}
                        trackColor={{ false: colors.border, true: colors.primary + '80' }}
                        thumbColor={permissions[item.key] ? colors.primary : '#f4f4f4'}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
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
  associatePicker: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  associateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  associateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chipName: { fontSize: 14, fontWeight: '700', color: colors.text },
  chipOab: { fontSize: 11, color: colors.textSecondary },
  scroll: { padding: 16, paddingBottom: 32 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  permRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  permRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  permInfo: { flex: 1, marginRight: 12 },
  permLabel: { fontSize: 14, color: colors.text, fontWeight: '500' },
  permDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 14, marginTop: 12 },
});
