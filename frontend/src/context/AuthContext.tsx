import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Opcional: podrías verificar el token con un endpoint /auth/me
      // Por simplicidad, asumimos que el token es válido
      // Aquí podrías obtener el usuario, pero lo dejamos para cuando se haga login
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await apiLogin(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const user = await apiRegister(email, password, name);
    setUser(user);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};