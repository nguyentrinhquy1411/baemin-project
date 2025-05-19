import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateUserResponse,
  mapToCreateUserResponse,
} from './type/create-user.response';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    // tạo trong db
    const { last_name, first_name, phone, address } = createUserDto;
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prismaService.user_profiles.create({
      data: {
        last_name,
        first_name,
        phone,
        address,
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

    return mapToCreateUserResponse(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
