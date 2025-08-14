import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";

// ProductGrid에서 사용하는 공통 상품 타입과 핸들러 타입 정의
// (단일 소스의 Product 타입을 그대로 사용)
type ProductGridProps = {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function ProductGrid({ 
  products, 
  onAddToCart, 
  onToggleFavorite,
  className = ""
}: ProductGridProps) {
  return (
    <motion.div 
      className={`unified-mobile-grid ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {products.map((p: Product) => (
        // key는 문자열만 허용되는 경우가 있으므로 String으로 변환
        <motion.div key={String(p.id)} variants={itemVariants}>
          <ProductCard
            product={p}
            // 불필요한 중괄호 사용 시 TS 오류가 발생할 수 있어 단순 전달
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}