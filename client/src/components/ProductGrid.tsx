import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
}

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
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}