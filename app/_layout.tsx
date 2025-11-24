import { Stack, useSegments, router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/context/AuthContext';
import { TaskProvider } from '../lib/context/TaskContext';
import '../global.css';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Esperar a que la navegación esté lista
    if (!navigationState?.key) return;

    const currentPath = segments.join('/');
    const isAuthPage = currentPath.includes('login') || currentPath.includes('register');

    // Usar setTimeout para evitar el error de navegación
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !isAuthPage) {
        router.replace('/login');
      } else if (isAuthenticated && isAuthPage) {
        router.replace('/');
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, segments, navigationState?.key]);

  return (
    <TaskProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#7f19e6' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="create" 
          options={{ 
            title: 'Nueva Tarea',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="edit/[id]" 
          options={{ 
            title: 'Editar Tarea',
            presentation: 'modal',
          }} 
        />
      </Stack>
    </TaskProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}