import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider, ProjectProvider, NotificationProvider, ArtifactProvider } from './src/context';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <NotificationProvider>
          <ArtifactProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <StatusBar style="auto" />
          </ArtifactProvider>
        </NotificationProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}
