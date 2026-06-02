// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public client: Redis;

  constructor() {
    // Intenta leer la variable 'REDIS_URL' que inyecta Railway.
    // Si no existe (como en desarrollo local), usa tu configuración por defecto (localhost:6379).
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // En Railway, se requiere a veces añadir '?family=0' a la URL para manejar conexiones IPv6[reference:5].
    const finalUrl = process.env.REDIS_URL ? `${redisUrl}?family=0` : redisUrl;

    this.client = new Redis(finalUrl);
    console.log(`Conectando a Redis con URL: ${finalUrl}`);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}