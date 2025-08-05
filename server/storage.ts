import {
  users,
  categories,
  products,
  productReviews,
  productLikes,
  reviewComments,
  reviewLikes,
  cartItems,
  orders,
  orderItems,
  payments,
  coupons,
  adminLogs,
  communityPosts,
  communityComments,
  belugaTemplates,
  goodsEditorDesigns,
  inquiries,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductReview,
  type InsertProductReview,
  type ProductLike,
  type InsertProductLike,
  type ReviewComment,
  type InsertReviewComment,
  type ReviewLike,
  type InsertReviewLike,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Payment,
  type InsertPayment,
  type Coupon,
  type InsertCoupon,
  type AdminLog,
  type InsertAdminLog,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
  type BelugaTemplate,
  type InsertBelugaTemplate,
  type GoodsEditorDesign,
  type InsertGoodsEditorDesign,
  type Inquiry,
  type InsertInquiry,
} from "@shared/schema";
import { db } from "./db";
import { eq, count, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(
    id: number,
    updates: Partial<InsertProduct>,
  ): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Review methods
  getProductReviews(productId: number): Promise<ProductReview[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;

  // Review comment methods
  getReviewComments(reviewId: number): Promise<ReviewComment[]>;
  createReviewComment(comment: InsertReviewComment): Promise<ReviewComment>;

  // Review like methods
  getReviewLikes(reviewId: number): Promise<ReviewLike[]>;
  createReviewLike(like: InsertReviewLike): Promise<ReviewLike>;
  isReviewLiked(reviewId: number, userId: number): Promise<boolean>;

  // Product like methods
  isProductLiked(productId: number, userId: number): Promise<boolean>;
  likeProduct(productId: number, userId: number): Promise<ProductLike>;
  unlikeProduct(productId: number, userId: number): Promise<boolean>;
  getProductLikesCount(productId: number): Promise<number>;
  getProductReviewsCount(productId: number): Promise<number>;

  // Cart methods
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;

  // Order methods
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Order Item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Payment methods
  getPayments(orderId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;

  // Coupon methods
  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(
    id: number,
    updates: Partial<InsertCoupon>,
  ): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<boolean>;

  // Admin Log methods
  getAdminLogs(): Promise<AdminLog[]>;
  createAdminLog(adminLog: InsertAdminLog): Promise<AdminLog>;

  // Community methods
  getCommunityPosts(): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likeCommunityPost(id: number): Promise<CommunityPost | undefined>;
  getCommunityComments(postId: number): Promise<CommunityComment[]>;
  createCommunityComment(
    comment: InsertCommunityComment,
  ): Promise<CommunityComment>;

  // Template methods
  getBelugaTemplates(): Promise<BelugaTemplate[]>;
  getBelugaTemplate(id: number): Promise<BelugaTemplate | undefined>;
  createBelugaTemplate(template: InsertBelugaTemplate): Promise<BelugaTemplate>;
  updateBelugaTemplate(
    id: number,
    updates: Partial<InsertBelugaTemplate>,
  ): Promise<BelugaTemplate | undefined>;
  deleteBelugaTemplate(id: number): Promise<boolean>;
  reorderBelugaTemplates(templateIds: number[]): Promise<boolean>;

  // Goods Editor Design methods
  getGoodsEditorDesigns(userId?: number): Promise<GoodsEditorDesign[]>;
  getGoodsEditorDesignById(id: number): Promise<GoodsEditorDesign | undefined>;
  createGoodsEditorDesign(
    design: InsertGoodsEditorDesign,
  ): Promise<GoodsEditorDesign>;
  updateGoodsEditorDesign(
    id: number,
    updates: Partial<InsertGoodsEditorDesign>,
  ): Promise<GoodsEditorDesign | undefined>;
  deleteGoodsEditorDesign(id: number): Promise<boolean>;

  // Inquiry methods
  getInquiries(userId?: number): Promise<Inquiry[]>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(
    id: number,
    updates: Partial<InsertInquiry>,
  ): Promise<Inquiry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private productReviews: Map<number, ProductReview>;
  private productLikes: Map<number, ProductLike>;
  private reviewComments: Map<number, ReviewComment>;
  private reviewLikes: Map<number, ReviewLike>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private payments: Map<number, Payment>;
  private coupons: Map<number, Coupon>;
  private adminLogs: Map<number, AdminLog>;
  private communityPosts: Map<number, CommunityPost>;
  private communityComments: Map<number, CommunityComment>;
  private belugaTemplates: Map<number, BelugaTemplate>;
  private goodsEditorDesigns: Map<number, GoodsEditorDesign>;
  private inquiries: Map<number, Inquiry>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.productReviews = new Map();
    this.productLikes = new Map();
    this.reviewComments = new Map();
    this.reviewLikes = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.payments = new Map();
    this.coupons = new Map();
    this.adminLogs = new Map();
    this.communityPosts = new Map();
    this.communityComments = new Map();
    this.belugaTemplates = new Map();
    this.goodsEditorDesigns = new Map();
    this.inquiries = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize users (admin accounts)
    const usersData = [
      {
        id: 1,
        username: "admin",
        email: "admin@allthatprinting.com",
        password: "12345",
        firstName: "관리자",
        lastName: "",
        isAdmin: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        username: "superadmin",
        email: "superadmin@allthatprinting.com",
        password: "12345",
        firstName: "슈퍼관리자",
        lastName: "",
        isAdmin: true,
        createdAt: new Date(),
      },
    ];

    usersData.forEach((user) => {
      this.users.set(user.id, user as User);
    });

    // Initialize categories
    const categoriesData = [
      {
        id: 1,
        name: "T-Shirts",
        nameKo: "티셔츠",
        description: "Custom printed t-shirts",
        descriptionKo: "커스텀 프린팅 티셔츠",
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        isActive: true,
      },
      {
        id: 2,
        name: "Mugs",
        nameKo: "머그컵",
        description: "Custom printed mugs",
        descriptionKo: "커스텀 프린팅 머그컵",
        imageUrl:
          "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
        isActive: true,
      },
      {
        id: 3,
        name: "Stickers",
        nameKo: "스티커",
        description: "Custom stickers",
        descriptionKo: "커스텀 스티커",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        isActive: true,
      },
      {
        id: 4,
        name: "Acrylic Keychains",
        nameKo: "아크릴 키링",
        description: "Custom acrylic keychains",
        descriptionKo: "커스텀 아크릴 키링",
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
      },
      {
        id: 5,
        name: "Phone Cases",
        nameKo: "폰케이스",
        description: "Custom phone cases",
        descriptionKo: "커스텀 폰케이스",
        imageUrl:
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
        isActive: true,
      },
      {
        id: 6,
        name: "Tote Bags",
        nameKo: "에코백",
        description: "Custom tote bags",
        descriptionKo: "커스텀 에코백",
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        isActive: true,
      },
      {
        id: 7,
        name: "Lanyard Goods",
        nameKo: "렌야드굿즈",
        description: "Custom lanyards and straps",
        descriptionKo: "커스텀 렌야드와 스트랩",
        imageUrl:
          "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=400",
        isActive: true,
      },
    ];

    categoriesData.forEach((cat) => {
      this.categories.set(cat.id, cat as Category);
    });

    // Initialize products
    const productsData = [
      // Acrylic Keyrings
      {
        id: 1,
        name: "Acrylic Keychain",
        nameKo: "아크릴 키링",
        description: "High-quality acrylic keychain",
        descriptionKo: "고품질 아크릴 키링",
        basePrice: "8900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Clear", "White"],
        },
        createdAt: new Date(),
        stock: 40,
      },
      {
        id: 2,
        name: "Premium Acrylic Keyring",
        nameKo: "프리미엄 아크릴 키링",
        description: "Premium quality acrylic keyring",
        descriptionKo: "프리미엄 품질의 아크릴 키링",
        basePrice: "12900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium", "Large"],
          colors: ["Clear", "White", "Black"],
        },
        createdAt: new Date(),
        stock: 35,
      },
      {
        id: 3,
        name: "Heart Shape Acrylic Keyring",
        nameKo: "하트형 아크릴 키링",
        description: "Heart-shaped acrylic keyring",
        descriptionKo: "하트 모양의 아크릴 키링",
        basePrice: "10900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Clear", "Pink", "Red"],
        },
        createdAt: new Date(),
        stock: 20,
      },

      // Korotto
      {
        id: 4,
        name: "Korotto Stand",
        nameKo: "코롯토 스탠드",
        description: "Cute korotto character stand",
        descriptionKo: "귀여운 코롯토 캐릭터 스탠드",
        basePrice: "7900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Clear", "White"],
        },
        createdAt: new Date(),
        stock: 45,
      },
      {
        id: 5,
        name: "Mini Korotto",
        nameKo: "미니 코롯토",
        description: "Small korotto character",
        descriptionKo: "작은 코롯토 캐릭터",
        basePrice: "5900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Mini"],
          colors: ["Clear", "White", "Pink"],
        },
        createdAt: new Date(),
        stock: 30,
      },

      // Smart Tok
      {
        id: 6,
        name: "Smart Tok Grip",
        nameKo: "스마트톡 그립",
        description: "Phone grip with custom design",
        descriptionKo: "커스텀 디자인 폰 그립",
        basePrice: "13900",
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Standard"],
          colors: ["Clear", "White", "Black"],
        },
        createdAt: new Date(),
        stock: 25,
      },
      {
        id: 7,
        name: "Premium Smart Tok",
        nameKo: "프리미엄 스마트톡",
        description: "Premium phone grip",
        descriptionKo: "프리미엄 폰 그립",
        basePrice: "16900",
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Standard", "Large"],
          colors: ["Clear", "White", "Black", "Rose Gold"],
        },
        createdAt: new Date(),
        stock: 20,
      },

      // Stands/Dioramas
      {
        id: 8,
        name: "Acrylic Stand",
        nameKo: "아크릴 스탠드",
        description: "Clear acrylic display stand",
        descriptionKo: "투명 아크릴 디스플레이 스탠드",
        basePrice: "15900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium", "Large"],
          colors: ["Clear"],
        },
        createdAt: new Date(),
        stock: 15,
      },
      {
        id: 9,
        name: "Diorama Stand",
        nameKo: "디오라마 스탠드",
        description: "3D diorama display stand",
        descriptionKo: "3D 디오라마 디스플레이 스탠드",
        basePrice: "24900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Medium", "Large"],
          colors: ["Clear", "White"],
        },
        createdAt: new Date(),
        stock: 10,
      },

      // Card Holders
      {
        id: 10,
        name: "Card Holder",
        nameKo: "포카홀더",
        description: "Acrylic card holder",
        descriptionKo: "아크릴 카드 홀더",
        basePrice: "6900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Standard"],
          colors: ["Clear", "White", "Pink"],
        },
        createdAt: new Date(),
        stock: 60,
      },
      {
        id: 11,
        name: "Premium Card Holder",
        nameKo: "프리미엄 포카홀더",
        description: "Premium acrylic card holder",
        descriptionKo: "프리미엄 아크릴 카드 홀더",
        basePrice: "9900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Standard", "Large"],
          colors: ["Clear", "White", "Black", "Pink"],
        },
        createdAt: new Date(),
        stock: 35,
      },

      // Shakers
      {
        id: 12,
        name: "Acrylic Shaker",
        nameKo: "아크릴 쉐이커",
        description: "Fun acrylic shaker charm",
        descriptionKo: "재미있는 아크릴 쉐이커 참",
        basePrice: "11900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Clear", "White"],
        },
        createdAt: new Date(),
        stock: 18,
      },
      {
        id: 13,
        name: "Glitter Shaker",
        nameKo: "글리터 쉐이커",
        description: "Glitter-filled acrylic shaker",
        descriptionKo: "글리터가 들어간 아크릴 쉐이커",
        basePrice: "14900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Clear", "Pink", "Blue", "Gold"],
        },
        createdAt: new Date(),
        stock: 22,
      },

      // Other categories
      {
        id: 14,
        name: "Custom Tote Bag",
        nameKo: "커스텀 에코백",
        description: "Eco-friendly tote bag",
        descriptionKo: "친환경 에코백",
        basePrice: "12900",
        categoryId: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Large"],
          colors: ["Natural", "Black", "Navy"],
        },
        createdAt: new Date(),
        stock: 40,
      },
      {
        id: 15,
        name: "Custom Pin Badge",
        nameKo: "커스텀 뱃지",
        description: "Custom pin badge",
        descriptionKo: "커스텀 뱃지",
        basePrice: "3900",
        categoryId: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: { sizes: ["25mm", "32mm"], colors: ["Any"] },
        createdAt: new Date(),
        stock: 80,
      },
      {
        id: 16,
        name: "Custom Tumbler",
        nameKo: "커스텀 텀블러",
        description: "Insulated tumbler",
        descriptionKo: "보온 텀블러",
        basePrice: "18900",
        categoryId: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["350ml", "500ml"],
          colors: ["White", "Black", "Silver"],
        },
        createdAt: new Date(),
        stock: 25,
      },

      // Additional popular Korean goods
      {
        id: 17,
        name: "Custom T-Shirt",
        nameKo: "커스텀 티셔츠",
        description: "High-quality cotton t-shirt",
        descriptionKo: "고품질 면 티셔츠",
        basePrice: "15900",
        categoryId: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["S", "M", "L", "XL"],
          colors: ["White", "Black", "Navy", "Gray"],
        },
        createdAt: new Date(),
        stock: 50,
      },
      {
        id: 18,
        name: "Custom Mug",
        nameKo: "커스텀 머그컵",
        description: "Ceramic mug with custom design",
        descriptionKo: "커스텀 디자인 세라믹 머그컵",
        basePrice: "9900",
        categoryId: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["11oz", "15oz"],
          colors: ["White", "Black"],
        },
        createdAt: new Date(),
        stock: 30,
      },
      {
        id: 19,
        name: "Custom Stickers Pack",
        nameKo: "커스텀 스티커 팩",
        description: "Waterproof vinyl stickers",
        descriptionKo: "방수 비닐 스티커",
        basePrice: "4900",
        categoryId: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium", "Large"],
          colors: ["Any"],
        },
        createdAt: new Date(),
        stock: 100,
      },
      {
        id: 20,
        name: "Clear Phone Case",
        nameKo: "투명 폰케이스",
        description: "Crystal clear phone protection",
        descriptionKo: "크리스탈 투명 폰 보호케이스",
        basePrice: "11900",
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["iPhone", "Samsung", "Universal"],
          colors: ["Clear", "Frosted"],
        },
        createdAt: new Date(),
        stock: 25,
      },

      // Wood Goods - 우드굿즈
      {
        id: 21,
        name: "Wood Keychain",
        nameKo: "우드키링",
        description: "Natural wood keychain with custom engraving",
        descriptionKo: "커스텀 각인이 가능한 천연 우드 키링",
        basePrice: "9900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Natural", "Cherry", "Walnut"],
        },
        createdAt: new Date(),
        stock: 50,
      },
      {
        id: 22,
        name: "Premium Wood Keychain",
        nameKo: "프리미엄 우드키링",
        description: "High-quality hardwood keychain",
        descriptionKo: "고품질 원목 키링",
        basePrice: "14900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium", "Large"],
          colors: ["Oak", "Maple", "Mahogany"],
        },
        createdAt: new Date(),
        stock: 40,
      },
      {
        id: 23,
        name: "Wood Magnet",
        nameKo: "우드마그넷",
        description: "Wooden refrigerator magnet",
        descriptionKo: "나무 냉장고 자석",
        basePrice: "6900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Natural", "Stained"],
        },
        createdAt: new Date(),
        stock: 60,
      },
      {
        id: 24,
        name: "Wood Stand",
        nameKo: "우드스탠드",
        description: "Wooden display stand",
        descriptionKo: "나무 디스플레이 스탠드",
        basePrice: "18900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Small", "Medium", "Large"],
          colors: ["Natural", "Dark"],
        },
        createdAt: new Date(),
        stock: 30,
      },
      {
        id: 25,
        name: "Wood Coaster Set",
        nameKo: "우드코스터 세트",
        description: "Set of 4 wooden coasters",
        descriptionKo: "나무 컵받침 4개 세트",
        basePrice: "12900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Standard"],
          colors: ["Natural", "Stained"],
        },
        createdAt: new Date(),
        stock: 35,
      },
      {
        id: 26,
        name: "Bamboo Keychain",
        nameKo: "대나무키링",
        description: "Eco-friendly bamboo keychain",
        descriptionKo: "친환경 대나무 키링",
        basePrice: "7900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Natural", "Burnt"],
        },
        createdAt: new Date(),
        stock: 45,
      },
      {
        id: 27,
        name: "Wood Phone Stand",
        nameKo: "우드 폰스탠드",
        description: "Wooden phone stand holder",
        descriptionKo: "나무 휴대폰 거치대",
        basePrice: "15900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Standard", "Large"],
          colors: ["Natural", "Stained"],
        },
        createdAt: new Date(),
        stock: 25,
      },
      {
        id: 28,
        name: "Wood Badge",
        nameKo: "우드뱃지",
        description: "Wooden badge with custom design",
        descriptionKo: "커스텀 디자인 나무 뱃지",
        basePrice: "8900",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Small", "Medium"],
          colors: ["Natural", "Stained"],
        },
        createdAt: new Date(),
        stock: 40,
      },

      // Lanyard Goods - 렌야드굿즈
      {
        id: 29,
        name: "Neck Strap Lanyard",
        nameKo: "목걸이형 렌야드",
        description: "Comfortable neck strap lanyard",
        descriptionKo: "편안한 목걸이형 스트랩",
        basePrice: "7900",
        categoryId: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Standard"],
          colors: ["Black", "Navy", "Gray", "Pink"],
        },
        createdAt: new Date(),
        stock: 45,
      },
      {
        id: 30,
        name: "Premium Neck Lanyard",
        nameKo: "프리미엄 목걸이형 렌야드",
        description: "Premium quality neck lanyard with custom charm",
        descriptionKo: "커스텀 참이 달린 프리미엄 목걸이형 렌야드",
        basePrice: "12900",
        categoryId: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=400",
        isActive: true,
        isFeatured: true,
        customizationOptions: {
          sizes: ["Standard", "Long"],
          colors: ["Black", "Navy", "White", "Pink", "Purple"],
        },
        createdAt: new Date(),
        stock: 30,
      },
      {
        id: 31,
        name: "Phone Strap Lanyard",
        nameKo: "핸드폰용 렌야드",
        description: "Phone strap lanyard with secure attachment",
        descriptionKo: "안전한 부착부가 있는 핸드폰용 스트랩",
        basePrice: "5900",
        categoryId: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
        isActive: true,
        isFeatured: false,
        customizationOptions: {
          sizes: ["Short", "Medium"],
          colors: ["Black", "Clear", "White", "Blue"],
        },
        createdAt: new Date(),
        stock: 50,
      },
    ];

    productsData.forEach((prod) => {
      this.products.set(prod.id, {
        ...(prod as Product),
        isApproved: true,
        status: "approved",
        approvalDate: new Date(),
      } as Product);
    });

    // Initialize templates
    const templatesData = [
      {
        id: 1,
        title: "Beluga Keychain Template",
        titleKo: "벨루가 키링 템플릿",
        description: "Cute beluga keychain design",
        descriptionKo: "귀여운 벨루가 키링 디자인",
        size: "50×50mm",
        format: "AI/PSD",
        downloads: 1247,
        tags: ["keychain", "beluga", "character"],
        status: "HOT",
        imageUrl: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "Beluga Stand Template",
        titleKo: "벨루가 스탠드 템플릿",
        description: "Standing beluga character",
        descriptionKo: "서 있는 벨루가 캐릭터",
        size: "60×80mm",
        format: "AI/PSD",
        downloads: 897,
        tags: ["stand", "beluga", "character"],
        status: "NEW",
        imageUrl: null,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        title: "Beluga Smart Tok Template",
        titleKo: "벨루가 스마트톡 템플릿",
        description: "Smart tok with beluga design",
        descriptionKo: "벨루가 디자인 스마트톡",
        size: "40×40mm",
        format: "AI/PSD",
        downloads: 1156,
        tags: ["smarttok", "beluga", "phone"],
        status: "인기",
        imageUrl: null,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        title: "Beluga Badge Template",
        titleKo: "벨루가 뱃지 템플릿",
        description: "Round badge with beluga",
        descriptionKo: "벨루가가 있는 둥근 뱃지",
        size: "32×32mm",
        format: "AI/PSD",
        downloads: 634,
        tags: ["badge", "beluga", "round"],
        status: null,
        imageUrl: null,
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        title: "Beluga Card Holder Template",
        titleKo: "벨루가 포카홀더 템플릿",
        description: "Photo card holder design",
        descriptionKo: "포토카드 홀더 디자인",
        size: "55×85mm",
        format: "AI/PSD",
        downloads: 789,
        tags: ["cardholder", "beluga", "photo"],
        status: "NEW",
        imageUrl: null,
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        title: "Beluga Magnet Template",
        titleKo: "벨루가 자석 템플릿",
        description: "Refrigerator magnet design",
        descriptionKo: "냉장고 자석 디자인",
        size: "50×50mm",
        format: "AI/PSD",
        downloads: 432,
        tags: ["magnet", "beluga", "fridge"],
        status: null,
        imageUrl: null,
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        title: "Beluga Korotto Template",
        titleKo: "벨루가 코롯토 템플릿",
        description: "Flat character goods",
        descriptionKo: "플랫 캐릭터 굿즈",
        size: "70×70mm",
        format: "AI/PSD",
        downloads: 923,
        tags: ["korotto", "beluga", "flat"],
        status: "HOT",
        imageUrl: null,
        isActive: true,
        sortOrder: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        title: "Beluga Carabiner Template",
        titleKo: "벨루가 카라비너 템플릿",
        description: "Carabiner with beluga design",
        descriptionKo: "벨루가 디자인 카라비너",
        size: "45×60mm",
        format: "AI/PSD",
        downloads: 156,
        tags: ["carabiner", "beluga", "clip"],
        status: null,
        imageUrl: null,
        isActive: false,
        sortOrder: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    templatesData.forEach((template) => {
      this.belugaTemplates.set(template.id, template as BelugaTemplate);
    });

    this.currentId = 100;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: new Date(),
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
    };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter((cat) => cat.isActive);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId++;
    const category: Category = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
      descriptionKo: insertCategory.descriptionKo || null,
      imageUrl: insertCategory.imageUrl || null,
      isActive: insertCategory.isActive ?? true,
    };
    this.categories.set(id, category);
    return category;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (prod) => prod.isActive && prod.status === "approved",
    );
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (prod) =>
        prod.categoryId === categoryId &&
        prod.isActive &&
        prod.status === "approved",
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (prod) => prod.isFeatured && prod.isActive && prod.status === "approved",
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product || !product.isActive || product.status !== "approved") {
      return undefined;
    }
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      description: insertProduct.description || null,
      descriptionKo: insertProduct.descriptionKo || null,
      isActive: insertProduct.isActive ?? true,
      isFeatured: insertProduct.isFeatured ?? false,
      isApproved: insertProduct.isApproved ?? true,
      status: insertProduct.status ?? "approved",
      approvalDate: insertProduct.approvalDate ?? new Date(),
      customizationOptions: insertProduct.customizationOptions || null,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(
    id: number,
    updates: Partial<InsertProduct>,
  ): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      status: updates.status ?? existingProduct.status,
      isApproved: updates.isApproved ?? existingProduct.isApproved,
      approvalDate: updates.approvalDate ?? existingProduct.approvalDate,
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Review methods
  async getProductReviews(productId: number): Promise<ProductReview[]> {
    return Array.from(this.productReviews.values()).filter(
      (review) => review.productId === productId,
    );
  }

  async createProductReview(
    insertReview: InsertProductReview,
  ): Promise<ProductReview> {
    const id = this.currentId++;
    const review: ProductReview = {
      ...insertReview,
      id,
      createdAt: new Date(),
      comment: insertReview.comment || null,
    };
    this.productReviews.set(id, review);
    return review;
  }

  // Review comment methods
  async getReviewComments(reviewId: number): Promise<ReviewComment[]> {
    return Array.from(this.reviewComments.values()).filter(
      (comment) => comment.reviewId === reviewId,
    );
  }

  async createReviewComment(
    insertComment: InsertReviewComment,
  ): Promise<ReviewComment> {
    const id = this.currentId++;
    const comment: ReviewComment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.reviewComments.set(id, comment);
    return comment;
  }

  // Review like methods
  async getReviewLikes(reviewId: number): Promise<ReviewLike[]> {
    return Array.from(this.reviewLikes.values()).filter(
      (like) => like.reviewId === reviewId,
    );
  }

  async createReviewLike(insertLike: InsertReviewLike): Promise<ReviewLike> {
    const id = this.currentId++;
    const like: ReviewLike = {
      ...insertLike,
      id,
      createdAt: new Date(),
    };
    this.reviewLikes.set(id, like);
    return like;
  }

  async isReviewLiked(reviewId: number, userId: number): Promise<boolean> {
    const likes = Array.from(this.reviewLikes.values());
    return likes.some(
      (like) => like.reviewId === reviewId && like.userId === userId,
    );
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentId++;
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      createdAt: new Date(),
      customization: insertCartItem.customization || null,
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(
    id: number,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.userId === userId,
    );
    userItems.forEach(([id, _]) => this.cartItems.delete(id));
    return true;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(
    id: number,
    status: string,
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      this.orders.set(id, order);
      return order;
    }
    return undefined;
  }

  // Community methods
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async createCommunityPost(
    insertPost: InsertCommunityPost,
  ): Promise<CommunityPost> {
    const id = this.currentId++;
    const post: CommunityPost = {
      ...insertPost,
      id,
      likes: 0,
      createdAt: new Date(),
      description: insertPost.description || null,
      productId: insertPost.productId || null,
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async likeCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.communityPosts.set(id, post);
      return post;
    }
    return undefined;
  }

  async getCommunityComments(postId: number): Promise<CommunityComment[]> {
    return Array.from(this.communityComments.values()).filter(
      (comment) => comment.postId === postId,
    );
  }

  async createCommunityComment(
    insertComment: InsertCommunityComment,
  ): Promise<CommunityComment> {
    const id = this.currentId++;
    const comment: CommunityComment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.communityComments.set(id, comment);
    return comment;
  }

  // Template methods
  async getBelugaTemplates(): Promise<BelugaTemplate[]> {
    return Array.from(this.belugaTemplates.values())
      .filter((template) => template.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getBelugaTemplate(id: number): Promise<BelugaTemplate | undefined> {
    return this.belugaTemplates.get(id);
  }

  async createBelugaTemplate(
    insertTemplate: InsertBelugaTemplate,
  ): Promise<BelugaTemplate> {
    const id = this.currentId++;
    const template: BelugaTemplate = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: insertTemplate.imageUrl || null,
      isActive: insertTemplate.isActive ?? true,
      status: insertTemplate.status || null,
      sortOrder: insertTemplate.sortOrder || 0,
      downloads: insertTemplate.downloads || 0,
      tags: insertTemplate.tags || [],
    };
    this.belugaTemplates.set(id, template);
    return template;
  }

  async updateBelugaTemplate(
    id: number,
    updates: Partial<InsertBelugaTemplate>,
  ): Promise<BelugaTemplate | undefined> {
    const template = this.belugaTemplates.get(id);
    if (template) {
      const updated = { ...template, ...updates, updatedAt: new Date() };
      this.belugaTemplates.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteBelugaTemplate(id: number): Promise<boolean> {
    const template = this.belugaTemplates.get(id);
    if (template) {
      template.isActive = false;
      this.belugaTemplates.set(id, template);
      return true;
    }
    return false;
  }

  async reorderBelugaTemplates(templateIds: number[]): Promise<boolean> {
    templateIds.forEach((id, index) => {
      const template = this.belugaTemplates.get(id);
      if (template) {
        template.sortOrder = index;
        this.belugaTemplates.set(id, template);
      }
    });
    return true;
  }

  // Product like methods
  async isProductLiked(productId: number, userId: number): Promise<boolean> {
    const likes = Array.from(this.productLikes.values());
    return likes.some(
      (like) => like.productId === productId && like.userId === userId,
    );
  }

  async likeProduct(productId: number, userId: number): Promise<ProductLike> {
    const id = this.currentId++;
    const like: ProductLike = {
      id,
      productId,
      userId,
      createdAt: new Date(),
    };
    this.productLikes.set(id, like);
    return like;
  }

  async unlikeProduct(productId: number, userId: number): Promise<boolean> {
    const likes = Array.from(this.productLikes.entries());
    const likeEntry = likes.find(
      ([_, like]) => like.productId === productId && like.userId === userId,
    );
    if (likeEntry) {
      this.productLikes.delete(likeEntry[0]);
      return true;
    }
    return false;
  }

  async getProductLikesCount(productId: number): Promise<number> {
    const likes = Array.from(this.productLikes.values());
    return likes.filter((like) => like.productId === productId).length;
  }

  async getProductReviewsCount(productId: number): Promise<number> {
    const reviews = Array.from(this.productReviews.values());
    return reviews.filter((review) => review.productId === productId).length;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.status, "approved")));
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.categoryId, categoryId),
          eq(products.isActive, true),
          eq(products.status, "approved"),
        ),
      );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(eq(products.isFeatured, true), eq(products.status, "approved")),
      );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, id),
          eq(products.isActive, true),
          eq(products.status, "approved"),
        ),
      );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(
    id: number,
    updates: Partial<InsertProduct>,
  ): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Review methods
  async getProductReviews(productId: number): Promise<ProductReview[]> {
    return await db
      .select()
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
  }

  async createProductReview(
    insertReview: InsertProductReview,
  ): Promise<ProductReview> {
    const [review] = await db
      .insert(productReviews)
      .values(insertReview)
      .returning();
    return review;
  }

  // Review comment methods
  async getReviewComments(reviewId: number): Promise<ReviewComment[]> {
    return await db
      .select()
      .from(reviewComments)
      .where(eq(reviewComments.reviewId, reviewId));
  }

  async createReviewComment(
    insertComment: InsertReviewComment,
  ): Promise<ReviewComment> {
    const [comment] = await db
      .insert(reviewComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Review like methods
  async getReviewLikes(reviewId: number): Promise<ReviewLike[]> {
    return await db
      .select()
      .from(reviewLikes)
      .where(eq(reviewLikes.reviewId, reviewId));
  }

  async createReviewLike(insertLike: InsertReviewLike): Promise<ReviewLike> {
    const [like] = await db
      .insert(reviewLikes)
      .values(insertLike)
      .returning();
    return like;
  }

  async isReviewLiked(reviewId: number, userId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(reviewLikes)
      .where(
        and(
          eq(reviewLikes.reviewId, reviewId),
          eq(reviewLikes.userId, userId),
        ),
      );
    return !!like;
  }

  async isReviewLiked(reviewId: number, userId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(reviewLikes)
      .where(
        and(
          eq(reviewLikes.reviewId, reviewId),
          eq(reviewLikes.userId, userId),
        ),
      );
    return !!like;
  }

  // Product like methods
  async isProductLiked(productId: number, userId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(productLikes)
      .where(
        and(
          eq(productLikes.productId, productId),
          eq(productLikes.userId, userId),
        ),
      );
    return !!like;
  }

  async likeProduct(productId: number, userId: number): Promise<ProductLike> {
    const [like] = await db
      .insert(productLikes)
      .values({ productId, userId })
      .returning();
    return like;
  }

  async unlikeProduct(productId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(productLikes)
      .where(
        and(
          eq(productLikes.productId, productId),
          eq(productLikes.userId, userId),
        ),
      );
    return (result.rowCount || 0) > 0;
  }

  async getProductLikesCount(productId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(productLikes)
      .where(eq(productLikes.productId, productId));
    return result.count;
  }

  async getProductReviewsCount(productId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));
    return result.count;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async updateCartItem(
    id: number,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return cartItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId));
    return (result.rowCount || 0) > 0;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(
    id: number,
    status: string,
  ): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Community methods
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return await db.select().from(communityPosts);
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, id));
    return post;
  }

  async createCommunityPost(
    insertPost: InsertCommunityPost,
  ): Promise<CommunityPost> {
    const [post] = await db
      .insert(communityPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async likeCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db
      .update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, id))
      .returning();
    return post;
  }

  async getCommunityComments(postId: number): Promise<CommunityComment[]> {
    return await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.postId, postId));
  }

  async createCommunityComment(
    insertComment: InsertCommunityComment,
  ): Promise<CommunityComment> {
    const [comment] = await db
      .insert(communityComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Template methods
  async getBelugaTemplates(): Promise<BelugaTemplate[]> {
    return await db.select().from(belugaTemplates);
  }

  async getBelugaTemplate(id: number): Promise<BelugaTemplate | undefined> {
    const [template] = await db
      .select()
      .from(belugaTemplates)
      .where(eq(belugaTemplates.id, id));
    return template;
  }

  async createBelugaTemplate(
    insertTemplate: InsertBelugaTemplate,
  ): Promise<BelugaTemplate> {
    const [template] = await db
      .insert(belugaTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateBelugaTemplate(
    id: number,
    updates: Partial<InsertBelugaTemplate>,
  ): Promise<BelugaTemplate | undefined> {
    const [template] = await db
      .update(belugaTemplates)
      .set(updates)
      .where(eq(belugaTemplates.id, id))
      .returning();
    return template;
  }

  async deleteBelugaTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(belugaTemplates)
      .where(eq(belugaTemplates.id, id));
    return (result.rowCount || 0) > 0;
  }

  async reorderBelugaTemplates(templateIds: number[]): Promise<boolean> {
    for (let i = 0; i < templateIds.length; i++) {
      await db
        .update(belugaTemplates)
        .set({ sortOrder: i })
        .where(eq(belugaTemplates.id, templateIds[i]));
    }
    return true;
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }

  // Payment methods
  async getPayments(orderId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async updatePaymentStatus(
    id: number,
    status: string,
  ): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // Coupon methods
  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code));
    return coupon;
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db.insert(coupons).values(insertCoupon).returning();
    return coupon;
  }

  async updateCoupon(
    id: number,
    updates: Partial<InsertCoupon>,
  ): Promise<Coupon | undefined> {
    const [coupon] = await db
      .update(coupons)
      .set(updates)
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Admin Log methods
  async getAdminLogs(): Promise<AdminLog[]> {
    return await db.select().from(adminLogs);
  }

  async createAdminLog(insertAdminLog: InsertAdminLog): Promise<AdminLog> {
    const [adminLog] = await db
      .insert(adminLogs)
      .values(insertAdminLog)
      .returning();
    return adminLog;
  }

  // Goods Editor Design methods
  async getGoodsEditorDesigns(userId?: number): Promise<GoodsEditorDesign[]> {
    if (userId) {
      return await db
        .select()
        .from(goodsEditorDesigns)
        .where(eq(goodsEditorDesigns.userId, userId));
    }
    return await db.select().from(goodsEditorDesigns);
  }

  async getGoodsEditorDesignById(
    id: number,
  ): Promise<GoodsEditorDesign | undefined> {
    const [design] = await db
      .select()
      .from(goodsEditorDesigns)
      .where(eq(goodsEditorDesigns.id, id));
    return design;
  }

  async createGoodsEditorDesign(
    insertDesign: InsertGoodsEditorDesign,
  ): Promise<GoodsEditorDesign> {
    const [design] = await db
      .insert(goodsEditorDesigns)
      .values(insertDesign)
      .returning();
    return design;
  }

  async updateGoodsEditorDesign(
    id: number,
    updates: Partial<InsertGoodsEditorDesign>,
  ): Promise<GoodsEditorDesign | undefined> {
    const [design] = await db
      .update(goodsEditorDesigns)
      .set(updates)
      .where(eq(goodsEditorDesigns.id, id))
      .returning();
    return design;
  }

  async deleteGoodsEditorDesign(id: number): Promise<boolean> {
    const result = await db
      .delete(goodsEditorDesigns)
      .where(eq(goodsEditorDesigns.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Inquiry methods
  async getInquiries(userId?: number): Promise<Inquiry[]> {
    if (userId) {
      return await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.userId, userId));
    }
    return await db.select().from(inquiries);
  }

  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id));
    return inquiry;
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values(insertInquiry)
      .returning();
    return inquiry;
  }

  async updateInquiry(
    id: number,
    updates: Partial<InsertInquiry>,
  ): Promise<Inquiry | undefined> {
    const [inquiry] = await db
      .update(inquiries)
      .set(updates)
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry;
  }
}

// Temporarily use MemoryStorage until MySQL cloud database is properly configured
export const storage = new MemStorage();
