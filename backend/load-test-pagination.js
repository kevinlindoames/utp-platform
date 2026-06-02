import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200'],
  },
};

export default function () {
  // Páginas aleatorias entre 1 y 50 (asumiendo que tienes muchas páginas)
  const page = Math.floor(Math.random() * 50) + 1;
  const url = `http://localhost:3001/courses?page=${page}&limit=20`;

  const res = http.get(url);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => r.json('data') !== undefined,
  });

  sleep(0.3); // reduce la pausa para generar más carga
}