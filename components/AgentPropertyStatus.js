"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { formatPrice } from "@/data/properties";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
];

const STATUS_LABELS = {
  pending: "Pending approval",
  approved: "Approved",
  declined: "Declined",
  sold: "Sold",
};

export default function AgentPropertyStatus({ activeFilter, onActiveFilterChange }) {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProperties() {
      try {
        const response = await fetch("/api/properties");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load your properties.");
        if (active) setProperties(result.properties || []);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProperties();
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => ({
    pending: properties.filter((property) => property.status === "pending").length,
    approved: properties.filter((property) => property.status === "approved").length,
  }), [properties]);

  const visibleProperties = activeFilter === "all"
    ? properties
    : properties.filter((property) => property.status === activeFilter);

  return (
    <section id="agent-property-status" aria-labelledby="agent-listings-title" className="mx-auto w-full max-w-[1440px] px-5 pt-7 sm:px-8 lg:px-12">
      <div className="border-y border-forest/10 py-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">Listing review</p>
            <h2 id="agent-listings-title" className="mt-2 font-display text-2xl text-forest">Your property approvals</h2>
          </div>
          <div className="flex gap-5 text-sm">
            <p className="text-ink/55"><span className="font-semibold text-forest">{counts.pending}</span> pending</p>
            <p className="text-ink/55"><span className="font-semibold text-forest">{counts.approved}</span> approved</p>
          </div>
        </div>

        <div className="mt-5 flex gap-2 border-b border-forest/10 pb-3" aria-label="Filter your properties">
          {FILTERS.map((filter) => (
            <button key={filter.id} type="button" onClick={() => onActiveFilterChange(filter.id)} aria-pressed={activeFilter === filter.id}
              className={`px-3 py-2 text-xs font-semibold ${activeFilter === filter.id ? "bg-forest text-cream" : "text-ink/60 hover:bg-forest/5"}`}>
              {filter.label}{filter.id === "pending" ? ` (${counts.pending})` : filter.id === "approved" ? ` (${counts.approved})` : ` (${properties.length})`}
            </button>
          ))}
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-clay">{error}</p>}
        {isLoading ? (
          <p role="status" className="py-8 text-sm text-ink/50">Loading your listings...</p>
        ) : visibleProperties.length > 0 ? (
          <div className="divide-y divide-forest/10">
            {visibleProperties.map((property) => (
              <article key={property.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-sand/60 text-forest"><Building2 size={17} /></span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-forest">{property.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink/50"><MapPin size={12} />{property.location}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 pl-12 sm:justify-end sm:pl-0">
                  <span className="text-sm font-semibold text-forest">{formatPrice(property.price)}</span>
                  <span className={`whitespace-nowrap border px-2.5 py-1 text-xs font-semibold ${property.status === "approved" ? "border-forest/15 bg-forest/5 text-forest" : property.status === "pending" ? "border-gold/30 bg-gold/10 text-ink" : "border-clay/20 bg-clay/5 text-clay"}`}>
                    {STATUS_LABELS[property.status] || property.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-8 text-sm text-ink/50">
            <p>{activeFilter === "all" ? "You haven't submitted any properties yet." : `No ${activeFilter} properties.`}</p>
            {activeFilter === "all" && <a href="/dashboard/properties/new" className="mt-2 inline-block font-semibold text-forest hover:text-clay">Submit a property</a>}
          </div>
        )}
      </div>
    </section>
  );
}