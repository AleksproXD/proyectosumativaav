export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

// Ahora TaskFormData viene de Zod
export type { TaskFormData } from '../schemas/taskSchema';

export interface ValidationErrors {
  title?: string;
  description?: string;
}