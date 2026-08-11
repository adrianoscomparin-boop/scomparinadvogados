import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calendarEvents } from '../../data/mockData';
import { colors, eventTypeColors } from '../../theme';
import { CalendarEvent, EventType } from '../../types';

const TYPE_FILTERS: (EventType | 'todos')[] = ['todos', 'audiência', 'prazo', 'reunião', 'outros'];

export default function CalendarScreen() {
  const [typeFilter, setTypeFilter] = useState<EventType | 'todos'>('todos');

  const sorted = [...calendarEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filtered = sorted.filter((e) => typeFilter === 'todos' || e.type === typeFilter);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function isToday(dateStr: string) {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  function isPast(dateStr: string) {
    return new Date(dateStr + 'T23:59:00') < new Date();
  }

  function renderEvent({ item }: { item: CalendarEvent }) {
    const past = isPast(item.date);
    const today = isToday(item.date);
    const typeColor = eventTypeColors[item.type] || colors.textSecondary;

    return (
      <View style={[styles.card, past && styles.cardPast, today && styles.cardToday]}>
        <View style={[styles.typeBar, { backgroundColor: typeColor }]} />
        <View style={styles.dateCol}>
          <Text style={[styles.dateDay, past && { color: colors.textSecondary }]}>
            {new Date(item.date + 'T12:00:00').getDate()}
          </Text>
          <Text style={[styles.dateMonth, past && { color: colors.textSecondary }]}>
            {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventTopRow}>
            <Text style={[styles.eventTitle, past && { color: colors.textSecondary }]} numberOfLines={2}>
              {item.title}
            </Text>
            {today && <View style={styles.todayBadge}><Text style={styles.todayText}>Hoje</Text></View>}
          </View>
          {item.time && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText}> {item.time}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}> {item.location}</Text>
            </View>
          )}
          {item.clientName && (
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText}> {item.clientName}</Text>
            </View>
          )}
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>{item.type}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.subtitle}>{calendarEvents.length} eventos cadastrados</Text>
      </View>

      <View style={styles.filtersRow}>
        {TYPE_FILTERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterBtn, typeFilter === t && styles.filterBtnActive]}
            onPress={() => setTypeFilter(t)}
          >
            <Text style={[styles.filterText, typeFilter === t && styles.filterTextActive]}>
              {t === 'todos' ? 'Todos' : t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum evento encontrado.</Text>}
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
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
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
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  cardPast: { opacity: 0.6 },
  cardToday: { borderWidth: 1.5, borderColor: colors.secondary },
  typeBar: { width: 4 },
  dateCol: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 8,
  },
  dateDay: { fontSize: 22, fontWeight: '700', color: colors.text },
  dateMonth: { fontSize: 11, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' },
  eventInfo: { flex: 1, padding: 12 },
  eventTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  eventTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text, marginRight: 8 },
  todayBadge: { backgroundColor: colors.secondary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  todayText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  typeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
