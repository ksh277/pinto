import { useParams, Link } from "wouter";
import { acrylicKeyrings } from "@/data/acrylicKeyrings";

export default function KeyringDetail() {
  const { id } = useParams<{ id: string }>();
  const product = acrylicKeyrings.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">상품을 찾을 수 없습니다</div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#1a1a1a] p-4">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <p className="mb-4">가격: {product.price} 원</p>
      <Link href="/category/acrylic/keyring" className="text-blue-500 underline">목록으로</Link>
    </div>
  );
}
