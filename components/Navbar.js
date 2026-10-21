"use client";

import { useState } from "react";
import { Menu, X, Home } from "lucide-react";

const LINKS = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Estates", href: "/#estates" },
  { label: "Land", href: "/#land" },
  { label: "Shortlets", href: "/#shortlets" },
  { label: "Commercial", href: "/#commercial" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream">
            <Home size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-xl font-medium tracking-tight text-forest">
            Haven
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-forest"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-forest"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-forest"
          >
            Create account
          </a>
          <a
            href="#list"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-forest"
          >
            List a property
          </a>
          <a
            href="#contact"
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-light"
          >
            Talk to an agent
          </a>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-forest md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-forest/10 bg-cream px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink/80"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="text-sm font-medium text-ink/80"
              onClick={() => setOpen(false)}
            >
              Sign in
            </a>
            <a
              href="/register"
              className="text-sm font-medium text-ink/80"
              onClick={() => setOpen(false)}
            >
              Create account
            </a>
            <a
              href="#contact"
              className="mt-2 rounded-full bg-forest px-5 py-3 text-center text-sm font-medium text-cream"
              onClick={() => setOpen(false)}
            >
              Talk to an agent
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
