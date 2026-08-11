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
import { transactions } from '../../data/mockData';
import { colors, transactionColors } from '../../theme';
import { Transaction, TransactionType } from '../../types';

type Filter = 'todos' | TransactionType;

export default function FinanceScreen() {
  const [filter, setFilter] = useState<Filter>('todos');

  const filtered = transactions.filter((t) => filter === 'todos' || t.type === filter);

  const totalRevenue = transactions
    .filter((t) => t.type === 'receita' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago')
    .reduce((s, t) => s + t.amount, 0);
  const pending = transactions
    .filter((t) => t.type === 'receita' && t.status === 'pendente')
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalRevenue - totalExpense;

  function formatCurrency(val: number) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function renderTransaction({ item }: { item: Transaction }) {
    const isRevenue = item.type === 'receita';
    const statusColor = transactionColors[item.status] || colors.textSecondary;
    return (
      <View style={styles.card}>
        <View style={[styles.typeIcon, { backgroundColor: (isRevenue ? colors.success : colors.error) + '15' }]}>
          <Ionicons
            name={isRevenue ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
            size={24}
            color={isRevenue ? colors.success : colors.error}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            {item.clientName && <Text style={styles.client}> · {item.clientName}</Text>}
          </View>
        </View>
        <View style={styles.rightCol}>
          <Text style={[styles.amount, { color: isRevenue ? colors.success : colors.error }]}>
            {isRevenue ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Finanças</Text>
        <View style={styles.summaryRow}>
          <SummaryItem label="Receitas" value={formatCurrency(totalRevenue)} color={colors.success} />
          <SummaryItem label="Despesas" value={formatCurrency(totalExpense)} color={colors.error} />
          <SummaryItem label="A receber" value={formatCurrency(pending)} color={colors.warning} />
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Saldo Líquido</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? '#a8e6b8' : '#f8b4b4' }]}>
            {formatCurrency(balance)}
          </Text>
        </View>
      </View>

      <View style={styles.filtersRow}>
        {(['todos', 'receita', 'despesa'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'todos' ? 'Todos' : f === 'receita' ? 'Receitas' : 'Despesas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma transação encontrada.</Text>}
      />
    </View>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
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
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  summaryValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceValue: { fontSize: 18, fontWeight: '700' },
  filtersRow: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 10 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: '#fff', fontWeight: '600' },
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
  typeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1, marginRight: 8 },
  desc: { fontSize: 13, color: colors.text, fontWeight: '500', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  date: { fontSize: 12, color: colors.textSecondary },
  client: { fontSize: 12, color: colors.textSecondary },
  rightCol: { alignItems: 'flex-end' },
  amount: { fontSize: 14, fontWeight: '700' },
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
