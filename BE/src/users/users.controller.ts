import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('sign-up')
  @ApiOperation({
    summary: 'Create new user',
    description: 'Register a new user with the system',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'abc123' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john@example.com' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Username or email already exists',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users (admin access may be required)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          role: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  findAll() {
    return this.usersService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile of the currently authenticated user',
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
        created_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  findMe(@Request() req) {
    const userId = req.user.user_id || req.user.sub;
    return this.usersService.findOne(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a user by their unique ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    schema: {
      properties: {
        id: { type: 'string', example: 'abc123' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john@example.com' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        role: { type: 'string', example: 'user' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  @Patch(':id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user',
    description: "Update a user's information",
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'abc123' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john@example.com' },
        first_name: { type: 'string', example: 'Updated' },
        last_name: { type: 'string', example: 'Name' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  @Delete(':id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Remove a user from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'User deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  @Post('search')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Search and filter users',
    description:
      'Search and filter users by various criteria with pagination support',
  })
  @ApiBody({ type: SearchUserDto })
  @ApiResponse({
    status: 200,
    description: 'Users found',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              id: { type: 'string', example: 'abc123' },
              username: { type: 'string', example: 'johndoe' },
              email: { type: 'string', example: 'john@example.com' },
              role: { type: 'string', example: 'user' },
              created_at: { type: 'string', format: 'date-time' },
              first_name: { type: 'string', example: 'John' },
              last_name: { type: 'string', example: 'Doe' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalCount: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  searchUsers(@Body() searchUserDto: SearchUserDto) {
    return this.usersService.searchUsers(searchUserDto);
  }

  @Patch(':id/role')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user role',
    description:
      "Change a user's role (requires admin or super_user permissions)",
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'abc123' },
        username: { type: 'string', example: 'johndoe' },
        role: { type: 'string', example: 'store' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.usersService.updateRole(id, updateRoleDto.role);
  }

  @Get('profile/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user profile',
    description: "Retrieve a user's profile information",
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      properties: {
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '1234567890' },
        address: { type: 'string', example: '123 Main St, City' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User profile does not exist',
  })
  getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Patch('profile/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user profile',
    description: "Update a user's profile information",
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      properties: {
        user_id: { type: 'string', example: 'abc123' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '1234567890' },
        address: { type: 'string', example: '123 Main St, City' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User profile does not exist',
  })
  updateUserProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req,
  ) {
    // Check if user is updating their own profile or has admin privileges
    const requestUserId = req.user.user_id || req.user.sub;
    const isOwnProfile = requestUserId === id;
    const isAdmin = req.user.role === 'super_user';

    if (!isOwnProfile && !isAdmin) {
      return {
        error: 'Forbidden',
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You can only update your own profile',
      };
    }

    return this.usersService.updateUserProfile(id, updateProfileDto);
  }

  @Get('statistics')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieve statistics about users (requires admin permissions)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      properties: {
        totalUsers: { type: 'number', example: 100 },
        usersByRole: {
          type: 'object',
          properties: {
            user: { type: 'number', example: 80 },
            store: { type: 'number', example: 15 },
            super_user: { type: 'number', example: 5 },
          },
        },
        newUsersThisMonth: { type: 'number', example: 12 },
        activeStores: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  getUserStatistics(@Request() req) {
    // Only admins should access this endpoint
    if (req.user.role !== 'super_user') {
      return {
        error: 'Forbidden',
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Admin permissions required',
      };
    }

    return this.usersService.getUserStatistics();
  }

  @Post(':id/disable')
  @HttpCode(200)
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Disable user account',
    description:
      'Temporarily disable a user account without deleting it (requires admin permissions)',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'User account disabled successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'User account disabled successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  disableUser(@Param('id') id: string, @Request() req) {
    // Only admins should be able to disable accounts
    if (req.user.role !== 'super_user') {
      return {
        error: 'Forbidden',
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Admin permissions required',
      };
    }

    return this.usersService.disableUser(id);
  }

  @Post(':id/enable')
  @HttpCode(200)
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Enable user account',
    description:
      'Re-enable a previously disabled user account (requires admin permissions)',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'User account enabled successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'User account enabled successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Not Found - User does not exist' })
  enableUser(@Param('id') id: string, @Request() req) {
    // Only admins should be able to enable accounts
    if (req.user.role !== 'super_user') {
      return {
        error: 'Forbidden',
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Admin permissions required',
      };
    }

    return this.usersService.enableUser(id);
  }
}
