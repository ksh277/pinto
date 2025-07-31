-- Supabase Storage 버킷 생성 SQL
-- 이 스크립트를 Supabase 콘솔의 SQL Editor에서 실행하세요

-- 1. Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('custom-designs', 'custom-designs', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('post-images', 'post-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- 2. Storage 정책 생성
-- custom-designs 버킷 정책
CREATE POLICY "Allow authenticated users to upload custom designs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'custom-designs' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view custom designs" ON storage.objects FOR SELECT USING (
  bucket_id = 'custom-designs'
);

CREATE POLICY "Allow users to update their own custom designs" ON storage.objects FOR UPDATE USING (
  bucket_id = 'custom-designs' AND auth.uid()::text = owner
);

CREATE POLICY "Allow users to delete their own custom designs" ON storage.objects FOR DELETE USING (
  bucket_id = 'custom-designs' AND auth.uid()::text = owner
);

-- post-images 버킷 정책
CREATE POLICY "Allow authenticated users to upload post images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view post images" ON storage.objects FOR SELECT USING (
  bucket_id = 'post-images'
);

CREATE POLICY "Allow users to update their own post images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'post-images' AND auth.uid()::text = owner
);

CREATE POLICY "Allow users to delete their own post images" ON storage.objects FOR DELETE USING (
  bucket_id = 'post-images' AND auth.uid()::text = owner
);

-- product-images 버킷 정책 (관리자만 업로드 가능)
CREATE POLICY "Allow admins to upload product images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view product images" ON storage.objects FOR SELECT USING (
  bucket_id = 'product-images'
);

CREATE POLICY "Allow admins to update product images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow admins to delete product images" ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);

-- 3. 테이블 RLS 정책 생성
-- users 테이블 정책
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (
  auth.uid() = id
);

CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (
  auth.uid() = id
);

CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- community_posts 테이블 정책
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (
  auth.uid() = user_id
);

-- community_comments 테이블 정책
CREATE POLICY "Anyone can view comments" ON community_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON community_comments FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own comments" ON community_comments FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own comments" ON community_comments FOR DELETE USING (
  auth.uid() = user_id
);

-- likes 테이블 정책
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes" ON likes FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (
  auth.uid() = user_id
);

-- favorites 테이블 정책
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can create their own favorites" ON favorites FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (
  auth.uid() = user_id
);

-- notifications 테이블 정책
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (
  auth.uid() = user_id
);

-- orders 테이블 정책
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (
  auth.uid() = user_id
);

-- order_items 테이블 정책
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- cart_items 테이블 정책
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (
  auth.uid() = user_id
);

-- goods_editor_designs 테이블 정책
CREATE POLICY "Users can view their own designs" ON goods_editor_designs FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can create their own designs" ON goods_editor_designs FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own designs" ON goods_editor_designs FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own designs" ON goods_editor_designs FOR DELETE USING (
  auth.uid() = user_id
);

-- inquiries 테이블 정책
CREATE POLICY "Users can view their own inquiries" ON inquiries FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can create inquiries" ON inquiries FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own inquiries" ON inquiries FOR UPDATE USING (
  auth.uid() = user_id
);

-- 공개 데이터 정책
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Anyone can view templates" ON templates FOR SELECT USING (true);
CREATE POLICY "Anyone can view additional_services" ON additional_services FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_reviews" ON product_reviews FOR SELECT USING (true);

-- Reviews table RLS and policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);