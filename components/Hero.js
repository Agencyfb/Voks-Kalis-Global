"use client";

import { ChevronDown, House, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PROPERTY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "raw-land", label: "Land (Raw)" },
  { value: "agricultural-land", label: "Land (Agricultural)" },
];

export default function Hero() {
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const propertyTypeRef = useRef(null);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!propertyTypeRef.current?.contains(event.target)) {
        setIsPropertyTypeOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <section id="top" className="px-4 pt-4 sm:px-7 lg:px-10 lg:pt-1">
      <div className="relative z-20 mx-auto flex min-h-[430px] max-w-7xl items-center rounded-b-2xl rounded-t-lg bg-[#C7E5FC] sm:min-h-[450px] lg:min-h-[430px]">
        <img
          src="/hero-building.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-[78%] w-full object-contain object-bottom sm:h-[88%] lg:h-full lg:w-[68%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#D8EEFF] via-[#D0E9FF]/95 to-transparent lg:w-[72%]" />

        <div className="relative z-10 w-full px-6 py-10 sm:px-10 lg:px-[6%]">
          <h1 className="max-w-[450px] text-balance text-4xl font-semibold leading-[1.12] tracking-tight text-[#10283A] sm:text-5xl lg:text-[2.65rem]">
            Find your perfect
            <br />
            Property
          </h1>
          <p className="mt-5 max-w-[390px] text-sm leading-relaxed text-[#263E50] sm:text-base">
            We provide a complete service for the sale,
            <br className="hidden sm:block" /> purchase or rental of real estate.
          </p>

          <form
            action="/marketplace"
            method="get"
            className="mt-7 w-full max-w-[640px]"
          >
            <div className="flex gap-1 pl-2 text-xs font-medium">
              <button type="button" className="flex-1 rounded-t-md bg-white px-3 py-2.5 text-center text-text-primary">
                Sell
              </button>
              <button type="button" className="flex-1 rounded-t-md bg-white/40 px-3 py-2.5 text-center text-text-secondary hover:bg-white/70">
                Buy
              </button>
              <button type="button" className="flex-1 rounded-t-md bg-white/40 px-3 py-2.5 text-center text-text-secondary hover:bg-white/70">
                Rent
              </button>
              <button type="button" className="flex-1 rounded-t-md bg-white/40 px-3 py-2.5 text-center text-text-secondary hover:bg-white/70">
                Join
              </button>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-[0_8px_20px_rgba(24,42,56,.12)] sm:flex-row sm:items-center sm:gap-0 sm:px-3">
              <div ref={propertyTypeRef} className="relative min-w-0 flex-1 sm:border-r sm:border-border-default">
                <input type="hidden" name="propertyType" value={selectedPropertyType} />
                <button
                  type="button"
                  aria-label="Property type"
                  aria-haspopup="listbox"
                  aria-expanded={isPropertyTypeOpen}
                  aria-controls="hero-property-type-options"
                  onClick={() => setIsPropertyTypeOpen((open) => !open)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setIsPropertyTypeOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs text-text-secondary outline-none"
                >
                  <House size={16} className="shrink-0 text-text-primary" />
                  <span className="min-w-0 flex-1">{PROPERTY_TYPES.find((type) => type.value === selectedPropertyType)?.label || "Property type"}</span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${isPropertyTypeOpen ? "rotate-180" : ""}`} />
                </button>
                {isPropertyTypeOpen && (
                  <div
                    id="hero-property-type-options"
                    role="listbox"
                    aria-label="Property types"
                    className="absolute left-0 top-full z-30 mt-2 w-full min-w-[220px] overflow-hidden rounded-lg border border-border-default bg-white py-1 shadow-lg"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        role="option"
                        aria-selected={selectedPropertyType === type.value}
                        onClick={() => {
                          setSelectedPropertyType(type.value);
                          setIsPropertyTypeOpen(false);
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] focus:outline-none"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex min-w-0 flex-[1.25] items-center gap-3 px-3 py-2 text-xs text-text-secondary">
                <Search size={16} className="shrink-0 text-text-primary" />
                <input
                  name="location"
                  type="search"
                  placeholder="Find Your Property"
                  className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-secondary"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-[#202529] px-8 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#343C41]"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
