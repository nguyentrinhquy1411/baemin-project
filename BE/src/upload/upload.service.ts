import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Xử lý upload single file
   */
  async uploadSingle(
    file: Express.Multer.File,
    type: 'avatar' | 'food' | 'stall',
  ): Promise<{
    filename: string;
    originalName: string;
    size: number;
    url: string;
    mimetype: string;
  }> {
    if (!file) {
      throw new BadRequestException('Không có file nào được upload');
    }

    try {
      this.logger.log(`File ${type} đã upload: ${file.filename}`);

      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${type}s/${file.filename}`,
      };
    } catch (error) {
      this.logger.error('Upload thất bại', error);
      throw new BadRequestException('Upload thất bại');
    }
  }

  /**
   * Xử lý upload multiple files
   */ async uploadMultiple(
    files: Express.Multer.File[],
    type: 'food' | 'stall',
  ): Promise<
    Array<{
      filename: string;
      originalName: string;
      size: number;
      url: string;
      mimetype: string;
    }>
  > {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được upload');
    }

    const results: Array<{
      filename: string;
      originalName: string;
      size: number;
      url: string;
      mimetype: string;
    }> = [];

    for (const file of files) {
      try {
        results.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/${type}s/${file.filename}`,
        });
        this.logger.log(`Đã xử lý file ${type}: ${file.originalname}`);
      } catch (error) {
        this.logger.error(`Lỗi xử lý file: ${file.originalname}`, error);
      }
    }

    return results;
  }

  /**
   * Xóa file
   */
  async deleteFile(
    filename: string,
    type: 'avatar' | 'food' | 'stall',
  ): Promise<boolean> {
    try {
      const filePath = path.join(`./uploads/${type}s`, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Đã xóa file: ${filename}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Lỗi xóa file: ${filename}`, error);
      return false;
    }
  }

  /**
   * Kiểm tra file có tồn tại không
   */
  fileExists(filename: string, type: 'avatar' | 'food' | 'stall'): boolean {
    const filePath = path.join(`./uploads/${type}s`, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Lấy URL của file
   */
  getFileUrl(filename: string, type: 'avatar' | 'food' | 'stall'): string {
    return `/uploads/${type}s/${filename}`;
  }

  /**
   * Lấy thông tin file
   */
  getFileInfo(filename: string, type: 'avatar' | 'food' | 'stall') {
    const filePath = path.join(`./uploads/${type}s`, filename);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File không tồn tại');
    }

    const stats = fs.statSync(filePath);

    return {
      filename,
      size: stats.size,
      url: this.getFileUrl(filename, type),
      uploadDate: stats.birthtime,
      exists: true,
    };
  }

  /**
   * Upload avatar and save URL to user profile
   */
  async uploadAvatarAndSave(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    filename: string;
    originalName: string;
    size: number;
    url: string;
    mimetype: string;
  }> {
    if (!file) {
      throw new BadRequestException('Không có file nào được upload');
    }

    try {
      // Check if user exists
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User không tồn tại');
      }

      this.logger.log(`Avatar uploaded for user ${userId}: ${file.filename}`);

      const avatarUrl = `/uploads/avatars/${file.filename}`;

      // Update or create user profile with avatar URL
      await this.prismaService.user_profiles.upsert({
        where: { user_id: userId },
        update: { image_url: avatarUrl },
        create: {
          user_id: userId,
          image_url: avatarUrl,
        },
      });

      this.logger.log(`Avatar URL saved to database for user ${userId}`);

      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: avatarUrl,
      };
    } catch (error) {
      this.logger.error('Upload avatar thất bại', error);
      throw new BadRequestException('Upload avatar thất bại');
    }
  }

  /**
   * Upload food image and save URL to food table
   */
  async uploadFoodAndSave(
    file: Express.Multer.File,
    foodId: string,
    userId: string,
  ): Promise<{
    filename: string;
    originalName: string;
    size: number;
    url: string;
    mimetype: string;
  }> {
    if (!file) {
      throw new BadRequestException('Không có file nào được upload');
    }

    try {
      // Check if food exists and user owns it (through stall ownership)
      const food = await this.prismaService.food.findUnique({
        where: { id: foodId },
        include: {
          stall: {
            select: { owner_id: true, name: true },
          },
        },
      });

      if (!food) {
        throw new NotFoundException('Món ăn không tồn tại');
      }

      if (food.stall.owner_id !== userId) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật ảnh cho món ăn này',
        );
      }

      this.logger.log(
        `Food image uploaded for food ${foodId}: ${file.filename}`,
      );

      const imageUrl = `/uploads/foods/${file.filename}`;

      // Update food with image URL
      await this.prismaService.food.update({
        where: { id: foodId },
        data: { image_url: imageUrl },
      });

      this.logger.log(`Food image URL saved to database for food ${foodId}`);

      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: imageUrl,
      };
    } catch (error) {
      this.logger.error('Upload food image thất bại', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Upload food image thất bại');
    }
  }

  /**
   * Upload stall image and save URL to stall table
   */
  async uploadStallAndSave(
    file: Express.Multer.File,
    stallId: string,
    userId: string,
    imageType: 'image' | 'banner' = 'image',
  ): Promise<{
    filename: string;
    originalName: string;
    size: number;
    url: string;
    mimetype: string;
  }> {
    if (!file) {
      throw new BadRequestException('Không có file nào được upload');
    }

    try {
      // Check if stall exists and user owns it
      const stall = await this.prismaService.stall.findUnique({
        where: { id: stallId },
        select: { owner_id: true, name: true },
      });

      if (!stall) {
        throw new NotFoundException('Cửa hàng không tồn tại');
      }

      if (stall.owner_id !== userId) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật ảnh cho cửa hàng này',
        );
      }

      this.logger.log(
        `Stall ${imageType} uploaded for stall ${stallId}: ${file.filename}`,
      );

      const imageUrl = `/uploads/stalls/${file.filename}`;

      // Update stall with image URL based on type
      const updateData =
        imageType === 'banner'
          ? { banner_url: imageUrl }
          : { image_url: imageUrl };

      await this.prismaService.stall.update({
        where: { id: stallId },
        data: updateData,
      });

      this.logger.log(
        `Stall ${imageType} URL saved to database for stall ${stallId}`,
      );

      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: imageUrl,
      };
    } catch (error) {
      this.logger.error('Upload stall image thất bại', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Upload stall image thất bại');
    }
  }
}
