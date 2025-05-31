import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Mock data arrays cho food delivery
const stallCategories = [
  {
    name: 'Fast Food',
    description: 'Đồ ăn nhanh và tiện lợi',
    image_url: 'https://picsum.photos/400/300?random=1',
  },
  {
    name: 'Món Á',
    description: 'Các món ăn truyền thống và hiện đại châu Á',
    image_url: 'https://picsum.photos/400/300?random=2',
  },
  {
    name: 'Món Ý',
    description: 'Ẩm thực Ý chính hiệu',
    image_url: 'https://picsum.photos/400/300?random=3',
  },
  {
    name: 'Món Mexico',
    description: 'Đồ ăn Mexico cay nồng',
    image_url: 'https://picsum.photos/400/300?random=4',
  },
  {
    name: 'BBQ & Nướng',
    description: 'Các món nướng và BBQ đặc biệt',
    image_url: 'https://picsum.photos/400/300?random=5',
  },
  {
    name: 'Chay',
    description: 'Các món chay lành mạnh',
    image_url: 'https://picsum.photos/400/300?random=6',
  },
  {
    name: 'Hải sản',
    description: 'Các món hải sản tươi ngon',
    image_url: 'https://picsum.photos/400/300?random=7',
  },
  {
    name: 'Tráng miệng',
    description: 'Các món ngọt và tráng miệng',
    image_url: 'https://picsum.photos/400/300?random=8',
  },
  {
    name: 'Café & Đồ uống',
    description: 'Cà phê, đồ uống và món ăn nhẹ',
    image_url: 'https://picsum.photos/400/300?random=9',
  },
  {
    name: 'Đồ ăn healthy',
    description: 'Các món ăn dinh dưỡng và cân bằng',
    image_url: 'https://picsum.photos/400/300?random=10',
  },
  {
    name: 'Lẩu & Nướng',
    description: 'Lẩu và các món nướng Hàn Quốc',
    image_url: 'https://picsum.photos/400/300?random=11',
  },
  {
    name: 'Dimsum',
    description: 'Dimsum và món ăn Hồng Kông',
    image_url: 'https://picsum.photos/400/300?random=12',
  },
  {
    name: 'Kem & Chè',
    description: 'Kem, chè và đồ uống mát',
    image_url: 'https://picsum.photos/400/300?random=13',
  },
  {
    name: 'Bánh & Kẹo',
    description: 'Bánh ngọt, bánh mì và kẹo',
    image_url: 'https://picsum.photos/400/300?random=14',
  },
  {
    name: 'Ăn Vặt',
    description: 'Đồ ăn vặt và snack',
    image_url: 'https://picsum.photos/400/300?random=15',
  },
];

const foodCategories = [
  {
    name: 'Khai vị',
    description: 'Món khai vị và món nhỏ',
    image_url: 'https://picsum.photos/400/300?random=16',
  },
  {
    name: 'Món chính',
    description: 'Các món chính thịnh soạn',
    image_url: 'https://picsum.photos/400/300?random=17',
  },
  {
    name: 'Súp',
    description: 'Súp nóng và lạnh',
    image_url: 'https://picsum.photos/400/300?random=18',
  },
  {
    name: 'Salad',
    description: 'Salad tươi mát và lành mạnh',
    image_url: 'https://picsum.photos/400/300?random=19',
  },
  {
    name: 'Mì & Cơm',
    description: 'Các món mì và cơm châu Á',
    image_url: 'https://picsum.photos/400/300?random=20',
  },
  {
    name: 'Pizza',
    description: 'Các loại pizza đa dạng',
    image_url: 'https://picsum.photos/400/300?random=21',
  },
  {
    name: 'Burger',
    description: 'Burger cao cấp và truyền thống',
    image_url: 'https://picsum.photos/400/300?random=22',
  },
  {
    name: 'Sandwich',
    description: 'Các loại sandwich đa dạng',
    image_url: 'https://picsum.photos/400/300?random=23',
  },
  {
    name: 'Đồ uống',
    description: 'Nước uống và đồ giải khát',
    image_url: 'https://picsum.photos/400/300?random=24',
  },
  {
    name: 'Tráng miệng',
    description: 'Món ngọt và bánh kem',
    image_url: 'https://picsum.photos/400/300?random=25',
  },
  {
    name: 'Món sáng',
    description: 'Các lựa chọn cho bữa sáng',
    image_url: 'https://picsum.photos/400/300?random=26',
  },
  {
    name: 'Hải sản',
    description: 'Cá và các món biển ngon',
    image_url: 'https://picsum.photos/400/300?random=27',
  },
  {
    name: 'Nướng',
    description: 'Các món nướng BBQ',
    image_url: 'https://picsum.photos/400/300?random=28',
  },
  {
    name: 'Lẩu',
    description: 'Các loại lẩu Việt Nam và Thái',
    image_url: 'https://picsum.photos/400/300?random=29',
  },
  {
    name: 'Dimsum',
    description: 'Dimsum và bánh bao',
    image_url: 'https://picsum.photos/400/300?random=30',
  },
];

