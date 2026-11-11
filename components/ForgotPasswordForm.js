"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to send a verification code right now.");
        return;
      }

      window.sessionStorage.setItem("password-reset-email", email.trim().toLowerCase());
      router.push("/confirm-otp");
    } catch {
      setError("We couldn't reach Voks-Kalis Global. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-8 sm:px-12 sm:py-10">
      <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-ink">Email address</label>
      <div className="relative">
        <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-forest/15 bg-cream px-4 py-3.5 pl-11 text-sm text-ink placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none"
        />
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-clay">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-dark disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Sending code..." : "Send verification code"}
        {!isSubmitting && <ArrowRight size={16} />}
      </button>
      <p className="mt-5 text-center text-xs text-ink/55">
        Remember your password? <a href="/login" className="font-semibold text-forest hover:text-forest-light">Back to sign in</a>
      </p>
    </form>
  );
}
