import { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <div className="border rounded-xl p-4 shadow">

      <img
        src={product.image}
        alt={product.name}
      />

      <h2 className="font-bold mt-4">
        {product.name}
      </h2>

      <p>{product.brand}</p>

      <p>{product.condition}</p>

      <p>{product.price} EGP</p>

    </div>
  );
}