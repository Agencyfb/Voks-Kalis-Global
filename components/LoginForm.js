"use client";

import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

const initialValues = { email: "", password: "" };

function validate(values) {
  const errors = {};

  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.password) errors.password = "Enter your password.";

  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [destination, setDestination] = useState("/dashboard");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setServerError("");
    setSubmitted(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setServerError("");
    setSubmitted(false);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setServerError(result.error || "We couldn't sign you in. Please try again.");
        return;
      }

      try {
        window.localStorage.setItem("haven-user", JSON.stringify({
          name: `${result.user.firstName} ${result.user.lastName}`.trim(),
          email: result.user.email,
          role: result.user.role,
        }));
      } catch {}
      setDestination(result.user.role === "admin" ? "/admin" : "/dashboard");
      setSubmitted(true);
    } catch {
      setServerError("We couldn't reach Voks-Kalis Global. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="px-6 py-14 text-center sm:px-12 sm:py-20">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream">
          <Check size={25} />
        </span>
        <h2 className="mt-6 font-display text-3xl text-forest">Welcome back.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65">You&apos;re signed in and ready to continue your property search.</p>
        <a href={destination} className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream hover:bg-forest-light">
          {destination === "/admin" ? "Open admin dashboard" : "Open dashboard"} <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 py-8 sm:px-12 sm:py-10">
      <div className="grid gap-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">Email address</label>
          <div className="relative">
            <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
            <input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className={`w-full rounded-xl border bg-cream px-4 py-3.5 pl-11 text-sm text-ink placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none ${errors.email ? "border-clay" : "border-forest/15"}`} />
          </div>
          {errors.email && <p id="email-error" className="mt-1.5 text-xs text-clay">{errors.email}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
            <a href="/forgot-password" className="text-xs font-medium text-forest hover:text-forest-light">Forgot password?</a>
          </div>
          <div className="relative">
            <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={values.password} onChange={handleChange} placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className={`w-full rounded-xl border bg-cream py-3.5 pl-11 pr-12 text-sm text-ink placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none ${errors.password ? "border-clay" : "border-forest/15"}`} />
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-forest/55 hover:text-forest">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p id="password-error" className="mt-1.5 text-xs text-clay">{errors.password}</p>}
        </div>
      </div>

      {serverError && <p role="alert" className="mt-5 text-sm text-clay">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-dark disabled:cursor-wait disabled:opacity-70">
        {isSubmitting ? "Signing in..." : "Sign in"} {!isSubmitting && <ArrowRight size={16} />}
      </button>
      <p className="mt-5 text-center text-xs text-ink/45">New to Voks-Kalis Global? <a href="/register" className="font-semibold text-forest hover:text-forest-light">Create an account</a></p>
    </form>
  );
}