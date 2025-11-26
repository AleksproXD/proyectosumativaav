import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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

const DB_KEY = 'app_database';

// ==================== WEB ====================
const loadDatabaseWeb = (): Database => {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return defaultDB;
  } catch (error) {
    console.error('Error cargando DB (web):', error);
    return defaultDB;
  }
};

const saveDatabaseWeb = (data: Database): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error guardando DB (web):', error);
  }
};

// ==================== MOBILE ====================
const DB_FILE = `${FileSystem.documentDirectory}db.json`;

const loadDatabaseMobile = async (): Promise<Database> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(DB_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(DB_FILE);
      return JSON.parse(content);
    }
    await saveDatabaseMobile(defaultDB);
    return defaultDB;
  } catch (error) {
    console.error('Error cargando DB (mobile):', error);
    return defaultDB;
  }
};

const saveDatabaseMobile = async (data: Database): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error guardando DB (mobile):', error);
  }
};

// ==================== EXPORTS ====================
export const loadDatabase = async (): Promise<Database> => {
  if (Platform.OS === 'web') {
    return loadDatabaseWeb();
  }
  return await loadDatabaseMobile();
};

export const saveDatabase = async (data: Database): Promise<void> => {
  if (Platform.OS === 'web') {
    saveDatabaseWeb(data);
  } else {
    await saveDatabaseMobile(data);
  }
};