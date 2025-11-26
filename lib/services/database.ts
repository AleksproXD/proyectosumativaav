import * as FileSystem from 'expo-file-system';

// @ts-ignore - Solución temporal para problema de tipos
const DB_FILE = `${FileSystem.documentDirectory}db.json`;

export interface Database {
  users: Array<{
    id: string;
    name: string;
    email: string;
    password: string;
  }>;
  tasks: Array<{
    id: string;
    userId: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: string;
  }>;
  currentUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const defaultDB: Database = {
  users: [],
  tasks: [],
  currentUser: null,
};

export const loadDatabase = async (): Promise<Database> => {
  try {
    // @ts-ignore
    const fileInfo = await FileSystem.getInfoAsync(DB_FILE);
    if (fileInfo.exists) {
      // @ts-ignore
      const content = await FileSystem.readAsStringAsync(DB_FILE);
      return JSON.parse(content);
    }
    // Si no existe, crear el archivo con datos por defecto
    await saveDatabase(defaultDB);
    return defaultDB;
  } catch (error) {
    console.error('Error cargando db.json:', error);
    return defaultDB;
  }
};

export const saveDatabase = async (data: Database): Promise<void> => {
  try {
    // @ts-ignore
    await FileSystem.writeAsStringAsync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error guardando db.json:', error);
  }
};