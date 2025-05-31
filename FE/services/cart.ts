import { Food } from "./food";

// Interface cho cart item
export interface CartItem {
  id: string;
  food_id: string;
  name: string;
  image_url: string;
  description: string;
  price: number;
  quantity: number;
  stall_id: string;
  stall_name: string;
  is_available: boolean;
}

// Interface cho cart của một quán (stall)
export interface StallCart {
  stall_id: string;
  stall_name: string;
  items: CartItem[];
}

// Interface cho toàn bộ cart
export interface UserCart {
  user_id: string;
  stalls: StallCart[];
  total_items: number;
  total_amount: number;
  updated_at: string;
}

export class CartService {
  private static CART_KEY = "baemin_cart";
  // Lấy cart từ localStorage
  static getCart(userId: string): UserCart {
    try {
      const cartData = localStorage.getItem(this.CART_KEY);
      if (!cartData) {
        return this.createEmptyCart(userId);
      }

      const allCarts: { [key: string]: UserCart } = JSON.parse(cartData);
      const userCart = allCarts[userId];

      if (!userCart) {
        return this.createEmptyCart(userId);
      }

      return userCart;
    } catch (error) {
      console.error("Error getting cart from localStorage:", error);
      return this.createEmptyCart(userId);
    }
  }
  // Lưu cart vào localStorage
  static saveCart(cart: UserCart): void {
    try {
      const cartData = localStorage.getItem(this.CART_KEY);
      let allCarts: { [key: string]: UserCart } = {};

      if (cartData) {
        allCarts = JSON.parse(cartData);
      }

      allCarts[cart.user_id] = cart;
      localStorage.setItem(this.CART_KEY, JSON.stringify(allCarts));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }

  // Tạo cart rỗng
  private static createEmptyCart(userId: string): UserCart {
    return {
      user_id: userId,
      stalls: [],
      total_items: 0,
      total_amount: 0,
      updated_at: new Date().toISOString(),
    };
  }

  // Thêm món ăn vào cart
  static addToCart(userId: string, food: Food, quantity: number = 1): UserCart {
    const cart = this.getCart(userId);

    // Tìm stall trong cart
    let stallCart = cart.stalls.find(
      (stall) => stall.stall_id === food.stall_id
    );

    if (!stallCart) {
      // Tạo mới stall cart nếu chưa có
      stallCart = {
        stall_id: food.stall_id,
        stall_name: food.stall?.name || "Quán ăn",
        items: [],
      };
      cart.stalls.push(stallCart);
    }

    // Kiểm tra xem món ăn đã có trong cart chưa
    const existingItem = stallCart.items.find(
      (item) => item.food_id === food.id
    );

    if (existingItem) {
      // Cập nhật số lượng nếu đã có
      existingItem.quantity += quantity;
    } else {
      // Thêm món ăn mới
      const cartItem: CartItem = {
        id: `${food.id}_${Date.now()}`, // Unique ID cho cart item
        food_id: food.id,
        name: food.name,
        image_url: food.image_url || "/food/default.jpg",
        description: food.description || "",
        price: food.price,
        quantity: quantity,
        stall_id: food.stall_id,
        stall_name: food.stall?.name || "Quán ăn",
        is_available: food.is_available,
      };
      stallCart.items.push(cartItem);
    }

    // Cập nhật tổng số lượng và tổng tiền
    this.updateCartTotals(cart);

    // Lưu cart
    this.saveCart(cart);

    return cart;
  }

  // Cập nhật số lượng món ăn trong cart
  static updateQuantity(
    userId: string,
    itemId: string,
    newQuantity: number
  ): UserCart {
    const cart = this.getCart(userId);

    for (const stall of cart.stalls) {
      const item = stall.items.find((item) => item.id === itemId);
      if (item) {
        if (newQuantity <= 0) {
          // Xóa item nếu quantity <= 0
          stall.items = stall.items.filter((item) => item.id !== itemId);
        } else {
          item.quantity = newQuantity;
        }
        break;
      }
    }

    // Xóa stall nếu không còn item nào
    cart.stalls = cart.stalls.filter((stall) => stall.items.length > 0);

    // Cập nhật tổng
    this.updateCartTotals(cart);

    // Lưu cart
    this.saveCart(cart);

    return cart;
  }

  // Xóa món ăn khỏi cart
  static removeFromCart(userId: string, itemId: string): UserCart {
    return this.updateQuantity(userId, itemId, 0);
  }

  // Xóa toàn bộ cart của một stall
  static removeStallFromCart(userId: string, stallId: string): UserCart {
    const cart = this.getCart(userId);
    cart.stalls = cart.stalls.filter((stall) => stall.stall_id !== stallId);

    // Cập nhật tổng
    this.updateCartTotals(cart);

    // Lưu cart
    this.saveCart(cart);

    return cart;
  }

  // Xóa toàn bộ cart
  static clearCart(userId: string): UserCart {
    const cart = this.createEmptyCart(userId);
    this.saveCart(cart);
    return cart;
  }

  // Cập nhật tổng số lượng và tổng tiền
  private static updateCartTotals(cart: UserCart): void {
    let totalItems = 0;
    let totalAmount = 0;

    for (const stall of cart.stalls) {
      for (const item of stall.items) {
        totalItems += item.quantity;
        totalAmount += item.price * item.quantity;
      }
    }

    cart.total_items = totalItems;
    cart.total_amount = totalAmount;
    cart.updated_at = new Date().toISOString();
  }

  // Lấy số lượng items trong cart
  static getCartItemCount(userId: string): number {
    const cart = this.getCart(userId);
    return cart.total_items;
  }

  // Lấy tổng tiền trong cart
  static getCartTotal(userId: string): number {
    const cart = this.getCart(userId);
    return cart.total_amount;
  }

  // Kiểm tra xem món ăn có trong cart không
  static isInCart(userId: string, foodId: string): boolean {
    const cart = this.getCart(userId);

    for (const stall of cart.stalls) {
      if (stall.items.some((item) => item.food_id === foodId)) {
        return true;
      }
    }

    return false;
  }

  // Lấy quantity của một món ăn trong cart
  static getItemQuantity(userId: string, foodId: string): number {
    const cart = this.getCart(userId);

    for (const stall of cart.stalls) {
      const item = stall.items.find((item) => item.food_id === foodId);
      if (item) {
        return item.quantity;
      }
    }

    return 0;
  }
}

export default CartService;
