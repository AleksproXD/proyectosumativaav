import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { geminiService, AITaskSuggestion } from '../lib/services/gemini';
import { useTasks } from '../lib/context/TaskContext';

interface AITaskGeneratorProps {
  visible: boolean;
  onClose: () => void;
}

export const AITaskGenerator = ({ visible, onClose }: AITaskGeneratorProps) => {
  const { addTask } = useTasks();
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Escribe algo para generar tareas');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const tasks = await geminiService.generateTasks(prompt);
      setSuggestions(tasks);
    } catch (err) {
      setError('Error al generar tareas. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (suggestion: AITaskSuggestion) => {
    await addTask({
      title: suggestion.title,
      description: suggestion.description,
      completed: false,
    });
    
    // Remover de sugerencias
    setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  };

  const handleAddAll = async () => {
    for (const suggestion of suggestions) {
      await addTask({
        title: suggestion.title,
        description: suggestion.description,
        completed: false,
      });
    }
    setSuggestions([]);
    setPrompt('');
    onClose();
  };

  const handleClose = () => {
    setPrompt('');
    setSuggestions([]);
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                <Ionicons name="sparkles" size={24} color="#7f19e6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                IA Generadora
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              ¿Qué tareas necesitas?
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
              placeholder="Ej: Tareas para organizar mi mudanza..."
              placeholderTextColor="#9CA3AF"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Error */}
          {error && (
            <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 flex-row items-center gap-2">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="text-red-600 dark:text-red-400 flex-1">{error}</Text>
            </View>
          )}

          {/* Botón generar */}
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={loading}
            className={`py-4 rounded-xl mb-4 flex-row items-center justify-center gap-2 ${
              loading ? 'bg-purple-400' : 'bg-primary'
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold">Generando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="white" />
                <Text className="text-white font-bold">Generar con IA</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sugerencias */}
          {suggestions.length > 0 && (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Sugerencias ({suggestions.length})
                </Text>
                <TouchableOpacity
                  onPress={handleAddAll}
                  className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full"
                >
                  <Text className="text-green-700 dark:text-green-400 font-semibold text-sm">
                    Agregar todas
                  </Text>
                </TouchableOpacity>
              </View>

              {suggestions.map((suggestion, index) => (
                <View
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700"
                >
                  <View className="flex-row items-start gap-3">
                    <View className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mt-1">
                      <Text className="text-primary font-bold">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 dark:text-white font-bold mb-1">
                        {suggestion.title}
                      </Text>
                      <Text className="text-gray-600 dark:text-gray-400 text-sm">
                        {suggestion.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddTask(suggestion)}
                      className="bg-primary rounded-full p-2"
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};