import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma.service';
import { Course } from '@prisma/client';

// Mock de PrismaService
const mockPrisma = {
  course: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      const expectedCourses: Course[] = [
        { id: 1, name: 'Test', description: null, credits: 3, createdAt: new Date(), updatedAt: new Date() },
      ];
      prisma.course.findMany.mockResolvedValue(expectedCourses);

      const result = await service.findAll();
      expect(result).toEqual(expectedCourses);
      expect(prisma.course.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single course by id', async () => {
      const expectedCourse: Course = { id: 1, name: 'Test', description: null, credits: 3, createdAt: new Date(), updatedAt: new Date() };
      prisma.course.findUnique.mockResolvedValue(expectedCourse);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedCourse);
      expect(prisma.course.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);
      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new course', async () => {
      const createData = { name: 'New Course', description: 'Desc', credits: 4 };
      const createdCourse: Course = { id: 2, ...createData, createdAt: new Date(), updatedAt: new Date() };
      prisma.course.create.mockResolvedValue(createdCourse);

      const result = await service.create(createData);
      expect(result).toEqual(createdCourse);
      expect(prisma.course.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('update', () => {
    it('should update and return the updated course', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedCourse: Course = { id: 1, name: 'Updated Name', description: null, credits: 3, createdAt: new Date(), updatedAt: new Date() };
      prisma.course.update.mockResolvedValue(updatedCourse);

      const result = await service.update(1, updateData);
      expect(result).toEqual(updatedCourse);
      expect(prisma.course.update).toHaveBeenCalledWith({ where: { id: 1 }, data: updateData });
    });
  });

  describe('delete', () => {
    it('should delete and return the deleted course', async () => {
      const deletedCourse: Course = { id: 1, name: 'ToDelete', description: null, credits: 1, createdAt: new Date(), updatedAt: new Date() };
      prisma.course.delete.mockResolvedValue(deletedCourse);

      const result = await service.delete(1);
      expect(result).toEqual(deletedCourse);
      expect(prisma.course.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});