# Baemin Clone Project

## Giới thiệu

Đây là dự án clone của ứng dụng giao đồ ăn Baemin, được phát triển với mục đích học tập và thực hành. Dự án bao gồm đầy đủ các tính năng cơ bản của một nền tảng giao đồ ăn trực tuyến, từ đặt hàng, theo dõi đơn hàng đến quản lý cửa hàng và món ăn.

## Công nghệ sử dụng

### Frontend

- **Next.js 14**: Framework React với Server Side Rendering
- **TypeScript**: Hỗ trợ kiểu dữ liệu tĩnh
- **Tailwind CSS**: Framework CSS utility-first
- **Ant Design**: Thư viện UI components
- **Axios**: Client HTTP để gọi API

### Backend

- **NestJS**: Framework Node.js cho phía server
- **TypeScript**: Hệ thống kiểu dữ liệu tĩnh
- **Prisma**: ORM hiện đại cho Node.js và TypeScript
- **PostgreSQL**: Hệ quản trị cơ sở dữ liệu quan hệ
- **JWT**: Xác thực người dùng
- **Swagger**: API documentation

## Tính năng chính

### Khách hàng

- Đăng ký, đăng nhập (JWT + Google OAuth)
- Xem danh sách cửa hàng và món ăn theo danh mục
- Tìm kiếm món ăn, cửa hàng
- Thêm món vào giỏ hàng và đặt hàng
- Xem lịch sử đơn hàng
- Đánh giá món ăn và cửa hàng
- Lưu địa chỉ giao hàng
- Sử dụng mã giảm giá

### Chủ cửa hàng

- Quản lý thông tin cửa hàng
- Quản lý món ăn (thêm, sửa, xóa)
- Quản lý đơn hàng
- Xem đánh giá từ khách hàng
- Phân tích doanh thu cơ bản

### Quản trị viên

- Quản lý danh mục
- Phê duyệt cửa hàng
- Quản lý người dùng

## Cấu trúc dự án

```
baemin-project/
│
├── BE/                   # Backend NestJS
│   ├── src/              # Mã nguồn
│   │   ├── common/       # Modules dùng chung
│   │   ├── auth/         # Xác thực
│   │   ├── users/        # Quản lý người dùng
│   │   ├── stall/        # Quản lý cửa hàng
│   │   ├── food/         # Quản lý món ăn
│   │   ├── order/        # Quản lý đơn hàng
│   │   └── ...
│   │
│   ├── prisma/           # Prisma schema và migrations
│   └── uploads/          # Thư mục lưu trữ files
│
└── FE/                   # Frontend Next.js
    ├── app/              # App router và pages
    ├── components/       # Các components UI
    ├── contexts/         # React contexts
    ├── hooks/            # Custom hooks
    ├── services/         # API services
    └── public/           # Static assets
```

## Cách cài đặt và chạy dự án

### Backend

```bash
cd BE
npm install
cp .env.example .env  # Cấu hình .env

# Cấu hình database trong file .env
# Ví dụ: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/baemin"

# File schema.prisma nằm trong thư mục prisma/schema.prisma
npx prisma migrate dev  # Chạy migrations
npm run seed  # Tạo dữ liệu mẫu
npm run start:dev
```

### Frontend

```bash
cd FE
npm install
cp .env.example .env  # Cấu hình .env
npm run dev
```

## Database Schema

File schema Prisma định nghĩa cấu trúc cơ sở dữ liệu của ứng dụng nằm trong thư mục `prisma/schema.prisma`. Schema này định nghĩa:

- User (người dùng với các vai trò khác nhau)
- Stall (cửa hàng)
- Food (món ăn)
- Category (danh mục món ăn và cửa hàng)
- Order (đơn hàng)
- Rating (đánh giá)
- và các mối quan hệ giữa chúng

Các module trong thư mục `src/` được tổ chức theo từng domain tương ứng với schema DB:

```
src/
├── users/        # Quản lý người dùng
├── stall/        # Quản lý cửa hàng
├── food/         # Quản lý món ăn
├── order/        # Quản lý đơn hàng
├── rating/       # Đánh giá
├── upload/       # Upload file
└── ...
```

## API Documentation

Sau khi chạy backend, bạn có thể truy cập vào Swagger UI để xem tài liệu API tại:

```
http://localhost:8080/api/docs
```

## Tài khoản demo

### Admin

- Email: admin@baemin.com
- Password: admin123

### Chủ cửa hàng

- Email: store@baemin.com
- Password: store123

### Khách hàng

- Email: user@baemin.com
- Password: user123

## Các tính năng đã hoàn thành

### Frontend

- Đăng ký, đăng nhập và phân quyền người dùng
- Trang chủ hiển thị cửa hàng và món ăn nổi bật
- Tìm kiếm và lọc món ăn theo danh mục
- Giỏ hàng và thanh toán
- Quản lý cửa hàng cho chủ kinh doanh
- Quản lý món ăn (CRUD) cho chủ cửa hàng
- Quản lý đơn hàng
- Đánh giá món ăn và cửa hàng

### Backend

- API Authentication và Authorization
- API quản lý người dùng
- API quản lý cửa hàng
- API quản lý món ăn
- API quản lý đơn hàng
- API tìm kiếm và lọc
- API upload ảnh
- API đánh giá và nhận xét

## Lưu ý

Hình ảnh các món ăn và cửa hàng đang là random.
