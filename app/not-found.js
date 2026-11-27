import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-copper-dark">
          404 · Page not found
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-text-primary sm:text-5xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
          The listing or page you are looking for may have moved or been updated. Explore available properties or return home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-md bg-brand-copper-dark px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-copper"
          >
            Browse marketplace <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-border-default bg-white px-5 py-3 text-xs font-semibold text-text-primary transition-colors hover:border-brand-copper"
          >
            Back to home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
