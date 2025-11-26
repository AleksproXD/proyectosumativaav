import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginFormData, RegisterFormData } from '../types/Auth';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<boolean>;
  register: (data: RegisterFormData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const sessions = await api.get<any[]>('/sessions');
      if (sessions.length > 0) {
        const userData = await api.get<any>(`/users/${sessions[0].userId}`);
        setUser({ id: userData.id, email: userData.email, name: userData.name });
      }
    } catch (error) {
      console.error('Error cargando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginFormData): Promise<boolean> => {
    try {
      const users = await api.get<any[]>(`/users?email=${data.email}`);
      const foundUser = users.find(u => u.password === data.password);

      if (foundUser) {
        await api.post('/sessions', { userId: foundUser.id });
        setUser({ id: foundUser.id, email: foundUser.email, name: foundUser.name });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const register = async (data: RegisterFormData): Promise<boolean> => {
    try {
      const users = await api.get<any[]>(`/users?email=${data.email}`);
      if (users.length > 0) return false;

      const newUser = await api.post<any>('/users', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      await api.post('/sessions', { userId: newUser.id });
      setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const sessions = await api.get<any[]>('/sessions');
      for (const session of sessions) {
        await api.delete(`/sessions/${session.id}`);
      }
      setUser(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};