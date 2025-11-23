import { ValidationErrors, TaskFormData } from '../types/Task';

const isAlphanumeric = (text: string): boolean => {
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return regex.test(text);
};

export const validateTaskForm = (data: TaskFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.title.trim()) {
    errors.title = 'El título es obligatorio';
  } else if (!isAlphanumeric(data.title)) {
    errors.title = 'Solo letras, números y espacios';
  } else if (data.title.length < 3) {
    errors.title = 'Mínimo 3 caracteres';
  }

  if (!data.description.trim()) {
    errors.description = 'La descripción es obligatoria';
  } else if (!isAlphanumeric(data.description)) {
    errors.description = 'Solo letras, números y espacios';
  } else if (data.description.length < 5) {
    errors.description = 'Mínimo 5 caracteres';
  }

  return errors;
};