import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Task } from '../lib/types/Task';
import { useTasks } from '../lib/context/TaskContext';
import { router } from 'expo-router';

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const { updateTask } = useTasks();

  const handleToggle = () => {
    updateTask(task.id, { completed: !task.completed });
  };

  const handleEdit = () => {
    router.push(`/edit/${task.id}`);
  };

  return (
    <View className="mb-2">
      <TouchableOpacity
        onPress={handleToggle}
        onLongPress={handleEdit}
        className={`flex-row items-center gap-4 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-sm ${
          task.completed ? 'opacity-60' : ''
        }`}
        activeOpacity={0.7}
      >
        <View
          className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
            task.completed
              ? 'bg-primary border-primary'
              : 'border-primary/50'
          }`}
        >
          {task.completed && (
            <Text className="text-white text-xs font-bold">✓</Text>
          )}
        </View>

        <View className="flex-1">
          <Text
            className={`text-base font-normal ${
              task.completed
                ? 'text-gray-500 dark:text-gray-400 line-through'
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            {task.title}
          </Text>
          {task.description && !task.completed && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {task.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};