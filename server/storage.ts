import { 
  users, categories, products, productReviews, cartItems, orders, communityPosts, communityComments, belugaTemplates,
  type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct,
  type ProductReview, type InsertProductReview, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type CommunityPost, type InsertCommunityPost,
  type CommunityComment, type InsertCommunityComment, type BelugaTemplate, type InsertBelugaTemplate
} from "@shared/schema";

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
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Review methods
  getProductReviews(productId: number): Promise<ProductReview[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  
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
  
  // Community methods
  getCommunityPosts(): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likeCommunityPost(id: number): Promise<CommunityPost | undefined>;
  getCommunityComments(postId: number): Promise<CommunityComment[]>;
  createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment>;
  
  // Template methods
  getBelugaTemplates(): Promise<BelugaTemplate[]>;
  getBelugaTemplate(id: number): Promise<BelugaTemplate | undefined>;
  createBelugaTemplate(template: InsertBelugaTemplate): Promise<BelugaTemplate>;
  updateBelugaTemplate(id: number, updates: Partial<InsertBelugaTemplate>): Promise<BelugaTemplate | undefined>;
  deleteBelugaTemplate(id: number): Promise<boolean>;
  reorderBelugaTemplates(templateIds: number[]): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private productReviews: Map<number, ProductReview>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private communityPosts: Map<number, CommunityPost>;
  private communityComments: Map<number, CommunityComment>;
  private belugaTemplates: Map<number, BelugaTemplate>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.productReviews = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.communityPosts = new Map();
    this.communityComments = new Map();
    this.belugaTemplates = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize users (admin accounts)
    const usersData = [
      { id: 1, username: "admin", email: "admin@allthatprinting.com", password: "12345", firstName: "관리자", lastName: "", isAdmin: true, createdAt: new Date() },
      { id: 2, username: "superadmin", email: "superadmin@allthatprinting.com", password: "12345", firstName: "슈퍼관리자", lastName: "", isAdmin: true, createdAt: new Date() },
    ];
    
    usersData.forEach(user => {
      this.users.set(user.id, user as User);
    });

    // Initialize categories
    const categoriesData = [
      { id: 1, name: "T-Shirts", nameKo: "티셔츠", description: "Custom printed t-shirts", descriptionKo: "커스텀 프린팅 티셔츠", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", isActive: true },
      { id: 2, name: "Mugs", nameKo: "머그컵", description: "Custom printed mugs", descriptionKo: "커스텀 프린팅 머그컵", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400", isActive: true },
      { id: 3, name: "Stickers", nameKo: "스티커", description: "Custom stickers", descriptionKo: "커스텀 스티커", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", isActive: true },
      { id: 4, name: "Acrylic Keychains", nameKo: "아크릴 키링", description: "Custom acrylic keychains", descriptionKo: "커스텀 아크릴 키링", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true },
      { id: 5, name: "Phone Cases", nameKo: "폰케이스", description: "Custom phone cases", descriptionKo: "커스텀 폰케이스", imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400", isActive: true },
      { id: 6, name: "Tote Bags", nameKo: "에코백", description: "Custom tote bags", descriptionKo: "커스텀 에코백", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", isActive: true },
    ];

    categoriesData.forEach(cat => {
      this.categories.set(cat.id, cat as Category);
    });

    // Initialize products
    const productsData = [
      // Acrylic Keyrings
      { id: 1, name: "Acrylic Keychain", nameKo: "아크릴 키링", description: "High-quality acrylic keychain", descriptionKo: "고품질 아크릴 키링", basePrice: "8900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Small", "Medium"], colors: ["Clear", "White"] }, createdAt: new Date() },
      { id: 2, name: "Premium Acrylic Keyring", nameKo: "프리미엄 아크릴 키링", description: "Premium quality acrylic keyring", descriptionKo: "프리미엄 품질의 아크릴 키링", basePrice: "12900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Small", "Medium", "Large"], colors: ["Clear", "White", "Black"] }, createdAt: new Date() },
      { id: 3, name: "Heart Shape Acrylic Keyring", nameKo: "하트형 아크릴 키링", description: "Heart-shaped acrylic keyring", descriptionKo: "하트 모양의 아크릴 키링", basePrice: "10900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: false, customizationOptions: { sizes: ["Small", "Medium"], colors: ["Clear", "Pink", "Red"] }, createdAt: new Date() },
      
      // Korotto
      { id: 4, name: "Korotto Stand", nameKo: "코롯토 스탠드", description: "Cute korotto character stand", descriptionKo: "귀여운 코롯토 캐릭터 스탠드", basePrice: "7900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Small", "Medium"], colors: ["Clear", "White"] }, createdAt: new Date() },
      { id: 5, name: "Mini Korotto", nameKo: "미니 코롯토", description: "Small korotto character", descriptionKo: "작은 코롯토 캐릭터", basePrice: "5900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: false, customizationOptions: { sizes: ["Mini"], colors: ["Clear", "White", "Pink"] }, createdAt: new Date() },
      
      // Smart Tok
      { id: 6, name: "Smart Tok Grip", nameKo: "스마트톡 그립", description: "Phone grip with custom design", descriptionKo: "커스텀 디자인 폰 그립", basePrice: "13900", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Standard"], colors: ["Clear", "White", "Black"] }, createdAt: new Date() },
      { id: 7, name: "Premium Smart Tok", nameKo: "프리미엄 스마트톡", description: "Premium phone grip", descriptionKo: "프리미엄 폰 그립", basePrice: "16900", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Standard", "Large"], colors: ["Clear", "White", "Black", "Rose Gold"] }, createdAt: new Date() },
      
      // Stands/Dioramas
      { id: 8, name: "Acrylic Stand", nameKo: "아크릴 스탠드", description: "Clear acrylic display stand", descriptionKo: "투명 아크릴 디스플레이 스탠드", basePrice: "15900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Small", "Medium", "Large"], colors: ["Clear"] }, createdAt: new Date() },
      { id: 9, name: "Diorama Stand", nameKo: "디오라마 스탠드", description: "3D diorama display stand", descriptionKo: "3D 디오라마 디스플레이 스탠드", basePrice: "24900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: false, customizationOptions: { sizes: ["Medium", "Large"], colors: ["Clear", "White"] }, createdAt: new Date() },
      
      // Card Holders
      { id: 10, name: "Card Holder", nameKo: "포카홀더", description: "Acrylic card holder", descriptionKo: "아크릴 카드 홀더", basePrice: "6900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Standard"], colors: ["Clear", "White", "Pink"] }, createdAt: new Date() },
      { id: 11, name: "Premium Card Holder", nameKo: "프리미엄 포카홀더", description: "Premium acrylic card holder", descriptionKo: "프리미엄 아크릴 카드 홀더", basePrice: "9900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: false, customizationOptions: { sizes: ["Standard", "Large"], colors: ["Clear", "White", "Black", "Pink"] }, createdAt: new Date() },
      
      // Shakers
      { id: 12, name: "Acrylic Shaker", nameKo: "아크릴 쉐이커", description: "Fun acrylic shaker charm", descriptionKo: "재미있는 아크릴 쉐이커 참", basePrice: "11900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Small", "Medium"], colors: ["Clear", "White"] }, createdAt: new Date() },
      { id: 13, name: "Glitter Shaker", nameKo: "글리터 쉐이커", description: "Glitter-filled acrylic shaker", descriptionKo: "글리터가 들어간 아크릴 쉐이커", basePrice: "14900", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Small", "Medium"], colors: ["Clear", "Pink", "Blue", "Gold"] }, createdAt: new Date() },
      
      // Other categories
      { id: 14, name: "Custom Tote Bag", nameKo: "커스텀 에코백", description: "Eco-friendly tote bag", descriptionKo: "친환경 에코백", basePrice: "12900", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["Small", "Large"], colors: ["Natural", "Black", "Navy"] }, createdAt: new Date() },
      { id: 15, name: "Custom Pin Badge", nameKo: "커스텀 뱃지", description: "Custom pin badge", descriptionKo: "커스텀 뱃지", basePrice: "3900", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1606402179428-a57976d71fa4?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["25mm", "32mm"], colors: ["Any"] }, createdAt: new Date() },
      { id: 16, name: "Custom Tumbler", nameKo: "커스텀 텀블러", description: "Insulated tumbler", descriptionKo: "보온 텀블러", basePrice: "18900", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", isActive: true, isFeatured: true, customizationOptions: { sizes: ["350ml", "500ml"], colors: ["White", "Black", "Silver"] }, createdAt: new Date() },
    ];

    productsData.forEach(prod => {
      this.products.set(prod.id, prod as Product);
    });

    // Initialize templates
    const templatesData = [
      { id: 1, title: "Beluga Keychain Template", titleKo: "벨루가 키링 템플릿", description: "Cute beluga keychain design", descriptionKo: "귀여운 벨루가 키링 디자인", size: "50×50mm", format: "AI/PSD", downloads: 1247, tags: ["keychain", "beluga", "character"], status: "HOT", imageUrl: null, isActive: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, title: "Beluga Stand Template", titleKo: "벨루가 스탠드 템플릿", description: "Standing beluga character", descriptionKo: "서 있는 벨루가 캐릭터", size: "60×80mm", format: "AI/PSD", downloads: 897, tags: ["stand", "beluga", "character"], status: "NEW", imageUrl: null, isActive: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, title: "Beluga Smart Tok Template", titleKo: "벨루가 스마트톡 템플릿", description: "Smart tok with beluga design", descriptionKo: "벨루가 디자인 스마트톡", size: "40×40mm", format: "AI/PSD", downloads: 1156, tags: ["smarttok", "beluga", "phone"], status: "인기", imageUrl: null, isActive: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, title: "Beluga Badge Template", titleKo: "벨루가 뱃지 템플릿", description: "Round badge with beluga", descriptionKo: "벨루가가 있는 둥근 뱃지", size: "32×32mm", format: "AI/PSD", downloads: 634, tags: ["badge", "beluga", "round"], status: null, imageUrl: null, isActive: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, title: "Beluga Card Holder Template", titleKo: "벨루가 포카홀더 템플릿", description: "Photo card holder design", descriptionKo: "포토카드 홀더 디자인", size: "55×85mm", format: "AI/PSD", downloads: 789, tags: ["cardholder", "beluga", "photo"], status: "NEW", imageUrl: null, isActive: true, sortOrder: 5, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, title: "Beluga Magnet Template", titleKo: "벨루가 자석 템플릿", description: "Refrigerator magnet design", descriptionKo: "냉장고 자석 디자인", size: "50×50mm", format: "AI/PSD", downloads: 432, tags: ["magnet", "beluga", "fridge"], status: null, imageUrl: null, isActive: true, sortOrder: 6, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, title: "Beluga Korotto Template", titleKo: "벨루가 코롯토 템플릿", description: "Flat character goods", descriptionKo: "플랫 캐릭터 굿즈", size: "70×70mm", format: "AI/PSD", downloads: 923, tags: ["korotto", "beluga", "flat"], status: "HOT", imageUrl: null, isActive: true, sortOrder: 7, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, title: "Beluga Carabiner Template", titleKo: "벨루가 카라비너 템플릿", description: "Carabiner with beluga design", descriptionKo: "벨루가 디자인 카라비너", size: "45×60mm", format: "AI/PSD", downloads: 156, tags: ["carabiner", "beluga", "clip"], status: null, imageUrl: null, isActive: false, sortOrder: 8, createdAt: new Date(), updatedAt: new Date() },
    ];

    templatesData.forEach(template => {
      this.belugaTemplates.set(template.id, template as BelugaTemplate);
    });

    this.currentId = 100;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(prod => prod.isActive);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(prod => prod.categoryId === categoryId && prod.isActive);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(prod => prod.isFeatured && prod.isActive);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Review methods
  async getProductReviews(productId: number): Promise<ProductReview[]> {
    return Array.from(this.productReviews.values()).filter(review => review.productId === productId);
  }

  async createProductReview(insertReview: InsertProductReview): Promise<ProductReview> {
    const id = this.currentId++;
    const review: ProductReview = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.productReviews.set(id, review);
    return review;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentId++;
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      createdAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
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
    const userItems = Array.from(this.cartItems.entries()).filter(([_, item]) => item.userId === userId);
    userItems.forEach(([id, _]) => this.cartItems.delete(id));
    return true;
  }

  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
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

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
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
    return Array.from(this.communityPosts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentId++;
    const post: CommunityPost = {
      ...insertPost,
      id,
      likes: 0,
      createdAt: new Date(),
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
    return Array.from(this.communityComments.values()).filter(comment => comment.postId === postId);
  }

  async createCommunityComment(insertComment: InsertCommunityComment): Promise<CommunityComment> {
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
      .filter(template => template.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getBelugaTemplate(id: number): Promise<BelugaTemplate | undefined> {
    return this.belugaTemplates.get(id);
  }

  async createBelugaTemplate(insertTemplate: InsertBelugaTemplate): Promise<BelugaTemplate> {
    const id = this.currentId++;
    const template: BelugaTemplate = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.belugaTemplates.set(id, template);
    return template;
  }

  async updateBelugaTemplate(id: number, updates: Partial<InsertBelugaTemplate>): Promise<BelugaTemplate | undefined> {
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
}

export const storage = new MemStorage();
