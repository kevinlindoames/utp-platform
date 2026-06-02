import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new UnauthorizedException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken, revoked: false },
      include: { user: true },
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Rotación: eliminar el token usado y generar uno nuevo
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
    const newAccessToken = this.generateAccessToken(storedToken.user);
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: number, refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, userId },
      data: { revoked: true },
    });
    return { message: 'Logout exitoso' };
  }

  private generateAccessToken(user: any) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
    return token;
  }
}