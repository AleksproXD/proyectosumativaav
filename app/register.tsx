import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { RegisterFormData, AuthValidationErrors } from '../lib/types/Auth';
import { validateRegisterForm } from '../lib/utils/authValidation';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<AuthValidationErrors>({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(validateRegisterForm({ ...formData, [field]: value }));
    }
  };

  const handleBlur = (field: keyof RegisterFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validateRegisterForm(formData));
  };

  const handleSubmit = async () => {
    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      const success = await register(formData);
      setLoading(false);

      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Error', 'Este email ya está registrado');
      }
    }
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Text className="text-5xl">✨</Text>
          </View>
          <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Crear Cuenta
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">Únete a nosotros</Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">Nombre</Text>
            <TextInput
              className={`rounded-xl border bg-white dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white ${
                errors.name && touched.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              onBlur={() => handleBlur('name')}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
            />
            {errors.name && touched.name && (
              <Text className="text-red-500 text-sm mt-1 px-1">{errors.name}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">Email</Text>
            <TextInput
              className={`rounded-xl border bg-white dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white ${
                errors.email && touched.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              onBlur={() => handleBlur('email')}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && touched.email && (
              <Text className="text-red-500 text-sm mt-1 px-1">{errors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">Contraseña</Text>
            <TextInput
              className={`rounded-xl border bg-white dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white ${
                errors.password && touched.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
            {errors.password && touched.password && (
              <Text className="text-red-500 text-sm mt-1 px-1">{errors.password}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">Confirmar</Text>
            <TextInput
              className={`rounded-xl border bg-white dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white ${
                errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1 px-1">{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            className={`py-4 rounded-xl mt-4 shadow-lg ${loading ? 'bg-primary/70' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-base">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600 dark:text-gray-400">¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-primary font-bold">Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}