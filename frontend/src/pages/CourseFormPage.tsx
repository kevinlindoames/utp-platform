import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourse, createCourse, updateCourse, Course } from '../api/courses';

export default function CourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: 1,
  });

  const { data: course, isLoading: loadingCourse } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: () => getCourse(Number(id)),
    enabled: isEditing,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description || '',
        credits: course.credits,
      });
    }
  }, [course]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEditing) {
        return updateCourse(Number(id), data);
      } else {
        return createCourse(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isEditing && loadingCourse) return <div>Cargando...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar Curso' : 'Nuevo Curso'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Descripción</label>
          <textarea
            className="w-full border p-2 rounded"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Créditos</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={formData.credits}
            onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })}
            min="1"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded">
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </form>
    </div>
  );
}