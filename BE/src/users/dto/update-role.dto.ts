import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

// Using the user_role enum from your Prisma schema
enum UserRole {
  user = 'user',
  store = 'store',
  super_user = 'super_user',
}

export class UpdateRoleDto {
  @ApiProperty({
    description: 'User role to assign',
    enum: UserRole,
    example: 'store',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, {
    message: 'Invalid role. Must be one of: user, store, super_user',
  })
  role: UserRole;
}
