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
import { useAuth } from '../../contexts/AuthContext';
import { cases, calendarEvents, transactions, users, conversations } from '../../data/mockData';
import { colors, caseStatusColors } from '../../theme';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  const totalClients = users.filter((u) => u.role === 'client').length;
  const activeCases = cases.filter((c) => c.status === 'ativo').length;
  const pendingCases = cases.filter((c) => c.status === 'aguardando').length;

  const today = new Date();
  const upcomingEvents = calendarEvents
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const pendingRevenue = transactions
    .filter((t) => t.type === 'receita' && t.status === 'pendente')
    .reduce((s, t) => s + t.amount, 0);

  const totalRevenue = transactions
    .filter((t) => t.type === 'receita' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);

  const unreadMessages = conversations.reduce((s, c) => s + c.unreadCount, 0);

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function formatCurrency(val: number) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const statCards = [
    { label: 'Clientes', value: totalClients, icon: 'people', color: colors.primary },
    { label: 'Processos Ativos', value: activeCases, icon: 'briefcase', color: colors.success },
    { label: 'Aguardando', value: pendingCases, icon: 'time', color: colors.warning },
    { label: 'Mensagens', value: unreadMessages, icon: 'chatbubbles', color: colors.info },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name.split(' ')[1] || user?.name}!</Text>
          <Text style={styles.date}>
            {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.statsGrid}>
          {statCards.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={(s.icon + '-outline') as any} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.financeRow}>
          <View style={[styles.financeCard, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.financeLabel}>Receitas Recebidas</Text>
            <Text style={[styles.financeValue, { color: colors.success }]}>{formatCurrency(totalRevenue)}</Text>
          </View>
          <View style={[styles.financeCard, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.financeLabel}>A Receber</Text>
            <Text style={[styles.financeValue, { color: colors.warning }]}>{formatCurrency(pendingRevenue)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Próximos Eventos</Text>
        {upcomingEvents.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum evento próximo.</Text>
        ) : (
          upcomingEvents.map((ev) => (
            <View key={ev.id} style={styles.eventCard}>
              <View style={[styles.eventTypeDot, { backgroundColor: ev.type === 'audiência' ? colors.info : ev.type === 'prazo' ? colors.error : colors.success }]} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{ev.title}</Text>
                <Text style={styles.eventMeta}>
                  {formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ''}{ev.location ? ` · ${ev.location}` : ''}
                </Text>
              </View>
              <View style={[styles.eventTypeBadge, { backgroundColor: ev.type === 'audiência' ? colors.info + '20' : ev.type === 'prazo' ? colors.error + '20' : colors.success + '20' }]}>
                <Text style={[styles.eventTypeText, { color: ev.type === 'audiência' ? colors.info : ev.type === 'prazo' ? colors.error : colors.success }]}>
                  {ev.type}
                </Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Processos Recentes</Text>
        {cases.slice(0, 3).map((c) => (
          <View key={c.id} style={styles.caseCard}>
            <View style={styles.caseHeader}>
              <Text style={styles.caseClient}>{c.clientName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: caseStatusColors[c.status] + '20' }]}>
                <Text style={[styles.statusText, { color: caseStatusColors[c.status] }]}>{c.status}</Text>
              </View>
            </View>
            <Text style={styles.caseTitle}>{c.title}</Text>
            <Text style={styles.caseNumber}>{c.number}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  date: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  logoutBtn: { padding: 8 },
  scroll: { padding: 16, paddingBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  financeRow: { flexDirection: 'row', marginBottom: 16 },
  financeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  financeLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  financeValue: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10, marginTop: 4 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  eventCard: {
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
  eventTypeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  eventMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  eventTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  eventTypeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  caseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  caseClient: { fontSize: 13, fontWeight: '700', color: colors.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  caseTitle: { fontSize: 14, color: colors.text, marginBottom: 4 },
  caseNumber: { fontSize: 11, color: colors.textSecondary },
});
