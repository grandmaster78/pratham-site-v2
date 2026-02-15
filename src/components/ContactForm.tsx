"use client";

import { useState } from "react";

// Replace with your Formspree form ID: https://formspree.io/
const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ID
  ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`
  : "";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!FORMSPREE_ENDPOINT) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="sr-only">
          Your email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:border-[#0071bc]/50 focus:outline-none focus:ring-1 focus:ring-[#0071bc]/30"
        />
      </div>
      <div>
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Your message"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:border-[#0071bc]/50 focus:outline-none focus:ring-1 focus:ring-[#0071bc]/30 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg border border-[#0071bc] bg-[#0071bc]/10 px-6 py-3 font-mono text-sm text-[#0071bc] transition-colors hover:bg-[#0071bc]/20 disabled:opacity-50"
      >
        {status === "sending"
          ? "Sending..."
          : status === "success"
            ? "Sent"
            : status === "error"
              ? "Try again"
              : "Send"}
      </button>
      {!FORMSPREE_ENDPOINT && (
        <p className="text-xs text-zinc-600">
          Set NEXT_PUBLIC_FORMSPREE_ID in .env.local to enable the form. Or use
          the email link above.
        </p>
      )}
    </form>
  );
}
