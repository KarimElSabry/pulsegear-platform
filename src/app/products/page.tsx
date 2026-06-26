import ProductGrid from "@/components/product/ProductGrid";

export default function ProductsPage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Products
      </h1>

      <ProductGrid />
    </main>
  );
}