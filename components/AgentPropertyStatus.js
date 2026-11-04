"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Building2, CalendarDays, Check, Clock3, Edit3, Home, MapPin, Plus, Settings, ShieldAlert, Tag, X } from "lucide-react";
import { formatPrice } from "@/data/properties";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Declined" },
  { id: "sold", label: "Sold" },
];

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
  sold: "Sold",
};

const STATUS_STYLES = {
  pending: "bg-[#fbf2df] text-[#986817]",
  approved: "bg-[#eaf4ed] text-[#3d7653]",
  declined: "bg-[#f9e9eb] text-[#a34350]",
  sold: "bg-[#edf0f8] text-[#596b96]",
};

function formatCategory(category) {
  const labels = {
    land: "Land",
    lands: "Lands",
    estates: "Residential",
    buildings: "Buildings",
    shortlets: "Shortlets",
    rentals: "Rentals",
    commercial: "Commercial",
  };
  return labels[category] || category;
}

function formatDate(value) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function AgentPropertyStatus({ agentName = "Agent" }) {
  const [properties, setProperties] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPropertyId, setEditingPropertyId] = useState("");
  const [editValues, setEditValues] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
    all: properties.length,
    pending: properties.filter((property) => property.status === "pending").length,
    approved: properties.filter((property) => property.status === "approved").length,
    declined: properties.filter((property) => property.status === "declined").length,
    sold: properties.filter((property) => property.status === "sold").length,
  }), [properties]);

  const visibleProperties = useMemo(() => (
    activeFilter === "all" ? properties : properties.filter((property) => property.status === activeFilter)
  ), [properties, activeFilter]);

  const recentProperties = properties.slice(0, 3);
  const attentionProperties = properties.filter((property) => property.status === "declined").slice(0, 2);

  function startEditing(property) {
    setEditingPropertyId(property.id);
    setEditValues({
      category: property.category,
      propertyType: property.propertyType || "residential",
      purpose: property.purpose === "sale" ? "sales" : property.purpose,
    });
    setError("");
  }

  async function saveClassification(propertyId) {
    setIsSavingEdit(true);
    setError("");
    try {
      const response = await fetch("/api/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propertyId, updates: editValues }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to update this property's classification.");
      setProperties((current) => current.map((property) => (
        property.id === propertyId ? { ...property, ...result.property } : property
      )));
      setEditingPropertyId("");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f7] text-[#242321]">
      <header className="sticky top-0 z-10 border-b border-[#e9e7e4] bg-white">
        <div className="flex h-[58px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2 text-[#70410f]" aria-label="Voks-Kalis Global home">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a65f0c] text-white"><Home size={16} /></span>
            <span className="font-display text-lg font-semibold">VOKS-KALIS</span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.3em] text-[#9a6b32] sm:block">Global</span>
          </a>
          <div className="hidden items-center gap-2 text-xs text-[#706e6b] sm:flex"><span>Workspace</span><span>/</span><span className="text-[#34322f]">My business</span></div>
          <div className="flex items-center gap-3 text-xs text-[#706e6b]">
            <span className="hidden sm:block">Lagos, Nigeria · NGN</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#faf1e6] font-display text-sm text-[#9a5c17]">{agentName[0]}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-58px)] border-r border-[#e9e7e4] bg-white px-4 py-6 lg:flex lg:flex-col">
          <p className="rounded-md bg-[#f5f4f2] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#77736e]">Agent workspace</p>
          <nav className="mt-4 grid gap-1" aria-label="Agent dashboard">
            <a href="#overview" className="flex items-center gap-3 rounded-md bg-[#faf1e6] px-3 py-2.5 text-sm font-medium text-[#855017]"><Building2 size={16} /> Overview</a>
            <button type="button" onClick={() => setActiveFilter("all")} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${activeFilter === "all" ? "font-medium text-[#855017]" : "text-[#5f5d59] hover:bg-[#f7f6f4]"}`}><Building2 size={16} /><span className="flex-1">My listings</span><span className="text-xs text-[#88847e]">{counts.all}</span></button>
            {FILTERS.slice(1).map((filter) => (
              <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${activeFilter === filter.id ? "bg-[#faf1e6] font-medium text-[#855017]" : "text-[#5f5d59] hover:bg-[#f7f6f4]"}`}>
                {filter.id === "pending" ? <Clock3 size={16} /> : filter.id === "approved" ? <BadgeCheck size={16} /> : filter.id === "declined" ? <ShieldAlert size={16} /> : <Tag size={16} />}
                <span className="flex-1">{filter.label}</span><span className="text-xs text-[#88847e]">{counts[filter.id]}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#eeeae5] pt-4">
            <a href="/dashboard/profile" className="mb-3 flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#5f5d59] hover:bg-[#f7f6f4]"><Settings size={15} /> Edit profile</a>
            <p className="text-sm font-medium text-[#383632]">{agentName}</p>
            <p className="mt-1 text-xs text-[#85817b]">Agent account</p>
          </div>
        </aside>

        <section id="overview" className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a65f0c]">My business · {new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</p>
              <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-[#272522] sm:text-4xl">A good day to open doors, {agentName.split(" ")[0]}</h1>
              <p className="mt-1 text-sm text-[#77736e]">Your listings, buyer conversations, and next opportunities in one place.</p>
            </div>
            <a href="/dashboard/properties/new" className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#a65f0c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#854b09] sm:self-auto"><Plus size={16} /> Upload property</a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["My properties", counts.all, "Submitted listings", Building2],
              ["Pending review", counts.pending, "Awaiting admin review", Clock3],
              ["Approved", counts.approved, "Live on the marketplace", BadgeCheck],
              ["Declined", counts.declined, "Check with the admin team", ShieldAlert],
            ].map(([label, value, note, Icon]) => (
              <div key={label} className="rounded-lg border border-[#e9e7e4] bg-white p-4">
                <div className="flex items-center justify-between text-xs text-[#77736e]"><span>{label}</span><Icon size={15} className="text-[#a65f0c]" /></div>
                <p className="mt-2 font-display text-3xl font-semibold text-[#292724]">{isLoading ? "—" : value}</p>
                <p className="mt-1 text-[11px] text-[#88847e]">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <section id="properties" className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-[#292724]">My properties</h2>
                <a href="/dashboard/properties/new" className="text-xs font-medium text-[#9b5b16] hover:underline">Add a listing <span aria-hidden="true">→</span></a>
              </div>
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1" aria-label="Filter your properties">
                {FILTERS.map((filter) => (
                  <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} aria-pressed={activeFilter === filter.id}
                    className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium ${activeFilter === filter.id ? "border-[#b67630] bg-[#fbf3e9] text-[#875317]" : "border-[#e8e5e1] bg-white text-[#696661] hover:bg-[#f7f6f4]"}`}>
                    {filter.label} {isLoading ? "" : counts[filter.id]}
                  </button>
                ))}
              </div>

              {error && <p role="alert" className="mb-3 rounded-md border border-[#efd4d5] bg-[#fff7f7] p-3 text-sm text-[#a34350]">{error}</p>}
              {isLoading ? (
                <p role="status" className="rounded-lg border border-[#e9e7e4] bg-white p-8 text-sm text-[#77736e]">Loading your properties...</p>
              ) : visibleProperties.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleProperties.map((property) => (
                    <article key={property.id} className="overflow-hidden rounded-lg border border-[#e9e7e4] bg-white">
                      {property.image ? <img src={property.image} alt={property.title} className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center bg-[#f1efec] text-[#9c9892]"><Building2 size={28} /></div>}
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-[#925615]">{formatPrice(property.price)}</p>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_STYLES[property.status] || "bg-[#f1efec] text-[#68645e]"}`}>• {STATUS_LABELS[property.status] || property.status}</span>
                        </div>
                        <h3 className="mt-1 truncate text-sm font-semibold text-[#292724]">{property.title}</h3>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#77736e]"><MapPin size={12} />{property.location}</p>
                        <p className="mt-2 flex items-center gap-1 border-t border-[#efedea] pt-2 text-[10px] text-[#8a857e]"><Tag size={11} />{formatCategory(property.category)} · {property.purpose}</p>
                        <p className="mt-2 flex items-center gap-1 text-[10px] text-[#9a5c17]"><CalendarDays size={11} />{property.status === "pending" ? "Awaiting admin review" : `Updated ${formatDate(property.reviewedAt || property.createdAt)}`}</p>
                        {property.reviewNote && <p className="mt-2 rounded bg-[#f7f5f2] px-2.5 py-2 text-[10px] leading-relaxed text-[#625d55]"><span className="font-semibold">Admin feedback: </span>{property.reviewNote}</p>}
                        {editingPropertyId === property.id ? (
                          <div className="mt-3 space-y-2 border-t border-[#efedea] pt-3">
                            <label className="block text-[10px] font-medium text-[#77736e]">
                              Category
                              <select value={editValues.category} onChange={(event) => setEditValues((current) => ({ ...current, category: event.target.value }))} className="mt-1 w-full rounded border border-[#e8e5e1] bg-white px-2 py-1.5 text-xs text-[#34312d]">
                                <option value="lands">Land</option>
                                <option value="buildings">Building</option>
                                <option value="shortlets">Shortlets</option>
                                <option value="rentals">Rentals</option>
                                <option value="estates">Estates (legacy)</option>
                                <option value="land">Land (legacy)</option>
                                <option value="commercial">Commercial (legacy)</option>
                              </select>
                            </label>
                            <label className="block text-[10px] font-medium text-[#77736e]">
                              Property type
                              <select value={editValues.propertyType} onChange={(event) => setEditValues((current) => ({ ...current, propertyType: event.target.value }))} className="mt-1 w-full rounded border border-[#e8e5e1] bg-white px-2 py-1.5 text-xs text-[#34312d]">
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                                <option value="raw-land">Land (Raw)</option>
                                <option value="agricultural-land">Land (Agricultural)</option>
                              </select>
                            </label>
                            <label className="block text-[10px] font-medium text-[#77736e]">
                              Purpose
                              <select value={editValues.purpose} onChange={(event) => setEditValues((current) => ({ ...current, purpose: event.target.value }))} className="mt-1 w-full rounded border border-[#e8e5e1] bg-white px-2 py-1.5 text-xs text-[#34312d]">
                                <option value="sales">For Sale</option>
                                <option value="lease">For Lease</option>
                                <option value="rent">For Rent</option>
                                <option value="shortlet">Shortlet</option>
                              </select>
                            </label>
                            <div className="flex gap-2 pt-1">
                              <button type="button" onClick={() => saveClassification(property.id)} disabled={isSavingEdit} className="inline-flex items-center gap-1 rounded bg-[#a65f0c] px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-60"><Check size={12} />{isSavingEdit ? "Saving..." : "Save changes"}</button>
                              <button type="button" onClick={() => setEditingPropertyId("")} disabled={isSavingEdit} className="inline-flex items-center gap-1 rounded border border-[#e8e5e1] px-2.5 py-1.5 text-[10px] font-semibold text-[#696661]"><X size={12} />Cancel</button>
                            </div>
                            {property.status !== "pending" && <p className="text-[10px] leading-relaxed text-[#8a857e]">Changing these selections sends the listing back to admin review.</p>}
                          </div>
                        ) : (
                          <button type="button" onClick={() => startEditing(property)} className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#9a5c17] hover:underline"><Edit3 size={11} />Edit category, type or purpose</button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[#dcd7d0] bg-white px-5 py-10 text-center">
                  <p className="font-display text-lg text-[#292724]">{activeFilter === "all" ? "No properties submitted yet" : `No ${activeFilter} properties`}</p>
                  <p className="mt-1 text-sm text-[#77736e]">{activeFilter === "all" ? "Upload your first listing to get started." : "Your listings will appear here when their status changes."}</p>
                  {activeFilter === "all" && <a href="/dashboard/properties/new" className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#a65f0c] px-3 py-2 text-xs font-semibold text-white"><Plus size={14} /> Upload property</a>}
                </div>
              )}
              <p className="mt-3 text-[10px] text-[#8a857e]">Property status is managed by an administrator. Approved listings are visible on the marketplace.</p>
            </section>

            <aside className="grid gap-3">
              <section className="rounded-lg border border-[#e9e7e4] bg-white p-4">
                <h2 className="font-display text-base font-semibold text-[#292724]">Needs your attention</h2>
                {attentionProperties.length ? (
                  <div className="mt-3 divide-y divide-[#efedea]">
                    {attentionProperties.map((property) => (
                      <div key={property.id} className="py-3 first:pt-0 last:pb-0">
                        <span className="rounded-sm bg-[#f9e9eb] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#a34350]">Declined</span>
                        <p className="mt-2 text-sm font-medium text-[#34312d]">{property.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#77736e]">{property.reviewNote || "Please contact the admin team for feedback and next steps."}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-3 text-xs leading-relaxed text-[#77736e]">No listings need your attention right now.</p>}
              </section>

              <section className="rounded-lg border border-[#e9e7e4] bg-white p-4">
                <div className="flex items-center justify-between"><h2 className="font-display text-base font-semibold text-[#292724]">Recent activity</h2><span className="text-[10px] text-[#9a5c17]">Latest</span></div>
                {recentProperties.length ? (
                  <ul className="mt-2 divide-y divide-[#efedea]">
                    {recentProperties.map((property) => (
                      <li key={property.id} className="py-3 first:pt-2 last:pb-0">
                        <p className="text-xs font-semibold text-[#34312d]">{property.title}</p>
                        <p className="mt-1 text-[10px] text-[#77736e]">{property.status === "pending" ? "Submitted for admin review" : `Status: ${STATUS_LABELS[property.status] || property.status}`}</p>
                        <p className="mt-1 text-[10px] text-[#9a958e]">{formatDate(property.reviewedAt || property.createdAt)}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-xs leading-relaxed text-[#77736e]">Activity will show here after you submit a property.</p>}
              </section>

              <section className="rounded-lg border border-[#e9e7e4] bg-white p-4">
                <h2 className="font-display text-base font-semibold text-[#292724]">Review process</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#77736e]">New submissions are checked by an administrator. Approved listings are published to the marketplace.</p>
                <p className="mt-3 flex items-center gap-2 text-[10px] font-medium text-[#9a5c17]"><Clock3 size={13} /> Usually reviewed within 24–48 hours</p>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
