export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: string;
  }
  
  export interface TaskFormData {
    title: string;
    description: string;
  }
  
  export interface ValidationErrors {
    title?: string;
    description?: string;
  }