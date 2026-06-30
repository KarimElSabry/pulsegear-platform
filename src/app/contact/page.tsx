import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen bg-zinc-950 py-20 px-6">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">
            Get In Touch
          </span>
          <h1 className="text-4xl font-black text-white uppercase">
            Contact Us
          </h1>
          <p className="text-zinc-400 text-lg">
            Have a question? We'd love to hear from you.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <ContactForm />
        </div>

      </div>
    </main>
  );
}