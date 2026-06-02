import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input type="email" className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input type="password" className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded">Login</button>
      </form>
      <p className="mt-4 text-center">¿No tienes cuenta? <Link to="/register" className="text-blue-500">Regístrate</Link></p>
    </div>
  );
}