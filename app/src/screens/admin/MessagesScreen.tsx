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
import { conversations } from '../../data/mockData';
import { colors } from '../../theme';
import { Conversation } from '../../types';

export default function MessagesScreen() {
  const navigation = useNavigation<any>();

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  function renderConversation({ item }: { item: Conversation }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Conversation', { conversationId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.clientName.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.time}>{formatDate(item.lastMessageAt)}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
        {totalUnread > 0 && (
          <Text style={styles.subtitle}>{totalUnread} mensagem(ns) não lida(s)</Text>
        )}
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(i) => i.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma conversa.</Text>}
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
  list: { paddingTop: 8, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  info: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  lastMessage: { fontSize: 13, color: colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: 12, color: colors.textSecondary },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
