import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'Tên file đã được lưu',
    example: 'avatar_1234567890123.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'Tên file gốc',
    example: 'my-avatar.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 102400,
  })
  size: number;

  @ApiProperty({
    description: 'URL để truy cập file',
    example: '/uploads/avatars/avatar_1234567890123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Loại MIME của file',
    example: 'image/jpeg',
  })
  mimetype: string;
}

export class MultipleUploadResponseDto {
  @ApiProperty({
    description: 'Danh sách các file đã upload',
    type: [UploadResponseDto],
  })
  files: UploadResponseDto[];

  @ApiProperty({
    description: 'Số lượng file đã upload thành công',
    example: 3,
  })
  count: number;
}

export class FileInfoDto {
  @ApiProperty({
    description: 'Tên file',
    example: 'avatar_1234567890123.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 102400,
  })
  size: number;

  @ApiProperty({
    description: 'URL để truy cập file',
    example: '/uploads/avatars/avatar_1234567890123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Ngày upload',
    example: '2024-01-15T10:30:00.000Z',
  })
  uploadDate: Date;

  @ApiProperty({
    description: 'File có tồn tại không',
    example: true,
  })
  exists: boolean;
}
