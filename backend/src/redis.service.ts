import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn('⚠️ REDIS_URL no definida. Redis no se usará.');
      return;
    }
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
    this.client.on('connect', () => console.log('✅ Conectado a Redis'));
    this.client.on('error', (err) => console.error('❌ Redis error:', err));
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error(`Redis GET error: ${key}`, err);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttl) await this.client.set(key, value, 'EX', ttl);
      else await this.client.set(key, value);
    } catch (err) {
      console.error(`Redis SET error: ${key}`, err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`Redis DEL error: ${key}`, err);
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }
}