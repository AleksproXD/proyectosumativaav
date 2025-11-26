import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types/Task';
import { useAuth } from './AuthContext';
import { loadDatabase, saveDatabase } from '../services/database';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user) {
      loadTasks(user.id);
    } else {
      setTasks([]);
    }
  }, [user]);

  const loadTasks = async (userId: string) => {
    try {
      const db = await loadDatabase();
      const userTasks = db.tasks.filter(task => task.userId === userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      setTasks([]);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    if (!user) return;
    
    try {
      const db = await loadDatabase();
      // Remover tareas del usuario actual
      db.tasks = db.tasks.filter(task => task.userId !== user.id);
      // Agregar tareas actualizadas
      db.tasks.push(...updatedTasks.map(task => ({ ...task, userId: user.id })));
      await saveDatabase(db);
    } catch (error) {
      console.error('Error guardando tareas:', error);
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, ...updatedTask } : task
    );
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, getTaskById }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks debe usarse dentro de TaskProvider');
  }
  return context;
};