import { prisma } from "./db";
import type { User, Product, Category, Cart, CartItem, Order, OrderItem } from "@prisma/client";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  upsertUser(user: Partial<User>): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  
  // Product operations
  getProducts(filters?: { categoryId?: number; search?: string; limit?: number; offset?: number }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getUserProducts(userId: string): Promise<Product[]>;
  
  // Cart operations
  getCart(userId: string): Promise<Cart | null>;
  getCartWithItems(userId: string): Promise<{ cart: Cart; items: (CartItem & { product: Product })[] } | null>;
  addToCart(userId: string, productId: number, qty: number): Promise<CartItem>;
  updateCartItem(userId: string, productId: number, qty: number): Promise<CartItem>;
  removeFromCart(userId: string, productId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  createOrder(order: Omit<Order, 'id' | 'createdAt'> & { items: Omit<OrderItem, 'orderId'>[] }): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async upsertUser(userData: Partial<User>): Promise<User> {
    if (userData.id) {
      return await prisma.user.upsert({
        where: { id: userData.id },
        update: { ...userData, updatedAt: new Date() },
        create: userData as User,
      });
    } else {
      return await prisma.user.create({ data: userData as User });
    }
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await prisma.category.findMany();
  }
  
  // Product operations
  async getProducts(filters?: { categoryId?: number; search?: string; limit?: number; offset?: number }): Promise<Product[]> {
    const where: any = { status: "active" };
    
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters?.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    
    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
    });
  }
  
  async getProduct(id: number): Promise<Product | null> {
    return await prisma.product.findUnique({ where: { id } });
  }
  
  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    return await prisma.product.create({ data: product });
  }
  
  async updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
    return await prisma.product.update({ where: { id }, data: product });
  }
  
  async deleteProduct(id: number): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
  
  async getUserProducts(userId: string): Promise<Product[]> {
    return await prisma.product.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  // Cart operations
  async getCart(userId: string): Promise<Cart | null> {
    return await prisma.cart.findUnique({ where: { userId } });
  }
  
  async getCartWithItems(userId: string): Promise<{ cart: Cart; items: (CartItem & { product: Product })[] } | null> {
    let cart = await this.getCart(userId);
    
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    
    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });
    
    return { cart, items };
  }
  
  async addToCart(userId: string, productId: number, qty: number): Promise<CartItem> {
    let cart = await this.getCart(userId);
    
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    
    // Try to update existing item first
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    
    if (existingItem) {
      return await prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { qty: existingItem.qty + qty },
      });
    } else {
      return await prisma.cartItem.create({
        data: { cartId: cart.id, productId, qty },
      });
    }
  }
  
  async updateCartItem(userId: string, productId: number, qty: number): Promise<CartItem> {
    const cart = await this.getCart(userId);
    if (!cart) throw new Error("Cart not found");
    
    return await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { qty },
    });
  }
  
  async removeFromCart(userId: string, productId: number): Promise<void> {
    const cart = await this.getCart(userId);
    if (!cart) return;
    
    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
  }
  
  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    if (!cart) return;
    
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  
  // Order operations
  async getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }
  
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'> & { items: Omit<OrderItem, 'orderId'>[] }): Promise<Order> {
    const { items, ...order } = orderData;
    
    return await prisma.order.create({
      data: {
        ...order,
        items: {
          create: items,
        },
      },
    });
  }
}

export const storage = new DatabaseStorage();