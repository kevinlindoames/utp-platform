import api from './axiosConfig';

export interface Course {
  id: number;
  name: string;
  description?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Obtener cursos con paginación
export const getCoursesPaginated = async (page: number, limit: number = 20): Promise<PaginatedResponse> => {
  const response = await api.get(`/courses?page=${page}&limit=${limit}`);
  return response.data;
};

// Obtener un curso por ID (sin cambios)
export const getCourse = async (id: number): Promise<Course> => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

// Crear curso (sin cambios)
export const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
  const response = await api.post('/courses', course);
  return response.data;
};

// Actualizar curso (sin cambios)
export const updateCourse = async (id: number, course: Partial<Course>): Promise<Course> => {
  const response = await api.put(`/courses/${id}`, course);
  return response.data;
};

// Eliminar curso (sin cambios)
export const deleteCourse = async (id: number): Promise<void> => {
  await api.delete(`/courses/${id}`);
};