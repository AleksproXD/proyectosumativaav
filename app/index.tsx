import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTasks } from '../lib/context/TaskContext';
import { useAuth } from '../lib/context/AuthContext';
import { TaskItem } from '../components/TaskItem';
import { AITaskGenerator } from '../components/AITaskGenerator';

export default function HomeScreen() {
  const { tasks, addTask } = useTasks(); // ← SIN loading
  const { user, logout } = useAuth();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAI, setShowAI] = useState(false);

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
            className="bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full flex-row items-center gap-2"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#b91c1c" />
            <Text className="text-red-700 dark:text-red-400 font-semibold text-sm">Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de tareas */}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Botón de IA destacado */}
        <TouchableOpacity
          onPress={() => setShowAI(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mt-4 mb-4 flex-row items-center justify-between shadow-lg"
          style={{ backgroundColor: '#7f19e6' }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="sparkles" size={28} color="white" />
            </View>
            <View>
              <Text className="text-white font-bold text-lg">Generar con IA</Text>
              <Text className="text-white/80 text-sm">Gemini 2.0 Flash</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>

        {/* Pendientes */}
        <View>
          <View className="flex-row items-center gap-2 px-2 pb-2 pt-4">
            <Ionicons name="list-outline" size={24} color="#111827" />
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Pendientes ({pendingTasks.length})
            </Text>
          </View>
          {pendingTasks.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-lg p-8 items-center">
              <Ionicons name="checkmark-done-circle-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 dark:text-gray-500 text-center mt-2">
                No hay tareas pendientes
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-center text-sm mt-1">
                ¡Usa la IA para generar tareas!
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
            <View className="flex-row items-center gap-2 px-2 pb-2 pt-4">
              <Ionicons name="checkmark-done" size={24} color="#10b981" />
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Completadas ({completedTasks.length})
              </Text>
            </View>
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
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-around h-16 border-t border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
          <TouchableOpacity className="flex-1 items-center justify-center gap-1">
            <Ionicons name="list" size={24} color="#7f19e6" />
            <Text className="text-xs font-bold text-primary">Tareas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/create')}
            className="flex-1 items-center justify-center gap-1"
          >
            <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
            <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Nueva</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowAI(true)}
            className="flex-1 items-center justify-center gap-1"
          >
            <Ionicons name="sparkles" size={24} color="#7f19e6" />
            <Text className="text-xs font-bold text-primary">IA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de IA */}
      <AITaskGenerator visible={showAI} onClose={() => setShowAI(false)} />
    </View>
  );
}