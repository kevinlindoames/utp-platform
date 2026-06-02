import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCoursesPaginated, deleteCourse, Course, PaginatedResponse } from '../api/courses';

export default function CoursesListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  // Consulta paginada con keepPreviousData
  const { data, isLoading, error, isFetching } = useQuery<PaginatedResponse>({
    queryKey: ['courses', page],
    queryFn: () => getCoursesPaginated(page, limit),
    placeholderData: keepPreviousData, // ← reemplaza keepPreviousData por placeholderData
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', page] });
    },
  });

  if (isLoading) return <div className="text-center p-4">Cargando cursos...</div>;
  if (error) return <div className="text-red-500 p-4">Error al cargar cursos</div>;
  if (!data) return null; // Aseguramos que data existe

  const { data: courses, totalPages, page: currentPage, total } = data;

  const handlePrevious = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <Link to="/courses/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Nuevo Curso
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course: Course) => (
          <div key={course.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold">{course.name}</h3>
            <p className="text-gray-600">{course.description || 'Sin descripción'}</p>
            <p className="text-sm text-gray-500">Créditos: {course.credits}</p>
            <div className="mt-2 flex justify-end space-x-2">
              <Link to={`/courses/edit/${course.id}`} className="text-blue-500 hover:underline">
                Editar
              </Link>
              <button
                onClick={() => deleteMutation.mutate(course.id)}
                className="text-red-500 hover:underline"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-600">
          Página {currentPage} de {totalPages} (Total cursos: {total})
          {isFetching && <span className="ml-2 text-blue-500">Cargando...</span>}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}