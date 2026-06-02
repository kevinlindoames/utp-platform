import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.coursesService.findAllPaginated(skip, limitNum),
      this.coursesService.count(),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course | null> {
    return this.coursesService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { name: string; description?: string; credits: number }): Promise<Course> {
    return this.coursesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: { name?: string; description?: string; credits?: number }): Promise<Course> {
    return this.coursesService.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<Course> {
    return this.coursesService.delete(Number(id));
  }
}