INSERT INTO public.products (category, subcategory, name_ko, name_en, slug, price_krw, review_count)
VALUES
  ('acrylic','keyring','투명 아크릴 키링','ClearAcrylicKeyring','clear-acrylic-keyring',1200,11774),
  ('acrylic','keyring','하프미러 아크릴 키링','HalfMirrorAcrylicKeyring','half-mirror-acrylic-keyring',1700,1321),
  ('acrylic','keyring','글리터 아크릴 키링','GlitterAcrylicKeyring','glitter-acrylic-keyring',1200,1031),
  ('acrylic','keyring','유색·투명컬러 아스텔 키링','ColoredTransparentAstelKeyring','colored-transparent-astel-keyring',1200,6430),
  ('acrylic','keyring','자개 아크릴키링','NacreAcrylicKeyring','nacre-acrylic-keyring',1200,793),
  ('acrylic','keyring','렌티큘러 키링','LenticularKeyring','lenticular-keyring',1800,358),
  ('acrylic','keyring','거울 아크릴 키링','MirrorAcrylicKeyring','mirror-acrylic-keyring',1700,331),
  ('acrylic','keyring','홀로그램 아크릴 키링','HologramAcrylicKeyring','hologram-acrylic-keyring',1700,1008),
  ('acrylic','keyring','5T 하프미러 아크릴 키링','5THalfMirrorAcrylicKeyring','5t-half-mirror-acrylic-keyring',1900,286),
  ('acrylic','keyring','5T 투명 아크릴 키링','5TClearAcrylicKeyring','5t-clear-acrylic-keyring',1400,569),
  ('acrylic','keyring','뮤트컬러 아크릴 키링','MuteColorAcrylicKeyring','mute-color-acrylic-keyring',1200,714),
  ('acrylic','keyring','야광 아크릴 키링','GlowInTheDarkAcrylicKeyring','glow-in-the-dark-acrylic-keyring',1300,289),
  ('acrylic','keyring','스핀 아크릴 키링','SpinAcrylicKeyring','spin-acrylic-keyring',1300,236),
  ('acrylic','keyring','앞뒤도바 5T 아크릴 키링','BothSides5tAcrylicKeyring','both-sides-5t-acrylic-keyring',1800,144),
  ('acrylic','keyring','파스텔 양면 아스텔 아크릴 키링','PastelDoubleAstelAcrylicKeyring','pastel-double-astel-acrylic-keyring',1300,317)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  name_ko = EXCLUDED.name_ko,
  name_en = EXCLUDED.name_en,
  price_krw = EXCLUDED.price_krw,
  review_count = EXCLUDED.review_count;
