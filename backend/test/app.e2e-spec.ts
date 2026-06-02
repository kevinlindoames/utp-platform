import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';
const request = require('supertest');

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('should register a user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e@test.com', password: '123456', name: 'E2E User' })
      .expect(201);
  });

  it('should login and return accessToken', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e@test.com', password: '123456' })
      .expect(200)
      .expect(res => {
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
      });
  });

  it('should create a course (protected)', () => {
    return request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Course', description: 'E2E course', credits: 3 })
      .expect(201);
  });

  it('should get all courses (public)', () => {
    return request(app.getHttpServer())
      .get('/courses')
      .expect(200);
  });

  it('should get course by id (public)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'GetById Course', credits: 2 });
    const courseId = createRes.body.id;

    return request(app.getHttpServer())
      .get(`/courses/${courseId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.id).toEqual(courseId);
      });
  });

  it('should update a course (protected)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'ToUpdate', credits: 1 });
    const id = createRes.body.id;

    return request(app.getHttpServer())
      .put(`/courses/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Course' })
      .expect(200);
  });

  it('should delete a course (protected)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'ToDelete', credits: 1 });
    const id = createRes.body.id;

    return request(app.getHttpServer())
      .delete(`/courses/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});