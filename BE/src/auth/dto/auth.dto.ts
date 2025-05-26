import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email or username for login',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Account is required' })
  @IsString({ message: 'Account must be a string' })
  account: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString({ message: 'Refresh token must be a string' })
  refresh_token: string;
}

export class TokenPayloadDto {
  @ApiProperty({
    description: 'User ID',
    example: 'abc123',
  })
  @IsNotEmpty()
  @IsString()
  sub: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
    enum: ['user', 'vendor', 'admin', 'super_user'],
  })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-01-01T00:00:00Z',
  })
  @Type(() => Date)
  created_at: Date;
}
