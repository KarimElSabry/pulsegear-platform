import ProductCard from "./ProductCard";

import { products } from "@/lib/products";

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}

    </div>
  );
}