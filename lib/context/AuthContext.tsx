import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, LoginFormData, RegisterFormData } from '../types/Auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<boolean>;
  register: (data: RegisterFormData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: { email: string; password: string; name: string }[] = [];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (data: LoginFormData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(
      u => u.email === data.email && u.password === data.password
    );

    if (foundUser) {
      setUser({
        id: Date.now().toString(),
        email: foundUser.email,
        name: foundUser.name,
      });
      return true;
    }

    return false;
  };

  const register = async (data: RegisterFormData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      return false;
    }

    mockUsers.push({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    setUser({
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
    });

    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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