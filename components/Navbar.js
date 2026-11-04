"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CircleUserRound, Menu, X } from "lucide-react";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact Us", href: "/contact" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Blog", href: "/#insights" },
];

function BrandLogo({ className = "" }) {
  return (
    <img
      src="/voks-kalis-logo.png"
      alt="Voks-Kalis Global"
      className={`h-9 w-[124px] object-contain ${className}`}
    />
  );
}

function NavigationLinks({ onNavigate, pathname }) {
  return (
    <>
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          onClick={onNavigate}
          aria-current={(link.href === pathname || (link.href === "/" && pathname === "/")) ? "page" : undefined}
          className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors ${
            link.href === pathname
              ? "bg-brand-copper text-white"
              : "text-text-primary hover:bg-brand-copper-subtle hover:text-brand-copper-dark"
          }`}
        >
          {link.label}
        </a>
      ))}
    </>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-white">
      <div className="mx-auto grid min-h-[68px] max-w-7xl grid-cols-[1fr_auto] items-center px-5 sm:px-8 lg:min-h-[76px] lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <NavigationLinks pathname={pathname} />
        </nav>

        <a
          href="/"
          aria-label="Voks-Kalis Global home"
          className="justify-self-start lg:justify-self-center"
        >
          <BrandLogo />
        </a>

        <div className="hidden items-center justify-self-end gap-5 lg:flex">
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-text-primary hover:text-brand-copper-dark"
          >
            <CircleUserRound size={15} />
            Login/Register
          </a>
          <a
            href="/login"
            className="whitespace-nowrap rounded-md bg-brand-copper px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-copper-dark"
          >
            + Add Property
          </a>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center justify-self-end rounded-md text-text-primary lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full border-t border-border-default bg-white px-5 pb-5 shadow-lg sm:px-8 lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2 pt-4">
            <NavigationLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <a
              href="/login"
              className="mt-2 text-sm font-medium text-text-primary"
              onClick={() => setOpen(false)}
            >
              Login/Register
            </a>
            <a
              href="/login"
              className="rounded-md bg-brand-copper px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              + Add Property
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
