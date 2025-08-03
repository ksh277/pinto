-- Community Tables for Supabase
-- Execute this SQL in your Supabase SQL Editor to create the community tables

-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  description TEXT,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  user_id BIGINT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_comments table
CREATE TABLE IF NOT EXISTS public.community_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_likes table
CREATE TABLE IF NOT EXISTS public.community_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for community_posts
CREATE POLICY "Anyone can view community posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert community posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own community posts" ON public.community_posts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own community posts" ON public.community_posts
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for community_comments
CREATE POLICY "Anyone can view community comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert community comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own community comments" ON public.community_comments
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own community comments" ON public.community_comments
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for community_likes
CREATE POLICY "Anyone can view community likes" ON public.community_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage community likes" ON public.community_likes
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.community_posts (title, content, description, image_url, likes, user_id, username) VALUES 
('나만의 캐릭터 키링 완성!', '홀로그램 효과가 너무 예뻐요! 친구들한테도 추천했습니다. 배송도 빠르고 퀄리티도 만족스러워서 다음에 또 주문할 예정입니다. 처음 만들어봤는데 생각보다 쉽고 결과물이 좋아서 놀랐습니다.', '홀로그램 효과가 너무 예뻐요! 친구들한테도 추천했습니다.', 'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=300&h=300&fit=crop', 245, 1, '네기다***'),
('홀로그램 스티커 대박!', '제작 퀄리티가 기대 이상이었어요. 다음에 또 만들 거예요. 색감도 선명하고 접착력도 좋아서 정말 만족합니다. 친구들도 다 예쁘다고 하네요!', '제작 퀄리티가 기대 이상이었어요. 다음에 또 만들 거예요.', 'https://images.unsplash.com/photo-1544996184-8b0e6c1b8e8a?w=300&h=300&fit=crop', 189, 2, '모토***'),
('투명 아크릴 스탠드 후기', '각인도 선명하고 부드럽고 선물용으로 완벽합니다. 받는 사람도 너무 좋아해서 뿌듯했어요. 포장도 깔끔하게 해주셔서 감사합니다.', '각인도 선명하고 부드럽고 선물용으로 완벽합니다.', 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=300&h=300&fit=crop', 167, 3, '짱구***'),
('레진 키링 DIY 성공!', '퀄리티가 정말 만족스러워요. 다시 주문할 예정입니다. 처음 만들어봤는데 생각보다 결과물이 좋아서 놀랐습니다. 튜토리얼도 잘 되어있어요.', '퀄리티가 정말 만족스러워요. 다시 주문할 예정입니다.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop', 134, 1, '토루***'),
('내 굿즈 첫 제작 후기', '처음인데도 너무 잘 만들어져서 감동이었습니다. 디자인 상담도 친절하게 해주셔서 감사했어요. 다음에는 더 큰 사이즈로 만들어볼 예정입니다.', '처음인데도 너무 잘 만들어져서 감동이었습니다.', 'https://images.unsplash.com/photo-1541280910-90e3b707ed5e?w=300&h=300&fit=crop', 112, 2, 'dlwlrma***'),
('연인 선물로 딱이에요!', '포장도 고급스럽고 퀄리티도 매우 만족합니다. 특별한 날 선물로 정말 추천드려요. 커플 키링으로 만들었는데 너무 예뻐요!', '포장도 고급스럽고 퀄리티도 매우 만족합니다.', 'https://images.unsplash.com/photo-1596254513635-c3ad7fd62f9b?w=300&h=300&fit=crop', 198, 3, 'yeonwoo***');

-- Insert sample comments
INSERT INTO public.community_comments (post_id, user_id, comment) VALUES 
(1, 2, '정말 예쁘게 나왔네요! 저도 만들어보고 싶어요.'),
(1, 3, '홀로그램 효과가 진짜 좋네요. 어디서 제작하셨나요?'),
(1, 1, '감사합니다! 다음에 다른 디자인으로도 만들어볼게요.'),
(2, 1, '스티커 퀄리티가 정말 좋아보여요!'),
(2, 3, '저도 홀로그램 스티커 주문하려고 하는데 팁 있나요?'),
(3, 2, '투명 아크릴 정말 깔끔하네요. 선물로 딱일 것 같아요.'),
(4, 3, 'DIY 키링 만들기 어렵지 않았나요?'),
(5, 1, '첫 제작이라고는 믿어지지 않을 정도로 잘 나왔네요!'),
(6, 2, '연인 선물로 정말 좋을 것 같아요. 포장도 예쁘고!');

-- Insert sample likes
INSERT INTO public.community_likes (post_id, user_id) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 1), (3, 3),
(4, 2), (4, 3),
(5, 1), (5, 2),
(6, 1), (6, 3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);