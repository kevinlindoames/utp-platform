import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

// Mocks
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

// Mock completo de bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrisma;
  let jwtService: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user and return user without password', async () => {
      const registerDto = { email: 'test@example.com', password: '123456', name: 'Test' };
      const hashedPassword = 'hashed123';
      const createdUser = { id: 1, email: registerDto.email, password: hashedPassword, name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      const expectedUser = { id: 1, email: registerDto.email, name: 'Test', createdAt: createdUser.createdAt, updatedAt: createdUser.updatedAt };

      prisma.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);
      expect(result).toEqual(expectedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
        },
      });
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      const registerDto = { email: 'existing@example.com', password: '123456', name: 'Test' };
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: registerDto.email, password: 'hash' });

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return accessToken and user if credentials are valid', async () => {
      const loginDto = { email: 'test@example.com', password: '123456' };
      const user = { id: 1, email: loginDto.email, password: 'hashed', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      const token = 'jwt-token';

      prisma.user.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);
      expect(result).toEqual({
        accessToken: token,
        user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: loginDto.email } });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'no@existe.com', password: '123' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = { id: 1, email: 'test@example.com', password: 'hashed', name: 'Test', createdAt: new Date(), updatedAt: new Date() };
      prisma.user.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);
      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });
});