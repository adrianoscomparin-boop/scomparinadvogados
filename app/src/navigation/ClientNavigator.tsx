import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import ClientDashboardScreen from '../screens/client/ClientDashboardScreen';
import ClientCasesScreen from '../screens/client/ClientCasesScreen';
import ClientCaseDetailScreen from '../screens/client/ClientCaseDetailScreen';
import ClientDocumentsScreen from '../screens/client/ClientDocumentsScreen';
import ClientMessagesScreen from '../screens/client/ClientMessagesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CasesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientCasesMain" component={ClientCasesScreen} />
      <Stack.Screen name="ClientCaseDetail" component={ClientCaseDetailScreen} />
    </Stack.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: colors.primaryDark,
          height: 62,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Início: 'home',
            'Meus Processos': 'briefcase',
            Documentos: 'document-text',
            Mensagens: 'chatbubbles',
          };
          return <Ionicons name={(icons[route.name] + '-outline') as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={ClientDashboardScreen} />
      <Tab.Screen name="Meus Processos" component={CasesStack} />
      <Tab.Screen name="Documentos" component={ClientDocumentsScreen} />
      <Tab.Screen name="Mensagens" component={ClientMessagesScreen} />
    </Tab.Navigator>
  );
}
