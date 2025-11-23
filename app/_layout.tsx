import { Stack, useSegments, router } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/context/AuthContext';
import { TaskProvider } from '../lib/context/TaskContext';
import '../global.css';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const currentPath = segments.join('/');
    const isAuthPage = currentPath.includes('login') || currentPath.includes('register');

    if (!isAuthenticated && !isAuthPage) {
      router.replace('/login');
    } else if (isAuthenticated && isAuthPage) {
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

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