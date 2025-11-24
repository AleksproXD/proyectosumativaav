import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { loginSchema, LoginFormData } from '../lib/schemas/authSchema';
import { AuthValidationErrors } from '../lib/types/Auth';

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
      const result = loginSchema.safeParse({ ...formData, [field]: value });
      if (!result.success) {
        const fieldErrors: AuthValidationErrors = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof AuthValidationErrors] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({});
      }
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: AuthValidationErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof AuthValidationErrors] = issue.message;
        }
      });
      setErrors(fieldErrors);
    }
  };

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });

    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: AuthValidationErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof AuthValidationErrors] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const success = await login(result.data);
    setLoading(false);

    if (success) {
      router.replace('/');
    } else {
      Alert.alert('Error', 'Email o contraseña incorrectos');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#f0f4f8' }}>
      <View 
        className="absolute top-0 left-0 right-0 h-96" 
        style={{ 
          backgroundColor: '#e0e7ff',
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      >
        <View className="absolute top-20 right-10 w-32 h-32 rounded-full" style={{ backgroundColor: '#c7d2fe', opacity: 0.5 }} />
        <View className="absolute top-40 left-5 w-24 h-24 rounded-full" style={{ backgroundColor: '#ddd6fe', opacity: 0.3 }} />

        <View className="items-center mb-12 relative z-10">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#818cf8' }}>
            <Ionicons name="checkmark-done" size={48} color="white" />
          </View>
          <Text className="text-4xl font-bold text-gray-800 mb-2">
            Hola de nuevo
          </Text>
          <Text className="text-gray-600 text-center">
            Tus tareas te esperan
          </Text>
        </View>

        <View className="gap-5 relative z-10">
          <View>
            <Text className="text-gray-700 font-semibold mb-2 px-1">Email</Text>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className={`rounded-2xl pl-12 pr-4 py-4 text-gray-900 shadow-sm ${
                  errors.email && touched.email ? 'bg-red-50 border-2 border-red-300' : 'bg-white/90'
                }`}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                onBlur={() => handleBlur('email')}
                placeholder="tu@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && touched.email && (
              <Text className="text-red-500 text-sm mt-1 px-1">{errors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 font-semibold mb-2 px-1">Contraseña</Text>
            <View className="relative">
              <View className="absolute left-4 top-4 z-10">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className={`rounded-2xl pl-12 pr-4 py-4 text-gray-900 shadow-sm ${
                  errors.password && touched.password ? 'bg-red-50 border-2 border-red-300' : 'bg-white/90'
                }`}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>
            {errors.password && touched.password && (
              <Text className="text-red-500 text-sm mt-1 px-1">{errors.password}</Text>
            )}
          </View>

          <TouchableOpacity
            className={`py-4 rounded-2xl mt-4 shadow-lg flex-row items-center justify-center gap-2 ${
              loading ? 'opacity-70' : ''
            }`}
            style={{ backgroundColor: '#818cf8' }}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Ionicons name="hourglass-outline" size={20} color="white" />
            ) : (
              <Ionicons name="log-in-outline" size={20} color="white" />
            )}
            <Text className="text-white text-center font-bold text-base">
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="font-bold" style={{ color: '#818cf8' }}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}