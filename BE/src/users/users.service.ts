import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
}
