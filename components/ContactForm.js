"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const INTERESTS = [
  ["buying a property", "Buying"],
  ["selling a property", "Selling"],
  ["renting a property", "Renting"],
  ["property management / consultancy", "Management / Consultancy"],
  ["property development", "Development"],
];

export default function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    contactMethod: "email",
    message: "",
    consent: false,
  });
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setError("Please complete your name, email and message.");
      return;
    }
    if (!values.consent) {
      setError("Please confirm that we may contact you about this enquiry.");
      return;
    }

    const subject = values.topic
      ? `Website enquiry: ${values.topic}`
      : `Website enquiry from ${values.name.trim()}`;
    const body = [
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      values.phone.trim() ? `Phone: ${values.phone.trim()}` : "",
      values.topic ? `I'm interested in: ${values.topic}` : "",
      `Preferred contact method: ${values.contactMethod}`,
      "",
      values.message.trim(),
    ]
      .filter((line) => line !== undefined)
      .join("\n");
    window.location.href = `mailto:vokskalisglobal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setError("");
  }

  const inputClassName =
    "mt-1.5 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-xs text-text-primary outline-none transition-colors focus:border-brand-copper";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#E5E5E5] bg-white p-5 sm:p-7"
    >
      <h2 className="text-lg font-semibold text-text-primary">
        How can we help?
      </h2>
      <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
        Fields marked * are required. Please don&apos;t include sensitive
        financial documents.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-text-primary sm:col-span-2">
          Full name <span className="text-brand-copper-dark">*</span>
          <input
            required
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={updateField}
            maxLength={120}
            placeholder="Your full name"
            className={inputClassName}
          />
        </label>

        <label className="text-xs font-medium text-text-primary">
          Email address <span className="text-brand-copper-dark">*</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={updateField}
            maxLength={254}
            placeholder="you@example.com"
            className={inputClassName}
          />
        </label>

        <label className="text-xs font-medium text-text-primary">
          Phone number
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={values.phone}
            onChange={updateField}
            maxLength={40}
            placeholder="Include country code"
            className={inputClassName}
          />
        </label>

        <label className="text-xs font-medium text-text-primary sm:col-span-2">
          I&apos;m interested in
          <select
            name="topic"
            value={values.topic}
            onChange={updateField}
            className={inputClassName}
          >
            <option value="">Choose a property service</option>
            {INTERESTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
            <option value="other">Something else</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {INTERESTS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  topic: current.topic === value ? "" : value,
                }))
              }
              aria-pressed={values.topic === value}
              className={`rounded-md px-2.5 py-1.5 text-[10px] transition-colors ${
                values.topic === value
                  ? "bg-brand-copper-subtle text-brand-copper-dark"
                  : "bg-[#F5F5F5] text-text-secondary hover:bg-brand-copper-subtle"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="text-xs font-medium text-text-primary sm:col-span-2">
          Preferred contact method
          <select
            name="contactMethod"
            value={values.contactMethod}
            onChange={updateField}
            className={inputClassName}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </label>

        <label className="text-xs font-medium text-text-primary sm:col-span-2">
          Your message <span className="text-brand-copper-dark">*</span>
          <textarea
            required
            name="message"
            value={values.message}
            onChange={updateField}
            maxLength={3000}
            rows={5}
            placeholder="Tell us your preferred area, property needs or service request..."
            className={`${inputClassName} resize-y`}
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-text-secondary">
        <input
          required
          type="checkbox"
          name="consent"
          checked={values.consent}
          onChange={updateField}
          className="mt-0.5 accent-[#A15912]"
        />
        <span>I agree that Voks may contact me about this enquiry.</span>
      </label>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-copper-dark px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-copper"
      >
        Send enquiry <ArrowRight size={14} aria-hidden="true" />
      </button>
      <p className="mt-3 text-[10px] leading-relaxed text-text-secondary">
        Your enquiry will be reviewed by the relevant Voks team. Sending this
        form does not create an agreement. See our Privacy Policy.
      </p>
    </form>
  );
}
