import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export default function AccessDeniedScreen({ feature }: { feature: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed-outline" size={64} color={colors.border} />
      <Text style={styles.title}>Acesso Restrito</Text>
      <Text style={styles.text}>
        Você não tem permissão para acessar <Text style={{ fontWeight: '700' }}>{feature}</Text>.
      </Text>
      <Text style={styles.subText}>
        Entre em contato com o advogado administrador para solicitar acesso.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  subText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
