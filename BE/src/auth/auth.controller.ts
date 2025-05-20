import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { get } from 'http';
import { AuthGuard } from '@nestjs/passport';
import { loggers } from 'winston';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenRequest: RefreshTokenDto) {
    // log with winston
    const logger = loggers.get('default');
    logger.info('Refresh token request', refreshTokenRequest);
    return this.authService.refreshToken(refreshTokenRequest);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.sub || req.user.user_id;
    return this.usersService.findOne(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Request() req, @Body() body: { refresh_token?: string }) {
    const userId = req.user.user_id;
    return this.authService.logout(userId, body.refresh_token);
  }
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // This endpoint will redirect to Google OAuth
    // Passport handles the redirect automatically
  }
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async callback(@Request() req, @Res() res) {
    // The validated user is available as req.user
    console.log(req.user);
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(
      `${frontendUrl}/login/success?access_token=${result.access_token}&refresh_token=${result.refresh_token}`,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('token-info')
  async getTokenInfo(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return { error: 'No token provided' };
    }

    try {
      // Decode the token without verification
      const decoded = this.authService.decodeJwtToken(token);

      // Calculate remaining time
      const remainingMs = decoded.exp ? decoded.exp * 1000 - Date.now() : 0;

      return {
        token_info: {
          ...decoded,
          exp_date: decoded.exp
            ? new Date(decoded.exp * 1000).toISOString()
            : null,
          iat_date: decoded.iat
            ? new Date(decoded.iat * 1000).toISOString()
            : null,
        },
        remaining_seconds: Math.max(0, Math.floor(remainingMs / 1000)),
        remaining_time_formatted: this.formatRemainingTime(remainingMs),
        is_valid: remainingMs > 0,
      };
    } catch (error) {
      return { error: 'Invalid token', details: error.message };
    }
  }

  private formatRemainingTime(ms: number): string {
    if (ms <= 0) return 'Expired';

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return `${hours}h ${minutes}m ${seconds}s`;
  }
}
