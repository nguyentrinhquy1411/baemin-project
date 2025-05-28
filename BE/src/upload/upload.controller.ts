import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadResponseDto, FileInfoDto } from './dto/upload-response.dto';
import { uploadConfigs } from '../oss';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', uploadConfigs.avatar))
  @ApiOperation({
    summary: 'Upload ảnh đại diện',
    description:
      'Upload một ảnh đại diện và tự động cập nhật vào profile user (tối đa 2MB, chỉ hỗ trợ JPEG, PNG, GIF, WebP)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh đại diện',
        },
        userId: {
          type: 'string',
          description: 'ID của user cần cập nhật ảnh đại diện',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['file', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công và cập nhật database',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc vượt quá giới hạn',
  })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại',
  })
  async uploadAvatarAndSave(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { userId: string },
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh đại diện');
    }

    if (!body.userId) {
      throw new BadRequestException('Vui lòng cung cấp userId');
    }

    return this.uploadService.uploadAvatarAndSave(file, body.userId);
  }
  @Post('food/:foodId')
  @UseInterceptors(FileInterceptor('file', uploadConfigs.food))
  @ApiOperation({
    summary: 'Upload ảnh món ăn và lưu vào database',
    description:
      'Upload một ảnh món ăn và tự động cập nhật vào bảng food (tối đa 5MB, chỉ hỗ trợ JPEG, PNG, GIF, WebP)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'foodId',
    description: 'ID của món ăn cần cập nhật ảnh',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh món ăn',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công và cập nhật database',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc vượt quá giới hạn',
  })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền cập nhật ảnh cho món ăn này',
  })
  @ApiResponse({
    status: 404,
    description: 'Món ăn không tồn tại',
  })
  async uploadFoodAndSave(
    @UploadedFile() file: Express.Multer.File,
    @Param('foodId') foodId: string,
    @Request() req,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh món ăn');
    }

    const userId = req.user.user_id || req.user.sub;
    return this.uploadService.uploadFoodAndSave(file, foodId, userId);
  }

  @Post('stall/:stallId')
  @UseInterceptors(FileInterceptor('file', uploadConfigs.stall))
  @ApiOperation({
    summary: 'Upload ảnh quán ăn và lưu vào database',
    description:
      'Upload một ảnh quán ăn và tự động cập nhật vào bảng stall (tối đa 10MB, chỉ hỗ trợ JPEG, PNG, GIF, WebP)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'stallId',
    description: 'ID của quán ăn cần cập nhật ảnh',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh quán ăn',
        },
        image_type: {
          type: 'string',
          enum: ['image', 'banner'],
          description: 'Loại ảnh (image hoặc banner)',
          default: 'image',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công và cập nhật database',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc vượt quá giới hạn',
  })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền cập nhật ảnh cho quán ăn này',
  })
  @ApiResponse({
    status: 404,
    description: 'Quán ăn không tồn tại',
  })
  async uploadStallAndSave(
    @UploadedFile() file: Express.Multer.File,
    @Param('stallId') stallId: string,
    @Body() body: { image_type?: 'image' | 'banner' },
    @Request() req,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh quán ăn');
    }

    const userId = req.user.user_id || req.user.sub;
    const imageType = body.image_type || 'image';
    return this.uploadService.uploadStallAndSave(
      file,
      stallId,
      userId,
      imageType,
    );
  }

  @Get(':type/:filename/info')
  @ApiOperation({
    summary: 'Lấy thông tin file',
    description: 'Lấy thông tin chi tiết của một file đã upload',
  })
  @ApiParam({
    name: 'type',
    enum: ['avatar', 'food', 'stall'],
    description: 'Loại file',
  })
  @ApiParam({
    name: 'filename',
    description: 'Tên file',
    example: 'avatar_1234567890123.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin file',
    type: FileInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File không tồn tại',
  })
  async getFileInfo(
    @Param('type') type: 'avatar' | 'food' | 'stall',
    @Param('filename') filename: string,
  ): Promise<FileInfoDto> {
    return this.uploadService.getFileInfo(filename, type);
  }

  @Delete(':type/:filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa file',
    description: 'Xóa một file đã upload',
  })
  @ApiParam({
    name: 'type',
    enum: ['avatar', 'food', 'stall'],
    description: 'Loại file',
  })
  @ApiParam({
    name: 'filename',
    description: 'Tên file',
    example: 'avatar_1234567890123.jpg',
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'File không tồn tại hoặc lỗi xóa file',
  })
  async deleteFile(
    @Param('type') type: 'avatar' | 'food' | 'stall',
    @Param('filename') filename: string,
  ): Promise<void> {
    const deleted = await this.uploadService.deleteFile(filename, type);
    if (!deleted) {
      throw new BadRequestException(
        'Không thể xóa file hoặc file không tồn tại',
      );
    }
  }
}
