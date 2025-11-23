import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTasks } from '../../lib/context/TaskContext';
import { TaskForm } from '../../components/TaskForm';
import { TaskFormData } from '../../lib/types/Task';

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTaskById, updateTask } = useTasks();
  const [initialData, setInitialData] = useState<TaskFormData | null>(null);

  useEffect(() => {
    if (id) {
      const task = getTaskById(id);
      if (task) {
        setInitialData({
          title: task.title,
          description: task.description,
        });
      }
    }
  }, [id]);

  const handleSubmit = (data: TaskFormData) => {
    if (id) {
      updateTask(id, {
        title: data.title,
        description: data.description,
      });
      router.back();
    }
  };

  if (!initialData) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <Text className="text-gray-400 dark:text-gray-500">Cargando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <TaskForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          submitButtonText="Guardar Cambios"
        />
      </ScrollView>
    </View>
  );
}