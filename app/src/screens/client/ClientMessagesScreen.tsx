import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { conversations } from '../../data/mockData';
import { colors } from '../../theme';
import { Message } from '../../types';

export default function ClientMessagesScreen() {
  const { user } = useAuth();
  const conv = conversations.find((c) => c.clientId === user?.id);
  const [messages, setMessages] = useState<Message[]>(conv?.messages || []);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  if (!user) return null;

  function sendMessage() {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: user!.id,
      senderName: user!.name,
      receiverId: 'admin-1',
      content: text.trim(),
      sentAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDay(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function renderMessage({ item, index }: { item: Message; index: number }) {
    const isOwn = item.senderId === user!.id;
    const prevItem = index > 0 ? messages[index - 1] : null;
    const showDay = !prevItem || formatDay(prevItem.sentAt) !== formatDay(item.sentAt);

    return (
      <>
        {showDay && (
          <View style={styles.dayLabel}>
            <Text style={styles.dayText}>{formatDay(item.sentAt)}</Text>
          </View>
        )}
        <View style={[styles.msgRow, isOwn ? styles.msgRowOwn : styles.msgRowOther]}>
          <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
            <Text style={[styles.msgText, isOwn && { color: '#fff' }]}>{item.content}</Text>
            <Text style={[styles.msgTime, isOwn && { color: 'rgba(255,255,255,0.7)' }]}>{formatTime(item.sentAt)}</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="shield-checkmark" size={22} color={colors.secondary} />
        </View>
        <View>
          <Text style={styles.headerName}>Scomparin Advogados</Text>
          <Text style={styles.headerSub}>Fale com seu advogado</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={56} color={colors.border} />
            <Text style={styles.emptyText}>Nenhuma mensagem ainda.</Text>
            <Text style={styles.emptySubText}>Envie uma mensagem para seu advogado.</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(i) => i.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200,169,81,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  list: { padding: 16, paddingBottom: 8 },
  dayLabel: { alignItems: 'center', marginVertical: 10 },
  dayText: {
    backgroundColor: colors.border,
    color: colors.textSecondary,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  msgRow: { marginBottom: 6 },
  msgRowOwn: { alignItems: 'flex-end' },
  msgRowOther: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, elevation: 1 },
  msgText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  msgTime: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 16, marginTop: 16, fontWeight: '600' },
  emptySubText: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
