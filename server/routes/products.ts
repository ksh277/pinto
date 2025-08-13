import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

const mock = [
  { id: 1, category: "acrylic", subcategory: "keyring", name_ko: "투명 아크릴 키링", price_krw: 1200, review_count: 11774 },
  { id: 2, category: "acrylic", subcategory: "keyring", name_ko: "하프미러 아크릴 키링", price_krw: 1700, review_count: 1321 },
  { id: 3, category: "acrylic", subcategory: "keyring", name_ko: "글리터 아크릴 키링", price_krw: 1200, review_count: 1031 },
  { id: 4, category: "acrylic", subcategory: "keyring", name_ko: "유색·투명컬러 아스텔 키링", price_krw: 1200, review_count: 6430 },
  { id: 5, category: "acrylic", subcategory: "keyring", name_ko: "자개 아크릴키링", price_krw: 1200, review_count: 793 },
  { id: 6, category: "acrylic", subcategory: "keyring", name_ko: "렌티큘러 키링", price_krw: 1800, review_count: 358 },
  { id: 7, category: "acrylic", subcategory: "keyring", name_ko: "거울 아크릴 키링", price_krw: 1700, review_count: 331 },
  { id: 8, category: "acrylic", subcategory: "keyring", name_ko: "홀로그램 아크릴 키링", price_krw: 1700, review_count: 1008 },
  { id: 9, category: "acrylic", subcategory: "keyring", name_ko: "5T 하프미러 아크릴 키링", price_krw: 1900, review_count: 286 },
  { id: 10, category: "acrylic", subcategory: "keyring", name_ko: "5T 투명 아크릴 키링", price_krw: 1400, review_count: 569 },
  { id: 11, category: "acrylic", subcategory: "keyring", name_ko: "뮤트컬러 아크릴 키링", price_krw: 1200, review_count: 714 },
  { id: 12, category: "acrylic", subcategory: "keyring", name_ko: "야광 아크릴 키링", price_krw: 1300, review_count: 289 },
  { id: 13, category: "acrylic", subcategory: "keyring", name_ko: "스핀 아크릴 키링", price_krw: 1300, review_count: 236 },
  { id: 14, category: "acrylic", subcategory: "keyring", name_ko: "앞뒤도바 5T 아크릴 키링", price_krw: 1800, review_count: 144 },
  { id: 15, category: "acrylic", subcategory: "keyring", name_ko: "파스텔 양면 아스텔 아크릴 키링", price_krw: 1300, review_count: 317 },
];

router.get("/", async (req, res) => {
  const category = (req.query.category as string | undefined)?.toLowerCase();
  const subcategory = (req.query.subcategory as string | undefined)?.toLowerCase();
  const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || "15")));
  const page = Math.max(1, parseInt((req.query.page as string) || "1"));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const items = mock
      .filter(p => !category || p.category === category)
      .filter(p => !subcategory || p.subcategory === subcategory);
    return res.json({ items, total: items.length, page, limit });
  }

  let q = supabase.from("products").select("*", { count: "exact" });
  if (category) q = q.eq("category", category);
  if (subcategory) q = q.eq("subcategory", subcategory);
  const { data, error, count } = await q.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    return res.status(500).json({ items: [], total: 0, page, limit, error: error.message });
  }
  return res.json({ items: data ?? [], total: count ?? 0, page, limit });
});

export default router;

