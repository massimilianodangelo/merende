import { users, type User, type InsertUser, products, type Product, type InsertProduct, orders, type Order, type InsertOrder, orderItems, type OrderItem, type InsertOrderItem } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByDate(date: Date): Promise<Order[]>;
  getOrdersByClass(classroom: string): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  public sessionStore: session.SessionStore;
  
  private userId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with some sample products
    this.initializeProducts();
  }

  // Initialize sample products
  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "TRAMEZZINO TONNO E POMODORO",
        description: "Tramezzino con tonno e pomodoro",
        price: 2.00,
        category: "Tramezzini",
        available: true
      },
      {
        name: "TRAMEZZINO PROSCIUTTO COTTO",
        description: "Tramezzino con prosciutto cotto e formaggio edamer",
        price: 2.00,
        category: "Tramezzini",
        available: true
      },
      {
        name: "TRAMEZZINO PROSCIUTTO CRUDO",
        description: "Tramezzino con prosciutto crudo e formaggio edamer",
        price: 2.00,
        category: "Tramezzini",
        available: true
      },
      {
        name: "TRAMEZZINO SALAME",
        description: "Tramezzino con salame e formaggio edamer",
        price: 2.00,
        category: "Tramezzini",
        available: true
      },
      {
        name: "CALZONE AL FORNO",
        description: "Calzone al forno con prosciutto cotto e mozzarella",
        price: 2.00,
        category: "Calzoni",
        available: true
      },
      {
        name: "PANINO TONDO PROSCIUTTO CRUDO",
        description: "Panino tondo con prosciutto crudo",
        price: 2.50,
        category: "Panini",
        available: true
      },
      {
        name: "PANINO TONDO PETTO DI TACCHINO",
        description: "Panino tondo con petto di tacchino arrosto, rucola, grana e olio d'oliva",
        price: 2.50,
        category: "Panini",
        available: true
      },
      {
        name: "PANINO TONDO PROSCIUTTO COTTO",
        description: "Panino tondo con prosciutto cotto",
        price: 2.50,
        category: "Panini",
        available: true
      },
      {
        name: "PANINO TONDO SALAME",
        description: "Panino tondo con salame",
        price: 2.50,
        category: "Panini",
        available: true
      },
      {
        name: "PANINO TONDO HAMBURGER",
        description: "Panino tondo con hamburger di manzo, lattuga e pomodoro",
        price: 2.50,
        category: "Panini",
        available: true
      },
      {
        name: "PIZZA BIANCA SEMPLICE",
        description: "Pizza bianca semplice",
        price: 1.00,
        category: "Pizze",
        available: true
      },
      {
        name: "PIZZA ROSSA SEMPLICE",
        description: "Pizza rossa con pomodoro",
        price: 1.50,
        category: "Pizze",
        available: true
      },
      {
        name: "PIZZA PATATE",
        description: "Pizza con patate",
        price: 1.50,
        category: "Pizze",
        available: true
      }
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    
    // Controlla se è un amministratore basato sull'email
    const isAdmin = insertUser.email === 'prova@amministratore.it';
    
    // Per ora mantengo la possibilità di diventare rappresentante tramite checkbox
    // nella form di registrazione
    const isRepresentative = !!insertUser.isRepresentative;
    
    const user: User = { 
      ...insertUser, 
      id, 
      isRepresentative, 
      isAdmin 
    };
    
    this.users.set(id, user);
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    if (category === "Tutti") {
      return Array.from(this.products.values());
    }
    return Array.from(this.products.values()).filter(
      (product) => product.category === category,
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async getOrdersByDate(date: Date): Promise<Order[]> {
    const targetDate = new Date(date.toDateString());
    return Array.from(this.orders.values()).filter((order) => {
      const orderDate = new Date(order.orderDate.toDateString());
      return orderDate.getTime() === targetDate.getTime();
    });
  }
  
  async getOrdersByClass(classroom: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    const result: Order[] = [];
    
    // Per ogni ordine, ottieni l'utente e verifica la classe
    for (const order of orders) {
      const user = this.users.get(order.userId);
      if (user && user.classRoom === classroom) {
        result.push(order);
      }
    }
    
    return result;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      return undefined;
    }
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
}

export const storage = new MemStorage();
