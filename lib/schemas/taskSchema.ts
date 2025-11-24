import { z } from 'zod';

// Regex para validar solo alfanuméricos, espacios y tildes
const alphanumericRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .regex(alphanumericRegex, 'Solo se permiten letras, números y espacios'),
  
  description: z
    .string()
    .min(1, 'La descripción es obligatoria')
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .regex(alphanumericRegex, 'Solo se permiten letras, números y espacios'),
});

export type TaskFormData = z.infer<typeof taskSchema>;