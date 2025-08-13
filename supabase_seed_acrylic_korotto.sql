INSERT INTO public.products (category, subcategory, name_ko, name_en, slug, price_krw, review_count)
VALUES
  ('acrylic','korotto','자립형 두꺼운 아크릴 스탠드 코롯토 (8T/9T)','KorottoThickStand8t9t','korotto-thick-stand-8t-9t',1700,0),
  ('acrylic','korotto','뒤도바 코롯토 자립형 두꺼운 아크릴 스탠드 (10T)','KorottoBackbarThickStand10t','korotto-backbar-thick-stand-10t',2300,0),
  ('acrylic','korotto','아프로바 입체형 코롯토 자립형 두꺼운 아크릴 스탠드 (10T)','Aprova3dKorottoThickStand10t','aprova-3d-korotto-thick-stand-10t',2300,0),
  ('acrylic','korotto','렌티큘러 코롯토 두꺼운 아크릴스탠드 렌티코롯토','LenticularKorottoThickStand','lenticular-korotto-thick-stand',2600,0)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  name_ko = EXCLUDED.name_ko,
  name_en = EXCLUDED.name_en,
  price_krw = EXCLUDED.price_krw,
  review_count = EXCLUDED.review_count;
