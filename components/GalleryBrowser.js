"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  { value: "", label: "All photos" },
  { value: "clients", label: "Satisfied clients" },
  { value: "projects", label: "Projects delivered" },
];

export default function GalleryBrowser({ initialCategory = "" }) {
  const [category, setCategory] = useState(initialCategory);
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadGallery() {
      setIsLoading(true);
      setError("");
      setItems([]);
      setNextCursor(null);
      try {
        const query = category ? `?category=${encodeURIComponent(category)}` : "";
        const response = await fetch(`/api/gallery${query}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load the gallery.");
        if (active) {
          setItems(result.items || []);
          setNextCursor(result.nextCursor || null);
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadGallery();
    return () => { active = false; };
  }, [category]);

  async function loadMore() {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setError("");
    try {
      const query = new URLSearchParams({ cursor: nextCursor });
      if (category) query.set("category", category);
      const response = await fetch(`/api/gallery?${query}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to load more gallery images.");
      setItems((current) => [...current, ...(result.items || [])]);
      setNextCursor(result.nextCursor || null);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingMore(false);
    }
  }

  function selectCategory(value) {
    setCategory(value);
    const url = value ? `/gallery?category=${value}` : "/gallery";
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[65vh] bg-[#FAFAFA] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-copper-dark">Our work, our people</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-[#242424] sm:text-5xl">Client stories &amp; delivered projects</h1>
            <p className="mt-4 text-sm leading-7 text-[#666] sm:text-base">
              A look at the people we have served and the projects we have brought to life.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter gallery">
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => selectCategory(item.value)}
                aria-pressed={category === item.value}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                  category === item.value
                    ? "border-[#17392E] bg-[#17392E] text-white"
                    : "border-[#17392E]/15 bg-white text-[#666] hover:border-[#17392E]/40 hover:text-[#17392E]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {error && <p role="alert" className="mt-6 rounded-lg border border-[#EBCBCB] bg-[#FCEDED] px-4 py-3 text-sm text-[#9A3434]">{error}</p>}

          {isLoading ? (
            <p className="mt-10 text-sm text-[#777]">Loading gallery...</p>
          ) : items.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-2xl border border-[#E9E5E0] bg-white shadow-[0_8px_24px_rgba(24,48,68,.06)]">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F0EEF7]">
                    <img
                      src={item.imageUrl}
                      alt={item.caption || (item.category === "clients" ? "Satisfied client" : "Delivered project")}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FBF2E9] text-[#A15912]">
                      <ImageIcon size={15} />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-[#242424]">{item.caption || (item.category === "clients" ? "Satisfied client" : "Project delivered")}</h2>
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A7565]">
                        {item.category === "clients" ? "Satisfied client" : "Project delivered"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-[#D8D2CC] bg-white px-6 py-14 text-center">
              <ImageIcon size={28} className="mx-auto text-[#A15912]/70" />
              <h2 className="mt-4 font-display text-xl font-semibold text-[#242424]">Gallery photos coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777]">
                We&apos;re preparing photos of our happy clients and delivered projects. Please check back soon.
              </p>
            </div>
          )}

          {nextCursor && !isLoading && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="mx-auto mt-9 flex items-center gap-2 rounded-full border border-[#17392E]/20 bg-white px-5 py-2.5 text-xs font-semibold text-[#17392E] hover:bg-[#F5F5F5] disabled:opacity-60"
            >
              {isLoadingMore ? "Loading..." : "Load more"} {!isLoadingMore && <ArrowDown size={14} />}
            </button>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
