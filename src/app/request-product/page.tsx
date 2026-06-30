import ProductRequestForm from "@/components/ProductRequestForm";

export default function RequestProductPage() {
  return (
    <main className="w-full min-h-screen bg-zinc-950 py-20 px-6">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">
            Can't Find what you're looking for?
          </span>
          <h1 className="text-4xl font-black text-white uppercase">
            Request a Product
          </h1>
          <p className="text-zinc-400 text-lg">
            Fill in the form and we'll dig deep and source it for you.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <ProductRequestForm />
        </div>

      </div>
    </main>
  );
}