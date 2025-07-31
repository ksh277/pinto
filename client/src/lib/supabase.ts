import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDI3NTkyMDAsImV4cCI6MTk1ODMzNTIwMH0.placeholder-key";

// Check if environment variables are properly configured
export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !==
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDI3NTkyMDAsImV4cCI6MTk1ODMzNTIwMH0.placeholder-key"
);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase environment variables not found or using placeholder values. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for Supabase tables
export interface Product {
  id: string;
  name: string;
  name_ko: string;
  description?: string;
  description_ko?: string;
  category_id: string;
  base_price: number;
  image_url?: string;
  is_featured: boolean;
  is_available: boolean;
  stock_quantity?: number;
  options?: any;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ko: string;
  description?: string;
  description_ko?: string;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  membership_tier: "basic" | "special" | "vip" | "vvip";
  total_spent: number;
  points_balance: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status:
    | "payment_completed"
    | "processing"
    | "shipping"
    | "delivered"
    | "canceled";
  total_amount: number;
  shipping_address: any; // JSON object
  payment_method: "card" | "kakao_pay" | "naver_pay" | "bank_transfer";
  payment_status: "pending" | "completed" | "failed" | "refunded";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  design_id?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  options?: any; // JSON object
  design_data?: any;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  content?: string;
  images?: string[];
  is_featured: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: "showcase" | "question" | "design_share" | "general";
  images?: string[];
  tags?: string[];
  like_count: number;
  comment_count: number;
  view_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  title_ko: string;
  description?: string;
  description_ko?: string;
  event_type: "sale" | "contest" | "announcement" | "promotion";
  start_date: string;
  end_date: string;
  banner_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  name_ko: string;
  description?: string;
  description_ko?: string;
  category:
    | "keyring"
    | "stand"
    | "smart_tok"
    | "photo_holder"
    | "corot"
    | "badge"
    | "magnet";
  file_url: string;
  preview_url?: string;
  file_format: "ai" | "psd" | "svg" | "png";
  file_size: number;
  download_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  name_ko: string;
  description?: string;
  description_ko?: string;
  service_type: "design" | "speed" | "special";
  price: number;
  delivery_time_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  options?: any; // JSON object
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  options?: any; // JSON object
  created_at: string;
  updated_at: string;
  products?: Product; // Relationship to product
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  target_type: "post" | "comment";
  target_id: string;
  created_at: string;
}
