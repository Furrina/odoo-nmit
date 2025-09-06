import {
  users,
  products,
  categories,
  carts,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type Cart,
  type CartItem,
  type InsertCartItem,
  type Order,
  type OrderItem,
  type InsertOrder,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  
  // Product operations
  getProducts(filters?: { categoryId?: number; search?: string; limit?: number; offset?: number }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { ownerId: string }): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getUserProducts(userId: string): Promise<Product[]>;
  
  // Cart operations
  getCart(userId: string): Promise<Cart | undefined>;
  getCartWithItems(userId: string): Promise<{ cart: Cart; items: (CartItem & { product: Product })[] } | null>;
  addToCart(userId: string, productId: number, qty: number): Promise<CartItem>;
  updateCartItem(userId: string, productId: number, qty: number): Promise<CartItem>;
  removeFromCart(userId: string, productId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  createOrder(order: InsertOrder & { items: InsertOrderItem[] }): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  // Product operations
  async getProducts(filters?: { categoryId?: number; search?: string; limit?: number; offset?: number }): Promise<Product[]> {
    let query = db.select().from(products);
    const conditions = [eq(products.status, "active")];
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      conditions.push(sql`${products.title} ILIKE ${'%' + filters.search + '%'}`);
    }
    
    query = query.where(and(...conditions)).orderBy(desc(products.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async createProduct(product: InsertProduct & { ownerId: string }): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
  
  async getUserProducts(userId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.ownerId, userId)).orderBy(desc(products.createdAt));
  }
  
  // Cart operations
  async getCart(userId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart;
  }
  
  async getCartWithItems(userId: string): Promise<{ cart: Cart; items: (CartItem & { product: Product })[] } | null> {
    let cart = await this.getCart(userId);
    
    if (!cart) {
      // Create cart if it doesn't exist
      [cart] = await db.insert(carts).values({ userId }).returning();
    }
    
    const items = await db
      .select({
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        qty: cartItems.qty,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));
    
    return { cart, items };
  }
  
  async addToCart(userId: string, productId: number, qty: number): Promise<CartItem> {
    let cart = await this.getCart(userId);
    
    if (!cart) {
      [cart] = await db.insert(carts).values({ userId }).returning();
    }
    
    // Try to update existing item first
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
    
    if (existingItem) {
      const [updatedItem] = await db
        .update(cartItems)
        .set({ qty: existingItem.qty + qty })
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
        .returning();
      return updatedItem;
    } else {
      const [newItem] = await db
        .insert(cartItems)
        .values({ cartId: cart.id, productId, qty })
        .returning();
      return newItem;
    }
  }
  
  async updateCartItem(userId: string, productId: number, qty: number): Promise<CartItem> {
    const cart = await this.getCart(userId);
    if (!cart) throw new Error("Cart not found");
    
    const [updatedItem] = await db
      .update(cartItems)
      .set({ qty })
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
      .returning();
    return updatedItem;
  }
  
  async removeFromCart(userId: string, productId: number): Promise<void> {
    const cart = await this.getCart(userId);
    if (!cart) return;
    
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  }
  
  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    if (!cart) return;
    
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  }
  
  // Order operations
  async getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            qty: orderItems.qty,
            priceCents: orderItems.priceCents,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));
        
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }
  
  async createOrder(orderData: InsertOrder & { items: InsertOrderItem[] }): Promise<Order> {
    const { items, ...order } = orderData;
    
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    if (items.length > 0) {
      await db.insert(orderItems).values(
        items.map(item => ({ ...item, orderId: newOrder.id }))
      );
    }
    
    return newOrder;
  }
}

export const storage = new DatabaseStorage();
