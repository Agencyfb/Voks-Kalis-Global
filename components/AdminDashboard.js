"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Building2, Check, CircleDollarSign, Clock3, Home, MapPin, Search, ShieldAlert, X } from "lucide-react";
import { formatPrice } from "@/data/properties";

const QUEUES = [
  { id: "pending", label: "Pending", icon: Clock3 },
  { id: "approved", label: "Approved", icon: BadgeCheck },
  { id: "declined", label: "Declined", icon: ShieldAlert },
  { id: "sold", label: "Sold", icon: CircleDollarSign },
];

function formatCategory(category) {
  if (category === "land") return "Land";
  if (category === "estates") return "Home";
  if (category === "shortlets") return "Shortlet";
  return "Commercial";
}

export default function AdminDashboard({ adminName = "Haven admin" }) {
  const [properties, setProperties] = useState([]);
  const [activeQueue, setActiveQueue] = useState("pending");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [adminError, setAdminError] = useState("");
  const [expandedPropertyId, setExpandedPropertyId] = useState("");
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProperties() {
      try {
        const response = await fetch("/api/admin/properties");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load properties.");
        if (active) setProperties(result.properties || []);
      } catch (error) {
        if (active) setAdminError(error.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProperties();
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => Object.fromEntries(
    QUEUES.map(({ id }) => [id, properties.filter((property) => property.workflowStatus === id).length]),
  ), [properties]);

  const visibleProperties = useMemo(() => properties.filter((property) => {
    if (property.workflowStatus !== activeQueue) return false;
    if (category !== "all" && property.category !== category) return false;
    const query = search.trim().toLowerCase();
    return !query || [property.title, property.location, property.submittedBy, property.assignedAgent, property.soldBy]
      .some((value) => value?.toLowerCase().includes(query));
  }), [properties, activeQueue, category, search]);
  async function updateProperty(id, updates) {
    setAdminError("");
    try {
      const response = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to update this property.");
      setProperties((current) => current.map((property) => property.id === id ? result.property : property));
    } catch (error) {
      setAdminError(error.message);
    }
  }

  async function togglePropertyDetails(id) {
    if (expandedPropertyId === id) {
      setExpandedPropertyId("");
      setExpandedProperty(null);
      setAdminError("");
      return;
    }

    setExpandedPropertyId(id);
    setExpandedProperty(null);
    setAdminError("");
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/admin/properties?id=${encodeURIComponent(id)}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to load property documents.");
      setExpandedProperty(result.property);
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setIsLoadingDetails(false);
    }
  }

  function approve(property) {
    updateProperty(property.id, { workflowStatus: "approved" });
  }

  function decline(property) {
    updateProperty(property.id, { workflowStatus: "declined" });
  }

  function markSold(property) {
    updateProperty(property.id, {
      workflowStatus: "sold",
      soldBy: property.assignedAgent || (property.submittedByRole === "agent" ? property.submittedBy : adminName),
      soldAt: new Date().toISOString(),
      paymentStatus: "in-progress",
    });
  }

  const selectedQueue = QUEUES.find((queue) => queue.id === activeQueue);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-forest/10 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8">
          <a href="/" className="flex items-center gap-2 text-forest" aria-label="Haven home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream"><Home size={18} /></span>
            <span className="font-display text-xl font-medium">Haven</span>
            <span className="ml-2 hidden border-l border-forest/15 pl-3 text-xs font-semibold uppercase tracking-wider text-ink/45 sm:block">Admin</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink/55 sm:block">Marketplace operations</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand font-display text-lg text-forest">{adminName[0]}</span>
            <span className="hidden text-sm font-medium text-forest sm:block">{adminName}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-73px)] border-r border-forest/10 bg-white/40 px-5 py-8 lg:block">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest2 text-ink/40">Property management</p>
          <nav aria-label="Property status" className="mt-4 grid gap-1">
            {QUEUES.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActiveQueue(id)} aria-current={activeQueue === id ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-3 text-left text-sm transition-colors ${activeQueue === id ? "bg-forest text-cream" : "text-ink/65 hover:bg-forest/5 hover:text-forest"}`}>
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                <span className={`text-xs tabular-nums ${activeQueue === id ? "text-cream/70" : "text-ink/40"}`}>{counts[id] || 0}</span>
              </button>
            ))}
          </nav>
          <a href="/dashboard" className="mt-12 flex items-center gap-3 px-3 py-3 text-sm text-ink/55 hover:text-forest"><ArrowLeft size={17} /> Account dashboard</a>
        </aside>

        <section className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-5 border-b border-forest/10 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">Haven marketplace</p>
              <h1 className="mt-2 font-display text-4xl text-forest">Property oversight</h1>
              <p className="mt-2 text-sm text-ink/55">Review listings, coordinate agents and track completed sales.</p>
            </div>
            <a href="/dashboard/properties/new" className="inline-flex items-center justify-center gap-2 self-start bg-forest px-4 py-3 text-sm font-medium text-cream transition hover:bg-forest-light sm:self-auto">
              <Building2 size={16} /> Add property
            </a>
          </div>

          <div className="grid grid-cols-2 border-b border-forest/10 py-5 sm:grid-cols-4">
            <div className="border-r border-forest/10 px-3 first:pl-0 sm:px-5"><p className="text-xs text-ink/50">Needs review</p><p className="mt-1 font-display text-3xl text-forest">{counts.pending || 0}</p></div>
            <div className="px-3 sm:border-r sm:border-forest/10 sm:px-5"><p className="text-xs text-ink/50">Approved</p><p className="mt-1 font-display text-3xl text-forest">{counts.approved || 0}</p></div>
            <div className="border-r border-forest/10 px-3 pt-4 sm:border-r-0 sm:px-5 sm:pt-0"><p className="text-xs text-ink/50">Declined</p><p className="mt-1 font-display text-3xl text-forest">{counts.declined || 0}</p></div>
            <div className="px-3 pt-4 sm:border-l sm:border-forest/10 sm:px-5 sm:pt-0"><p className="text-xs text-ink/50">Sold, payment in progress</p><p className="mt-1 font-display text-3xl text-forest">{properties.filter((property) => property.workflowStatus === "sold" && property.paymentStatus !== "paid").length}</p></div>
          </div>

          <div className="mt-7 flex gap-2 overflow-x-auto border-b border-forest/10 pb-3 lg:hidden">
            {QUEUES.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setActiveQueue(id)} className={`shrink-0 px-3 py-2 text-xs font-semibold ${activeQueue === id ? "bg-forest text-cream" : "bg-white text-ink/60"}`}>
                {label} <span className="ml-1 opacity-70">{counts[id] || 0}</span>
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-forest">{selectedQueue?.label} properties</h2>
              <p className="mt-1 text-xs text-ink/50">{visibleProperties.length} {visibleProperties.length === 1 ? "listing" : "listings"}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search properties or agents" aria-label="Search properties or agents" className="w-full border border-forest/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold sm:w-64" />
              </label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by property type" className="border border-forest/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold">
                <option value="all">All property types</option>
                <option value="estates">Homes</option>
                <option value="land">Land</option>
                <option value="shortlets">Shortlets</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto border-y border-forest/10 bg-white">
            {adminError && <p role="alert" className="border-b border-clay/20 bg-clay/5 px-4 py-3 text-sm text-clay">{adminError}</p>}
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead className="bg-forest/[0.035] text-[10px] font-semibold uppercase tracking-wider text-ink/45">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Submitted by</th>
                  <th className="px-4 py-3">Assigned agent</th>
                  <th className="px-4 py-3">Asking price</th>
                  {activeQueue === "sold" && <><th className="px-4 py-3">Sold by</th><th className="px-4 py-3">Payment</th></>}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {visibleProperties.map((property) => (
                  <tr key={property.id} className="align-middle">
                    <td className="px-4 py-4">
                      <div className="flex min-w-64 items-center gap-3">
                        <img src={property.image} alt="" className="h-14 w-20 shrink-0 object-cover" />
                        <div className="min-w-0">
                          <p className="max-w-64 truncate text-sm font-semibold text-forest">{property.title}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-ink/50"><MapPin size={12} />{property.location}</p>
                          <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-clay">{formatCategory(property.category)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><p className="text-sm font-medium text-ink">{property.submittedBy}</p><p className="mt-1 text-xs capitalize text-ink/45">{property.submittedByRole}</p></td>
                    <td className="px-4 py-4">
                      <input value={property.assignedAgent || ""} onChange={(event) => setProperties((current) => current.map((item) => item.id === property.id ? { ...item, assignedAgent: event.target.value } : item))} onBlur={(event) => updateProperty(property.id, { assignedAgent: event.target.value })} placeholder="Assign agent" aria-label={`Assign agent for ${property.title}`} className="w-40 border-b border-forest/15 bg-transparent py-2 text-sm outline-none placeholder:text-ink/35 focus:border-gold" />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-forest">{formatPrice(property.price)}</td>
                    {activeQueue === "sold" && <>
                      <td className="px-4 py-4 text-sm text-ink/70">{property.soldBy || "Not recorded"}</td>
                      <td className="px-4 py-4">
                        <select value={property.paymentStatus || "in-progress"} onChange={(event) => updateProperty(property.id, { paymentStatus: event.target.value })} aria-label={`Payment status for ${property.title}`} className="border border-forest/15 bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-gold">
                          <option value="in-progress">In progress</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                    </>}
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => togglePropertyDetails(property.id)} disabled={isLoadingDetails} className="border border-forest/15 px-3 py-2 text-xs font-semibold text-forest hover:border-forest disabled:opacity-50">
                          {expandedPropertyId === property.id ? isLoadingDetails ? "Loading..." : "Hide details" : "Review details"}
                        </button>
                        {activeQueue === "pending" && <>
                          <button type="button" onClick={() => approve(property)} className="inline-flex items-center gap-1.5 bg-forest px-3 py-2 text-xs font-semibold text-cream hover:bg-forest-light"><Check size={14} /> Approve</button>
                          <button type="button" onClick={() => decline(property)} aria-label={`Decline ${property.title}`} title="Decline listing" className="flex h-8 w-8 items-center justify-center border border-forest/15 text-ink/55 hover:border-clay hover:text-clay"><X size={15} /></button>
                        </>}
                        {activeQueue === "approved" && <button type="button" onClick={() => markSold(property)} className="inline-flex items-center gap-1.5 border border-forest/15 px-3 py-2 text-xs font-semibold text-forest hover:border-forest"><CircleDollarSign size={14} /> Mark sold</button>}
                        {activeQueue === "declined" && <button type="button" onClick={() => updateProperty(property.id, { workflowStatus: "pending" })} className="border border-forest/15 px-3 py-2 text-xs font-semibold text-forest hover:border-forest">Reopen review</button>}
                        {activeQueue === "sold" && <button type="button" onClick={() => updateProperty(property.id, { workflowStatus: "approved", soldBy: "", soldAt: null })} className="border border-forest/15 px-3 py-2 text-xs font-semibold text-forest hover:border-forest">Return to approved</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleProperties.length === 0 && <div className="px-6 py-16 text-center"><p className="font-display text-2xl text-forest">{isLoading ? "Loading properties..." : `No ${selectedQueue?.label.toLowerCase()} listings`}</p>{!isLoading && <p className="mt-2 text-sm text-ink/50">Try another property type or search term.</p>}</div>}
          </div>
          {expandedProperty && expandedProperty.id === expandedPropertyId && (
            <section className="mt-6 border border-forest/10 bg-white p-5 sm:p-7" aria-label={`Review details for ${expandedProperty.title}`}>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">Property due diligence</p>
                  <h3 className="mt-2 font-display text-2xl text-forest">{expandedProperty.title}</h3>
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(expandedProperty.propertyAddress || expandedProperty.location)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-forest underline">
                  <MapPin size={15} /> Open property map
                </a>
              </div>
              <dl className="mt-5 grid gap-x-6 gap-y-4 border-y border-forest/10 py-5 sm:grid-cols-2">
                {[["Title of the property", expandedProperty.propertyTitle], ["Property address", expandedProperty.propertyAddress], ["Root of title", expandedProperty.rootOfTitle], ["Previous owner", expandedProperty.previousOwner], ["Ownership", expandedProperty.ownershipType]].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</dt>
                    <dd className="mt-1 text-sm text-ink/80">{value || "Not provided"}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink/45">Declaration</dt>
                  <dd className="mt-1 text-sm text-ink/80">
                    {expandedProperty.declarationAcceptedAt
                      ? `Accepted ${new Date(expandedProperty.declarationAcceptedAt).toLocaleString()}`
                      : "No declaration recorded"}
                  </dd>
                </div>
              </dl>
              <h4 className="mt-5 text-sm font-semibold text-forest">Property photos</h4>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {expandedProperty.images.map((image, index) => (
                  <a key={`${image.name}-${index}`} href={image.data} target="_blank" rel="noreferrer" className="group overflow-hidden border border-forest/10">
                    <img src={image.url} alt={image.name} className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
                    <span className="block truncate px-2 py-1.5 text-xs text-ink/55">{image.name}</span>
                  </a>
                ))}
              </div>
              <h4 className="mt-6 text-sm font-semibold text-forest">Supporting documents</h4>
              {expandedProperty.documents.length > 0 ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {expandedProperty.documents.map((document, index) => (
                    <li key={`${document.name}-${index}`}>
                      <a href={document.url} download={document.name} target="_blank" rel="noreferrer" className="flex items-center gap-2 border border-forest/10 px-3 py-3 text-sm text-forest hover:bg-forest/5">
                        <Building2 size={15} className="shrink-0" /><span className="truncate">{document.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink/50">No supporting documents were uploaded for this listing.</p>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}