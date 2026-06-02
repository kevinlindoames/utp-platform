import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course } from '@prisma/client';

// Mock completo del servicio
const mockCoursesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CoursesController', () => {
  let controller: CoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CoursesService, useValue: mockCoursesService },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver un array de cursos', async () => {
      const expectedCourses: Course[] = [
        { id: 1, name: 'Curso 1', description: null, credits: 3, createdAt: new Date(), updatedAt: new Date() },
      ];
      mockCoursesService.findAll.mockResolvedValue(expectedCourses);

      const result = await controller.findAll();

      expect(result).toEqual(expectedCourses);
      expect(mockCoursesService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debe devolver un curso por id', async () => {
      const expectedCourse: Course = { id: 1, name: 'Curso 1', description: null, credits: 3, createdAt: new Date(), updatedAt: new Date() };
      mockCoursesService.findOne.mockResolvedValue(expectedCourse);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedCourse);
      expect(mockCoursesService.findOne).toHaveBeenCalledWith(1);
    });

    it('debe devolver null si no encuentra el curso', async () => {
      mockCoursesService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('debe crear un curso y devolverlo', async () => {
      const createDto = { name: 'Nuevo curso', description: 'Descripción', credits: 4 };
      const createdCourse: Course = { id: 2, ...createDto, createdAt: new Date(), updatedAt: new Date() };
      mockCoursesService.create.mockResolvedValue(createdCourse);

      const result = await controller.create(createDto);

      expect(result).toEqual(createdCourse);
      expect(mockCoursesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('debe actualizar un curso y devolverlo', async () => {
      const updateDto = { name: 'Curso actualizado' };
      const updatedCourse: Course = { id: 1, name: 'Curso actualizado', description: null, credits: 3, createdAt: new Date(), updatedAt: new Date() };
      mockCoursesService.update.mockResolvedValue(updatedCourse);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedCourse);
      expect(mockCoursesService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('delete', () => {
    it('debe eliminar un curso y devolverlo', async () => {
      const deletedCourse: Course = { id: 1, name: 'Curso a eliminar', description: null, credits: 3, createdAt: new Date(), updatedAt: new Date() };
      mockCoursesService.delete.mockResolvedValue(deletedCourse);

      const result = await controller.delete('1');

      expect(result).toEqual(deletedCourse);
      expect(mockCoursesService.delete).toHaveBeenCalledWith(1);
    });
  });
});