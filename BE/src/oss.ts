import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Tạo các thư mục upload
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/avatars',
    './uploads/foods',
    './uploads/stalls',
    './uploads/temp',
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Khởi tạo thư mục
createUploadDirs();

// File filter cho ảnh
const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)') as any,
      false,
    );
  }
};

// Storage cho avatar
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/avatars');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// Storage cho ảnh món ăn
const foodStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/foods');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `food-${uniqueSuffix}${ext}`);
  },
});

// Storage cho ảnh quán
const stallStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/stalls');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `stall-${uniqueSuffix}${ext}`);
  },
});

// Cấu hình upload cho từng loại
export const uploadConfigs = {
  avatar: {
    storage: avatarStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  },
  food: {
    storage: foodStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  },
  stall: {
    storage: stallStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  },
};

// Giữ lại storage cũ để tương thích
export const storage = avatarStorage;
