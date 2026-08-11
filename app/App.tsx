import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { PermissionsProvider } from './src/contexts/PermissionsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </PermissionsProvider>
    </AuthProvider>
  );
}
