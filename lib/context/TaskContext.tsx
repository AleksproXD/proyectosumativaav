import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types/Task';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTasks(user.id);
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const loadTasks = async (userId: string) => {
    try {
      setLoading(true);
      const data = await api.get<Task[]>(`/tasks?userId=${userId}`);
      setTasks(data);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const newTask = await api.post<Task>('/tasks', {
        ...task,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Error agregando tarea:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await api.patch<Task>(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(task => (task.id === id ? updated : task)));
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      throw error;
    }
  };

  const getTaskById = (id: string) => tasks.find(task => task.id === id);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTaskById, loading }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks debe usarse dentro de TaskProvider');
  return context;
};