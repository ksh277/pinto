import {
  mysqlTable,
  text,
  serial,
  int,
  boolean,
  timestamp,
  decimal,
  json,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKo: text("name_ko").notNull(),
  description: text("description"),
  descriptionKo: text("description_ko"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const sellers = mysqlTable("sellers", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  shopName: text("shop_name").notNull(),
  businessNumber: text("business_number"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  bankAccount: text("bank_account"),
  bankName: text("bank_name"),
  isApproved: boolean("is_approved").default(false).notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shippingCompanies = mysqlTable("shipping_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  trackingUrl: text("tracking_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKo: text("name_ko").notNull(),
  description: text("description"),
  descriptionKo: text("description_ko"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  categoryId: int("category_id")
    .references(() => categories.id)
    .notNull(),
  sellerId: int("seller_id").references(() => sellers.id),
  imageUrl: text("image_url").notNull(),
  stock: int("stock").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  status: text("status").default("pending").notNull(),
  approvalDate: timestamp("approval_date"),
  customizationOptions: json("customization_options"),
  options: json("options"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productReviews = mysqlTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productLikes = mysqlTable("product_likes", {
  id: serial("id").primaryKey(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = mysqlTable("favorites", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImages = mysqlTable("product_images", {
  id: serial("id").primaryKey(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  displayOrder: int("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goodsEditorDesigns = mysqlTable("goods_editor_designs", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  productType: text("product_type").notNull(),
  canvasData: json("canvas_data").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  isPublic: boolean("is_public").default(false).notNull(),
  isSaved: boolean("is_saved").default(true).notNull(),
  tags: json("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inquiries = mysqlTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  attachmentUrls: json("attachment_urls"),
  status: text("status").default("pending").notNull(),
  adminResponse: text("admin_response"),
  adminUserId: int("admin_user_id").references(() => users.id),
  priority: text("priority").default("normal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = mysqlTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: int("quantity").notNull(),
  customization: json("customization"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  status: text("status").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: json("shipping_address").notNull(),
  orderItems: json("order_items").notNull(),
  trackingNumber: text("tracking_number"),
  shippingCompanyId: int("shipping_company_id").references(
    () => shippingCompanies.id,
  ),
  shippedAt: timestamp("shipped_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: int("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: int("product_id")
    .references(() => products.id)
    .notNull(),
  designId: int("design_id").references(() => goodsEditorDesigns.id),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  orderId: int("order_id")
    .references(() => orders.id)
    .notNull(),
  paymentMethod: text("payment_method").notNull(), // 카드, 계좌이체 등
  status: text("status").notNull(), // pending, success, failed
  transactionId: text("transaction_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refundRequests = mysqlTable("refund_requests", {
  id: serial("id").primaryKey(),
  orderId: int("order_id")
    .references(() => orders.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  adminNote: text("admin_note"),
});

export const coupons = mysqlTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // percent, fixed
  discountValue: decimal("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminLogs = mysqlTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: int("admin_id")
    .references(() => users.id)
    .notNull(),
  action: text("action").notNull(), // 예: "상품 삭제"
  targetTable: text("target_table").notNull(),
  targetId: int("target_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPosts = mysqlTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  likes: int("likes").default(0).notNull(),
  productId: int("product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityComments = mysqlTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: int("post_id")
    .references(() => communityPosts.id)
    .notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  type: text("type").notNull(), // 'comment', 'like', 'order', 'system'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedPostId: int("related_post_id").references(() => communityPosts.id),
  relatedOrderId: int("related_order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const belugaTemplates = mysqlTable("beluga_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleKo: text("title_ko").notNull(),
  description: text("description").notNull(),
  descriptionKo: text("description_ko").notNull(),
  size: text("size").notNull(),
  format: text("format").notNull(),
  downloads: int("downloads").default(0).notNull(),
  tags: text("tags"), // MySQL does not support native arrays
  status: text("status"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertProductReviewSchema = createInsertSchema(
  productReviews,
).omit({
  id: true,
  createdAt: true,
});

export const insertProductLikeSchema = createInsertSchema(productLikes).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(
  communityPosts,
).omit({
  id: true,
  createdAt: true,
  likes: true,
});

export const insertCommunityCommentSchema = createInsertSchema(
  communityComments,
).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(communityComments).omit({
  id: true,
  createdAt: true,
});

export const insertBelugaTemplateSchema = createInsertSchema(
  belugaTemplates,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoodsEditorDesignSchema = createInsertSchema(
  goodsEditorDesigns,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertRefundRequestSchema = createInsertSchema(
  refundRequests,
).omit({
  id: true,
  requestedAt: true,
  resolvedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = z.infer<typeof insertRefundRequestSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductLike = typeof productLikes.$inferSelect;
export type InsertProductLike = z.infer<typeof insertProductLikeSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = z.infer<
  typeof insertCommunityCommentSchema
>;
export type BelugaTemplate = typeof belugaTemplates.$inferSelect;
export type InsertBelugaTemplate = z.infer<typeof insertBelugaTemplateSchema>;
export type GoodsEditorDesign = typeof goodsEditorDesigns.$inferSelect;
export type InsertGoodsEditorDesign = z.infer<
  typeof insertGoodsEditorDesignSchema
>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
