export interface User {
  id: string;
  email: string;
  name: string;
}

// Ahora los FormData vienen de Zod
export type { LoginFormData, RegisterFormData } from '../schemas/authSchema';

export interface AuthValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}