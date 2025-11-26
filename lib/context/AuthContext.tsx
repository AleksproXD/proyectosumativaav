import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginFormData, RegisterFormData } from '../types/Auth';
import { loadDatabase, saveDatabase } from '../services/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<boolean>;
  register: (data: RegisterFormData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const db = await loadDatabase();
      if (db.currentUser) {
        setUser(db.currentUser);
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginFormData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const db = await loadDatabase();
    const foundUser = db.users.find(
      u => u.email === data.email && u.password === data.password
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      };
      
      setUser(userData);
      db.currentUser = userData;
      await saveDatabase(db);
      return true;
    }

    return false;
  };

  const register = async (data: RegisterFormData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const db = await loadDatabase();
    const existingUser = db.users.find(u => u.email === data.email);
    
    if (existingUser) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password,
      name: data.name,
    };

    db.users.push(newUser);

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    setUser(userData);
    db.currentUser = userData;
    await saveDatabase(db);

    return true;
  };

  const logout = async () => {
    setUser(null);
    const db = await loadDatabase();
    db.currentUser = null;
    await saveDatabase(db);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};