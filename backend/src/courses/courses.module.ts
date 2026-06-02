import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, PrismaService, RedisService],
})
export class CoursesModule {}