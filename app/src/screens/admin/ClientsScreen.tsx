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
import { users, cases } from '../../data/mockData';
import { colors } from '../../theme';
import { User } from '../../types';

export default function ClientsScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  const clients = users.filter((u) => u.role === 'client');
  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  function getClientCases(clientId: string) {
    return cases.filter((c) => c.clientId === clientId);
  }

  function renderClient({ item }: { item: User }) {
    const clientCases = getClientCases(item.id);
    const active = clientCases.filter((c) => c.status === 'ativo').length;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
        </View>
        <View style={styles.right}>
          <Text style={styles.caseCount}>{clientCases.length}</Text>
          <Text style={styles.caseLabel}>processo{clientCases.length !== 1 ? 's' : ''}</Text>
          {active > 0 && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>{active} ativo</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>{clients.length} clientes cadastrados</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.search}
          placeholder="Buscar por nome ou e-mail..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderClient}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum cliente encontrado.</Text>}
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
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  email: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  phone: { fontSize: 12, color: colors.textSecondary },
  right: { alignItems: 'center', marginRight: 10 },
  caseCount: { fontSize: 20, fontWeight: '700', color: colors.primary },
  caseLabel: { fontSize: 11, color: colors.textSecondary },
  activeBadge: {
    backgroundColor: colors.success + '20',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  activeText: { fontSize: 10, color: colors.success, fontWeight: '600' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
