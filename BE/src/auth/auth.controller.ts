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
import { AuthGuard } from '@nestjs/passport';
import { loggers } from 'winston';
import { UsersService } from '../users/users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Login with username/email and password',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          example: {
            id: 'abc123',
            username: 'johndoe',
            email: 'john@example.com',
            role: 'user',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid refresh token',
  })
  async refreshToken(@Body() refreshTokenRequest: RefreshTokenDto) {
    // log with winston
    const logger = loggers.get('default');
    logger.info('Refresh token request', refreshTokenRequest);
    return this.authService.refreshToken(refreshTokenRequest);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the profile of the logged-in user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'abc123' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john@example.com' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        role: { type: 'string', example: 'user' },
        phone: { type: 'string', example: '1234567890' },
        created_at: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-01T00:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async getProfile(@Request() req) {
    const userId = req.user.sub || req.user.user_id;
    return this.usersService.findOne(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'User logout',
    description: 'Log out the user and invalidate tokens',
  })
  @ApiBody({
    schema: {
      properties: {
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async logout(@Request() req, @Body() body: { refresh_token?: string }) {
    const userId = req.user.user_id;
    return this.authService.logout(userId, body.refresh_token);
  }
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Redirects to Google authentication page',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google authentication',
  })
  async googleLogin() {
    // This endpoint will redirect to Google OAuth
    // Passport handles the redirect automatically
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Callback endpoint for Google OAuth authentication',
  })
  @ApiResponse({
    status: 302,
    description:
      'Redirects to frontend with tokens upon successful authentication',
  })
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
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get token information',
    description:
      'Returns information about the current JWT token including expiration time',
  })
  @ApiResponse({
    status: 200,
    description: 'Token information retrieved successfully',
    schema: {
      properties: {
        token_info: {
          type: 'object',
          properties: {
            sub: { type: 'string', example: 'abc123' },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john@example.com' },
            exp: { type: 'number', example: 1716688357 },
            iat: { type: 'number', example: 1716684757 },
            exp_date: {
              type: 'string',
              format: 'date-time',
              example: '2023-05-26T10:12:37Z',
            },
            iat_date: {
              type: 'string',
              format: 'date-time',
              example: '2023-05-26T09:12:37Z',
            },
          },
        },
        remaining_seconds: { type: 'number', example: 3600 },
        remaining_time_formatted: { type: 'string', example: '1h 0m 0s' },
        is_valid: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
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
