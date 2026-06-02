import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis.service';
import { Course, Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ========== PÁGINAS CON CACHÉ REDIS ==========
  async findAllPaginated(skip: number, take: number): Promise<Course[]> {
    const cacheKey = `courses:page:${skip}:${take}`;
    console.log(`🔑 cacheKey: ${cacheKey}`);

    // Intento leer desde Redis
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        console.log(`✅ Sirviendo desde caché Redis (página ${skip / take + 1})`);
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('❌ Error leyendo de Redis:', err.message);
    }

    // Consulta a la base de datos
    console.log(`⏳ Consultando BD: skip=${skip}, take=${take}`);
    const courses = await this.prisma.course.findMany({
      skip,
      take,
      orderBy: { id: 'asc' },
    });
    console.log(`📦 BD devolvió ${courses.length} cursos`);

    // Guardar en Redis (sin esperar resolución para no bloquear)
    this.redis.set(cacheKey, JSON.stringify(courses), 300).catch(err => {
      console.error('❌ Error guardando en Redis:', err.message);
    });

    return courses;
  }

  async count(): Promise<number> {
    return this.prisma.course.count();
  }

  // ========== MÉTODOS ADICIONALES ==========
  async findAll(): Promise<Course[]> {
    console.log('⚠️ findAll sin paginación – no recomendado para grandes volúmenes');
    return this.prisma.course.findMany();
  }

  async findOne(id: number): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { id } });
  }

  async create(data: Prisma.CourseCreateInput): Promise<Course> {
    const course = await this.prisma.course.create({ data });
    // No invalidamos caché – expira sola en 300 segundos
    return course;
  }

  async update(id: number, data: Prisma.CourseUpdateInput): Promise<Course> {
    return this.prisma.course.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Course> {
    return this.prisma.course.delete({ where: { id } });
  }
}