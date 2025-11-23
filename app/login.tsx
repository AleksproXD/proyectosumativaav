import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { LoginFormData, AuthValidationErrors } from '../lib/types/Auth';
import { validateLoginForm } from '../lib/utils/authValidation';

export default function LoginScreen() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<AuthValidationErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(validateLoginForm({ ...formData, [field]: value }));
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validateLoginForm(formData));
  };

  const handleSubmit = async () => {
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      const success = await login(formData);
      setLoading(false);

      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Error', 'Email o contraseña incorrectos');
      }
    }
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      >
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Text className="text-5xl">📝</Text>
          </View>
          <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenido
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            Inicia sesión para continuar
          </Text>
        </View>

        <View className="gap-5">
          <View>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">
              Email
            </Text>
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
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 px-1">
              Contraseña
            </Text>
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

          <TouchableOpacity
            className={`py-4 rounded-xl mt-4 shadow-lg ${
              loading ? 'bg-primary/70' : 'bg-primary'
            }`}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-base">
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600 dark:text-gray-400">¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-primary font-bold">Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}