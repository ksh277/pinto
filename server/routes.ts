import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabase } from "./lib/supabase";
import { db } from "./db";
import {
  insertUserSchema,
  insertProductSchema,
  insertProductReviewSchema,
  insertReviewCommentSchema,
  insertReviewLikeSchema,
  insertProductLikeSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertPaymentSchema,
  insertCouponSchema,
  insertAdminLogSchema,
  insertCommunityPostSchema,
  insertCommunityCommentSchema,
  insertBelugaTemplateSchema,
  insertGoodsEditorDesignSchema,
  insertInquirySchema,

} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { getChatbotResponse } from "./lib/openai";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// JWT Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "토큰이 필요합니다." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log("JWT verification error:", err);
      return res.status(403).json({ message: "토큰이 유효하지 않습니다." });
    }
    console.log("Authenticated user from token:", user);
    req.user = user;
    next();
  });
};

// Admin only middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());

  // Populate Supabase with sample data
  app.post("/api/populate-data", async (req, res) => {
    try {
      const results = {};

      // 1. Insert simple categories first
      const { data: categories, error: catError } = await supabase
        .from("categories")
        .insert([
          { name: 'Acrylic Keychains', nameKo: '아크릴 키링' },
          { name: 'Phone Cases', nameKo: '폰케이스' },
          { name: 'T-Shirts', nameKo: '티셔츠' }
        ])
        .select();

      results['categories'] = { 
        success: !catError,
        error: catError?.message,
        count: categories?.length || 0
      };

      if (categories && categories.length > 0) {
        // 2. Insert products with category references
        const { data: products, error: prodError } = await supabase
          .from("products")
          .insert([
            { name: 'Transparent Acrylic Keychain', nameKo: '투명 아크릴 키링', categoryId: categories[0].id, basePrice: 6000.00 },
            { name: 'Custom Phone Case', nameKo: '맞춤형 핸드폰 케이스', categoryId: categories[1].id, basePrice: 15000.00 },
            { name: 'Basic Cotton T-Shirt', nameKo: '베이직 코튼 티셔츠', categoryId: categories[2].id, basePrice: 18000.00 }
          ])
          .select();

        results['products'] = {
          success: !prodError,
          error: prodError?.message,
          count: products?.length || 0
        };
      }
        
      res.json(results);
    } catch (error) {
      res.json({ 
        success: false,
        error: (error as Error).message 
      });
    }
  });

  // Add missing essential API endpoints for e-commerce functionality

  // Product details API
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart management API
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItem = await storage.addToCart(req.body);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  // Orders API
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getUserOrders(userId);
      res.json(orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Reviews management API  
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const review = await storage.createProductReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Community management API
  app.get("/api/community-posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getCommunityPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching community post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/community-posts", async (req, res) => {
    try {
      const post = await storage.createCommunityPost(req.body);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Add community comments API
  app.post("/api/community-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comment = await storage.createCommunityComment({
        ...req.body,
        postId
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get("/api/community-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommunityComments(postId);
      res.json(comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Add design saving functionality
  app.post("/api/designs", async (req, res) => {
    try {
      const design = await storage.createGoodsEditorDesign(req.body);
      res.status(201).json(design);
    } catch (error) {
      console.error("Error saving design:", error);
      res.status(500).json({ message: "Failed to save design" });
    }
  });

  app.get("/api/designs/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const designs = await storage.getGoodsEditorDesigns(userId);
      res.json(designs || []);
    } catch (error) {
      console.error("Error fetching designs:", error);
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });

  // Review likes and comments
  app.post("/api/reviews/:id/like", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const like = await storage.createReviewLike({
        reviewId,
        userId: req.body.userId
      });
      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking review:", error);
      res.status(500).json({ message: "Failed to like review" });
    }
  });

  app.post("/api/reviews/:id/comments", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const comment = await storage.createReviewComment({
        ...req.body,
        reviewId
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating review comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Community likes
  app.post("/api/community-posts/:id/like", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.likeCommunityPost(postId);
      res.json(post);
    } catch (error) {
      console.error("Error liking community post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Cart operations
  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const cartItem = await storage.updateCartItem(cartItemId, req.body);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const success = await storage.deleteCartItem(cartItemId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(500).json({ message: "Failed to delete cart item" });
    }
  });

  // Admin product management
  app.patch("/api/admin/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.updateProduct(productId, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Admin order management
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders || []);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.updateOrder(orderId, req.body);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Debug database connection
  app.get("/api/test-db", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      const products = await storage.getProducts();
      const communityPosts = await storage.getCommunityPosts();
      
      res.json({
        categories: { count: categories.length, sample: categories.slice(0, 2) },
        products: { count: products.length, sample: products.slice(0, 2) },
        communityPosts: { count: communityPosts.length, sample: communityPosts.slice(0, 2) }
      });
    } catch (error) {
      res.json({ 
        success: false,
        error: (error as Error).message 
      });
    }
  });

  // Products routes (using Neon DB with real data)
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured } = req.query;
      
      // Use drizzle for querying products table
      const products = await storage.getProducts();
      res.json(products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Reviews routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const { data: reviews, error } = await supabase
        .from("product_reviews")
        .select(`*`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Failed to fetch reviews" });
      }

      res.json(reviews || []);
    } catch (error) {
      console.error("Error in reviews endpoint:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const { data: reviews, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching product reviews:", error);
        return res.status(500).json({ message: "Failed to fetch reviews" });
      }

      res.json(reviews || []);
    } catch (error) {
      console.error("Error in product reviews endpoint:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Categories route (using Neon DB with real data)
  app.get("/api/categories", async (req, res) => {
    try {
      // Use storage method for categories
      const categories = await storage.getCategories();
      res.json(categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({ message: "모든 필드를 입력해주세요." });
      }

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username, email")
        .or(`username.eq.${username},email.eq.${email}`)
        .single();

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.username === username
              ? "이미 사용 중인 아이디입니다."
              : "이미 사용 중인 이메일입니다.",
        });
      }

      // Hash password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([
          {
            username,
            email,
            password: hashedPassword,
            first_name: firstName,
            last_name: lastName,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "회원가입에 실패했습니다." });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          isAdmin: newUser.is_admin || false,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Set cookie with token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove password before sending response
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        ...userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "회원가입에 실패했습니다." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "아이디와 비밀번호를 입력해주세요." });
      }

      // Get user from database (check both username and email fields)
      console.log("Attempting to find user:", username);
      let { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      console.log("Supabase query result:", {
        data: user,
        error: error ? error.message : null,
      });

      // If single() fails, try getting all users and filter manually
      if (error && error.code === "PGRST116") {
        console.log("Single query failed, trying manual filter...");
        const { data: allUsers, error: listError } = await supabase
          .from("users")
          .select("id, username, email, password, first_name, last_name");

        console.log("All users query result:", {
          count: allUsers?.length,
          error: listError?.message,
        });

        if (allUsers && allUsers.length > 0) {
          const foundUser = allUsers.find(
            (u) => u.username === username || u.email === username,
          );
          if (foundUser) {
            console.log("Found user manually:", foundUser.username);
            // Override the original result
            user = foundUser;
            error = null;
          }
        }
      }

      console.log("Login attempt for:", username);
      console.log("User found:", user ? "Yes" : "No");
      if (user) {
        console.log("User username:", user.username);
        console.log("User email:", user.email);
      }

      if (error || !user) {
        return res
          .status(401)
          .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
      }

      // Check password with bcrypt
      let isPasswordValid = false;

      try {
        // Check if password starts with bcrypt hash
        if (user.password.startsWith("$2b$")) {
          // bcrypt encrypted password
          isPasswordValid = await bcrypt.compare(password, user.password);
          console.log(
            `BCrypt password check for ${user.username}:`,
            isPasswordValid,
          );
        } else {
          // Plain text password (for development/testing)
          isPasswordValid = password === user.password;
          console.log(
            `Plain text password check for ${user.username}:`,
            isPasswordValid,
            `"${password}" === "${user.password}"`,
          );
        }
      } catch (bcryptError) {
        console.error("Bcrypt error:", bcryptError);
        // If bcrypt fails, try plain text comparison
        isPasswordValid = password === user.password;
      }

      console.log(`Password check for ${username}: ${isPasswordValid}`);
      console.log(
        `User is_admin value: ${user.is_admin}, type: ${typeof user.is_admin}`,
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
      }

      // Generate JWT token with explicit isAdmin handling - check username for admin privileges
      const isAdminValue = user.username === "admin";
      const token = jwt.sign(
        {
          id: user.id,
          userId: user.id,
          username: user.username,
          email: user.email || "",
          isAdmin: isAdminValue,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      console.log(
        `Generated token for ${username} with isAdmin: ${isAdminValue}`,
      );

      // Set cookie with token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove password before sending response
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        token,
        isAdmin: isAdminValue,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "로그인에 실패했습니다." });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "로그아웃되었습니다." });
  });

  // Check authentication status
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, email, first_name, last_name, created_at")
        .eq("id", req.user.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      // Check if user is a seller
      const { data: seller } = await supabase
        .from("sellers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Add isAdmin from JWT token
      res.json({
        ...user,
        seller,
        isAdmin: req.user.isAdmin || false,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "인증 확인에 실패했습니다." });
    }
  });

  // Find ID endpoint
  app.post("/api/auth/find-id", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "이메일을 입력해 주세요." });
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("username")
        .eq("email", email)
        .single();

      if (error || !user) {
        return res
          .status(404)
          .json({ message: "등록된 이메일을 찾을 수 없습니다." });
      }

      res.json({
        username: user.username,
        message: "아이디를 찾았습니다.",
      });
    } catch (error) {
      console.error("Find ID error:", error);
      res.status(500).json({ message: "아이디 찾기에 실패했습니다." });
    }
  });

  // Find Password endpoint
  app.post("/api/auth/find-password", async (req, res) => {
    try {
      const { username, email, phone, method } = req.body;

      if (!username) {
        return res.status(400).json({ message: "아이디를 입력해 주세요." });
      }

      if (method === "email" && !email) {
        return res.status(400).json({ message: "이메일을 입력해 주세요." });
      }

      if (method === "phone" && !phone) {
        return res
          .status(400)
          .json({ message: "휴대폰 번호를 입력해 주세요." });
      }

      // Find user by username and email/phone
      let query = supabase
        .from("users")
        .select("id, username, email")
        .eq("username", username);

      if (method === "email") {
        query = query.eq("email", email);
      } else if (method === "phone") {
        query = query.eq("phone", phone);
      }

      const { data: user, error } = await query.single();

      if (error || !user) {
        return res.status(404).json({
          message: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
        });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      // In production, you would:
      // 1. Hash the temporary password
      // 2. Update user's password in database with expiration time
      // 3. Send email/SMS with temporary password

      // For now, just return the temporary password (demo purposes)
      res.json({
        tempPassword,
        message: `임시 비밀번호가 ${method === "email" ? "이메일" : "휴대폰"}로 전송되었습니다.`,
      });
    } catch (error) {
      console.error("Find Password error:", error);
      res.status(500).json({ message: "비밀번호 찾기에 실패했습니다." });
    }
  });

  // Seller registration
  app.post(
    "/api/sellers/register",
    authenticateToken,
    async (req: any, res) => {
      try {
        const {
          shopName,
          businessNumber,
          contactEmail,
          contactPhone,
          address,
          bankAccount,
          bankName,
        } = req.body;

        // Check if user already has seller account
        const { data: existingSeller } = await supabase
          .from("sellers")
          .select("id")
          .eq("user_id", req.user.id)
          .single();

        if (existingSeller) {
          return res
            .status(400)
            .json({ message: "이미 판매자로 등록되어 있습니다." });
        }

        const { data: seller, error } = await supabase
          .from("sellers")
          .insert([
            {
              user_id: req.user.id,
              shop_name: shopName,
              business_number: businessNumber,
              contact_email: contactEmail,
              contact_phone: contactPhone,
              address,
              bank_account: bankAccount,
              bank_name: bankName,
              status: "pending",
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Seller registration error:", error);
          return res
            .status(500)
            .json({ message: "판매자 등록에 실패했습니다." });
        }

        res.status(201).json(seller);
      } catch (error) {
        console.error("Seller registration error:", error);
        res.status(500).json({ message: "판매자 등록에 실패했습니다." });
      }
    },
  );

  // Wishlist routes
  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: wishlist, error } = await supabase
        .from("wishlist")
        .select(
          `
          *,
          products (
            id, name, name_ko, base_price, image_url, category_id
          )
        `,
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching wishlist:", error);
        return res.status(500).json({ message: "Failed to fetch wishlist" });
      }

      res.json(wishlist);
    } catch (error) {
      console.error("Error in wishlist endpoint:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const { user_id, product_id } = req.body;
      const { data: wishlistItem, error } = await supabase
        .from("wishlist")
        .insert([{ user_id, product_id }])
        .select()
        .single();

      if (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({ message: "Failed to add to wishlist" });
      }

      res.status(201).json(wishlistItem);
    } catch (error) {
      console.error("Error in wishlist endpoint:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:userId/:productId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const productId = parseInt(req.params.productId);

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (error) {
        console.error("Error removing from wishlist:", error);
        return res
          .status(500)
          .json({ message: "Failed to remove from wishlist" });
      }

      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error in wishlist endpoint:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          products (
            id, name, name_ko, base_price, image_url, category_id
          )
        `,
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({ message: "Failed to fetch cart" });
      }

      res.json(cartItems);
    } catch (error) {
      console.error("Error in cart endpoint:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { user_id, product_id, quantity, options } = req.body;

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
        .single();

      if (existingItem) {
        // Update quantity
        const { data: updatedItem, error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: existingItem.quantity + quantity,
            options: options || existingItem.options,
          })
          .eq("id", existingItem.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating cart item:", updateError);
          return res
            .status(500)
            .json({ message: "Failed to update cart item" });
        }

        res.json(updatedItem);
      } else {
        // Add new item
        const { data: cartItem, error } = await supabase
          .from("cart_items")
          .insert([{ user_id, product_id, quantity, options }])
          .select()
          .single();

        if (error) {
          console.error("Error adding to cart:", error);
          return res.status(500).json({ message: "Failed to add to cart" });
        }

        res.status(201).json(cartItem);
      }
    } catch (error) {
      console.error("Error in cart endpoint:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.delete("/api/cart/:userId/:itemId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemId = parseInt(req.params.itemId);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("id", itemId);

      if (error) {
        console.error("Error removing from cart:", error);
        return res.status(500).json({ message: "Failed to remove from cart" });
      }

      res.json({ message: "Removed from cart" });
    } catch (error) {
      console.error("Error in cart endpoint:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { user_id, total_amount, shipping_address, payment_method, items } =
        req.body;

      // 1. 재고 확인 먼저 수행
      for (const item of items) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock, name_ko, is_active")
          .eq("id", item.product_id)
          .single();

        if (productError || !product) {
          return res.status(400).json({
            message: `상품 정보를 찾을 수 없습니다. (상품 ID: ${item.product_id})`,
          });
        }

        if (!product.is_active) {
          return res.status(400).json({
            message: `${product.name_ko}는 현재 판매 중단된 상품입니다.`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `${product.name_ko}의 재고가 부족합니다. (요청: ${item.quantity}개, 재고: ${product.stock}개)`,
          });
        }
      }

      // 2. 재고 차감 (주문 생성 전에 미리 차감)
      for (const item of items) {
        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock: supabase.sql`stock - ${item.quantity}`,
          })
          .eq("id", item.product_id);

        if (stockError) {
          console.error("Error updating stock:", stockError);
          return res
            .status(500)
            .json({ message: "재고 업데이트 중 오류가 발생했습니다." });
        }
      }

      // 3. 주문 생성
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id,
            total_amount,
            shipping_address,
            payment_method,
            status: "payment_completed", // 결제 완료 상태로 설정
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);

        // 주문 생성 실패 시 재고 복구
        for (const item of items) {
          await supabase
            .from("products")
            .update({
              stock: supabase.sql`stock + ${item.quantity}`,
            })
            .eq("id", item.product_id);
        }

        return res
          .status(500)
          .json({ message: "주문 생성 중 오류가 발생했습니다." });
      }

      // 4. 주문 항목 추가
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        design_id: item.design_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        options: item.options,
        design_data: item.design_data,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error adding order items:", itemsError);

        // 주문 항목 추가 실패 시 재고 복구 및 주문 삭제
        for (const item of items) {
          await supabase
            .from("products")
            .update({
              stock: supabase.sql`stock + ${item.quantity}`,
            })
            .eq("id", item.product_id);
        }

        await supabase.from("orders").delete().eq("id", order.id);

        return res
          .status(500)
          .json({ message: "주문 항목 추가 중 오류가 발생했습니다." });
      }

      // Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user_id);

      res.status(201).json(order);
    } catch (error) {
      console.error("Error in orders endpoint:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get user orders
  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              id, name, name_ko, image_url, base_price
              ),
                goods_editor_designs (
                  id, title, thumbnail_url, canvas_data
            )
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Failed to fetch orders" });
      }

      res.json(orders);
    } catch (error) {
      console.error("Error in user orders endpoint:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update user profile
  app.patch("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { first_name, last_name, email, phone, address } = req.body;

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
          first_name,
          last_name,
          email,
          phone,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({ message: "Failed to update profile" });
      }

      // Remove password before sending response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error in user update endpoint:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              id, name, name_ko, image_url
              ),
                goods_editor_designs (
                  id, title, thumbnail_url, canvas_data
            )
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Failed to fetch orders" });
      }

      res.json(orders);
    } catch (error) {
      console.error("Error in orders endpoint:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { status } = req.body;

      const { data: order, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ message: "Failed to update order" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error in orders endpoint:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Review comments routes
  app.get("/api/reviews/:reviewId/comments", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const { data: comments, error } = await supabase
        .from("review_comments")
        .select(`
          *,
          users (
            id, username, first_name, last_name
          )
        `)
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching review comments:", error);
        return res.status(500).json({ message: "Failed to fetch comments" });
      }

      res.json(comments || []);
    } catch (error) {
      console.error("Error in review comments endpoint:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/reviews/:reviewId/comments", authenticateToken, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
      }

      const { data: comment, error } = await supabase
        .from("review_comments")
        .insert([{
          review_id: reviewId,
          user_id: userId,
          content: content.trim()
        }])
        .select(`
          *,
          users (
            id, username, first_name, last_name
          )
        `)
        .single();

      if (error) {
        console.error("Error creating comment:", error);
        return res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." });
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error in comment creation endpoint:", error);
      res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." });
    }
  });

  // Review likes routes
  app.get("/api/reviews/:reviewId/likes", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const { data: likes, error } = await supabase
        .from("review_likes")
        .select("user_id")
        .eq("review_id", reviewId);

      if (error) {
        console.error("Error fetching review likes:", error);
        return res.status(500).json({ message: "Failed to fetch likes" });
      }

      res.json({
        count: likes?.length || 0,
        userIds: likes?.map(like => like.user_id) || []
      });
    } catch (error) {
      console.error("Error in review likes endpoint:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.post("/api/reviews/:reviewId/like", authenticateToken, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const userId = req.user.id;

      // Check if user already liked this review
      const { data: existingLike } = await supabase
        .from("review_likes")
        .select("id")
        .eq("review_id", reviewId)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        // Unlike - remove the like
        const { error } = await supabase
          .from("review_likes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", userId);

        if (error) {
          console.error("Error removing like:", error);
          return res.status(500).json({ message: "좋아요 제거 중 오류가 발생했습니다." });
        }

        // Get updated count
        const { data: likes } = await supabase
          .from("review_likes")
          .select("user_id")
          .eq("review_id", reviewId);

        res.json({
          liked: false,
          count: likes?.length || 0,
          userIds: likes?.map(like => like.user_id) || []
        });
      } else {
        // Like - add the like
        const { error } = await supabase
          .from("review_likes")
          .insert([{
            review_id: reviewId,
            user_id: userId
          }]);

        if (error) {
          console.error("Error adding like:", error);
          return res.status(500).json({ message: "좋아요 추가 중 오류가 발생했습니다." });
        }

        // Get updated count
        const { data: likes } = await supabase
          .from("review_likes")
          .select("user_id")
          .eq("review_id", reviewId);

        res.json({
          liked: true,
          count: likes?.length || 0,
          userIds: likes?.map(like => like.user_id) || []
        });
      }
    } catch (error) {
      console.error("Error in review like endpoint:", error);
      res.status(500).json({ message: "좋아요 처리 중 오류가 발생했습니다." });
    }
  });

  // Community posts routes
  app.get("/api/community/posts", async (req, res) => {
    try {
      // First check if table exists by trying a simple query
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching community posts:", error);
        // If table doesn't exist, return sample data for demo
        if (error.code === '42P01') {
          const samplePosts = [
            {
              id: 1,
              title: "나만의 캐릭터 키링 완성!",
              content: "홀로그램 효과가 너무 예뻐요! 친구들한테도 추천했습니다.",
              description: "홀로그램 효과가 너무 예뻐요! 친구들한테도 추천했습니다.",
              image_url: "/api/placeholder/300/300",
              likes: 245,
              user_id: 1,
              username: "네기다***",
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              title: "홀로그램 스티커 대박!",
              content: "제작 퀄리티가 기대 이상이었어요. 다음에 또 만들 거예요.",
              description: "제작 퀄리티가 기대 이상이었어요. 다음에 또 만들 거예요.",
              image_url: "/api/placeholder/300/300",
              likes: 189,
              user_id: 2,
              username: "모토***",
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              title: "투명 아크릴 스탠드 후기",
              content: "각인도 선명하고 부드럽고 선물용으로 완벽합니다.",
              description: "각인도 선명하고 부드럽고 선물용으로 완벽합니다.",
              image_url: "/api/placeholder/300/300",
              likes: 167,
              user_id: 3,
              username: "짱구***",
              created_at: new Date().toISOString()
            },
            {
              id: 4,
              title: "레진 키링 DIY 성공!",
              content: "퀄리티가 정말 만족스러워요. 다시 주문할 예정입니다.",
              description: "퀄리티가 정말 만족스러워요. 다시 주문할 예정입니다.",
              image_url: "/api/placeholder/300/300",
              likes: 134,
              user_id: 1,
              username: "토루***",
              created_at: new Date().toISOString()
            },
            {
              id: 5,
              title: "내 굿즈 첫 제작 후기",
              content: "처음인데도 너무 잘 만들어져서 감동이었습니다.",
              description: "처음인데도 너무 잘 만들어져서 감동이었습니다.",
              image_url: "/api/placeholder/300/300",
              likes: 112,
              user_id: 2,
              username: "dlwlrma***",
              created_at: new Date().toISOString()
            },
            {
              id: 6,
              title: "연인 선물로 딱이에요!",
              content: "포장도 고급스럽고 퀄리티도 매우 만족합니다.",
              description: "포장도 고급스럽고 퀄리티도 매우 만족합니다.",
              image_url: "/api/placeholder/300/300",
              likes: 198,
              user_id: 3,
              username: "yeonwoo***",
              created_at: new Date().toISOString()
            }
          ];
          return res.json(samplePosts);
        }
        return res
          .status(500)
          .json({ message: "Failed to fetch community posts" });
      }

      res.json(posts || []);
    } catch (error) {
      console.error("Error in community posts endpoint:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  // Get single community post
  app.get("/api/community/posts/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { data: post, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) {
        console.error("Error fetching community post:", error);
        // If table doesn't exist, return sample post data
        if (error.code === '42P01') {
          const samplePosts = {
            1: {
              id: 1,
              title: "나만의 캐릭터 키링 완성!",
              content: "홀로그램 효과가 너무 예뻐요! 친구들한테도 추천했습니다. 배송도 빠르고 퀄리티도 만족스러워서 다음에 또 주문할 예정입니다.",
              description: "홀로그램 효과가 너무 예뻐요! 친구들한테도 추천했습니다.",
              image_url: "/api/placeholder/300/300",
              likes: 245,
              user_id: 1,
              username: "네기다***",
              created_at: new Date().toISOString()
            },
            2: {
              id: 2,
              title: "홀로그램 스티커 대박!",
              content: "제작 퀄리티가 기대 이상이었어요. 다음에 또 만들 거예요. 색감도 선명하고 접착력도 좋아서 정말 만족합니다.",
              description: "제작 퀄리티가 기대 이상이었어요. 다음에 또 만들 거예요.",
              image_url: "/api/placeholder/300/300",
              likes: 189,
              user_id: 2,
              username: "모토***",
              created_at: new Date().toISOString()
            },
            3: {
              id: 3,
              title: "투명 아크릴 스탠드 후기",
              content: "각인도 선명하고 부드럽고 선물용으로 완벽합니다. 받는 사람도 너무 좋아해서 뿌듯했어요.",
              description: "각인도 선명하고 부드럽고 선물용으로 완벽합니다.",
              image_url: "/api/placeholder/300/300",
              likes: 167,
              user_id: 3,
              username: "짱구***",
              created_at: new Date().toISOString()
            },
            4: {
              id: 4,
              title: "레진 키링 DIY 성공!",
              content: "퀄리티가 정말 만족스러워요. 다시 주문할 예정입니다. 처음 만들어봤는데 생각보다 결과물이 좋아서 놀랐습니다.",
              description: "퀄리티가 정말 만족스러워요. 다시 주문할 예정입니다.",
              image_url: "/api/placeholder/300/300",
              likes: 134,
              user_id: 1,
              username: "토루***",
              created_at: new Date().toISOString()
            },
            5: {
              id: 5,
              title: "내 굿즈 첫 제작 후기",
              content: "처음인데도 너무 잘 만들어져서 감동이었습니다. 디자인 상담도 친절하게 해주셔서 감사했어요.",
              description: "처음인데도 너무 잘 만들어져서 감동이었습니다.",
              image_url: "/api/placeholder/300/300",
              likes: 112,
              user_id: 2,
              username: "dlwlrma***",
              created_at: new Date().toISOString()
            },
            6: {
              id: 6,
              title: "연인 선물로 딱이에요!",
              content: "포장도 고급스럽고 퀄리티도 매우 만족합니다. 특별한 날 선물로 정말 추천드려요.",
              description: "포장도 고급스럽고 퀄리티도 매우 만족합니다.",
              image_url: "/api/placeholder/300/300",
              likes: 198,
              user_id: 3,
              username: "yeonwoo***",
              created_at: new Date().toISOString()
            }
          };
          
          const samplePost = samplePosts[postId];
          if (samplePost) {
            return res.json(samplePost);
          }
        }
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error in community post endpoint:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Community post comments routes
  app.get("/api/community/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { data: comments, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching community comments:", error);
        // Return sample comments if table doesn't exist
        if (error.code === '42P01' || error.code === 'PGRST200') {
          const sampleComments = {
            1: [
              { id: 1, user_id: 2, comment: "정말 예쁘게 나왔네요! 저도 만들어보고 싶어요.", created_at: new Date().toISOString(), username: "모토***" },
              { id: 2, user_id: 3, comment: "홀로그램 효과가 진짜 좋네요. 어디서 제작하셨나요?", created_at: new Date().toISOString(), username: "짱구***" },
              { id: 3, user_id: 1, comment: "감사합니다! 다음에 다른 디자인으로도 만들어볼게요.", created_at: new Date().toISOString(), username: "네기다***" }
            ],
            2: [
              { id: 4, user_id: 1, comment: "스티커 퀄리티가 정말 좋아보여요!", created_at: new Date().toISOString(), username: "네기다***" },
              { id: 5, user_id: 3, comment: "저도 홀로그램 스티커 주문하려고 하는데 팁 있나요?", created_at: new Date().toISOString(), username: "짱구***" }
            ],
            3: [
              { id: 6, user_id: 2, comment: "투명 아크릴 정말 깔끔하네요. 선물로 딱일 것 같아요.", created_at: new Date().toISOString(), username: "모토***" }
            ]
          };
          
          return res.json(sampleComments[postId] || []);
        }
        return res.status(500).json({ message: "Failed to fetch comments" });
      }

      res.json(comments || []);
    } catch (error) {
      console.error("Error in community comments endpoint:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/community/posts/:postId/comments", authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
      }

      const { data: comment, error } = await supabase
        .from("community_comments")
        .insert([{
          post_id: postId,
          user_id: userId,
          comment: content.trim()
        }])
        .select(`
          *,
          users (
            id, username, first_name, last_name
          )
        `)
        .single();

      if (error) {
        console.error("Error creating community comment:", error);
        return res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." });
      }

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error in community comment creation endpoint:", error);
      res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." });
    }
  });

  // Community post likes routes
  app.get("/api/community/posts/:postId/likes", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { data: likes, error } = await supabase
        .from("community_likes")
        .select("user_id")
        .eq("post_id", postId);

      if (error) {
        console.error("Error fetching community likes:", error);
        return res.status(500).json({ message: "Failed to fetch likes" });
      }

      res.json({
        count: likes?.length || 0,
        userIds: likes?.map(like => like.user_id) || []
      });
    } catch (error) {
      console.error("Error in community likes endpoint:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.post("/api/community/posts/:postId/like", authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const userId = req.user.id;

      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from("community_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        // Unlike - remove the like
        const { error } = await supabase
          .from("community_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) {
          console.error("Error removing community like:", error);
          return res.status(500).json({ message: "좋아요 제거 중 오류가 발생했습니다." });
        }

        // Get updated count
        const { data: likes } = await supabase
          .from("community_likes")
          .select("user_id")
          .eq("post_id", postId);

        res.json({
          liked: false,
          count: likes?.length || 0,
          userIds: likes?.map(like => like.user_id) || []
        });
      } else {
        // Like - add the like
        const { error } = await supabase
          .from("community_likes")
          .insert([{
            post_id: postId,
            user_id: userId
          }]);

        if (error) {
          console.error("Error adding community like:", error);
          return res.status(500).json({ message: "좋아요 추가 중 오류가 발생했습니다." });
        }

        // Get updated count
        const { data: likes } = await supabase
          .from("community_likes")
          .select("user_id")
          .eq("post_id", postId);

        res.json({
          liked: true,
          count: likes?.length || 0,
          userIds: likes?.map(like => like.user_id) || []
        });
      }
    } catch (error) {
      console.error("Error in community like endpoint:", error);
      res.status(500).json({ message: "좋아요 처리 중 오류가 발생했습니다." });
    }
  });

  // User's community posts
  app.get("/api/community/posts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user posts:", error);
        return res.status(500).json({ message: "Failed to fetch user posts" });
      }

      res.json(posts);
    } catch (error) {
      console.error("Error in user posts endpoint:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // User's favorites
  app.get("/api/favorites/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: favorites, error } = await supabase
        .from("favorites")
        .select(
          `
          *,
          products (
            id, name, name_ko, base_price, image_url, category_id
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user favorites:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch user favorites" });
      }

      res.json(favorites);
    } catch (error) {
      console.error("Error in user favorites endpoint:", error);
      res.status(500).json({ message: "Failed to fetch user favorites" });
    }
  });

  // User's orders
  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              id, name, name_ko, image_url
              ),
                goods_editor_designs (
                  id, title, thumbnail_url, canvas_data
            )
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Failed to fetch user orders" });
      }

      res.json(orders);
    } catch (error) {
      console.error("Error in user orders endpoint:", error);
      res.status(500).json({ message: "Failed to fetch user orders" });
    }
  });

  // Product images
  app.get("/api/products/:productId/images", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const { data: images, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order");

      if (error) {
        console.error("Error fetching product images:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch product images" });
      }

      res.json(images);
    } catch (error) {
      console.error("Error in product images endpoint:", error);
      res.status(500).json({ message: "Failed to fetch product images" });
    }
  });

  // Product reviews
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const { data: reviews, error } = await supabase
        .from("product_reviews")
        .select(
          `
          *,
          users (
            username
          )
        `,
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching product reviews:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch product reviews" });
      }

      res.json(reviews);
    } catch (error) {
      console.error("Error in product reviews endpoint:", error);
      res.status(500).json({ message: "Failed to fetch product reviews" });
    }
  });

  // Toggle favorite
  app.post("/api/favorites/toggle", async (req, res) => {
    try {
      const { user_id, product_id } = req.body;

      // Check if favorite exists
      const { data: existing, error: checkError } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking favorite:", checkError);
        return res
          .status(500)
          .json({ message: "Failed to check favorite status" });
      }

      if (existing) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user_id)
          .eq("product_id", product_id);

        if (deleteError) {
          console.error("Error removing favorite:", deleteError);
          return res.status(500).json({ message: "Failed to remove favorite" });
        }

        res.json({ isFavorite: false });
      } else {
        // Add favorite
        const { error: insertError } = await supabase
          .from("favorites")
          .insert([{ user_id, product_id }]);

        if (insertError) {
          console.error("Error adding favorite:", insertError);
          return res.status(500).json({ message: "Failed to add favorite" });
        }

        res.json({ isFavorite: true });
      }
    } catch (error) {
      console.error("Error in toggle favorite endpoint:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // Add to cart
  app.post("/api/cart/add", async (req, res) => {
    try {
      const { user_id, product_id, quantity, customization } = req.body;

      // Check if item already exists in cart
      const { data: existing, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking cart item:", checkError);
        return res.status(500).json({ message: "Failed to check cart item" });
      }

      if (existing) {
        // Update quantity
        const { data: updated, error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: existing.quantity + quantity,
            customization: customization || existing.customization,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating cart item:", updateError);
          return res
            .status(500)
            .json({ message: "Failed to update cart item" });
        }

        res.json(updated);
      } else {
        // Add new item
        const { data: newItem, error: insertError } = await supabase
          .from("cart_items")
          .insert([{ user_id, product_id, quantity, customization }])
          .select()
          .single();

        if (insertError) {
          console.error("Error adding to cart:", insertError);
          return res.status(500).json({ message: "Failed to add to cart" });
        }

        res.json(newItem);
      }
    } catch (error) {
      console.error("Error in add to cart endpoint:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.get("/api/community/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { data: post, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error in community post endpoint:", error);
      res.status(500).json({ message: "Failed to fetch community post" });
    }
  });

  // Design shares routes
  app.get("/api/design-shares", async (req, res) => {
    try {
      const { data: designs, error } = await supabase
        .from("design_shares")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching design shares:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch design shares" });
      }

      res.json(designs);
    } catch (error) {
      console.error("Error in design shares endpoint:", error);
      res.status(500).json({ message: "Failed to fetch design shares" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        return res.status(500).json({ message: "Failed to fetch events" });
      }

      res.json(events);
    } catch (error) {
      console.error("Error in events endpoint:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Resources routes
  app.get("/api/resources", async (req, res) => {
    try {
      const { data: resources, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching resources:", error);
        return res.status(500).json({ message: "Failed to fetch resources" });
      }

      res.json(resources);
    } catch (error) {
      console.error("Error in resources endpoint:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Q&A routes
  app.get("/api/qna", async (req, res) => {
    try {
      const { data: qnaPosts, error } = await supabase
        .from("qna_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching Q&A posts:", error);
        return res.status(500).json({ message: "Failed to fetch Q&A posts" });
      }

      res.json(qnaPosts);
    } catch (error) {
      console.error("Error in Q&A endpoint:", error);
      res.status(500).json({ message: "Failed to fetch Q&A posts" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch notifications" });
      }

      res.json(notifications);
    } catch (error) {
      console.error("Error in notifications endpoint:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const { data: notification, error } = await supabase
        .from("notifications")
        .insert([validatedData])
        .select()
        .single();

      if (error) {
        console.error("Error creating notification:", error);
        return res
          .status(500)
          .json({ message: "Failed to create notification" });
      }

      res.json(notification);
    } catch (error) {
      console.error("Error in create notification endpoint:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { data: notification, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error marking notification as read:", error);
        return res
          .status(500)
          .json({ message: "Failed to mark notification as read" });
      }

      res.json(notification);
    } catch (error) {
      console.error("Error in mark notification as read endpoint:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/user/:userId/read-all", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data: notifications, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)
        .select();

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return res
          .status(500)
          .json({ message: "Failed to mark all notifications as read" });
      }

      res.json(notifications);
    } catch (error) {
      console.error("Error in mark all notifications as read endpoint:", error);
      res
        .status(500)
        .json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      // Use memory storage for categories since we have data there
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error in categories endpoint:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { data: category, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching category:", error);
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error in category endpoint:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured, search } = req.query;

      // Use memory storage for products since we have data there
      let products = await storage.getProducts();

      // Apply filters
      if (category) {
        const categoryId = parseInt(category as string);
        products = products.filter(
          (product) => product.categoryId === categoryId,
        );
      }

      if (featured === "true") {
        products = products.filter((product) => product.isFeatured);
      }

      // Search filtering
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.nameKo.toLowerCase().includes(searchTerm) ||
            (product.description &&
              product.description.toLowerCase().includes(searchTerm)) ||
            (product.descriptionKo &&
              product.descriptionKo.toLowerCase().includes(searchTerm)),
        );
      }

      // Add stock and review information
      const productsWithStock = products.map((product) => ({
        ...product,
        reviewCount: 0,
        likeCount: 0,
        isOutOfStock: product.stock <= 0,
        isLowStock: product.stock > 0 && product.stock <= 5,
      }));

      res.json(productsWithStock);
    } catch (error) {
      console.error("Error in products endpoint:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Single product by ID
  app.get("/api/product/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Add stock and review information
      const productWithStock = {
        ...product,
        reviewCount: 0,
        likeCount: 0,
        isOutOfStock: product.stock <= 0,
        isLowStock: product.stock > 0 && product.stock <= 5,
      };

      res.json(productWithStock);
    } catch (error) {
      console.error("Error in single product endpoint:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Seller products management
  app.get("/api/seller/products", authenticateToken, async (req: any, res) => {
    try {
      // Get seller info
      const { data: seller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!seller) {
        return res.status(403).json({ message: "판매자 권한이 없습니다." });
      }

      const { data: products, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id, name, name_ko
          )
        `,
        )
        .eq("seller_id", seller.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching seller products:", error);
        return res
          .status(500)
          .json({ message: "상품 목록을 가져오는데 실패했습니다." });
      }

      res.json(products);
    } catch (error) {
      console.error("Error in seller products endpoint:", error);
      res.status(500).json({ message: "상품 목록을 가져오는데 실패했습니다." });
    }
  });

  // Add new product
  app.post("/api/seller/products", authenticateToken, async (req: any, res) => {
    try {
      // Get seller info
      const { data: seller } = await supabase
        .from("sellers")
        .select("id, is_approved")
        .eq("user_id", req.user.id)
        .single();

      if (!seller) {
        return res.status(403).json({ message: "판매자 권한이 없습니다." });
      }

      if (!seller.is_approved) {
        return res.status(403).json({ message: "판매자 승인이 필요합니다." });
      }

      const {
        name,
        nameKo,
        description,
        descriptionKo,
        basePrice,
        categoryId,
        imageUrl,
        stock,
        customizationOptions,
      } = req.body;

      const { data: product, error } = await supabase
        .from("products")
        .insert([
          {
            name,
            name_ko: nameKo,
            description,
            description_ko: descriptionKo,
            base_price: basePrice,
            category_id: categoryId,
            seller_id: seller.id,
            image_url: imageUrl,
            stock,
            customization_options: customizationOptions,
            is_active: true,
            is_approved: false, // 관리자 승인 대기
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "상품 등록에 실패했습니다." });
      }

      res.status(201).json(product);
    } catch (error) {
      console.error("Error in add product endpoint:", error);
      res.status(500).json({ message: "상품 등록에 실패했습니다." });
    }
  });

  // Update product
  app.put(
    "/api/seller/products/:productId",
    authenticateToken,
    async (req: any, res) => {
      try {
        const { productId } = req.params;

        // Get seller info
        const { data: seller } = await supabase
          .from("sellers")
          .select("id")
          .eq("user_id", req.user.id)
          .single();

        if (!seller) {
          return res.status(403).json({ message: "판매자 권한이 없습니다." });
        }

        // Check if product belongs to seller
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("id", productId)
          .eq("seller_id", seller.id)
          .single();

        if (!existingProduct) {
          return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
        }

        const {
          name,
          nameKo,
          description,
          descriptionKo,
          basePrice,
          categoryId,
          imageUrl,
          stock,
          options,
        } = req.body;

        const { data: product, error } = await supabase
          .from("products")
          .update({
            name,
            name_ko: nameKo,
            description,
            description_ko: descriptionKo,
            base_price: basePrice,
            category_id: categoryId,
            image_url: imageUrl,
            stock,
            options,
            is_approved: false, // 수정 시 재승인 필요
            status: "pending",
          })
          .eq("id", productId)
          .select()
          .single();

        if (error) {
          console.error("Error updating product:", error);
          return res.status(500).json({ message: "상품 수정에 실패했습니다." });
        }

        res.json(product);
      } catch (error) {
        console.error("Error in update product endpoint:", error);
        res.status(500).json({ message: "상품 수정에 실패했습니다." });
      }
    },
  );

  // Delete product (soft delete)
  app.delete(
    "/api/seller/products/:productId",
    authenticateToken,
    async (req: any, res) => {
      try {
        const { productId } = req.params;

        // Get seller info
        const { data: seller } = await supabase
          .from("sellers")
          .select("id")
          .eq("user_id", req.user.id)
          .single();

        if (!seller) {
          return res.status(403).json({ message: "판매자 권한이 없습니다." });
        }

        // Check if product belongs to seller
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("id", productId)
          .eq("seller_id", seller.id)
          .single();

        if (!existingProduct) {
          return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
        }

        const { error } = await supabase
          .from("products")
          .update({ is_active: false })
          .eq("id", productId);

        if (error) {
          console.error("Error deleting product:", error);
          return res.status(500).json({ message: "상품 삭제에 실패했습니다." });
        }

        res.json({ message: "상품이 삭제되었습니다." });
      } catch (error) {
        console.error("Error in delete product endpoint:", error);
        res.status(500).json({ message: "상품 삭제에 실패했습니다." });
      }
    },
  );

  // Get seller orders
  app.get("/api/seller/orders", authenticateToken, async (req: any, res) => {
    try {
      // Get seller info
      const { data: seller } = await supabase
        .from("sellers")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!seller) {
        return res.status(403).json({ message: "판매자 권한이 없습니다." });
      }

      // Get orders containing seller's products
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          users (
            id, username, email
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching seller orders:", error);
        return res
          .status(500)
          .json({ message: "주문 목록을 가져오는데 실패했습니다." });
      }

      // Filter orders that contain seller's products
      const sellerOrders = orders.filter((order) => {
        if (!order.order_items || !Array.isArray(order.order_items))
          return false;
        return order.order_items.some(
          (item: any) => item.sellerId === seller.id,
        );
      });

      res.json(sellerOrders);
    } catch (error) {
      console.error("Error in seller orders endpoint:", error);
      res.status(500).json({ message: "주문 목록을 가져오는데 실패했습니다." });
    }
  });

  // Update order status (seller)
  app.put(
    "/api/seller/orders/:orderId/status",
    authenticateToken,
    async (req: any, res) => {
      try {
        const { orderId } = req.params;
        const { status, trackingNumber, shippingCompanyId } = req.body;

        // Get seller info
        const { data: seller } = await supabase
          .from("sellers")
          .select("id")
          .eq("user_id", req.user.id)
          .single();

        if (!seller) {
          return res.status(403).json({ message: "판매자 권한이 없습니다." });
        }

        const updateData: any = { status };

        if (trackingNumber) {
          updateData.tracking_number = trackingNumber;
        }

        if (shippingCompanyId) {
          updateData.shipping_company_id = shippingCompanyId;
        }

        if (status === "shipping") {
          updateData.shipped_at = new Date().toISOString();
        }

        const { data: order, error } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", orderId)
          .select()
          .single();

        if (error) {
          console.error("Error updating order status:", error);
          return res
            .status(500)
            .json({ message: "주문 상태 업데이트에 실패했습니다." });
        }

        res.json(order);
      } catch (error) {
        console.error("Error in update order status endpoint:", error);
        res.status(500).json({ message: "주문 상태 업데이트에 실패했습니다." });
      }
    },
  );

  // Get shipping companies
  app.get("/api/shipping-companies", async (req, res) => {
    try {
      const { data: companies, error } = await supabase
        .from("shipping_companies")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching shipping companies:", error);
        return res
          .status(500)
          .json({ message: "배송업체 목록을 가져오는데 실패했습니다." });
      }

      res.json(companies);
    } catch (error) {
      console.error("Error in shipping companies endpoint:", error);
      res
        .status(500)
        .json({ message: "배송업체 목록을 가져오는데 실패했습니다." });
    }
  });

  // Get seller profile
  app.get("/api/seller/profile", authenticateToken, async (req: any, res) => {
    try {
      const { data: seller, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("user_id", req.user.id)
        .single();

      if (error || !seller) {
        return res
          .status(404)
          .json({ message: "판매자 정보를 찾을 수 없습니다." });
      }

      res.json(seller);
    } catch (error) {
      console.error("Error in seller profile endpoint:", error);
      res
        .status(500)
        .json({ message: "판매자 정보를 가져오는데 실패했습니다." });
    }
  });

  // Update seller profile
  app.put("/api/seller/profile", authenticateToken, async (req: any, res) => {
    try {
      const {
        shopName,
        businessNumber,
        contactEmail,
        contactPhone,
        address,
        bankAccount,
        bankName,
      } = req.body;

      const { data: seller, error } = await supabase
        .from("sellers")
        .update({
          shop_name: shopName,
          business_number: businessNumber,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address,
          bank_account: bankAccount,
          bank_name: bankName,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", req.user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating seller profile:", error);
        return res
          .status(500)
          .json({ message: "판매자 정보 수정에 실패했습니다." });
      }

      res.json(seller);
    } catch (error) {
      console.error("Error in update seller profile endpoint:", error);
      res.status(500).json({ message: "판매자 정보 수정에 실패했습니다." });
    }
  });

  // Admin routes - 관리자 전용 API

  // Get all products for admin (including inactive and unapproved)
  app.get("/api/admin/products", authenticateToken, async (req: any, res) => {
    try {
      // Check admin permissions - allow 'admin' username or isAdmin flag
      const isAdmin =
        req.user.isAdmin === true || req.user.username === "admin";
      if (!isAdmin) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching admin products:", error);
        return res
          .status(500)
          .json({ message: "상품 목록을 가져오는데 실패했습니다." });
      }

      res.json(products);
    } catch (error) {
      console.error("Error in admin products endpoint:", error);
      res.status(500).json({ message: "상품 목록을 가져오는데 실패했습니다." });
    }
  });

  // Approve/reject product
  app.put(
    "/api/admin/products/:productId/approve",
    authenticateToken,
    async (req: any, res) => {
      try {
        // Check admin permissions
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { productId } = req.params;
        const { approved } = req.body;

        const status = approved ? "approved" : "rejected";
        const updateData: any = { is_approved: approved, status };
        if (approved) {
          updateData.approval_date = new Date().toISOString();
        } else {
          updateData.approval_date = null;
        }

        const { data: product, error } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", productId)
          .select()
          .single();

        if (error) {
          console.error("Error updating product approval:", error);
          return res
            .status(500)
            .json({ message: "상품 승인 상태 변경에 실패했습니다." });
        }

        res.json(product);
      } catch (error) {
        console.error("Error in product approval endpoint:", error);
        res
          .status(500)
          .json({ message: "상품 승인 상태 변경에 실패했습니다." });
      }
    },
  );

  // Update product status (active/inactive)
  app.put(
    "/api/admin/products/:productId/status",
    authenticateToken,
    async (req: any, res) => {
      try {
        // Check admin permissions
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { productId } = req.params;
        const { is_active } = req.body;

        const { data: product, error } = await supabase
          .from("products")
          .update({ is_active })
          .eq("id", productId)
          .select()
          .single();

        if (error) {
          console.error("Error updating product status:", error);
          return res
            .status(500)
            .json({ message: "상품 상태 변경에 실패했습니다." });
        }

        res.json(product);
      } catch (error) {
        console.error("Error in product status endpoint:", error);
        res.status(500).json({ message: "상품 상태 변경에 실패했습니다." });
      }
    },
  );

  // Delete product (admin)
  app.delete(
    "/api/admin/products/:productId",
    authenticateToken,
    async (req: any, res) => {
      try {
        // Check admin permissions
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { productId } = req.params;

        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) {
          console.error("Error deleting product:", error);
          return res.status(500).json({ message: "상품 삭제에 실패했습니다." });
        }

        res.json({ message: "상품이 삭제되었습니다." });
      } catch (error) {
        console.error("Error in product delete endpoint:", error);
        res.status(500).json({ message: "상품 삭제에 실패했습니다." });
      }
    },
  );

  // Get all sellers for admin
  app.get("/api/admin/sellers", authenticateToken, async (req: any, res) => {
    try {
      // Check admin permissions
      const isAdmin =
        req.user.isAdmin === true || req.user.username === "admin";
      if (!isAdmin) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const { data: sellers, error } = await supabase
        .from("sellers")
        .select(
          `
          *,
          users (
            id, username, email, created_at
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sellers:", error);
        return res
          .status(500)
          .json({ message: "판매자 목록을 가져오는데 실패했습니다." });
      }

      res.json(sellers);
    } catch (error) {
      console.error("Error in admin sellers endpoint:", error);
      res
        .status(500)
        .json({ message: "판매자 목록을 가져오는데 실패했습니다." });
    }
  });

  // Approve/reject seller
  app.put(
    "/api/admin/sellers/:sellerId/approve",
    authenticateToken,
    async (req: any, res) => {
      try {
        // Check admin permissions
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { sellerId } = req.params;
        const { approved } = req.body;

        const status = approved ? "approved" : "rejected";
        const updateData: any = { is_approved: approved, status };

        if (approved) {
          updateData.approved_at = new Date().toISOString();
        }

        const { data: seller, error } = await supabase
          .from("sellers")
          .update(updateData)
          .eq("id", sellerId)
          .select()
          .single();

        if (error) {
          console.error("Error updating seller approval:", error);
          return res
            .status(500)
            .json({ message: "판매자 승인 상태 변경에 실패했습니다." });
        }

        res.json(seller);
      } catch (error) {
        console.error("Error in seller approval endpoint:", error);
        res
          .status(500)
          .json({ message: "판매자 승인 상태 변경에 실패했습니다." });
      }
    },
  );

  // Get all orders for admin
  app.get("/api/admin/orders", authenticateToken, async (req: any, res) => {
    try {
      // Check admin permissions
      const isAdmin =
        req.user.isAdmin === true || req.user.username === "admin";
      if (!isAdmin) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          users (
            id, username, email
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching admin orders:", error);
        return res
          .status(500)
          .json({ message: "주문 목록을 가져오는데 실패했습니다." });
      }

      res.json(orders);
    } catch (error) {
      console.error("Error in admin orders endpoint:", error);
      res.status(500).json({ message: "주문 목록을 가져오는데 실패했습니다." });
    }
  });

  // Get site statistics for admin dashboard
  app.get("/api/admin/stats", authenticateToken, async (req: any, res) => {
    try {
      // Check admin permissions - allow 'admin' username or isAdmin flag
      const isAdmin =
        req.user.isAdmin === true || req.user.username === "admin";
      if (!isAdmin) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      // Get various counts
      const [
        { count: totalProducts },
        { count: totalUsers },
        { count: totalOrders },
        { count: totalSellers },
        { count: pendingProducts },
        { count: pendingSellers },
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*", { count: "exact" })
          .eq("status", "pending")
          .then(({ count }) => ({ count: count || 0 })),
        supabase
          .from("users")
          .select("*", { count: "exact" })
          .then(({ count }) => ({ count: count || 0 })),
        supabase
          .from("orders")
          .select("*", { count: "exact" })
          .then(({ count }) => ({ count: count || 0 })),
        supabase
          .from("sellers")
          .select("*", { count: "exact" })
          .then(({ count }) => ({ count: count || 0 })),
        supabase
          .from("products")
          .select("*", { count: "exact" })
          .eq("is_approved", false)
          .then(({ count }) => ({ count: count || 0 })),
        supabase
          .from("sellers")
          .select("*", { count: "exact" })
          .eq("is_approved", false)
          .then(({ count }) => ({ count: count || 0 })),
      ]);

      // Calculate total revenue
      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("status", "completed");

      const totalRevenue =
        orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      res.json({
        totalProducts,
        totalUsers,
        totalOrders,
        totalSellers,
        pendingProducts,
        pendingSellers,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error in admin stats endpoint:", error);
      res.status(500).json({ message: "통계 정보를 가져오는데 실패했습니다." });
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", authenticateToken, async (req: any, res) => {
    try {
      const isAdmin =
        req.user.isAdmin === true || req.user.username === "admin";
      if (!isAdmin) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        return res
          .status(500)
          .json({ message: "사용자 목록을 가져오는데 실패했습니다." });
      }

      // Admin flag 추가 (admin 사용자명인 경우 true로 설정)
      const usersWithAdminFlag = users.map((user) => ({
        ...user,
        isAdmin: user.username === "admin",
      }));

      res.json(usersWithAdminFlag);
    } catch (error) {
      console.error("Error in admin users endpoint:", error);
      res
        .status(500)
        .json({ message: "사용자 목록을 가져오는데 실패했습니다." });
    }
  });

  // Update user role (admin/user)
  app.put(
    "/api/admin/users/:userId/role",
    authenticateToken,
    async (req: any, res) => {
      try {
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { userId } = req.params;
        const { isAdmin: newIsAdminStatus } = req.body;

        const { data: user, error } = await supabase
          .from("users")
          .update({ is_admin: newIsAdminStatus })
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          console.error("Error updating user role:", error);
          return res
            .status(500)
            .json({ message: "사용자 권한 변경에 실패했습니다." });
        }

        res.json(user);
      } catch (error) {
        console.error("Error in user role endpoint:", error);
        res.status(500).json({ message: "사용자 권한 변경에 실패했습니다." });
      }
    },
  );

  // Get all reviews for admin
  app.get("/api/admin/reviews", authenticateToken, async (req: any, res) => {
    try {
      const isAdmin =
        req.user.isAdmin === true || req.user.username === "admin";
      if (!isAdmin) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const { data: reviews, error } = await supabase
        .from("product_reviews")
        .select(
          `
          *,
          users (
            id, username, email
          ),
          products (
            id, name, name_ko, image_url
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching admin reviews:", error);
        return res
          .status(500)
          .json({ message: "리뷰 목록을 가져오는데 실패했습니다." });
      }

      res.json(reviews);
    } catch (error) {
      console.error("Error in admin reviews endpoint:", error);
      res.status(500).json({ message: "리뷰 목록을 가져오는데 실패했습니다." });
    }
  });

  // Delete review (admin)
  app.delete(
    "/api/admin/reviews/:reviewId",
    authenticateToken,
    async (req: any, res) => {
      try {
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { reviewId } = req.params;

        const { error } = await supabase
          .from("product_reviews")
          .delete()
          .eq("id", reviewId);

        if (error) {
          console.error("Error deleting review:", error);
          return res.status(500).json({ message: "리뷰 삭제에 실패했습니다." });
        }

        res.json({ message: "리뷰가 삭제되었습니다." });
      } catch (error) {
        console.error("Error in review delete endpoint:", error);
        res.status(500).json({ message: "리뷰 삭제에 실패했습니다." });
      }
    },
  );

  // Create category (admin)
  app.post(
    "/api/admin/categories",
    authenticateToken,
    async (req: any, res) => {
      try {
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { name, name_ko } = req.body;

        const { data: category, error } = await supabase
          .from("categories")
          .insert([{ name, name_ko }])
          .select()
          .single();

        if (error) {
          console.error("Error creating category:", error);
          return res
            .status(500)
            .json({ message: "카테고리 생성에 실패했습니다." });
        }

        res.json(category);
      } catch (error) {
        console.error("Error in category create endpoint:", error);
        res.status(500).json({ message: "카테고리 생성에 실패했습니다." });
      }
    },
  );

  // Update category (admin)
  app.put(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    async (req: any, res) => {
      try {
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { categoryId } = req.params;
        const { name, name_ko } = req.body;

        const { data: category, error } = await supabase
          .from("categories")
          .update({ name, name_ko })
          .eq("id", categoryId)
          .select()
          .single();

        if (error) {
          console.error("Error updating category:", error);
          return res
            .status(500)
            .json({ message: "카테고리 수정에 실패했습니다." });
        }

        res.json(category);
      } catch (error) {
        console.error("Error in category update endpoint:", error);
        res.status(500).json({ message: "카테고리 수정에 실패했습니다." });
      }
    },
  );

  // Delete category (admin)
  app.delete(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    async (req: any, res) => {
      try {
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { categoryId } = req.params;

        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", categoryId);

        if (error) {
          console.error("Error deleting category:", error);
          return res
            .status(500)
            .json({ message: "카테고리 삭제에 실패했습니다." });
        }

        res.json({ message: "카테고리가 삭제되었습니다." });
      } catch (error) {
        console.error("Error in category delete endpoint:", error);
        res.status(500).json({ message: "카테고리 삭제에 실패했습니다." });
      }
    },
  );

  // Broadcast notification to all users (admin)
  app.post(
    "/api/admin/notifications/broadcast",
    authenticateToken,
    async (req: any, res) => {
      try {
        const isAdmin =
          req.user.isAdmin === true || req.user.username === "admin";
        if (!isAdmin) {
          return res.status(403).json({ message: "관리자 권한이 필요합니다." });
        }

        const { title, message, type = "announcement" } = req.body;

        // Get all user IDs
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id");

        if (usersError) {
          console.error("Error fetching users for notification:", usersError);
          return res.status(500).json({ message: "알림 발송에 실패했습니다." });
        }

        // Create notifications for all users
        const notifications = users.map((user) => ({
          user_id: user.id,
          title,
          message,
          type,
          is_read: false,
        }));

        const { error } = await supabase
          .from("notifications")
          .insert(notifications);

        if (error) {
          console.error("Error broadcasting notification:", error);
          return res.status(500).json({ message: "알림 발송에 실패했습니다." });
        }

        res.json({
          message: `${users.length}명의 사용자에게 알림을 발송했습니다.`,
        });
      } catch (error) {
        console.error("Error in notification broadcast endpoint:", error);
        res.status(500).json({ message: "알림 발송에 실패했습니다." });
      }
    },
  );

  // Search products endpoint
  app.get("/api/products/search", async (req, res) => {
    try {
      const { q, category, priceRange, sortBy } = req.query;

      let products = await storage.getProducts();

      // Text search
      if (q) {
        const searchTerm = (q as string).toLowerCase();
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.nameKo.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (product.tags &&
              product.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm),
              )),
        );
      }

      // Category filter
      if (category && category !== "all") {
        products = products.filter(
          (product) => product.categoryId.toString() === category,
        );
      }

      // Price range filter
      if (priceRange && priceRange !== "all") {
        products = products.filter((product) => {
          const price = product.price;
          switch (priceRange) {
            case "under10":
              return price < 10000;
            case "10to30":
              return price >= 10000 && price < 30000;
            case "30to50":
              return price >= 30000 && price < 50000;
            case "over50":
              return price >= 50000;
            default:
              return true;
          }
        });
      }

      // Sorting
      if (sortBy) {
        products.sort((a, b) => {
          switch (sortBy) {
            case "latest":
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            case "oldest":
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            case "priceLow":
              return a.price - b.price;
            case "priceHigh":
              return b.price - a.price;
            case "name":
              return a.nameKo.localeCompare(b.nameKo);
            case "popular":
              return (b.reviews || 0) - (a.reviews || 0);
            default:
              return 0;
          }
        });
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error || !product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Admin Product Management (connected to database)
  app.post("/api/products", async (req, res) => {
    try {
      const productData = req.body;
      const { data: product, error } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Failed to create product" });
      }

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      const { data: product, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Failed to update product" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Product Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviewData = insertProductReviewSchema.parse({
        ...req.body,
        productId,
      });
      const review = await storage.createProductReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Product Likes
  app.post("/api/products/:id/like", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Check if already liked
      const isLiked = await storage.isProductLiked(productId, userId);
      if (isLiked) {
        return res.status(400).json({ message: "Product already liked" });
      }

      const like = await storage.likeProduct(productId, userId);
      res.status(201).json(like);
    } catch (error) {
      res.status(500).json({ message: "Failed to like product" });
    }
  });

  app.delete("/api/products/:id/like", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const success = await storage.unlikeProduct(productId, userId);
      if (!success) {
        return res.status(404).json({ message: "Like not found" });
      }

      res.json({ message: "Product unliked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike product" });
    }
  });

  app.get("/api/products/:id/liked", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const isLiked = await storage.isProductLiked(
        productId,
        parseInt(userId as string),
      );
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  // User Authentication
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Cart
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Cart item removed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Orders
  app.get("/api/orders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  // Community
  app.get("/api/community/posts", async (req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.get("/api/community/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const result = await storage.db.execute(
        `SELECT p.*, u.username, u.first_name, u.last_name 
         FROM community_posts p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = ?`,
        [postId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Comments
  app.get("/api/community/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const result = await storage.db.execute(
        `SELECT c.*, u.username, u.first_name, u.last_name 
         FROM community_comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.post_id = ? 
         ORDER BY c.created_at DESC`,
        [postId],
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/community/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const { user_id, comment } = req.body;

      if (!user_id || !comment) {
        return res
          .status(400)
          .json({ message: "User ID and comment are required" });
      }

      // Create the comment
      const result = await storage.db.execute(
        "INSERT INTO community_comments (post_id, user_id, comment) VALUES (?, ?, ?) RETURNING *",
        [postId, user_id, comment],
      );

      // Get the comment with user info
      const commentWithUser = await storage.db.execute(
        `SELECT c.*, u.username, u.first_name, u.last_name 
         FROM community_comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.id = ?`,
        [result.rows[0].id],
      );

      // Get post details and create notification for post author
      const postResult = await storage.db.execute(
        "SELECT p.*, u.username as author_username FROM community_posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?",
        [postId],
      );

      const commenterResult = await storage.db.execute(
        "SELECT username FROM users WHERE id = ?",
        [user_id],
      );

      if (postResult.rows.length > 0 && commenterResult.rows.length > 0) {
        const post = postResult.rows[0] as any;
        const commenter = commenterResult.rows[0] as any;

        // Don't notify if user is commenting on their own post
        if (post.user_id !== user_id) {
          await storage.db.execute(
            "INSERT INTO notifications (user_id, title, message, related_post_id) VALUES (?, ?, ?, ?)",
            [
              post.user_id,
              "💬 새 댓글 알림",
              `${commenter.username}님이 "${post.title}" 게시물에 댓글을 남겼습니다.`,
              postId,
            ],
          );
        }
      }

      res.status(201).json(commentWithUser.rows[0]);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete(
    "/api/community/posts/:postId/comments/:commentId",
    async (req, res) => {
      try {
        const commentId = parseInt(req.params.commentId);
        const { user_id } = req.body;

        if (!user_id) {
          return res.status(400).json({ message: "User ID is required" });
        }

        // Check if user owns the comment
        const checkResult = await storage.db.execute(
          "SELECT user_id FROM community_comments WHERE id = ?",
          [commentId],
        );

        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: "Comment not found" });
        }

        if (checkResult.rows[0].user_id !== user_id) {
          return res
            .status(403)
            .json({ message: "Not authorized to delete this comment" });
        }

        await storage.db.execute(
          "DELETE FROM community_comments WHERE id = ?",
          [commentId],
        );

        res.json({ message: "Comment deleted successfully" });
      } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Failed to delete comment" });
      }
    },
  );

  app.post("/api/community/posts", async (req, res) => {
    try {
      const postData = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  app.post("/api/community/posts/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.likeCommunityPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.get("/api/community/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommunityComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/community/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommunityCommentSchema.parse({
        ...req.body,
        postId,
      });
      const comment = await storage.createCommunityComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Beluga Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getBelugaTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getBelugaTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertBelugaTemplateSchema.parse(req.body);
      const template = await storage.createBelugaTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  app.patch("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertBelugaTemplateSchema.partial().parse(req.body);
      const template = await storage.updateBelugaTemplate(id, updates);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBelugaTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  app.post("/api/templates/reorder", async (req, res) => {
    try {
      const { templateIds } = req.body;
      if (!Array.isArray(templateIds)) {
        return res
          .status(400)
          .json({ message: "templateIds must be an array" });
      }
      const success = await storage.reorderBelugaTemplates(templateIds);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder templates" });
    }
  });

  // Order Items
  app.get("/api/orders/:orderId/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const orderItems = await storage.getOrderItems(orderId);
      res.json(orderItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders/:orderId/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const orderItemData = insertOrderItemSchema.parse({
        ...req.body,
        orderId,
      });
      const orderItem = await storage.createOrderItem(orderItemData);
      res.status(201).json(orderItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid order item data" });
    }
  });

  // Payments
  app.get("/api/orders/:orderId/payments", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const payments = await storage.getPayments(orderId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/orders/:orderId/payments", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const paymentData = insertPaymentSchema.parse({ ...req.body, orderId });
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(id, status);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Coupons
  app.get("/api/coupons", async (req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.get("/api/coupons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const coupon = await storage.getCoupon(id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupon" });
    }
  });

  app.get("/api/coupons/code/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupon" });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const couponData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(couponData);
      res.status(201).json(coupon);
    } catch (error) {
      res.status(400).json({ message: "Invalid coupon data" });
    }
  });

  app.patch("/api/coupons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCouponSchema.partial().parse(req.body);
      const coupon = await storage.updateCoupon(id, updates);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      res.status(400).json({ message: "Invalid coupon data" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCoupon(id);
      if (!success) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Admin Logs
  app.get("/api/admin/logs", async (req, res) => {
    try {
      const logs = await storage.getAdminLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin logs" });
    }
  });

  app.post("/api/admin/logs", async (req, res) => {
    try {
      const logData = insertAdminLogSchema.parse(req.body);
      const log = await storage.createAdminLog(logData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid admin log data" });
    }
  });

  // Goods Editor Design routes
  app.get("/api/designs", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const designs = await storage.getGoodsEditorDesigns(
        userId ? parseInt(userId) : undefined,
      );
      res.json(designs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });

  app.post("/api/designs", async (req, res) => {
    try {
      const designData = insertGoodsEditorDesignSchema.parse(req.body);
      const design = await storage.createGoodsEditorDesign(designData);
      res.status(201).json(design);
    } catch (error) {
      res.status(400).json({ message: "Invalid design data" });
    }
  });

  app.get("/api/designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const design = await storage.getGoodsEditorDesignById(id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch design" });
    }
  });

  app.put("/api/designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const design = await storage.updateGoodsEditorDesign(id, updateData);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error) {
      res.status(500).json({ message: "Failed to update design" });
    }
  });

  app.delete("/api/designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGoodsEditorDesign(id);
      if (!success) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json({ message: "Design deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete design" });
    }
  });

  // Inquiry routes
  app.get("/api/inquiries", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const inquiries = await storage.getInquiries(
        userId ? parseInt(userId) : undefined,
      );
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(400).json({ message: "Invalid inquiry data" });
    }
  });

  app.get("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.getInquiryById(id);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiry" });
    }
  });

  app.put("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const inquiry = await storage.updateInquiry(id, updateData);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inquiry" });
    }
  });

  // Goods Editor Design routes
  app.get("/api/goods-editor-designs", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const designs = await storage.getGoodsEditorDesigns(
        userId ? parseInt(userId) : undefined,
      );
      res.json(designs);
    } catch (error) {
      console.error("Error fetching designs:", error);
      res.status(500).json({ error: "Failed to fetch designs" });
    }
  });

  app.get("/api/goods-editor-designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const design = await storage.getGoodsEditorDesignById(id);

      if (!design) {
        return res.status(404).json({ error: "Design not found" });
      }

      res.json(design);
    } catch (error) {
      console.error("Error fetching design:", error);
      res.status(500).json({ error: "Failed to fetch design" });
    }
  });

  app.post("/api/goods-editor-designs", async (req, res) => {
    try {
      const validatedData = insertGoodsEditorDesignSchema.parse(req.body);
      const design = await storage.createGoodsEditorDesign(validatedData);
      res.json(design);
    } catch (error) {
      console.error("Error creating design:", error);
      res.status(500).json({ error: "Failed to create design" });
    }
  });

  app.put("/api/goods-editor-designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const design = await storage.updateGoodsEditorDesign(id, req.body);

      if (!design) {
        return res.status(404).json({ error: "Design not found" });
      }

      res.json(design);
    } catch (error) {
      console.error("Error updating design:", error);
      res.status(500).json({ error: "Failed to update design" });
    }
  });

  app.delete("/api/goods-editor-designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoodsEditorDesign(id);

      if (!deleted) {
        return res.status(404).json({ error: "Design not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting design:", error);
      res.status(500).json({ error: "Failed to delete design" });
    }
  });

  // Inquiry routes (additional endpoints)
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(500).json({ error: "Failed to create inquiry" });
    }
  });

  app.get("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.getInquiryById(id);

      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      res.json(inquiry);
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      res.status(500).json({ error: "Failed to fetch inquiry" });
    }
  });

  // Placeholder image endpoint
  app.get("/api/placeholder/:width/:height", async (req, res) => {
    const width = parseInt(req.params.width) || 300;
    const height = parseInt(req.params.height) || 300;

    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="16" fill="#666">
          ${width}×${height}
        </text>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  });

  // Notification routes
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const result = await storage.db.execute(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY sent_at DESC",
        [userId],
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error in notifications endpoint:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = req.body;
      const result = await storage.db.execute(
        "INSERT INTO notifications (user_id, title, message, is_read, related_post_id, related_order_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
        [
          notification.user_id,
          notification.title,
          notification.message,
          notification.is_read || false,
          notification.related_post_id || null,
          notification.related_order_id || null,
        ],
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error in create notification endpoint:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const result = await storage.db.execute(
        "UPDATE notifications SET is_read = true WHERE id = ? RETURNING *",
        [notificationId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error in mark notification as read endpoint:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/user/:userId/read-all", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const result = await storage.db.execute(
        "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false RETURNING *",
        [userId],
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error in mark all notifications as read endpoint:", error);
      res
        .status(500)
        .json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Product search endpoint
  app.get("/api/products/search", async (req, res) => {
    try {
      const { q, category, min_price, max_price, sort, featured } = req.query;

      let query = supabase.from("products").select(`
          *,
          categories (
            id,
            name,
            name_ko
          )
        `);

      // Apply search filter
      if (q && typeof q === "string") {
        query = query.or(
          `name.ilike.%${q}%,name_ko.ilike.%${q}%,description.ilike.%${q}%,description_ko.ilike.%${q}%`,
        );
      }

      // Apply category filter
      if (category && typeof category === "string") {
        const categories = category.split(",").filter(Boolean);
        if (categories.length > 0) {
          query = query.in("category_id", categories);
        }
      }

      // Apply price range filter
      if (min_price && typeof min_price === "string") {
        query = query.gte("base_price", parseInt(min_price));
      }
      if (max_price && typeof max_price === "string") {
        query = query.lte("base_price", parseInt(max_price));
      }

      // Apply featured filter
      if (featured === "1") {
        query = query.eq("is_featured", true);
      }

      // Always show active products
      query = query.eq("is_active", true);

      // Apply sorting
      switch (sort) {
        case "price_low":
          query = query.order("base_price", { ascending: true });
          break;
        case "price_high":
          query = query.order("base_price", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "featured":
          query = query
            .order("is_featured", { ascending: false })
            .order("name");
          break;
        default:
          query = query.order("name");
      }

      const { data: products, error } = await query;

      if (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({ message: "Failed to search products" });
      }

      res.json(products || []);
    } catch (error) {
      console.error("Error in product search endpoint:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Refund request endpoints
  app.post("/api/refund-requests", async (req, res) => {
    try {
      const { data: refundRequest, error } = await supabase
        .from("refund_requests")
        .insert(req.body)
        .select()
        .single();

      if (error) {
        console.error("Error creating refund request:", error);
        return res
          .status(500)
          .json({ message: "Failed to create refund request" });
      }

      res.json(refundRequest);
    } catch (error) {
      console.error("Error in refund request creation endpoint:", error);
      res.status(500).json({ message: "Failed to create refund request" });
    }
  });

  app.get("/api/refund-requests/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      const { data: refundRequests, error } = await supabase
        .from("refund_requests")
        .select(
          `
          *,
          orders (
            id,
            total_amount,
            created_at,
            order_items
          )
        `,
        )
        .eq("user_id", userId)
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching user refund requests:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch refund requests" });
      }

      res.json(refundRequests || []);
    } catch (error) {
      console.error("Error in user refund requests endpoint:", error);
      res.status(500).json({ message: "Failed to fetch refund requests" });
    }
  });

  app.get("/api/refund-requests/check/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      const { data: existingRequest, error } = await supabase
        .from("refund_requests")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking refund request:", error);
        return res
          .status(500)
          .json({ message: "Failed to check refund request" });
      }

      res.json({ exists: !!existingRequest, request: existingRequest });
    } catch (error) {
      console.error("Error in refund request check endpoint:", error);
      res.status(500).json({ message: "Failed to check refund request" });
    }
  });

  app.patch("/api/refund-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      if (
        updateData.status === "approved" ||
        updateData.status === "rejected"
      ) {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data: refundRequest, error } = await supabase
        .from("refund_requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating refund request:", error);
        return res
          .status(500)
          .json({ message: "Failed to update refund request" });
      }

      res.json(refundRequest);
    } catch (error) {
      console.error("Error in refund request update endpoint:", error);
      res.status(500).json({ message: "Failed to update refund request" });
    }
  });

  // Payment system endpoints
  app.post("/api/kakao/pay", async (req, res) => {
    try {
      const { orderId, userId, itemName, totalAmount, quantity } = req.body;

      // KakaoPay API 요청
      const response = await fetch("https://kapi.kakao.com/v1/payment/ready", {
        method: "POST",
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY || "YOUR_KAKAO_ADMIN_KEY"}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: new URLSearchParams({
          cid: "TC0ONETIME",
          partner_order_id: orderId.toString(),
          partner_user_id: userId.toString(),
          item_name: itemName,
          quantity: quantity.toString(),
          total_amount: totalAmount.toString(),
          tax_free_amount: "0",
          approval_url: `${process.env.VITE_APP_URL || "http://localhost:5000"}/payment-success?kakao=1&orderId=${orderId}`,
          fail_url: `${process.env.VITE_APP_URL || "http://localhost:5000"}/payment-failed?kakao=1&orderId=${orderId}`,
          cancel_url: `${process.env.VITE_APP_URL || "http://localhost:5000"}/payment-failed?kakao=1&orderId=${orderId}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`KakaoPay API request failed: ${response.status}`);
      }

      const data = await response.json();

      // 결제 준비 성공 시 리디렉션 URL 반환
      res.json({ redirectUrl: data.next_redirect_pc_url, tid: data.tid });
    } catch (error) {
      console.error("KakaoPay payment error:", error);
      res
        .status(500)
        .json({ message: "KakaoPay payment initialization failed" });
    }
  });

  app.post("/api/payment/complete", async (req, res) => {
    try {
      const { orderId, paymentMethod, status } = req.body;

      // Update payments table
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .update({
          status: status,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .select()
        .single();

      if (paymentError) {
        console.error("Error updating payment:", paymentError);
        return res
          .status(500)
          .json({ message: "Failed to update payment status" });
      }

      // Update orders table
      const orderStatus = status === "success" ? "completed" : "failed";
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update({
          status: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (orderError) {
        console.error("Error updating order:", orderError);
        return res
          .status(500)
          .json({ message: "Failed to update order status" });
      }

      res.json({
        orderId: orderId,
        paymentMethod: paymentMethod,
        status: status,
        amount: payment.amount,
        order: order,
      });
    } catch (error) {
      console.error("Error in payment completion endpoint:", error);
      res
        .status(500)
        .json({ message: "Failed to complete payment processing" });
    }
  });

  app.get("/api/payment/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      const { data: payment, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          orders (
            id,
            total_amount,
            status,
            created_at
          )
        `,
        )
        .eq("order_id", orderId)
        .single();

      if (error) {
        console.error("Error fetching payment:", error);
        return res
          .status(500)
          .json({ message: "Failed to fetch payment information" });
      }

      res.json(payment);
    } catch (error) {
      console.error("Error in payment info endpoint:", error);
      res.status(500).json({ message: "Failed to fetch payment information" });
    }
  });

  // Create order endpoint
  app.post("/api/orders", async (req, res) => {
    try {
      const {
        user_id,
        total_amount,
        status,
        shipping_address,
        shipping_phone,
        shipping_name,
        special_requests,
        order_items,
      } = req.body;

      const { data: order, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id,
            total_amount,
            status: status || "payment_completed",
            shipping_address: {
              address: shipping_address,
              phone: shipping_phone,
              name: shipping_name,
              special_requests: special_requests || "",
            },
            order_items: order_items || [],
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Failed to create order" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error in order creation endpoint:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Create payment endpoint
  app.post("/api/payments", async (req, res) => {
    try {
      const { order_id, amount, method, status } = req.body;

      const { data: payment, error } = await supabase
        .from("payments")
        .insert([
          {
            order_id,
            amount,
            method: method || "toss",
            status: status || "payment_completed",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating payment:", error);
        return res.status(500).json({ message: "Failed to create payment" });
      }

      res.json(payment);
    } catch (error) {
      console.error("Error in payment creation endpoint:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Order Detail API Endpoints
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 주문 ID입니다." });
      }

      const { data: order, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              id, name, name_ko, image_url
            ),
            goods_editor_designs (
              id, title, thumbnail_url, canvas_data
            )
          )
        `,
        )
        .eq("id", orderId)
        .single();

      if (error || !order) {
        return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "주문 정보를 불러오는데 실패했습니다." });
    }
  });

  app.get("/api/payments/order/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 주문 ID입니다." });
      }

      const { data: payment, error } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching payment:", error);
        return res
          .status(500)
          .json({ message: "결제 정보를 불러오는데 실패했습니다." });
      }

      res.json(payment || null);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ message: "결제 정보를 불러오는데 실패했습니다." });
    }
  });

  app.get("/api/shipping/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 주문 ID입니다." });
      }

      const { data: shipping, error } = await supabase
        .from("shipping_info")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching shipping info:", error);
        return res
          .status(500)
          .json({ message: "배송 정보를 불러오는데 실패했습니다." });
      }

      res.json(shipping || null);
    } catch (error) {
      console.error("Error fetching shipping info:", error);
      res.status(500).json({ message: "배송 정보를 불러오는데 실패했습니다." });
    }
  });

  app.get("/api/delivery-tracking/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 주문 ID입니다." });
      }

      const { data: tracking, error } = await supabase
        .from("delivery_tracking")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching delivery tracking:", error);
        return res
          .status(500)
          .json({ message: "배송 추적 정보를 불러오는데 실패했습니다." });
      }

      res.json(tracking || null);
    } catch (error) {
      console.error("Error fetching delivery tracking:", error);
      res
        .status(500)
        .json({ message: "배송 추적 정보를 불러오는데 실패했습니다." });
    }
  });

  app.get("/api/print-jobs/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 주문 ID입니다." });
      }

      const { data: printJob, error } = await supabase
        .from("print_jobs")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching print job:", error);
        return res
          .status(500)
          .json({ message: "프린트 작업 정보를 불러오는데 실패했습니다." });
      }

      res.json(printJob || null);
    } catch (error) {
      console.error("Error fetching print job:", error);
      res
        .status(500)
        .json({ message: "프린트 작업 정보를 불러오는데 실패했습니다." });
    }
  });

  // Refund Request API Endpoints
  app.post("/api/refund-requests", async (req, res) => {
    try {
      const { order_id, reason, amount, description } = req.body;

      if (!order_id || !reason || !amount) {
        return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
      }

      // Check if refund request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from("refund_requests")
        .select("*")
        .eq("order_id", order_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing refund request:", checkError);
        return res
          .status(500)
          .json({ message: "환불 요청 확인 중 오류가 발생했습니다." });
      }

      if (existingRequest) {
        return res
          .status(400)
          .json({ message: "이미 환불 요청이 존재합니다." });
      }

      const { data: refundRequest, error } = await supabase
        .from("refund_requests")
        .insert([
          {
            order_id,
            reason,
            amount,
            description,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating refund request:", error);
        return res
          .status(500)
          .json({ message: "환불 요청 생성에 실패했습니다." });
      }

      // Update order status to refund_requested
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({ status: "refund_requested" })
        .eq("id", order_id);

      if (orderUpdateError) {
        console.error("Error updating order status:", orderUpdateError);
        // Note: We don't return here since the refund request was created successfully
      }

      res.json(refundRequest);
    } catch (error) {
      console.error("Error creating refund request:", error);
      res.status(500).json({ message: "환불 요청 생성에 실패했습니다." });
    }
  });

  app.get("/api/refund-requests/check/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 주문 ID입니다." });
      }

      const { data: refundRequest, error } = await supabase
        .from("refund_requests")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking refund request:", error);
        return res
          .status(500)
          .json({ message: "환불 요청 확인에 실패했습니다." });
      }

      res.json({
        exists: !!refundRequest,
        request: refundRequest || null,
      });
    } catch (error) {
      console.error("Error checking refund request:", error);
      res.status(500).json({ message: "환불 요청 확인에 실패했습니다." });
    }
  });

  app.get("/api/refund-requests/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "유효하지 않은 사용자 ID입니다." });
      }

      const { data: refundRequests, error } = await supabase
        .from("refund_requests")
        .select(
          `
          *,
          orders (
            id,
            total_amount,
            created_at,
            status
          )
        `,
        )
        .eq("orders.user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching refund requests:", error);
        return res
          .status(500)
          .json({ message: "환불 요청 목록을 불러오는데 실패했습니다." });
      }

      res.json(refundRequests || []);
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      res
        .status(500)
        .json({ message: "환불 요청 목록을 불러오는데 실패했습니다." });
    }
  });

  // Orders refund request route
  app.post(
    "/api/orders/:orderId/refund",
    authenticateToken,
    async (req: any, res) => {
      try {
        const orderId = parseInt(req.params.orderId);
        const { reason } = req.body;

        if (isNaN(orderId)) {
          return res
            .status(400)
            .json({ message: "유효하지 않은 주문 ID입니다." });
        }

        if (!reason) {
          return res.status(400).json({ message: "환불 사유를 입력해주세요." });
        }

        // Check if order exists and belongs to the user
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", req.user.id)
          .single();

        if (orderError || !order) {
          return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
        }
        if (
          order.status === "canceled" ||
          order.status === "refund_requested"
        ) {
          return res
            .status(400)
            .json({ message: "환불 요청이 불가능한 주문 상태입니다." });
        }
        // Check if refund request already exists
        const { data: existingRequest, error: checkError } = await supabase
          .from("refund_requests")
          .select("*")
          .eq("order_id", orderId)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking existing refund request:", checkError);
          return res
            .status(500)
            .json({ message: "환불 요청 확인 중 오류가 발생했습니다." });
        }

        if (existingRequest) {
          return res
            .status(400)
            .json({ message: "이미 환불 요청이 존재합니다." });
        }

        // Create refund request
        const { data: refundRequest, error } = await supabase
          .from("refund_requests")
          .insert([
            {
              order_id: orderId,
              user_id: req.user.id,
              reason,
              status: "pending",
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error creating refund request:", error);
          return res
            .status(500)
            .json({ message: "환불 요청 생성에 실패했습니다." });
        }

        // Update order status to refund_requested
        const { error: orderUpdateError } = await supabase
          .from("orders")
          .update({ status: "refund_requested" })
          .eq("id", orderId);

        if (orderUpdateError) {
          console.error("Error updating order status:", orderUpdateError);
          // Note: We don't return here since the refund request was created successfully
        }

        res.json({
          message: "환불 요청이 성공적으로 접수되었습니다.",
          refundRequest,
        });
      } catch (error) {
        console.error("Error processing refund request:", error);
        res
          .status(500)
          .json({ message: "환불 요청 처리 중 오류가 발생했습니다." });
      }
    },
  );

  // Admin product management routes (using memory storage)
  app.post(
    "/api/products",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
      try {
        const productData = req.body;
        const newProduct = await storage.createProduct({
          name: productData.name,
          nameKo: productData.nameKo,
          description: productData.description,
          descriptionKo: productData.descriptionKo,
          price: productData.price,
          originalPrice: productData.originalPrice,
          categoryId: productData.categoryId,
          imageUrl: productData.imageUrl,
          isActive: productData.isActive ?? true,
          isFeatured: productData.isFeatured ?? false,
          stock: productData.stockQuantity,
          tags: productData.tags || [],
          isApproved: true,
          status: "approved",
          approvalDate: new Date().toISOString(),
        });

        res.status(201).json(newProduct);
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
      }
    },
  );

  app.put(
    "/api/products/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const productData = req.body;

        const updatedProduct = await storage.updateProduct(id, {
          name: productData.name,
          nameKo: productData.nameKo,
          description: productData.description,
          descriptionKo: productData.descriptionKo,
          price: productData.price,
          originalPrice: productData.originalPrice,
          categoryId: productData.categoryId,
          imageUrl: productData.imageUrl,
          isActive: productData.isActive,
          isFeatured: productData.isFeatured,
          stock: productData.stockQuantity,
          tags: productData.tags || [],
        });

        if (!updatedProduct) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.json(updatedProduct);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
      }
    },
  );

  app.delete(
    "/api/products/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);

        const success = await storage.deleteProduct(id);

        if (!success) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
      }
    },
  );

  // Chatbot API endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "메시지가 필요합니다." });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          reply: "죄송합니다. 현재 챗봇 서비스가 일시적으로 중단되었습니다. 고객센터(1588-0000)로 직접 문의해주세요." 
        });
      }

      const reply = await getChatbotResponse(message);
      res.json({ reply });
    } catch (error) {
      console.error("Chatbot API error:", error);
      res.status(500).json({ 
        reply: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