const stallNames = [
  'Bếp Rồng Vàng',
  'Pizza Tony Nổi Tiếng',
  'Burger Master VN',
  'Taco Fiesta Việt',
  'Sushi Zen Garden',
  'Nhà Mì Phở',
  'Grill Station BBQ',
  'Green Garden Cafe',
  'Cà Ri Gia Vị Ấn Độ',
  'Seoul Kitchen Hàn Quốc',
  'Thai Basil Thái Lan',
  'Hải Sản Tươi Sống',
  'Mama Mia Ý Chính Hiệu',
  'BBQ Pit Stop',
  'Healthy Bites Lành Mạnh',
  'Coffee Corner Cà Phê',
  'Thiên Đường Há Cảo',
  'Phở Sài Gòn Truyền Thống',
  'Ramen Ichiban Nhật',
  'Shawarma Express',
  'Steak House Cao Cấp',
  'Veggie Delight Chay',
  'Sweet Dreams Bánh Ngọt',
  'Urban Eats Đô Thị',
  'Fire Grill Nướng Lửa',
  'Pasta La Vista Ý',
  'Chicken Coop Gà',
  'Fish Market Cá Tươi',
  'Salad Bowl Tươi Mát',
  'Sandwich Station Bánh Mì',
  'Wings & Things Cánh Gà',
  'Curry House Cà Ri',
  'Smoothie Bar Sinh Tố',
  'Ice Cream Palace Kem',
  'Breakfast Club Sáng',
  'Midnight Snacks Đêm',
  'Fusion Kitchen Fusion',
  'Street Food Central Đường Phố',
  'Gourmet Corner Cao Cấp',
  'Family Diner Gia Đình',
  'Lẩu Thái Tomyum',
  'Dimsum Palace Hồng Kông',
  'Bánh Mì Sài Gòn',
  'Bún Bò Huế',
  'Cơm Tấm Sài Gòn',
  'Chè Cung Đình',
  'Bánh Canh Cua',
  'Hủ Tiếu Nam Vang',
  'Bánh Xèo Miền Tây',
  'Gỏi Cuốn Sài Gòn',
];

