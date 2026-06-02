import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;
  private isReady = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn('⚠️ REDIS_URL no definida. Redis no se usará.');
      return;
    }

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('❌ Redis: demasiados reintentos, deshabilitando caché');
          return null; // detiene reintentos
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.client.on('connect', () => console.log('✅ Conectado a Redis'));
    this.client.on('ready', () => {
      this.isReady = true;
      console.log('✅ Redis listo para usar');
    });
    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
      this.isReady = false;
    });
  }

  private async ensureReady(): Promise<boolean> {
    if (!this.client || !this.isReady) return false;
    return true;
  }

  async get(key: string): Promise<string | null> {
    if (!(await this.ensureReady())) return null;
    try {
      return await this.client!.get(key);
    } catch (err) {
      console.error(`Redis GET error (${key}):`, err);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!(await this.ensureReady())) return;
    try {
      if (ttl) await this.client!.set(key, value, 'EX', ttl);
      else await this.client!.set(key, value);
    } catch (err) {
      console.error(`Redis SET error (${key}):`, err);
    }
  }

  async del(key: string): Promise<void> {
    if (!(await this.ensureReady())) return;
    try {
      await this.client!.del(key);
    } catch (err) {
      console.error(`Redis DEL error (${key}):`, err);
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }
}