// src/app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Admin Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <span className="text-purple-400 font-bold text-lg">🛠️ Admin</span>
          <a
            href="/admin"
            className="text-gray-400 hover:text-white text-sm transition"
          >
            ➕ Add Product
          </a>
          <a
            href="/admin/products"
            className="text-gray-400 hover:text-white text-sm transition"
          >
            📦 Manage Products
          </a>
          <a
            href="/"
            className="text-gray-400 hover:text-white text-sm transition ml-auto"
          >
            ← Back to Site
          </a>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}