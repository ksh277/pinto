-- Populate Supabase with sample data for Korean e-commerce platform

-- Note: Using snake_case field names to match Supabase schema

-- Insert sample categories (using UUID format)
INSERT INTO categories (name, name_ko, description, description_ko, image_url, is_active, display_order) VALUES
('T-Shirts', '티셔츠', 'Custom printed t-shirts', '커스텀 프린팅 티셔츠', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', true, 1),
('Mugs', '머그컵', 'Custom printed mugs', '커스텀 프린팅 머그컵', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', true, 2),
('Stickers', '스티커', 'Custom stickers', '커스텀 스티커', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true, 3),
('Acrylic Keychains', '아크릴 키링', 'Custom acrylic keychains', '커스텀 아크릴 키링', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', true, 4),
('Phone Cases', '폰케이스', 'Custom phone cases', '커스텀 폰케이스', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400', true, 5);

-- Get category IDs for reference (will need to run these separately)
-- We'll insert products with manual category_id references

-- Insert sample products (you'll need to replace category_id with actual UUIDs from categories table)
-- INSERT INTO products (name, name_ko, description, description_ko, base_price, image_url, is_featured, is_available, stock_quantity) VALUES
-- ('Transparent Acrylic Keychain', '투명 아크릴 키링', 'Crystal clear acrylic keychain perfect for any design', '어떤 디자인에도 완벽한 투명 아크릴 키링', 6000.00, '/api/placeholder/300/300', true, true, 100),
-- ('Custom Phone Case', '맞춤형 핸드폰 케이스', 'Durable custom phone case for all models', '모든 기종용 내구성 좋은 맞춤형 케이스', 15000.00, '/api/placeholder/300/300', true, true, 200);

-- Since Supabase uses auth.users, we'll need to handle user creation differently
-- Community posts and reviews will need actual user UUIDs from auth.users