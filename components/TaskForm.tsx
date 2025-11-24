import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { taskSchema, TaskFormData } from '../lib/schemas/taskSchema';
import { ValidationErrors } from '../lib/types/Task';

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  submitButtonText?: string;
}

export const TaskForm = ({ 
  initialData = { title: '', description: '' },
  onSubmit,
  submitButtonText = 'Crear Tarea'
}: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ title: false, description: false });

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const result = taskSchema.safeParse({ ...formData, [field]: value });
      if (!result.success) {
        const fieldErrors: ValidationErrors = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof ValidationErrors] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({});
      }
    }
  };

  const handleBlur = (field: keyof TaskFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const result = taskSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof ValidationErrors] = issue.message;
        }
      });
      setErrors(fieldErrors);
    }
  };

  const handleSubmit = () => {
    setTouched({ title: true, description: true });

    const result = taskSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof ValidationErrors] = issue.message;
        }
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
      onSubmit(result.data);
      setFormData({ title: '', description: '' });
      setTouched({ title: false, description: false });
    }
  };

  return (
    <View className="gap-5">
      <View>
        <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">
          Título
        </Text>
        <TextInput
          className={`rounded-xl border bg-white dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white ${
            errors.title && touched.title
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-700'
          }`}
          value={formData.title}
          onChangeText={(text) => handleChange('title', text)}
          onBlur={() => handleBlur('title')}
          placeholder="Título de la tarea"
          placeholderTextColor="#9CA3AF"
        />
        {errors.title && touched.title && (
          <Text className="text-red-500 text-sm mt-1 px-1">{errors.title}</Text>
        )}
      </View>

      <View>
        <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">
          Descripción
        </Text>
        <TextInput
          className={`rounded-xl border bg-white dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white ${
            errors.description && touched.description
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-700'
          }`}
          style={{ minHeight: 120 }}
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          onBlur={() => handleBlur('description')}
          placeholder="Describe la tarea"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.description && touched.description && (
          <Text className="text-red-500 text-sm mt-1 px-1">{errors.description}</Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-primary py-4 rounded-xl shadow-lg active:opacity-80 mt-4"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-bold text-base">
          {submitButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};