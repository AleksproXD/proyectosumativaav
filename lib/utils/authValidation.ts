import { LoginFormData, RegisterFormData, AuthValidationErrors } from '../types/Auth';

const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isAlphaWithSpaces = (text: string): boolean => {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return regex.test(text);
};

const isStrongPassword = (password: string): boolean => {
  return password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

export const validateLoginForm = (data: LoginFormData): AuthValidationErrors => {
  const errors: AuthValidationErrors = {};

  if (!data.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (data.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres';
  }

  return errors;
};

export const validateRegisterForm = (data: RegisterFormData): AuthValidationErrors => {
  const errors: AuthValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = 'El nombre es obligatorio';
  } else if (!isAlphaWithSpaces(data.name)) {
    errors.name = 'Solo letras y espacios';
  } else if (data.name.length < 3) {
    errors.name = 'Mínimo 3 caracteres';
  }

  if (!data.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (!isStrongPassword(data.password)) {
    errors.password = 'Mínimo 6 caracteres con letras y números';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return errors;
};