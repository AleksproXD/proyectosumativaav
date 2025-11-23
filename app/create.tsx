import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTasks } from '../lib/context/TaskContext';
import { TaskForm } from '../components/TaskForm';
import { TaskFormData } from '../lib/types/Task';

export default function CreateScreen() {
  const { addTask } = useTasks();

  const handleSubmit = (data: TaskFormData) => {
    addTask({
      title: data.title,
      description: data.description,
      completed: false,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView className="flex-1 p-6">
        <TaskForm 
          onSubmit={handleSubmit}
          submitButtonText="Crear Tarea"
        />
      </ScrollView>
    </View>
  );
}