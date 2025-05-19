import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto, RefreshTokenDto, TokenPayloadDto } from './dto/auth.dto';
import { LoginResponse, mapToLoginResponse } from './type/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  async login(req: LoginDto): Promise<LoginResponse> {
    this.logger.log(
      `Login attempt with account: ${req.account}`,
      'AuthService',
    );

    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [
          { username: req.account },
          { email: req.account },
          { user_profiles: { phone: req.account } },
        ],
      },
      include: {
        user_profiles: true,
      },
    });

    if (!user) {
      this.logger.warn(
        `Login failed - user not found: ${req.account}`,
        'AuthService',
      );
      throw new UnauthorizedException('User not found');
    }

    // Validate password
    const validatedUser = await this.validatePassword(
      user.username,
      req.password,
    );
    // If password is invalid
    if (!validatedUser) {
      this.logger.warn(
        `Login failed - invalid password for account: ${req.account}`,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid password');
    }
    const payload: TokenPayloadDto = {
      sub: user.id,
      username: user.username || '',
      email: user.email,
      created_at: user.created_at || new Date(),
      role: user.role,
    };

    // Generate access token (short-lived)
    const accessToken = this.generateAccessToken(payload);

    // Generate refresh token (long-lived)
    const refreshToken = await this.generateRefreshToken(user.id);

    return mapToLoginResponse(user, accessToken, refreshToken);
  }
  async validatePassword(username: string | null, pass: string): Promise<any> {
    // Find user by username
    const user = await this.prismaService.users.findFirst({
      where: {
        username,
      },
    });

    // If user exists and password matches
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Don't include password in returned object
      const { password, ...result } = user;
      return result;
    }

    // Return null if user doesn't exist or password is wrong
    return null;
  }
  generateAccessToken(payload: TokenPayloadDto): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    this.logger.log(
      `Generating refresh token for user: ${userId}`,
      'AuthService',
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      },
    ); // Calculate expiration date - using simple calculation instead of ms package
    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    // Convert days to milliseconds (assuming format is like "7d")
    const days = parseInt(expiresIn.replace('d', ''));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    // Store the token in the database
    try {
      await this.prismaService.refresh_tokens.create({
        data: {
          token: refreshToken,
          user_id: userId,
          expires: expiresAt,
        },
      });

      this.logger.log(
        `Refresh token stored in database for user: ${userId}`,
        'AuthService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to store refresh token: ${error.message}`,
        error.stack,
        'AuthService',
      );
      throw new Error('Failed to generate refresh token');
    }

    return refreshToken;
  }
  async refreshToken(refreshTokenRequest: RefreshTokenDto) {
    this.logger.log('Refresh token request received', 'AuthService');

    try {
      // Verify the refresh token
      const decoded = this.jwtService.verify(
        refreshTokenRequest.refresh_token,
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            this.configService.get<string>('JWT_SECRET'),
        },
      );

      // Check if token exists in database and is not revoked
      const tokenRecord = await this.prismaService.refresh_tokens.findFirst({
        where: {
          token: refreshTokenRequest.refresh_token,
          revoked: false,
          expires: {
            gt: new Date(), // Ensure token has not expired
          },
        },
      });

      if (!tokenRecord) {
        this.logger.warn(
          `Refresh token not found or revoked: ${refreshTokenRequest.refresh_token.substring(0, 10)}...`,
          'AuthService',
        );
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user from database
      const user = await this.prismaService.users.findUnique({
        where: { id: decoded.sub },
        include: { user_profiles: true },
      });

      if (!user) {
        this.logger.warn(
          `User not found for refresh token: ${decoded.sub}`,
          'AuthService',
        );
        throw new UnauthorizedException('User not found');
      }

      // Generate a new payload for the access token
      const payload: TokenPayloadDto = {
        sub: user.id,
        username: user.username || '',
        email: user.email,
        created_at: user.created_at || new Date(),
        role: user.role,
      };

      // Mark the current token as revoked
      await this.prismaService.refresh_tokens.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });

      this.logger.log(
        `Old refresh token revoked for user: ${user.id}`,
        'AuthService',
      );

      // Generate new access token
      const accessToken = this.generateAccessToken(payload);

      // Generate new refresh token
      const newRefreshToken = await this.generateRefreshToken(user.id);

      this.logger.log(
        `New tokens generated for user: ${user.id}`,
        'AuthService',
      );

      return mapToLoginResponse(user, accessToken, newRefreshToken);
    } catch (error) {
      this.logger.error(
        `Refresh token error: ${error.message}`,
        error.stack,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    this.logger.log(`Logout request for user: ${userId}`, 'AuthService');

    try {
      if (refreshToken) {
        // If specific token provided, only revoke that token
        await this.prismaService.refresh_tokens.updateMany({
          where: {
            user_id: userId,
            token: refreshToken,
            revoked: false,
          },
          data: {
            revoked: true,
          },
        });

        this.logger.log(
          `Specific refresh token revoked for user: ${userId}`,
          'AuthService',
        );
      } else {
        // If no specific token, revoke all active tokens for this user
        await this.prismaService.refresh_tokens.updateMany({
          where: {
            user_id: userId,
            revoked: false,
          },
          data: {
            revoked: true,
          },
        });

        this.logger.log(
          `All refresh tokens revoked for user: ${userId}`,
          'AuthService',
        );
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(
        `Logout error: ${error.message}`,
        error.stack,
        'AuthService',
      );
      throw new Error('Failed to logout');
    }
  }
}
