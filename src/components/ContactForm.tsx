// src/app/components/ContactForm.tsx

"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "contact", ...formData }), // ✅ التعديل هنا
      });

      const data = await res.json();

      if (data.status === "success") {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
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
      <h2 className="text-2xl font-black text-white uppercase">Contact Us</h2>

      <input
        required
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        className={inputClass}
      />
      <input
        required
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className={inputClass}
      />
      <input
        name="phone"
        placeholder="Phone Number (Optional)"
        value={formData.phone}
        onChange={handleChange}
        className={inputClass}
      />
      <input
        required
        name="subject"
        placeholder="Subject"
        value={formData.subject}
        onChange={handleChange}
        className={inputClass}
      />
      <textarea
        required
        name="message"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
        className={inputClass}
        rows={5}
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>

      {status === "success" && (
        <p className="text-green-400 font-medium text-center">
          ✅ Message sent successfully!
        </p>
      )}
      {status === "error" && (
        <p className="text-red-400 font-medium text-center">
          ❌ Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}