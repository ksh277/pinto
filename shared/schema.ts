import {
  mysqlTable,
  int,
  text,
  boolean,
  timestamp,
  decimal,
  json,
  index,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 30 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  points: int("points").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  nameKo: varchar("name_ko", { length: 255 }).notNull(),
  description: text("description"),
  descriptionKo: text("description_ko"),
  imageUrl: varchar("image_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
});

export const sellers = mysqlTable("sellers", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  shopName: varchar("shop_name", { length: 255 }).notNull(),
  businessNumber: varchar("business_number", { length: 100 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  bankAccount: varchar("bank_account", { length: 100 }),
  bankName: varchar("bank_name", { length: 100 }),
  isApproved: boolean("is_approved").default(false).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shippingCompanies = mysqlTable("shipping_companies", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  trackingUrl: varchar("tracking_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  nameKo: varchar("name_ko", { length: 255 }).notNull(),
  description: text("description"),
  descriptionKo: text("description_ko"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  categoryId: int("category_id")
    .references(() => categories.id)
    .notNull(),
  sellerId: int("seller_id").references(() => sellers.id),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  stock: int("stock").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  approvalDate: timestamp("approval_date"),
  customizationOptions: json("customization_options"),
  options: json("options"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productReviews = mysqlTable("product_reviews", {
  id: int("id").primaryKey().autoincrement(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  rating: int("rating").notNull(),
  images: json("images"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewComments = mysqlTable("review_comments", {
  id: int("id").primaryKey().autoincrement(),
  reviewId: int("review_id")
    .references(() => productReviews.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewLikes = mysqlTable("review_likes", {
  id: int("id").primaryKey().autoincrement(),
  reviewId: int("review_id")
    .references(() => productReviews.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productLikes = mysqlTable("product_likes", {
  id: int("id").primaryKey().autoincrement(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = mysqlTable("favorites", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = mysqlTable("cart_items", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: int("quantity").notNull(),
  customOptions: json("custom_options"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: json("shipping_address").notNull(),
  orderItems: json("order_items").notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  shippingCompanyId: int("shipping_company_id").references(() => shippingCompanies.id),
  shippedAt: timestamp("shipped_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = mysqlTable("order_items", {
  id: int("id").primaryKey().autoincrement(),
  orderId: int("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  customOptions: json("custom_options"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").primaryKey().autoincrement(),
  orderId: int("order_id")
    .references(() => orders.id)
    .notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coupons = mysqlTable("coupons", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: int("usage_limit"),
  usageCount: int("usage_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").primaryKey().autoincrement(),
  adminId: int("admin_id")
    .references(() => users.id)
    .notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  targetType: varchar("target_type", { length: 50 }),
  targetId: int("target_id"),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPosts = mysqlTable("community_posts", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  likes: int("likes").default(0).notNull(),
  views: int("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityComments = mysqlTable("community_comments", {
  id: int("id").primaryKey().autoincrement(),
  postId: int("post_id")
    .references(() => communityPosts.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const belugaTemplates = mysqlTable("beluga_templates", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  titleKo: varchar("title_ko", { length: 255 }).notNull(),
  description: text("description").notNull(),
  descriptionKo: text("description_ko").notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  format: varchar("format", { length: 20 }).notNull(),
  downloads: int("downloads").default(0).notNull(),
  tags: text("tags").notNull(),
  status: varchar("status", { length: 20 }),
  imageUrl: varchar("image_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goodsEditorDesigns = mysqlTable("goods_editor_designs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  productType: varchar("product_type", { length: 100 }).notNull(),
  designData: json("design_data").notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inquiries = mysqlTable("inquiries", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  adminResponse: text("admin_response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Point History table for tracking point earning and usage
export const pointHistory = mysqlTable("point_history", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "earn" or "use"
  source: varchar("source", { length: 50 }).notNull(), // "리뷰작성", "결제", "상품구매", "이벤트참여"
  amount: int("amount").notNull(), // positive for earn, negative for use
  balance: int("balance").notNull(), // remaining points after this transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for TypeScript usage
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Seller = typeof sellers.$inferSelect;
export type InsertSeller = typeof sellers.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

export type ReviewComment = typeof reviewComments.$inferSelect;
export type InsertReviewComment = typeof reviewComments.$inferInsert;

export type ReviewLike = typeof reviewLikes.$inferSelect;
export type InsertReviewLike = typeof reviewLikes.$inferInsert;

export type ProductLike = typeof productLikes.$inferSelect;
export type InsertProductLike = typeof productLikes.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;

export type BelugaTemplate = typeof belugaTemplates.$inferSelect;
export type InsertBelugaTemplate = typeof belugaTemplates.$inferInsert;

export type GoodsEditorDesign = typeof goodsEditorDesigns.$inferSelect;
export type InsertGoodsEditorDesign = typeof goodsEditorDesigns.$inferInsert;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

export type PointHistory = typeof pointHistory.$inferSelect;
export type InsertPointHistory = typeof pointHistory.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories);
export const insertProductSchema = createInsertSchema(products);
export const insertProductReviewSchema = createInsertSchema(productReviews);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertCouponSchema = createInsertSchema(coupons);
export const insertAdminLogSchema = createInsertSchema(adminLogs);
export const insertCommunityPostSchema = createInsertSchema(communityPosts);
export const insertCommunityCommentSchema = createInsertSchema(communityComments);
export const insertBelugaTemplateSchema = createInsertSchema(belugaTemplates);
export const insertGoodsEditorDesignSchema = createInsertSchema(goodsEditorDesigns);
export const insertInquirySchema = createInsertSchema(inquiries);
export const insertPointHistorySchema = createInsertSchema(pointHistory);