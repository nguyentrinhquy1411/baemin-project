import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { AuthService } from './auth.service';
import { RefreshTokenRequest } from './type/auth.request';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.body);
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenRequest: RefreshTokenRequest) {
    return this.authService.refreshToken(refreshTokenRequest);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Request() req, @Body() body: { refresh_token?: string }) {
    const userId = req.user.user_id;
    return this.authService.logout(userId, body.refresh_token);
  }
}