const foodItems = {
  khaivi: [
    'Chả giò tôm thịt',
    'Cánh gà nướng',
    'Mozzarella que',
    'Nachos phô mai',
    'Bruschetta Ý',
    'Mực chiên giòn',
    'Bánh mì tỏi',
    'Nấm nhồi thịt',
    'Tôm cocktail',
    'Đĩa phô mai',
    'Bánh tôm Hồ Tây',
    'Nem nướng Nha Trang',
    'Chả cá Lã Vọng',
    'Gỏi cuốn tôm thịt',
    'Bánh khọt Vũng Tàu',
  ],
  monchinh: [
    'Cá hồi nướng',
    'Bò beefsteak',
    'Gà teriyaki',
    'Cà ri cừu',
    'Sườn heo nướng',
    'Fish & Chips Anh',
    'Vịt quay',
    'Bò stroganoff',
    'Gà parmesan',
    'Gà nướng',
    'Thịt nướng Hàn Quốc',
    'Cơm tấm sườn',
    'Bún thịt nướng',
    'Cơm gà Hải Nam',
    'Bánh mì thịt nướng',
  ],
  mi: [
    'Pad Thai Thái Lan',
    'Ramen Nhật Bản',
    'Phở bò Việt Nam',
    'Carbonara Ý',
    'Mì xào',
    'Súp mì gà',
    'Ramen bò',
    'Mì hải sản',
    'Mì rau củ',
    'Udon súp',
    'Bún bò Huế',
    'Hủ tiếu Nam Vang',
    'Bún riêu cua',
    'Mì Quảng',
    'Bánh canh cua',
  ],
  pizza: [
    'Pizza Margherita',
    'Pizza Pepperoni',
    'Pizza Hawaii',
    'Pizza thịt',
    'Pizza rau củ',
    'Pizza BBQ gà',
    'Pizza 4 phô mai',
    'Pizza nấm',
    'Pizza hải sản',
    'Pizza gà cay',
    'Pizza Salami',
    'Pizza Tuna',
    'Pizza Prosciutto',
    'Pizza Diavola',
    'Pizza Capricciosa',
  ],
  burger: [
    'Burger bò cổ điển',
    'Burger gà',
    'Burger cá',
    'Burger chay',
    'Double Cheeseburger',
    'BBQ Bacon Burger',
    'Mushroom Swiss Burger',
    'Burger gà cay',
    'Turkey Burger',
    'Lamb Burger',
    'Burger phô mai',
    'Burger tôm',
    'Burger cá hồi',
    'Burger Mexican',
    'Burger Teriyaki',
  ],
  douong: [
    'Nước cam tươi',
    'Cà phê đá',
    'Trà xanh',
    'Smoothie bowl',
    'Coca Cola',
    'Nước chanh tươi',
    'Trà sữa Thái',
    'Smoothie xoài',
    'Chocolate nóng',
    'Energy drink',
    'Nước dừa tươi',
    'Sinh tố bơ',
    'Trà đào',
    'Matcha latte',
    'Cappuccino',
  ],
  trangmieng: [
    'Bánh chocolate',
    'Tiramisu',
    'Kem sundae',
    'Cheesecake',
    'Bánh táo',
    'Chè xoài nếp',
    'Brownie',
    'Bánh tart trái cây',
    'Crème Brûlée',
    'Gelato',
    'Bánh flan',
    'Chè đậu đỏ',
    'Kem chuối',
    'Bánh su kem',
    'Mousse chocolate',
  ],
  haiSan: [
    'Cua rang me',
    'Tôm nướng',
    'Cá nướng lá chuối',
    'Mực nướng sa tế',
    'Nghêu hấp xả',
    'Sò điệp nướng',
    'Cá thu nướng',
    'Tôm sú nướng',
    'Cá mú hấp',
    'Ghẹ rang muối',
  ],
  lau: [
    'Lẩu Thái Tom Yum',
    'Lẩu cá kèo',
    'Lẩu bò nhúng dấm',
    'Lẩu gà lá giang',
    'Lẩu hải sản',
    'Lẩu nấm',
    'Lẩu riêu cua',
    'Lẩu cá đuối',
    'Lẩu kim chi',
    'Lẩu dê',
  ],
  dimsum: [
    'Há cảo tôm',
    'Sủi cảo',
    'Bánh bao nhân thịt',
    'Bánh cuốn',
    'Chân gà dim sum',
    'Báo tử hong kong',
    'Cơm chiên dương châu',
    'Xíu mại',
    'Bánh bao kim sa',
    'Cháo sò điệp',
  ],
};

const badgeNames = [
  'Top Rated',
  'Quán Mới',
  'Giao Hàng Nhanh',
  'Thân Thiện Môi Trường',
  'Yêu Thích Địa Phương',
  'Đặc Sản Đầu Bếp',
  'Lựa Chọn Lành Mạnh',
  'Đồ Ăn Cay',
  'Thân Thiện Chay',
  'Chứng Nhận Halal',
  'Chất Lượng Cao',
  'Giá Cả Phải Chăng',
  '24/7 Có Sẵn',
  'Nguyên Liệu Tươi',
  'Hương Vị Chính Hiệu',
];

const cities = [
  'Hà Nội',
  'TP.HCM',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Nha Trang',
  'Huế',
  'Vũng Tàu',
  'Đà Lạt',
  'Quy Nhơn',
];

