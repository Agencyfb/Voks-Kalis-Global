"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

export default function ConfirmOTPForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmail(window.sessionStorage.getItem("password-reset-email") || "");
  }, []);

  async function handleCodeSubmit(event) {
    event.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/confirm-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to verify this code.");
        return;
      }
      setResetToken(result.resetToken);
    } catch {
      setError("We couldn't reach Voks-Kalis Global. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Use at least 8 characters, including one uppercase letter and one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Unable to update your password.");
        return;
      }
      window.sessionStorage.removeItem("password-reset-email");
      router.replace("/login");
    } catch {
      setError("We couldn't reach Voks-Kalis Global. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!email) {
    return (
      <div className="px-6 py-10 text-center sm:px-12 sm:py-14">
        <p className="text-sm text-ink/65">Start by entering your email address to request a reset code.</p>
        <a href="/forgot-password" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-light">
          Request a code <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  return resetToken ? (
    <form onSubmit={handlePasswordSubmit} className="px-6 py-8 sm:px-12 sm:py-10">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-clay">New password</p>
        <h2 className="mt-2 font-display text-3xl text-forest">Choose a new password</h2>
        <p className="mt-2 text-sm text-ink/60">Use at least 8 characters, including one uppercase letter and one number.</p>
      </div>
      <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-ink">New password</label>
      <div className="relative">
        <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
        <input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border border-forest/15 bg-cream px-4 py-3.5 pl-11 text-sm text-ink focus:border-gold focus:bg-white focus:outline-none" />
      </div>
      <label htmlFor="confirm-password" className="mb-2 mt-5 block text-sm font-medium text-ink">Confirm new password</label>
      <div className="relative">
        <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
        <input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-forest/15 bg-cream px-4 py-3.5 pl-11 text-sm text-ink focus:border-gold focus:bg-white focus:outline-none" />
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-clay">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-dark disabled:cursor-wait disabled:opacity-70">
        {isSubmitting ? "Updating password..." : "Update password"}
        {!isSubmitting && <ArrowRight size={16} />}
      </button>
    </form>
  ) : (
    <form onSubmit={handleCodeSubmit} className="px-6 py-8 sm:px-12 sm:py-10">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-clay">Email verification</p>
        <h2 className="mt-2 font-display text-3xl text-forest">Enter your reset code</h2>
        <p className="mt-2 text-sm text-ink/60">Enter the six-digit code sent to your email. It expires in 10 minutes.</p>
      </div>
      <label htmlFor="reset-code" className="mb-2 block text-sm font-medium text-ink">Six-digit code</label>
      <div className="relative">
        <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
        <input
          id="reset-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="w-full rounded-xl border border-forest/15 bg-cream px-4 py-3.5 pl-11 text-lg tracking-[0.35em] text-ink placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none"
        />
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-clay">{error}</p>}
      <button type="submit" disabled={isSubmitting || code.length !== 6} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-dark disabled:cursor-wait disabled:opacity-70">
        {isSubmitting ? "Verifying code..." : "Verify code"}
        {!isSubmitting && <ArrowRight size={16} />}
      </button>
      <p className="mt-5 text-center text-xs text-ink/55">
        Didn&apos;t receive it? <a href="/forgot-password" className="font-semibold text-forest hover:text-forest-light">Request another code</a>
      </p>
    </form>
  );
}
