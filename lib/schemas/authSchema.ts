import { z } from 'zod';

// Regex para validar solo letras y espacios (nombres)
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

// Schema de Login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email válido'),
  
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Schema de Registro
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .regex(nameRegex, 'Solo se permiten letras y espacios'),
  
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email válido'),
  
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(/[a-zA-Z]/, 'Debe contener al menos una letra')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  
  confirmPassword: z
    .string()
    .min(1, 'Debes confirmar tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;