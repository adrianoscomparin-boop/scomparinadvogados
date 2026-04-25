import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import DashboardScreen from '../screens/admin/DashboardScreen';
import ClientsScreen from '../screens/admin/ClientsScreen';
import ClientDetailScreen from '../screens/admin/ClientDetailScreen';
import CasesScreen from '../screens/admin/CasesScreen';
import CaseDetailScreen from '../screens/admin/CaseDetailScreen';
import CalendarScreen from '../screens/admin/CalendarScreen';
import FinanceScreen from '../screens/admin/FinanceScreen';
import DocumentsScreen from '../screens/admin/DocumentsScreen';
import MessagesScreen from '../screens/admin/MessagesScreen';
import ConversationScreen from '../screens/admin/ConversationScreen';
import AssociatesScreen from '../screens/admin/AssociatesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

function ClientsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientsMain" component={ClientsScreen} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
    </Stack.Navigator>
  );
}

function CasesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CasesMain" component={CasesScreen} />
      <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesMain" component={MessagesScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  const icons: Record<string, string> = {
    Dashboard: 'home',
    Clientes: 'people',
    Processos: 'briefcase',
    Agenda: 'calendar',
    Finanças: 'cash',
    Documentos: 'document-text',
    Mensagens: 'chatbubbles',
    Associados: 'people-circle',
  };

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
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={(icons[route.name] + '-outline') as any} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Clientes" component={ClientsStack} />
      <Tab.Screen name="Processos" component={CasesStack} />
      <Tab.Screen name="Agenda" component={CalendarScreen} />
      <Tab.Screen name="Finanças" component={FinanceScreen} />
      <Tab.Screen name="Documentos" component={DocumentsScreen} />
      <Tab.Screen name="Mensagens" component={MessagesStack} />
      <Tab.Screen name="Associados" component={AssociatesScreen} />
    </Tab.Navigator>
  );
}
