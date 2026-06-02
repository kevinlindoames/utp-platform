import { Controller, Post, Body, Res, HttpCode, HttpStatus, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Response, Request } from 'express'; // ← importación como tipo

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(loginDto);
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Refresh token no proporcionado');
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh(refreshToken);
    response.cookie('refresh_token', newRefreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 7*24*60*60*1000 });
    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refresh_token;
    if (refreshToken) {
      const userId = (request.user as any).userId;
      await this.authService.logout(userId, refreshToken);
    }
    response.clearCookie('refresh_token');
    return { message: 'Logout exitoso' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() request: Request) {
    return request.user;
  }
}