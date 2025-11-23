import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useTasks } from '../lib/context/TaskContext';
import { useAuth } from '../lib/context/AuthContext';
import { TaskItem } from '../components/TaskItem';

export default function HomeScreen() {
  const { tasks, addTask } = useTasks();
  const { user, logout } = useAuth();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleAddQuickTask = () => {
    if (newTaskTitle.trim().length >= 3) {
      addTask({
        title: newTaskTitle.trim(),
        description: '',
        completed: false,
      });
      setNewTaskTitle('');
    }
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 pt-12 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 dark:text-gray-400">Bienvenido/a</Text>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="text-red-700 dark:text-red-400 font-semibold text-sm">Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de tareas con scroll */}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Pendientes */}
        <View>
          <Text className="px-2 pb-2 pt-4 text-lg font-bold text-gray-900 dark:text-white">
            Pendientes ({pendingTasks.length})
          </Text>
          {pendingTasks.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-lg p-8 items-center">
              <Text className="text-gray-400 dark:text-gray-500 text-center">
                No hay tareas pendientes
              </Text>
            </View>
          ) : (
            <View>
              {pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </View>
          )}
        </View>

        {/* Completadas */}
        {completedTasks.length > 0 && (
          <View className="mt-8">
            <Text className="px-2 pb-2 pt-4 text-lg font-bold text-gray-900 dark:text-white">
              Completadas ({completedTasks.length})
            </Text>
            <View>
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Barra inferior fija */}
      <View className="absolute bottom-0 left-0 right-0">
        {/* Input para agregar tarea */}
        <View className="flex-row items-center gap-2 bg-background-light/80 dark:bg-background-dark/80 px-4 py-3">
          <TextInput
            className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-gray-900 dark:text-white"
            placeholder="Añadir tarea rápida..."
            placeholderTextColor="#9CA3AF"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddQuickTask}
          />
          <TouchableOpacity
            onPress={handleAddQuickTask}
            className="h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-3xl font-light">+</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation bar */}
        <View className="flex-row items-center justify-around h-16 border-t border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
          <TouchableOpacity className="flex-1 items-center justify-center gap-1">
            <Text className="text-primary text-2xl">✓</Text>
            <Text className="text-xs font-bold text-primary">Tareas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/create')}
            className="flex-1 items-center justify-center gap-1"
          >
            <Text className="text-gray-500 dark:text-gray-400 text-2xl">+</Text>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Nueva</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 items-center justify-center gap-1">
            <Text className="text-gray-500 dark:text-gray-400 text-2xl">⚙</Text>
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Ajustes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}