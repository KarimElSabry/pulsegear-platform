"use client";

import { useState } from "react";

export default function ProductRequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    governorate: "",
    city: "",
    street: "",
    product: "",
    budget: "",
    notes: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.status === "success") {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          governorate: "",
          city: "",
          street: "",
          product: "",
          budget: "",
          notes: "",
        });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-400 p-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-black text-white uppercase">Product Request Form</h2>

      {/* Personal Info */}
      <input required name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className={inputClass} />
      <input required name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClass} />
      <input required name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputClass} />

      {/* Address */}
      <input required name="governorate" placeholder="Governorate" value={formData.governorate} onChange={handleChange} className={inputClass} />
      <input required name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputClass} />
      <input required name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} className={inputClass} />

      {/* Product Info */}
      <input required name="product" placeholder="Product Name" value={formData.product} onChange={handleChange} className={inputClass} />
      <input required name="budget" placeholder="Budget (EGP)" value={formData.budget} onChange={handleChange} className={inputClass} />
      <textarea name="notes" placeholder="Additional Notes (Optional)" value={formData.notes} onChange={handleChange} className={inputClass} rows={4} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
      >
        {status === "loading" ? "Submitting..." : "Submit Request"}
      </button>

      {/* Status Messages */}
      {status === "success" && <p className="text-green-400 font-medium text-center">✅ Request submitted successfully!</p>}
      {status === "error" && <p className="text-red-400 font-medium text-center">❌ Something went wrong. Please try again.</p>}
    </form>
  );
}