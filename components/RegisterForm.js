"use client";

import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "buyer",
  terms: false,
};

function validate(values) {
  const errors = {};

  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^\+?[0-9\s()-]{8,}$/.test(values.phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }
  if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
    errors.password = "Add one uppercase letter and one number.";
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (!values.terms) errors.terms = "Please accept the terms to continue.";

  return errors;
}

function Field({ label, name, type = "text", value, onChange, error, placeholder, icon: Icon }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full rounded-xl border bg-cream px-4 py-3.5 text-sm text-ink placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none ${Icon ? "pl-11" : ""} ${error ? "border-clay" : "border-forest/15"}`}
        />
      </div>
      {error && <p id={`${name}-error`} className="mt-1.5 text-xs text-clay">{error}</p>}
    </div>
  );
}

export default function RegisterForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: values.role,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setServerError(result.error || "We couldn't create your account. Please try again.");
        return;
      }

      try {
        window.localStorage.setItem("haven-user", JSON.stringify({
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          role: values.role,
        }));
      } catch {}
      setSubmitted(true);
    } catch {
      setServerError("We couldn't reach Haven. Check your connection and try again.");
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
        <h2 className="mt-6 font-display text-3xl text-forest">Welcome to Haven.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65">
          Your account is ready. We&apos;ll use {values.email} to share properties that fit your plans.
        </p>
        <a href="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream hover:bg-forest-light">
          Open dashboard <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 py-8 sm:px-12 sm:py-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="firstName" value={values.firstName} onChange={handleChange} error={errors.firstName} placeholder="Ada" icon={UserRound} />
        <Field label="Last name" name="lastName" value={values.lastName} onChange={handleChange} error={errors.lastName} placeholder="Okafor" />
        <Field label="Email address" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" icon={Mail} />
        <Field label="Phone number" name="phone" type="tel" value={values.phone} onChange={handleChange} error={errors.phone} placeholder="+234 800 000 0000" />
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">I am joining Haven as</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: "buyer", label: "Buyer", description: "Find your next home" },
              { value: "agent", label: "Agent", description: "Manage your listings" },
              { value: "landlord", label: "Landlord", description: "Share your property" },
            ].map((option) => (
              <label key={option.value} className={`cursor-pointer rounded-xl border px-4 py-3 transition-colors ${values.role === option.value ? "border-forest bg-forest/5" : "border-forest/15 hover:border-forest/35"}`}>
                <input type="radio" name="role" value={option.value} checked={values.role === option.value} onChange={handleChange} className="sr-only" />
                <span className="block text-sm font-semibold text-forest">{option.label}</span>
                <span className="mt-1 block text-xs text-ink/55">{option.description}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">Password</label>
          <div className="relative">
            <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
            <input id="password" name="password" type={showPassword ? "text" : "password"} value={values.password} onChange={handleChange} placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} aria-describedby="password-hint password-error" className={`w-full rounded-xl border bg-cream py-3.5 pl-11 pr-12 text-sm text-ink placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none ${errors.password ? "border-clay" : "border-forest/15"}`} />
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-forest/55 hover:text-forest">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {!errors.password && <p id="password-hint" className="mt-1.5 text-xs text-ink/45">8+ characters, one uppercase letter and one number.</p>}
          {errors.password && <p id="password-error" className="mt-1.5 text-xs text-clay">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-ink">Confirm password</label>
          <div className="relative">
            <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/45" />
            <input id="confirmPassword" name="confirmPassword" type={showConfirmation ? "text" : "password"} value={values.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" aria-invalid={Boolean(errors.confirmPassword)} className={`w-full rounded-xl border bg-cream py-3.5 pl-11 pr-12 text-sm text-ink placeholder:text-ink/35 focus:border-gold focus:bg-white focus:outline-none ${errors.confirmPassword ? "border-clay" : "border-forest/15"}`} />
            <button type="button" onClick={() => setShowConfirmation((current) => !current)} aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-forest/55 hover:text-forest">
              {showConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-clay">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/65">
          <input type="checkbox" name="terms" checked={values.terms} onChange={handleChange} className="mt-1 h-4 w-4 accent-forest" />
          <span>I agree to Haven&apos;s <a href="#terms" className="font-medium text-forest underline underline-offset-2">terms</a> and <a href="#privacy" className="font-medium text-forest underline underline-offset-2">privacy policy</a>.</span>
        </label>
        {errors.terms && <p className="mt-1.5 text-xs text-clay">{errors.terms}</p>}
      </div>

      {serverError && <p role="alert" className="mt-5 text-sm text-clay">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-light disabled:cursor-wait disabled:opacity-70">
        {isSubmitting ? "Creating account..." : "Create my account"} {!isSubmitting && <ArrowRight size={16} />}
      </button>
      <p className="mt-5 text-center text-xs text-ink/45">Already have an account? <a href="/login" className="font-semibold text-forest hover:text-forest-light">Sign in</a></p>
    </form>
  );
}