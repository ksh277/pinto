export const APP_CONFIG = {
  name: "Pinto",
  nameKo: "핀토",
  description: "Custom printing services for personalized merchandise",
  descriptionKo: "개인화된 굿즈를 위한 커스텀 프린팅 서비스",
  currency: "KRW",
  currencySymbol: "₩",
  languages: ["ko", "en"],
  defaultLanguage: "ko",
  supportedProducts: [
    "t-shirts",
    "mugs",
    "stickers", 
    "keychains",
    "phone-cases",
    "tote-bags",
    "notebooks",
    "badges"
  ],
  paymentMethods: [
    "credit-card",
    "kakao-pay",
    "naver-pay",
    "bank-transfer"
  ],
  shipping: {
    standard: {
      price: 3000,
      days: "3-5"
    },
    express: {
      price: 5000,
      days: "1-2"
    }
  },
  social: {
    instagram: "@pinto",
    twitter: "@pinto",
    line: "@pinto",
    email: "info@pinto.co.kr"
  }
};

export const PRODUCT_CATEGORIES = [
  {
    id: "t-shirts",
    name: "T-Shirts",
    nameKo: "티셔츠",
    icon: "👕",
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "mugs",
    name: "Mugs",
    nameKo: "머그컵",
    icon: "☕",
    color: "bg-green-100 text-green-800"
  },
  {
    id: "stickers",
    name: "Stickers",
    nameKo: "스티커",
    icon: "🏷️",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: "keychains",
    name: "Keychains",
    nameKo: "키링",
    icon: "🔑",
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "phone-cases",
    name: "Phone Cases",
    nameKo: "폰케이스",
    icon: "📱",
    color: "bg-red-100 text-red-800"
  },
  {
    id: "tote-bags",
    name: "Tote Bags",
    nameKo: "에코백",
    icon: "👜",
    color: "bg-indigo-100 text-indigo-800"
  }
];

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PROFILE: "/profile",
  ORDERS: "/orders",
  COMMUNITY: "/community",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN: "/admin"
};

export const API_ENDPOINTS = {
  CATEGORIES: "/api/categories",
  PRODUCTS: "/api/products",
  CART: "/api/cart",
  ORDERS: "/api/orders",
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout"
  },
  COMMUNITY: {
    POSTS: "/api/community/posts",
    COMMENTS: "/api/community/posts/:id/comments"
  }
};

export const STORAGE_KEYS = {
  THEME: "theme",
  LANGUAGE: "language",
  USER: "user",
  CART: "cart"
};