const streetNames = [
  'Đường Nguyễn Huệ',
  'Đường Lê Lợi',
  'Đường Trần Hưng Đạo',
  'Đường Hai Bà Trưng',
  'Đường Nguyễn Thị Minh Khai',
  'Đường Võ Văn Tần',
  'Đường Pasteur',
  'Đường Nam Kỳ Khởi Nghĩa',
  'Đường Điện Biên Phủ',
  'Đường Cách Mạng Tháng 8',
];

// Hàm tiện ích
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateAddress(): string {
  const street = getRandomElement(streetNames);
  const number = Math.floor(Math.random() * 999) + 1;
  const city = getRandomElement(cities);
  return `${street} số ${number}, ${city}`;
}

function generateOpenTime(): string {
  const openHour = Math.floor(Math.random() * 5) + 6; // 6-10
  const closeHour = Math.floor(Math.random() * 4) + 20; // 20-23
  return `${openHour}:00 - ${closeHour}:00`;
}

function generatePhoneNumber(): string {
  const prefixes = ['090', '091', '094', '083', '084', '085', '088'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}${number}`;
}

function generateFoodImageUrl(foodName: string): string {
  // Sử dụng ảnh cố định để tránh lỗi
  return 'https://picsum.photos/400/300?random=100';
}

function generateEmail(index: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const domain = getRandomElement(domains);
  return `user${index}@${domain}`;
}

function generateUsername(index: number): string {
  const prefixes = ['user', 'customer', 'store', 'admin', 'owner'];
  return `${getRandomElement(prefixes)}${index}_${Math.floor(Math.random() * 1000)}`;
}

function generateFirstName(): string {
  const names = [
    'Nguyễn',
    'Trần',
    'Lê',
    'Phạm',
    'Hoàng',
    'Huỳnh',
    'Phan',
    'Vũ',
    'Võ',
    'Đặng',
    'Bùi',
    'Đỗ',
    'Hồ',
    'Ngô',
    'Dương',
  ];
  return getRandomElement(names);
}

function generateLastName(): string {
  const lastNames = [
    'Văn Hùng',
    'Thị Lan',
    'Minh Đức',
    'Thị Hoa',
    'Văn Nam',
    'Thị Mai',
    'Đức Anh',
    'Thị Linh',
    'Văn Khang',
    'Thị Hương',
    'Minh Tuấn',
    'Thị Nga',
    'Văn Đức',
    'Thị Vy',
    'Minh Hải',
  ];
  return getRandomElement(lastNames);
}

function generateComment(): string {
  const comments = [
    'Đồ ăn rất ngon, tôi sẽ đặt lại!',
    'Chất lượng tuyệt vời, giao hàng nhanh',
    'Món ăn tươi ngon, đóng gói cẩn thận',
    'Phục vụ nhiệt tình, đồ ăn đúng gu',
    'Giá cả hợp lý, chất lượng tốt',
    'Món ăn ngon nhưng hơi mặn',
    'Giao hàng đúng giờ, đồ ăn còn nóng',
    'Rất hài lòng với chất lượng phục vụ',
    'Đóng gói đẹp, hương vị tuyệt vời',
    'Sẽ giới thiệu cho bạn bè',
    'Món ăn khá ngon, cần cải thiện thêm',
    'Tuyệt vời! Đúng như mong đợi',
  ];
  return getRandomElement(comments);
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function seed() {
  console.log('🌱 Bắt đầu tạo mock data...');

  try {
    // Xóa dữ liệu cũ
    console.log('🧹 Xóa dữ liệu cũ...');
    await prisma.rating.deleteMany();
    await prisma.stall_food_category.deleteMany();
    await prisma.badges_stall.deleteMany();
    await prisma.food.deleteMany();
    await prisma.stall.deleteMany();
    await prisma.category_food.deleteMany();
    await prisma.category_stall.deleteMany();
    await prisma.refresh_tokens.deleteMany();
    await prisma.user_profiles.deleteMany();
    await prisma.users.deleteMany();

    // 1. Tạo category_stall (10 bản ghi)
    console.log('📦 Tạo danh mục cửa hàng...');
    const createdStallCategories = await Promise.all(
      stallCategories.map((category) =>
        prisma.category_stall.create({
          data: {
            name: category.name,
            description: category.description,
            image_url: category.image_url,
          },
        }),
      ),
    );

    // 2. Tạo category_food (12 bản ghi)
    console.log('🍽️ Tạo danh mục món ăn...');
    const createdFoodCategories = await Promise.all(
      foodCategories.map((category) =>
        prisma.category_food.create({
          data: {
            name: category.name,
            description: category.description,
            image_url: category.image_url,
          },
        }),
      ),
    ); // 3. Tạo users (100 bản ghi: 80 khách hàng, 15 chủ cửa hàng, 5 super user)
    console.log('👥 Tạo người dùng...');
    const users: any[] = [];

    // Tạo tài khoản admin mặc định
    const adminUser = await prisma.users.create({
      data: {
        email: 'admin@baemin.com',
        password: await hashPassword('admin123'),
        username: 'admin',
        role: 'super_user',
      },
    });
    users.push(adminUser);

    // Tạo tài khoản test user
    const testUser = await prisma.users.create({
      data: {
        email: 'user@test.com',
        password: await hashPassword('123456'),
        username: 'testuser',
        role: 'user',
      },
    });
    users.push(testUser);

    // Tạo khách hàng (78)
    for (let i = 3; i <= 80; i++) {
      const user = await prisma.users.create({
        data: {
          email: generateEmail(i),
          password: await hashPassword('password123'),
          username: generateUsername(i),
          role: 'user',
        },
      });
      users.push(user);
    }

    // Tạo chủ cửa hàng (15)
    for (let i = 81; i <= 95; i++) {
      const user = await prisma.users.create({
        data: {
          email: generateEmail(i),
          password: await hashPassword('password123'),
          username: generateUsername(i),
          role: 'store',
        },
      });
      users.push(user);
    }

    // Tạo super users (5)
    for (let i = 96; i <= 100; i++) {
      const user = await prisma.users.create({
        data: {
          email: generateEmail(i),
          password: await hashPassword('password123'),
          username: generateUsername(i),
          role: 'super_user',
        },
      });
      users.push(user);
    }

    // 4. Tạo user_profiles (100 bản ghi)
    console.log('👤 Tạo hồ sơ người dùng...');
    await Promise.all(
      users.map((user) =>
        prisma.user_profiles.create({
          data: {
            user_id: user.id,
            phone: generatePhoneNumber(),
            address: generateAddress(),
            first_name: generateFirstName(),
            last_name: generateLastName(),
            image_url: `https://i.pravatar.cc/150?u=${user.id}`,
          },
        }),
      ),
    ); // 5. Tạo stalls (50 bản ghi)
    console.log('🏪 Tạo cửa hàng...');
    const storeOwners = users.filter((user: any) => user.role === 'store');
    const stalls: any[] = [];

    for (let i = 0; i < 50; i++) {
      const owner = getRandomElement(storeOwners);
      const category = getRandomElement(createdStallCategories);
      const stallName =
        i < stallNames.length
          ? stallNames[i]
          : `${getRandomElement(stallNames)} ${i + 1}`;

      const stall = await prisma.stall.create({
        data: {
          name: stallName,
          description: `${stallName} - Nơi phục vụ những món ăn ngon nhất với chất lượng tuyệt vời và dịch vụ tận tâm.`,
          address: generateAddress(),
          phone: generatePhoneNumber(),
          open_time: generateOpenTime(),
          image_url: 'https://picsum.photos/500/300?random=200',
          banner_url: 'https://picsum.photos/800/400?random=300',
          owner_id: owner.id,
          category_id: category.id,
          is_active: Math.random() > 0.1, // 90% hoạt động
        },
      });
      stalls.push(stall);
    } // 6. Tạo food items (600 bản ghi, ~12 món mỗi cửa hàng)
    console.log('🍕 Tạo món ăn...');
    const foods: any[] = [];

    for (const stall of stalls) {
      const numberOfFoods = Math.floor(Math.random() * 5) + 10; // 10-14 món

      for (let i = 0; i < numberOfFoods; i++) {
        const categoryKey = getRandomElement(
          Object.keys(foodItems),
        ) as keyof typeof foodItems;
        const foodName = getRandomElement(foodItems[categoryKey]);

        const food = await prisma.food.create({
          data: {
            name: `${foodName}`,
            description: `${foodName} đặc biệt từ ${stall.name} - được chế biến theo công thức riêng biệt với nguyên liệu tươi ngon`,
            price: Math.floor(Math.random() * 185000) + 15000, // 15k - 200k
            image_url: generateFoodImageUrl(foodName),
            stall_id: stall.id,
            is_available: Math.random() > 0.15, // 85% có sẵn
          },
        });
        foods.push(food);
      }
    }

    // 7. Tạo stall_food_category relationships (400+ bản ghi)
    console.log('🔗 Tạo mối quan hệ món ăn-danh mục...');
    for (const food of foods) {
      const numberOfCategories = Math.floor(Math.random() * 3) + 1; // 1-3 danh mục
      const selectedCategories = getRandomElements(
        createdFoodCategories,
        numberOfCategories,
      );

      for (const category of selectedCategories) {
        try {
          await prisma.stall_food_category.create({
            data: {
              stall_id: food.stall_id,
              food_id: food.id,
              category_id: category.id,
            },
          });
        } catch (error) {
          // Bỏ qua lỗi trùng lặp
        }
      }
    }

    // 8. Tạo badges_stall (80 bản ghi, ~2 badge mỗi cửa hàng)
    console.log('🏆 Tạo huy hiệu cửa hàng...');
    for (const stall of stalls) {
      const numberOfBadges = Math.floor(Math.random() * 3) + 1; // 1-3 badges

      for (let i = 0; i < numberOfBadges; i++) {
        await prisma.badges_stall.create({
          data: {
            name: getRandomElement(badgeNames),
            description: `Huy hiệu chứng nhận chất lượng và uy tín của ${stall.name}`,
            image_url: 'https://picsum.photos/100/100?random=400',
            stall_id: stall.id,
          },
        });
      }
    } // 9. Tạo ratings (500 bản ghi)
    console.log('⭐ Tạo đánh giá...');
    const customers = users.filter((user: any) => user.role === 'user');

    for (let i = 0; i < 500; i++) {
      const customer = getRandomElement(customers);
      const food = getRandomElement(foods);
      const stall = stalls.find((s: any) => s.id === food.stall_id)!;

      await prisma.rating.create({
        data: {
          score: Math.floor(Math.random() * 5) + 1, // 1-5 sao
          comment: Math.random() > 0.3 ? generateComment() : null,
          user_id: customer.id,
          food_id: food.id,
          stall_id: stall.id,
        },
      });
    }

    // 10. Tạo refresh_tokens (50 bản ghi)
    console.log('🔐 Tạo refresh tokens...');
    for (let i = 0; i < 50; i++) {
      const user = getRandomElement(users);
      const futureDate = new Date();
      futureDate.setDate(
        futureDate.getDate() + Math.floor(Math.random() * 30) + 1,
      ); // 1-30 ngày

      await prisma.refresh_tokens.create({
        data: {
          token: `refresh_token_${Math.random().toString(36).substr(2, 9)}_${i}`,
          user_id: user.id,
          expires: futureDate,
          revoked: Math.random() > 0.8, // 20% bị thu hồi
        },
      });
    }
    console.log('✅ Tạo mock data thành công!');
    console.log(`📊 Tóm tắt:`);
    console.log(`   - Người dùng: ${users.length}`);
    console.log(`   - Danh mục cửa hàng: ${createdStallCategories.length}`);
    console.log(`   - Danh mục món ăn: ${createdFoodCategories.length}`);
    console.log(`   - Cửa hàng: ${stalls.length}`);
    console.log(`   - Món ăn: ${foods.length}`);
    console.log(`   - Đánh giá: 500`);
    console.log(`   - Tổng bản ghi: ~1500+`);
  } catch (error) {
    console.error('❌ Lỗi khi tạo mock data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm seed
seed().catch((error) => {
  console.error('❌ Tạo mock data thất bại:', error);
  process.exit(1);
});
