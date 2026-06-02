import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  // 1. Login para obtener token
  const loginRes = http.post('http://localhost:3001/auth/login', JSON.stringify({
    email: 'testload@example.com',
    password: '123456',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'Login status 200': (r) => r.status === 200 });
  const token = loginRes.json('accessToken');

  if (!token) {
    console.error('No se pudo obtener token');
    return;
  }

  // 2. Crear un curso con el token
  const createRes = http.post('http://localhost:3001/courses', JSON.stringify({
    name: `Curso carga ${__VU}-${__ITER}`,
    credits: 3,
  }), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  check(createRes, { 'Crear curso status 201': (r) => r.status === 201 });

  // 3. Listar cursos (público o protegido)
  const listRes = http.get('http://localhost:3001/courses', {
    headers: { Authorization: `Bearer ${token}` },
  });
  check(listRes, { 'Listar cursos status 200': (r) => r.status === 200 });

  sleep(1);
}