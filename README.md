# Baemin Clone Project

<p align="center">
  <img src="docs/screenshots/baemin.jpg" alt="Baemin Clone" width="100%">
</p>

## Giới thiệu

Đây là dự án clone của ứng dụng giao đồ ăn Baemin (Việt Nam), được phát triển với kiến trúc full-stack hiện đại. Dự án triển khai đầy đủ các tính năng của một nền tảng giao đồ ăn trực tuyến, từ đặt hàng, theo dõi đơn hàng đến hệ thống quản lý đa vai trò (khách hàng, chủ cửa hàng, quản trị viên).

### Kiến trúc tổng quan

Dự án được phát triển với kiến trúc phân lớp rõ ràng:

- **Frontend**: Next.js 14 với App Router pattern, Tailwind CSS, và Ant Design
- **Backend**: NestJS + Prisma ORM với kiến trúc module rõ ràng
- **Database**: PostgreSQL với schema quan hệ phức tạp
- **Authentication**: JWT (Access & Refresh Tokens) + Google OAuth
- **File Storage**: Local storage với hệ thống upload/resize ảnh

Dự án này được thiết kế để triển khai tối ưu trên Docker với khả năng mở rộng cao, tích hợp CI/CD, và tuân thủ các tiêu chuẩn bảo mật OWASP.

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

File schema Prisma định nghĩa cấu trúc cơ sở dữ liệu của ứng dụng nằm trong thư mục `prisma/schema.prisma`. Dự án sử dụng PostgreSQL với schema quan hệ phức tạp.

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │    Stall    │     │   Category  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │─┐   │ id          │  ┌─>│ id          │
│ email       │ │   │ name        │  │  │ name        │
│ password    │ │   │ description │  │  │ image_url   │
│ role        │ └──>│ owner_id    │  │  └─────────────┘
│ avatar_url  │     │ address     │  │          ▲
└─────────────┘     │ status      │  │          │
                    └─────────────┘  │  ┌───────┴─────┐
                          │         │  │ StallCategory│
                          ▼         │  ├─────────────┤
                    ┌─────────────┐ │  │ stall_id    │
                    │    Food     │ │  │ category_id │
                    ├─────────────┤ │  └─────────────┘
                    │ id          │ │
                    │ name        │ │  ┌─────────────┐
                    │ description │ │  │  FoodCategory│
                    │ price       │ │  ├─────────────┤
                    │ stall_id    │ └─>│ food_id     │
                    │ image_url   │    │ category_id │
                    └─────────────┘    └─────────────┘
                          │
                          ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  OrderItem  │     │   Order     │
                    ├─────────────┤     ├─────────────┤
                    │ id          │     │ id          │
                    │ order_id    │<────│ user_id     │
                    │ food_id     │     │ stall_id    │
                    │ quantity    │     │ status      │
                    │ price       │     │ total       │
                    └─────────────┘     │ created_at  │
                                        └─────────────┘
```

### Các entity chính

- **User**: Người dùng với các vai trò khác nhau (ADMIN, STORE, USER)
- **Stall**: Cửa hàng/quán ăn với thông tin chi tiết
- **Food**: Món ăn với giá cả và thông tin chi tiết
- **Category**: Danh mục cho món ăn và cửa hàng
- **Order**: Đơn hàng của người dùng
- **OrderItem**: Chi tiết từng món trong đơn hàng
- **Rating**: Đánh giá và nhận xét của người dùng

### Schema Migration và Database Optimization

- Sử dụng Prisma Migrations để quản lý thay đổi schema
- Indexes cho các trường thường xuyên query tìm kiếm
- Foreign key constraints đảm bảo tính toàn vẹn dữ liệu
- Optimized query patterns cho các truy vấn phức tạp

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

## Showcase

<p align="center">
  <img src="docs/screenshots/home-page.jpg" alt="Trang chủ" width="100%">
  <em>Trang chủ với danh sách cửa hàng và món ăn nổi bật</em>
</p>

### Giao diện người dùng

Dự án sử dụng thiết kế UI/UX hiện đại, tương thích với đa thiết bị (responsive) và đảm bảo trải nghiệm người dùng tuyệt vời:

- **Trang chủ & Tìm kiếm**: Hiển thị cửa hàng nổi bật, món ăn phổ biến với bộ lọc thông minh
- **Chi tiết cửa hàng**: Hiển thị menu, đánh giá và thông tin của cửa hàng
- **Giỏ hàng & Thanh toán**: Quy trình thanh toán mượt mà với nhiều phương thức thanh toán
- **Quản lý cửa hàng**: Giao diện quản lý trực quan cho chủ cửa hàng

### Kiến trúc kỹ thuật

Dự án được xây dựng với kiến trúc hiện đại, tuân thủ các nguyên tắc thiết kế phần mềm quan trọng:

#### Frontend Architecture

- **App Router**: Sử dụng Next.js 14 App Router cho tối ưu SEO và chia sẻ code giữa client và server
- **Context API**: Quản lý state toàn cục (auth, cart) hiệu quả
- **Custom Hooks**: Tái sử dụng logic và tối ưu hiệu suất
- **Tailwind CSS**: Styling linh hoạt và dễ bảo trì
- **Type-safe APIs**: TypeScript end-to-end đảm bảo chất lượng code

#### Backend Architecture

- **Module-based Architecture**: NestJS với cấu trúc module rõ ràng cho từng domain
- **Repository Pattern**: Tách biệt logic business và data access
- **Guards & Interceptors**: Xử lý authentication và logging hiệu quả
- **DTO Validation**: Đảm bảo dữ liệu đầu vào hợp lệ
- **Advanced Prisma Features**: Sử dụng transactions và relations hiệu quả

#### Security Focus

- **JWT Authentication**: Access & Refresh token đảm bảo bảo mật
- **Role-based Authorization**: Phân quyền chi tiết cho từng API endpoint
- **Input Validation**: Ngăn chặn các lỗ hổng security như XSS, SQL Injection
- **Rate Limiting**: Bảo vệ API khỏi tấn công brute force

### Kỹ thuật triển khai và tối ưu hóa

Dự án được xây dựng với sự chú trọng đặc biệt vào hiệu suất và khả năng mở rộng:

#### Performance Optimizations

- **Server-Side Rendering (SSR)**: Cải thiện tốc độ tải trang và SEO
- **Image Optimization**: Xử lý, nén và lưu trữ hình ảnh hiệu quả
- **Code Splitting**: Giảm kích thước bundle JavaScript
- **Lazy Loading**: Tải các component và dữ liệu khi cần thiết
- **Memoization**: Sử dụng React.memo và useMemo để giảm thiểu render không cần thiết

#### Scalability Considerations

- **Stateless Architecture**: Hỗ trợ triển khai trên nhiều server
- **Database Indexing**: Tối ưu truy vấn dữ liệu
- **Caching Strategies**: Sử dụng Redis cho caching
- **Connection Pooling**: Quản lý kết nối database hiệu quả
- **Horizontal Scaling**: Thiết kế để dễ dàng thêm nhiều instance

#### DevOps & Deployment

- **Docker Containerization**: Đóng gói ứng dụng vào container
- **CI/CD Pipeline**: Tự động hóa quá trình test và deploy
- **Environment Segregation**: Phân tách môi trường dev, test, staging và production
- **Infrastructure as Code**: Quản lý cấu hình server tự động
- **Monitoring & Logging**: Theo dõi hiệu suất và lỗi hệ thống

## Lưu ý

Dự án vẫn đang trong quá trình phát triển. Một số hình ảnh cửa hàng và món ăn hiện đang sử dụng dữ liệu mẫu.
