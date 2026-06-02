import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesListPage from './pages/CoursesListPage';
import CourseFormPage from './pages/CourseFormPage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center p-4">Cargando...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <CoursesListPage />
            </PrivateRoute>
          } />
          <Route path="/courses/new" element={
            <PrivateRoute>
              <CourseFormPage />
            </PrivateRoute>
          } />
          <Route path="/courses/edit/:id" element={
            <PrivateRoute>
              <CourseFormPage />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;