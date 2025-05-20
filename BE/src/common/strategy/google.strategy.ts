import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['profile', 'email'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    this.logger.log(
      `Google auth attempt for email: ${profile.emails?.[0]?.value}`,
      'GoogleStrategy',
    );

    const email = profile.emails?.[0]?.value;

    if (!email) {
      this.logger.warn(
        `Google auth failed - no email provided in profile`,
        'GoogleStrategy',
      );
      throw new UnauthorizedException(
        'Google authentication failed: No email provided',
      );
    }

    // Find or create user
    try {
      // Check if user exists
      let user = await this.prismaService.users.findUnique({
        where: { email },
        include: { user_profiles: true },
      });

      // If user doesn't exist, create a new one
      if (!user) {
        this.logger.log(
          `Creating new user from Google auth with email: ${email}`,
          'GoogleStrategy',
        );

        const names = profile.displayName?.split(' ') || [];
        const firstName = names.slice(-1)[0] || '';
        const lastName = names.slice(0, -1).join(' ') || '';

        user = await this.prismaService.users.create({
          data: {
            email,
            username: email.split('@')[0], // Generate username from email
            password: '', // Empty password for social login users
            user_profiles: {
              create: {
                first_name: firstName,
                last_name: lastName,
                phone: null,
              },
            },
          },
          include: {
            user_profiles: true,
          },
        });
      }
      return {
        userId: user.id, // Changed from user_id to userId to match expected format
        email: user.email,
        username: user.username,
        role: user.role,
        first_name: user.user_profiles?.first_name || '',
        last_name: user.user_profiles?.last_name || '',
      };
    } catch (error) {
      this.logger.error(
        `Google auth error: ${error.message}`,
        error.stack,
        'GoogleStrategy',
      );
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
