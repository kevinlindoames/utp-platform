import api from './axiosConfig';

export interface User {
  id: number;
  email: string;
  name?: string;
}

export const register = async (email: string, password: string, name?: string): Promise<User> => {
  const response = await api.post('/auth/register', { email, password, name });
  return response.data;
};

export const login = async (email: string, password: string): Promise<{ accessToken: string; user: User }> => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
};

// Función para refrescar token (usada internamente por el interceptor)
export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await api.post('/auth/refresh');
  return response.data;
};