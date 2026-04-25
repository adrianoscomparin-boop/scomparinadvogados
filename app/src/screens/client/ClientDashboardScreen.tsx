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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { cases, calendarEvents, documents, conversations } from '../../data/mockData';
import { colors, caseStatusColors } from '../../theme';

export default function ClientDashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();

  const myCases = cases.filter((c) => c.clientId === user?.id);
  const activeCases = myCases.filter((c) => c.status === 'ativo').length;
  const myDocs = documents.filter((d) => d.clientId === user?.id);
  const myConv = conversations.find((c) => c.clientId === user?.id);
  const unread = myConv?.unreadCount || 0;

  const today = new Date();
  const upcomingEvents = calendarEvents
    .filter((e) => e.clientName === user?.name && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  const recentCase = myCases[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name.split(' ')[0]}!</Text>
            <Text style={styles.subtitle}>Scomparin Advogados</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.statsRow}>
          <StatCard icon="briefcase" label="Processos" value={myCases.length} color={colors.primary} />
          <StatCard icon="checkmark-circle" label="Ativos" value={activeCases} color={colors.success} />
          <StatCard icon="document-text" label="Documentos" value={myDocs.length} color={colors.info} />
          <StatCard icon="chatbubbles" label="Mensagens" value={unread} color={unread > 0 ? colors.warning : colors.textSecondary} />
        </View>

        {recentCase && (
          <>
            <Text style={styles.sectionTitle}>Processo em Destaque</Text>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => navigation.navigate('Meus Processos', { screen: 'ClientCaseDetail', params: { caseId: recentCase.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.featureTop}>
                <View style={styles.featureAreaBadge}>
                  <Text style={styles.featureAreaText}>{recentCase.area}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: caseStatusColors[recentCase.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: caseStatusColors[recentCase.status] }]}>{recentCase.status}</Text>
                </View>
              </View>
              <Text style={styles.featureTitle}>{recentCase.title}</Text>
              <Text style={styles.featureNumber}>{recentCase.number}</Text>
              {recentCase.nextHearing && (
                <View style={styles.hearingRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.warning} />
                  <Text style={styles.hearingText}> Próxima audiência: {formatDate(recentCase.nextHearing)}</Text>
                </View>
              )}
              <View style={styles.featureFooter}>
                <Text style={styles.featureUpdated}>Atualizado em {formatDate(recentCase.updatedAt)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {upcomingEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            {upcomingEvents.map((ev) => (
              <View key={ev.id} style={styles.eventCard}>
                <View style={[styles.eventDot, {
                  backgroundColor: ev.type === 'audiência' ? colors.info : ev.type === 'prazo' ? colors.error : colors.success
                }]} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventMeta}>
                    {formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ''}{ev.location ? ` · ${ev.location}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.contactCard}>
          <Ionicons name="shield-checkmark" size={32} color={colors.secondary} style={{ marginBottom: 8 }} />
          <Text style={styles.contactTitle}>Scomparin Advogados</Text>
          <Text style={styles.contactInfo}>Dúvidas? Entre em contato pelo chat.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={(icon + '-outline') as any} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 },
  logoutBtn: { padding: 8 },
  scroll: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 4 },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  featureTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  featureAreaBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  featureAreaText: { fontSize: 12, color: colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  featureTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  featureNumber: { fontSize: 11, color: colors.textSecondary, marginBottom: 8 },
  hearingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  hearingText: { fontSize: 13, color: colors.warning, fontWeight: '500' },
  featureFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featureUpdated: { fontSize: 12, color: colors.textSecondary },
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
  eventDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  eventMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  contactCard: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  contactTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  contactInfo: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
});
