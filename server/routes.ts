import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertOrderSchema, insertOrderItemSchema, insertProductSchema, CartItem } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      let products;
      
      if (category && category !== "Tutti") {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Solo l'amministratore può aggiungere prodotti
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validare i dati del prodotto
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        available: req.body.available !== undefined ? req.body.available : true
      };
      
      const validatedProductData = insertProductSchema.parse(productData);
      
      // Creare il prodotto
      const product = await storage.createProduct(validatedProductData);
      
      res.status(200).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user?.id;
      const orders = await storage.getOrdersByUser(userId);
      
      // For each order, get the order items
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            items,
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user?.id;
      
      // Validate the order data
      const orderData = {
        userId,
        total: req.body.total,
        status: "pending",
        orderDate: new Date(req.body.orderDate || new Date())
      };

      const validatedOrderData = insertOrderSchema.parse(orderData);
      
      // Create the order
      const order = await storage.createOrder(validatedOrderData);
      
      // Validate cart items and create order items
      const cartItemsSchema = z.array(z.object({
        product: z.object({
          id: z.number(),
          price: z.number()
        }),
        quantity: z.number().min(1)
      }));
      
      const validatedCartItems = cartItemsSchema.parse(req.body.items);
      
      // Create order items
      await Promise.all(
        validatedCartItems.map(async (item) => {
          const orderItemData = {
            orderId: order.id,
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          };
          
          await storage.createOrderItem(orderItemData);
        })
      );
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Admin routes
  app.get("/api/admin/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is a representative or admin
      if (!req.user?.isRepresentative && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get today's date
      const today = new Date();
      const todayOrders = await storage.getOrdersByDate(today);
      
      // For each order, get the order items and user info
      const ordersWithDetails = await Promise.all(
        todayOrders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const user = await storage.getUser(order.userId);
          
          return {
            ...order,
            items,
            user: {
              id: user?.id,
              firstName: user?.firstName,
              lastName: user?.lastName,
              classRoom: user?.classRoom
            }
          };
        })
      );
      
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch admin orders" });
    }
  });
  
  // Ottieni ordini per classe (solo per rappresentanti di classe)
  app.get("/api/admin/orders/class/:classroom", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is a representative or admin
      if (!req.user?.isRepresentative && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const classroom = req.params.classroom;
      const orders = await storage.getOrdersByClass(classroom);
      
      // Aggiunge i dettagli degli item e utente all'ordine
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const user = await storage.getUser(order.userId);
          return { 
            ...order, 
            items,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              classRoom: user.classRoom
            } : null
          };
        })
      );
      
      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching class orders:", error);
      res.status(500).json({ message: "Failed to fetch class orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is a representative or admin
      if (!req.user?.isRepresentative && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      // Update the order status
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
