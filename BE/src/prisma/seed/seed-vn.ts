import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Mock data arrays cho food delivery
const stallCategories = [
  {
    name: 'Fast Food',
    description: 'Đồ ăn nhanh và tiện lợi',
    image_url:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
  },
  {
    name: 'Món Á',
    description: 'Các món ăn truyền thống và hiện đại châu Á',
    image_url:
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
  },
  {
    name: 'Món Ý',
    description: 'Ẩm thực Ý chính hiệu',
    image_url:
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
  },
  {
    name: 'Món Mexico',
    description: 'Đồ ăn Mexico cay nồng',
    image_url:
      'https://images.unsplash.com/photo-1565299585323-38174c4a6538?w=400&h=300&fit=crop',
  },
  {
    name: 'BBQ & Nướng',
    description: 'Các món nướng và BBQ đặc biệt',
    image_url:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
  },
  {
    name: 'Chay',
    description: 'Các món chay lành mạnh',
    image_url:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  },
  {
    name: 'Hải sản',
    description: 'Các món hải sản tươi ngon',
    image_url:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
  },
  {
    name: 'Tráng miệng',
    description: 'Các món ngọt và tráng miệng',
    image_url:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
  },
  {
    name: 'Café & Đồ uống',
    description: 'Cà phê, đồ uống và món ăn nhẹ',
    image_url:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  },
  {
    name: 'Đồ ăn healthy',
    description: 'Các món ăn dinh dưỡng và cân bằng',
    image_url:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  },
];

const foodCategories = [
  {
    name: 'Khai vị',
    description: 'Món khai vị và món nhỏ',
    image_url:
      'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&h=300&fit=crop',
  },
  {
    name: 'Món chính',
    description: 'Các món chính thịnh soạn',
    image_url:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  },
  {
    name: 'Súp',
    description: 'Súp nóng và lạnh',
    image_url:
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
  },
  {
    name: 'Salad',
    description: 'Salad tươi mát và lành mạnh',
    image_url:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  },
  {
    name: 'Mì & Cơm',
    description: 'Các món mì và cơm châu Á',
    image_url:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
  },
  {
    name: 'Pizza',
    description: 'Các loại pizza đa dạng',
    image_url:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
  },
  {
    name: 'Burger',
    description: 'Burger cao cấp và truyền thống',
    image_url:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  },
  {
    name: 'Sandwich',
    description: 'Các loại sandwich đa dạng',
    image_url:
      'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop',
  },
  {
    name: 'Đồ uống',
    description: 'Nước uống và đồ giải khát',
    image_url:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  },
  {
    name: 'Tráng miệng',
    description: 'Món ngọt và bánh kem',
    image_url:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
  },
  {
    name: 'Món sáng',
    description: 'Các lựa chọn cho bữa sáng',
    image_url:
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop',
  },
  {
    name: 'Hải sản',
    description: 'Cá và các món biển ngon',
    image_url:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
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
  const foodImages = {
    'Chả giò tôm thịt':
      'https://images.unsplash.com/photo-1544047787-4d0b6d16a8b4?w=400&h=300&fit=crop',
    'Cánh gà nướng':
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop',
    'Cá hồi nướng':
      'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop',
    'Bò beefsteak':
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    'Pad Thai Thái Lan':
      'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=300&fit=crop',
    'Ramen Nhật Bản':
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'Pizza Margherita':
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    'Pizza Pepperoni':
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'Burger bò cổ điển':
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'Burger gà':
      'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=300&fit=crop',
    'Nước cam tươi':
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
    'Cà phê đá':
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    'Bánh chocolate':
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    Tiramisu:
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
  };

  return (
    foodImages[foodName as keyof typeof foodImages] ||
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
  );
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

    // Tạo khách hàng (80)
    for (let i = 1; i <= 80; i++) {
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
    ); // 5. Tạo stalls (40 bản ghi)
    console.log('🏪 Tạo cửa hàng...');
    const storeOwners = users.filter((user: any) => user.role === 'store');
    const stalls: any[] = [];

    for (let i = 0; i < 40; i++) {
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
          image_url:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
          banner_url:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop',
          owner_id: owner.id,
          category_id: category.id,
          is_active: Math.random() > 0.1, // 90% hoạt động
        },
      });
      stalls.push(stall);
    } // 6. Tạo food items (400 bản ghi, ~10 món mỗi cửa hàng)
    console.log('🍕 Tạo món ăn...');
    const foods: any[] = [];

    for (const stall of stalls) {
      const numberOfFoods = Math.floor(Math.random() * 5) + 8; // 8-12 món

      for (let i = 0; i < numberOfFoods; i++) {
        const categoryKey = getRandomElement(
          Object.keys(foodItems),
        ) as keyof typeof foodItems;
        const foodName = getRandomElement(foodItems[categoryKey]);

        const food = await prisma.food.create({
          data: {
            name: `${foodName}`,
            description: `${foodName} đặc biệt từ ${stall.name} - được chế biến theo công thức riêng biệt`,
            price: Math.floor(Math.random() * 135000) + 15000, // 15k - 150k
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
            image_url:
              'https://images.unsplash.com/photo-1567102537832-43d35ad5eb87?w=100&h=100&fit=crop',
            stall_id: stall.id,
          },
        });
      }
    }

    // 9. Tạo ratings (300 bản ghi)
    console.log('⭐ Tạo đánh giá...');
    const customers = users.filter((user: any) => user.role === 'user');

    for (let i = 0; i < 300; i++) {
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
    console.log(`   - Tổng bản ghi: ~1000+`);
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
