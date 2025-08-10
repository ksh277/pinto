export interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string | null;
  category: string | null;
  status: string | null;
  created_at: string | null;
}
