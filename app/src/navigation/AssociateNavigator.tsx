import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';

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
import AccessDeniedScreen from '../screens/shared/AccessDeniedScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

function DeniedFinance() {
  return <AccessDeniedScreen feature="Finanças" />;
}

export default function AssociateNavigator() {
  const { user } = useAuth();
  const { getPermissions } = usePermissions();
  const perms = user ? getPermissions(user.id) : null;

  const icons: Record<string, string> = {
    Dashboard: 'home',
    Clientes: 'people',
    Processos: 'briefcase',
    Agenda: 'calendar',
    Finanças: 'cash',
    Documentos: 'document-text',
    Mensagens: 'chatbubbles',
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      {perms?.viewClients && <Tab.Screen name="Clientes" component={ClientsStack} />}
      {perms?.viewCases && <Tab.Screen name="Processos" component={CasesStack} />}
      {perms?.viewCalendar && <Tab.Screen name="Agenda" component={CalendarScreen} />}
      <Tab.Screen
        name="Finanças"
        component={perms?.viewFinance ? FinanceScreen : DeniedFinance}
      />
      {perms?.viewDocuments && <Tab.Screen name="Documentos" component={DocumentsScreen} />}
      {perms?.viewMessages && <Tab.Screen name="Mensagens" component={MessagesStack} />}
    </Tab.Navigator>
  );
}
