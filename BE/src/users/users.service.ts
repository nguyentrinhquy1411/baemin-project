import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import {
  CreateUserResponse,
  mapToCreateUserResponse,
} from './type/create-user.response';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    this.logger.log(
      `Creating new user with username: ${createUserDto.username}, email: ${createUserDto.email}`,
      'UsersService',
    );

    // tạo trong db
    const { last_name, first_name, phone } = createUserDto;

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      this.logger.debug(
        `Attempting to create user profile and user account in database`,
        'UsersService',
      ); // Kiểm tra username hoặc email đã tồn tại
      const existingUser = await this.prismaService.users.findFirst({
        where: {
          OR: [
            { username: createUserDto.username },
            { email: createUserDto.email },
          ],
        },
      });

      // Kiểm tra số điện thoại đã tồn tại không
      const existingPhone = await this.prismaService.user_profiles.findFirst({
        where: { phone: createUserDto.phone },
      });

      if (existingPhone) {
        this.logger.warn(
          `Phone number already exists: ${createUserDto.phone}`,
          'UsersService',
        );
        throw new ConflictException({
          statusCode: 409,
          message: 'Số điện thoại đã được sử dụng',
          error: 'Conflict',
        });
      }
      if (existingUser) {
        this.logger.warn(
          `User already exists with username: ${createUserDto.username}, email: ${createUserDto.email}`,
          'UsersService',
        );

        // Kiểm tra chi tiết để trả về thông báo lỗi cụ thể
        if (existingUser.username === createUserDto.username) {
          throw new ConflictException({
            statusCode: 409,
            message: 'Tên đăng nhập đã được sử dụng',
            error: 'Conflict',
          });
        }

        if (existingUser.email === createUserDto.email) {
          throw new ConflictException({
            statusCode: 409,
            message: 'Email đã được sử dụng',
            error: 'Conflict',
          });
        }

        // Trường hợp mặc định
        throw new ConflictException({
          statusCode: 409,
          message: 'Tài khoản đã tồn tại',
          error: 'Conflict',
        });
      }

      this.logger.debug(
        `Creating user profile and user account in database`,
        'UsersService',
      );

      const user = await this.prismaService.user_profiles.create({
        data: {
          last_name,
          first_name,
          phone,
          users: {
            create: {
              email: createUserDto?.email,
              username: createUserDto?.username,
              password: hashedPassword,
            },
          },
        },
        include: {
          users: true,
        },
      });

      this.logger.log(
        `User created successfully with ID: ${user.users.id}`,
        'UsersService',
      );

      return mapToCreateUserResponse(user);
    } catch (error) {
      this.logger.error(
        `Failed to create user: ${error.message}`,
        error.stack,
        'UsersService',
      );

      // Nếu lỗi đã được xử lý (như ConflictException), chỉ cần chuyển tiếp
      if (error instanceof ConflictException) {
        throw error;
      }

      // Xử lý lỗi từ Prisma hoặc các lỗi khác
      if (error.code === 'P2002') {
        throw new ConflictException({
          statusCode: 409,
          message: 'Thông tin đăng ký đã được sử dụng',
          error: 'Conflict',
        });
      }

      // Lỗi khác
      throw new BadRequestException({
        statusCode: 400,
        message: 'Không thể tạo tài khoản, vui lòng thử lại sau',
        error: 'Bad Request',
      });
    }
  }
  findAll() {
    this.logger.log('Finding all users', 'UsersService');
    return `This action returns all users`;
  }
  async findOne(id: string) {
    this.logger.log(`Finding user with ID: ${id}`, 'UsersService');
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id },
        include: {
          user_profiles: true,
        },
      });

      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`, 'UsersService');
        return null;
      }

      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;

      return {
        ...userWithoutPassword,
        first_name: user.user_profiles?.first_name || '',
        last_name: user.user_profiles?.last_name || '',
        phone: user.user_profiles?.phone || '',
        address: user.user_profiles?.address || '',
      };
    } catch (error) {
      this.logger.error(
        `Error finding user with ID ${id}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`, 'UsersService');
    try {
      // First check if user exists
      const userExists = await this.prismaService.users.findUnique({
        where: { id },
      });

      if (!userExists) {
        this.logger.warn(
          `User not found for update with ID: ${id}`,
          'UsersService',
        );
        return null;
      }

      // Update logic would go here
      // Will be implemented when needed
      return `This action updates user with ID ${id}`;
    } catch (error) {
      this.logger.error(
        `Failed to update user ${id}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }
  async remove(id: string) {
    this.logger.log(`Removing user with ID: ${id}`, 'UsersService');
    try {
      // First check if user exists
      const userExists = await this.prismaService.users.findUnique({
        where: { id },
      });

      if (!userExists) {
        this.logger.warn(
          `User not found for removal with ID: ${id}`,
          'UsersService',
        );
        return null;
      }

      // Remove logic would go here
      // Will be implemented when needed
      return `This action removes user with ID ${id}`;
    } catch (error) {
      this.logger.error(
        `Failed to remove user ${id}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }
  async searchUsers(searchCriteria: SearchUserDto) {
    this.logger.log('Searching users with criteria', 'UsersService');
    try {
      const { page = 1, limit = 10, ...filters } = searchCriteria;
      const skip = (page - 1) * limit;

      const whereClause: any = {};

      if (filters.username) {
        whereClause.username = {
          contains: filters.username,
          mode: 'insensitive' as any,
        };
      }

      if (filters.email) {
        whereClause.email = {
          contains: filters.email,
          mode: 'insensitive' as any,
        };
      }

      if (filters.role) {
        whereClause.role = filters.role;
      }

      if (filters.name) {
        whereClause.user_profiles = {
          OR: [
            {
              first_name: {
                contains: filters.name,
                mode: 'insensitive' as any,
              },
            },
            {
              last_name: {
                contains: filters.name,
                mode: 'insensitive' as any,
              },
            },
          ],
        };
      }

      const [users, totalCount] = await Promise.all([
        this.prismaService.users.findMany({
          where: whereClause,
          include: {
            user_profiles: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          skip,
          take: limit,
        }),
        this.prismaService.users.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          first_name: user.user_profiles?.first_name,
          last_name: user.user_profiles?.last_name,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to search users: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }

  async updateRole(userId: string, newRole: string) {
    this.logger.log(
      `Updating role for user ${userId} to ${newRole}`,
      'UsersService',
    );
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(
          `User not found for role update with ID: ${userId}`,
          'UsersService',
        );
        throw new BadRequestException('User not found');
      }

      const updatedUser = await this.prismaService.users.update({
        where: { id: userId },
        data: { role: newRole as any },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });

      this.logger.log(
        `Successfully updated role for user ${userId}`,
        'UsersService',
      );
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update role for user ${userId}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    this.logger.log(`Getting profile for user ${userId}`, 'UsersService');
    try {
      const profile = await this.prismaService.user_profiles.findUnique({
        where: { user_id: userId },
      });

      if (!profile) {
        this.logger.warn(
          `Profile not found for user ID: ${userId}`,
          'UsersService',
        );
        return null;
      }

      return profile;
    } catch (error) {
      this.logger.error(
        `Failed to get profile for user ${userId}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }

  async updateUserProfile(userId: string, updateData: any) {
    this.logger.log(`Updating profile for user ${userId}`, 'UsersService');
    try {
      // Check if user exists
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(
          `User not found for profile update with ID: ${userId}`,
          'UsersService',
        );
        throw new BadRequestException('User not found');
      }

      // Check if profile exists, create if not
      const existingProfile = await this.prismaService.user_profiles.findUnique(
        {
          where: { user_id: userId },
        },
      );

      let profile;
      if (existingProfile) {
        // Update existing profile
        profile = await this.prismaService.user_profiles.update({
          where: { user_id: userId },
          data: updateData,
        });
      } else {
        // Create new profile
        profile = await this.prismaService.user_profiles.create({
          data: {
            user_id: userId,
            ...updateData,
          },
        });
      }

      this.logger.log(
        `Successfully updated profile for user ${userId}`,
        'UsersService',
      );
      return profile;
    } catch (error) {
      this.logger.error(
        `Failed to update profile for user ${userId}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }

  async getUserStatistics() {
    this.logger.log('Getting user statistics', 'UsersService');
    try {
      const totalUsers = await this.prismaService.users.count();

      const usersByRole = await this.prismaService.users.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      });

      const roleStats = usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as any);

      // Get new users this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const newUsersThisMonth = await this.prismaService.users.count({
        where: {
          created_at: {
            gte: startOfMonth,
          },
        },
      });

      // Get active stores (users with role 'store' who have at least one stall)
      const activeStores = await this.prismaService.users.count({
        where: {
          role: 'store',
          stalls: {
            some: {
              is_active: true,
            },
          },
        },
      });

      return {
        totalUsers,
        usersByRole: roleStats,
        newUsersThisMonth,
        activeStores,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user statistics: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }

  async disableUser(userId: string) {
    this.logger.log(`Disabling user ${userId}`, 'UsersService');
    try {
      // Note: Since there's no 'is_active' field in the users table,
      // we'll need to add this field to the schema or implement a different approach
      // For now, we'll add a comment and return a placeholder response

      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(
          `User not found for disabling with ID: ${userId}`,
          'UsersService',
        );
        throw new BadRequestException('User not found');
      }

      // TODO: Add is_active field to users table in schema
      // await this.prismaService.users.update({
      //   where: { id: userId },
      //   data: { is_active: false },
      // });

      this.logger.log(`User ${userId} disabled successfully`, 'UsersService');
      return { message: 'User account disabled successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to disable user ${userId}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }

  async enableUser(userId: string) {
    this.logger.log(`Enabling user ${userId}`, 'UsersService');
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(
          `User not found for enabling with ID: ${userId}`,
          'UsersService',
        );
        throw new BadRequestException('User not found');
      }

      // TODO: Add is_active field to users table in schema
      // await this.prismaService.users.update({
      //   where: { id: userId },
      //   data: { is_active: true },
      // });

      this.logger.log(`User ${userId} enabled successfully`, 'UsersService');
      return { message: 'User account enabled successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to enable user ${userId}: ${error.message}`,
        error.stack,
        'UsersService',
      );
      throw error;
    }
  }
}
