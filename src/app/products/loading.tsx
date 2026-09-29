// src/app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-label="Loading products">
      <div className="mb-10 h-10 w-64 animate-pulse rounded-lg bg-surface-3" />
      <div className="mb-10 h-20 animate-pulse rounded-2xl bg-surface-2" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card animate-pulse overflow-hidden">
            <div className="aspect-square bg-surface-3" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-1/3 rounded bg-surface-3" />
              <div className="h-4 w-2/3 rounded bg-surface-3" />
              <div className="h-5 w-1/4 rounded bg-surface-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
