"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Building2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  HelpCircle,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { formatPrice } from "@/data/properties";

const QUEUES = [
  { id: "pending", label: "Pending", icon: Clock3 },
  { id: "approved", label: "Approved", icon: BadgeCheck },
  { id: "declined", label: "Declined", icon: ShieldAlert },
  { id: "sold", label: "Sold", icon: CircleDollarSign },
];

const PAGE_SIZE = 5;

function formatCategory(category) {
  const labels = {
    land: "Land",
    lands: "Land",
    estates: "Home",
    buildings: "Buildings",
    shortlets: "Shortlets",
    rentals: "Rentals",
    commercial: "Commercial",
  };
  return labels[category] || category;
}

function getPropertyFeatures(property) {
  const features = [];
  if (property.beds) features.push(`${property.beds} beds`);
  if (property.baths) features.push(`${property.baths} baths`);
  if (property.areaSqm) features.push(`${property.areaSqm} m²`);
  if (property.features) features.push(property.features);
  return features.join(" · ") || formatCategory(property.category);
}

function getStatusClasses(status) {
  return {
    pending: "bg-[#FFF4DD] text-[#8A5A12]",
    approved: "bg-[#EAF5EE] text-[#246B4D]",
    declined: "bg-[#FCEDED] text-[#B33B3B]",
    sold: "bg-[#EDF2FA] text-[#405A8A]",
  }[status] || "bg-[#F5F5F5] text-[#666666]";
}

function getStatusLabel(status) {
  return status === "approved" ? "Approved" : status?.[0]?.toUpperCase() + status?.slice(1);
}

export default function AdminDashboard({ adminName = "Voks-Kalis Global admin" }) {
  const [properties, setProperties] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [activeQueue, setActiveQueue] = useState("all");
  const [activeSection, setActiveSection] = useState("overview");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
        if (active) {
          setProperties(result.properties || []);
          setLandlords(result.landlords || []);
        }
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
  const pendingProperties = useMemo(
    () => properties.filter((property) => property.workflowStatus === "pending"),
    [properties],
  );
  const totalSoldValue = useMemo(
    () => properties.filter((property) => property.workflowStatus === "sold")
      .reduce((total, property) => total + Number(property.price || 0), 0),
    [properties],
  );

  const visibleProperties = useMemo(() => properties.filter((property) => {
    if (activeQueue !== "all" && property.workflowStatus !== activeQueue) return false;
    if (category !== "all" && property.category !== category) return false;
    const query = search.trim().toLowerCase();
    return !query || [property.title, property.location, property.submittedBy, property.assignedAgent, property.soldBy]
      .some((value) => value?.toLowerCase().includes(query));
  }), [properties, activeQueue, category, search]);
  const visibleLandlords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return landlords.filter((landlord) => !query || [landlord.name, landlord.email, landlord.phone]
      .some((value) => value?.toLowerCase().includes(query)));
  }, [landlords, search]);
  const agents = useMemo(() => {
    const names = new Set();
    properties.forEach((property) => {
      if (property.assignedAgent) names.add(property.assignedAgent);
      if (property.submittedByRole === "agent" && property.submittedBy) names.add(property.submittedBy);
    });
    return Array.from(names).map((name) => {
      const agentProperties = properties.filter((property) => (
        property.assignedAgent === name
        || (property.submittedByRole === "agent" && property.submittedBy === name)
      ));
      return {
        name,
        total: agentProperties.length,
        pending: agentProperties.filter((property) => property.workflowStatus === "pending").length,
        approved: agentProperties.filter((property) => property.workflowStatus === "approved").length,
        sold: agentProperties.filter((property) => property.workflowStatus === "sold").length,
      };
    });
  }, [properties]);

  const pageCount = Math.max(1, Math.ceil(visibleProperties.length / PAGE_SIZE));
  const pageProperties = visibleProperties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedQueue = QUEUES.find((queue) => queue.id === activeQueue);
  const firstName = adminName.split(" ")[0] || "Admin";

  useEffect(() => {
    setPage(1);
  }, [activeQueue, category, search, activeSection]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

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

  function markSold(property) {
    updateProperty(property.id, {
      workflowStatus: "sold",
      soldBy: property.assignedAgent || (property.submittedByRole === "agent" ? property.submittedBy : adminName),
      soldAt: new Date().toISOString(),
      paymentStatus: "in-progress",
    });
  }

  function navigateTo(section, queue = "all") {
    setActiveSection(section);
    setActiveQueue(queue);
  }

  const showPortfolio = ["overview", "properties", "review", "sales"].includes(activeSection);
  const portfolioTitle = activeSection === "review"
    ? "Approval queue"
    : activeSection === "sales"
      ? "Sold properties"
      : "Property portfolio";
  const portfolioSubtitle = activeSection === "review"
    ? `${counts.pending || 0} listings awaiting review`
    : activeSection === "sales"
      ? `${counts.sold || 0} completed sales`
      : `${visibleProperties.length} ${visibleProperties.length === 1 ? "property" : "properties"}`;

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#242424]">
      <header className="sticky top-0 z-20 h-[62px] border-b border-[#E5E5E5] bg-white">
        <div className="flex h-full items-center justify-between px-4 sm:px-7 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <a href="/" className="flex shrink-0 items-center" aria-label="Voks-Kalis Global home">
              <img src="/voks-kalis-logo.png" alt="Voks-Kalis Global" className="h-9 w-auto max-w-[150px] object-contain" />
            </a>
            <div className="hidden border-l border-[#E5E5E5] pl-5 text-xs text-[#777] sm:block">
              Workspace <span className="px-1 text-[#B5B5B5]">/</span> Property operations
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#666] sm:gap-5">
            <span className="hidden sm:block">Lagos, Nigeria · NGN</span>
            <button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full text-[#555] hover:bg-[#F5F5F5]">
              <Bell size={17} />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] font-semibold text-[#A15912]">
              {firstName[0]?.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-62px)] max-w-[1600px] lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#E5E5E5] bg-white lg:flex lg:flex-col lg:px-3 lg:py-5">
          <p className="rounded-md bg-[#F5F5F5] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B7565]">
            Admin workspace
          </p>
          <nav aria-label="Admin dashboard navigation" className="mt-4 grid gap-1">
            <button type="button" onClick={() => navigateTo("overview")} aria-current={activeSection === "overview" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-colors ${activeSection === "overview" ? "bg-[#FBF2E9] font-semibold text-[#A15912]" : "text-[#555] hover:bg-[#F7F7F7]"}`}>
              <LayoutDashboard size={16} /> Overview
            </button>
            <button type="button" onClick={() => navigateTo("properties")} aria-current={activeSection === "properties" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-colors ${activeSection === "properties" ? "bg-[#FBF2E9] font-semibold text-[#A15912]" : "text-[#555] hover:bg-[#F7F7F7]"}`}>
              <Home size={16} /> <span className="flex-1">Properties</span><span className="text-[10px] text-[#888]">{properties.length}</span>
            </button>
            <button type="button" onClick={() => navigateTo("review", "pending")} aria-current={activeSection === "review" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-colors ${activeSection === "review" ? "bg-[#FBF2E9] font-semibold text-[#A15912]" : "text-[#555] hover:bg-[#F7F7F7]"}`}>
              <FileCheck2 size={16} /> <span className="flex-1">Review queue</span><span className="text-[10px] text-[#888]">{counts.pending || 0}</span>
            </button>
            <button type="button" onClick={() => navigateTo("agents")} aria-current={activeSection === "agents" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-colors ${activeSection === "agents" ? "bg-[#FBF2E9] font-semibold text-[#A15912]" : "text-[#555] hover:bg-[#F7F7F7]"}`}>
              <Users size={16} /> Agents
            </button>
            <button type="button" onClick={() => navigateTo("sales", "sold")} aria-current={activeSection === "sales" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-colors ${activeSection === "sales" ? "bg-[#FBF2E9] font-semibold text-[#A15912]" : "text-[#555] hover:bg-[#F7F7F7]"}`}>
              <CircleDollarSign size={16} /> Sales
            </button>
            <button type="button" onClick={() => navigateTo("landlords")} aria-current={activeSection === "landlords" ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs transition-colors ${activeSection === "landlords" ? "bg-[#FBF2E9] font-semibold text-[#A15912]" : "text-[#555] hover:bg-[#F7F7F7]"}`}>
              <Building2 size={16} /> Landlords
            </button>
            <a href="/admin/gallery" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] transition-colors hover:bg-[#F7F7F7]">
              <ImageIcon size={16} /> Gallery
            </a>
          </nav>

          <div className="mt-auto grid gap-1 border-t border-[#EAEAEA] pt-4">
            <a href="/admin/profile" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><Settings size={16} /> Edit profile</a>
            <a href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><HelpCircle size={16} /> Help center</a>
            <a href="/login" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><LogOut size={16} /> Sign out</a>
            <div className="mt-2 flex items-center gap-2 border-t border-[#EAEAEA] px-2 pt-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] text-xs font-semibold text-[#A15912]">{firstName[0]?.toUpperCase()}</span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-[#333]">{adminName}</p>
                <p className="text-[10px] text-[#888]">Admin account</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A15912]">Operations overview · Voks-Kalis Global</p>
              <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-[#242424] sm:text-[30px]">
                {activeSection === "overview" ? `Good morning, ${firstName}` : activeSection === "agents" ? "Agent overview" : activeSection === "landlords" ? "Landlord directory" : portfolioTitle}
              </h1>
              <p className="mt-1 text-xs text-[#777]">
                {activeSection === "overview" ? "Keep quality high, move reviews forward, and bring more homes to market." : portfolioSubtitle}
              </p>
            </div>
            <a href="/dashboard/properties/new" className="inline-flex items-center gap-2 rounded-md bg-[#A15912] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#78400B]">
              <Plus size={14} /> Upload property
            </a>
          </div>

          {adminError && <p role="alert" className="mb-4 border border-[#EBCBCB] bg-[#FCEDED] px-4 py-3 text-xs text-[#9A3434]">{adminError}</p>}

          {activeSection === "overview" && (
            <div className="mb-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total properties", value: properties.length, note: `${agents.length} active ${agents.length === 1 ? "agent" : "agents"}`, icon: Building2 },
                { label: "Pending review", value: counts.pending || 0, note: "Awaiting a decision", icon: Clock3 },
                { label: "Approved & available", value: counts.approved || 0, note: "Ready for buyers to discover", icon: BadgeCheck },
                { label: "Sold properties", value: counts.sold || 0, note: `${formatPrice(totalSoldValue)} total sale value`, icon: CircleDollarSign },
              ].map(({ label, value, note, icon: Icon }) => (
                <article key={label} className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-[#777]">{label}</p>
                    <Icon size={15} className="text-[#A15912]" />
                  </div>
                  <p className="mt-1 font-display text-[27px] font-semibold leading-tight text-[#242424]">{value}</p>
                  <p className="mt-1 text-[9px] text-[#888]">{note}</p>
                </article>
              ))}
            </div>
          )}

          {activeSection === "overview" && (
            <section className="mb-4 rounded-lg border border-[#E3E3E3] bg-white p-3.5 sm:p-4" aria-labelledby="approval-queue-title">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="approval-queue-title" className="text-sm font-semibold text-[#292929]">Approval queue</h2>
                <button type="button" onClick={() => navigateTo("review", "pending")} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8A4B0B] hover:underline">
                  View all <ArrowUpRight size={12} />
                </button>
              </div>
              {pendingProperties.length > 0 ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {pendingProperties.slice(0, 2).map((property) => (
                    <article key={property.id} className="flex min-w-0 gap-3 border-t border-[#EFEFEF] pt-3">
                      <img src={property.image} alt="" className="h-[76px] w-[92px] shrink-0 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-[#292929]">{property.title} · {formatPrice(property.price)}</p>
                        <p className="mt-1 truncate text-[9px] text-[#777]">{property.location} · {property.submittedBy}</p>
                        <p className="mt-1 text-[9px] text-[#777]">New submission · documents attached</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <a href={`/admin/properties/${property.id}`} className="text-[9px] font-semibold text-[#8A4B0B] hover:underline">Preview property →</a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="border-t border-[#EFEFEF] pt-3 text-xs text-[#777]">{isLoading ? "Loading review queue..." : "There are no properties waiting for review."}</p>
              )}
            </section>
          )}

          {showPortfolio && (
            <section className="rounded-lg border border-[#E3E3E3] bg-white p-3.5 sm:p-4" aria-labelledby="portfolio-title">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 id="portfolio-title" className="text-sm font-semibold text-[#292929]">{activeSection === "overview" ? "Property portfolio" : portfolioTitle}</h2>
                  <p className="mt-1 text-[9px] text-[#888]">{portfolioSubtitle}</p>
                </div>
                <label className="relative w-full sm:max-w-[230px]">
                  <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search properties or agents" aria-label="Search properties or agents" className="w-full rounded border border-[#E4E4E4] bg-white py-2 pl-8 pr-2 text-[10px] outline-none focus:border-[#A15912]" />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter properties by status">
                  {[{ id: "all", label: "All", count: properties.length }, ...QUEUES.map((queue) => ({ ...queue, count: counts[queue.id] || 0 }))].map(({ id, label, count }) => (
                    <button key={id} type="button" onClick={() => setActiveQueue(id)} aria-pressed={activeQueue === id}
                      className={`rounded border px-2.5 py-1.5 text-[9px] transition-colors ${activeQueue === id ? "border-[#D6B38F] bg-[#FBF2E9] font-semibold text-[#8A4B0B]" : "border-[#E5E5E5] text-[#777] hover:bg-[#F8F8F8]"}`}>
                      {label} {count}
                    </button>
                  ))}
                </div>
                <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by property type" className="rounded border border-[#E4E4E4] bg-white px-2.5 py-1.5 text-[9px] text-[#555] outline-none focus:border-[#A15912]">
                  <option value="all">All property types</option>
                  <option value="lands">Land</option>
                  <option value="buildings">Buildings</option>
                  <option value="estates">Homes</option>
                  <option value="land">Land listings</option>
                  <option value="shortlets">Shortlets</option>
                  <option value="commercial">Commercial</option>
                  <option value="rentals">Rentals</option>
                </select>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[790px] border-collapse text-left">
                  <thead className="bg-[#F5F5F5] text-[9px] font-medium text-[#777]">
                    <tr>
                      <th className="px-2.5 py-2.5 font-medium">Property &amp; features</th>
                      <th className="px-2.5 py-2.5 font-medium">Price</th>
                      <th className="px-2.5 py-2.5 font-medium">Submitting agent</th>
                      <th className="px-2.5 py-2.5 font-medium">Status</th>
                      <th className="px-2.5 py-2.5 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECEC]">
                    {pageProperties.map((property) => (
                      <tr key={property.id} className="align-middle">
                        <td className="px-2.5 py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <img src={property.image} alt="" className="h-10 w-12 shrink-0 rounded object-cover" />
                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-[10px] font-semibold text-[#292929]">{property.title}</p>
                              <p className="mt-0.5 truncate text-[9px] text-[#777]">{property.location} · {getPropertyFeatures(property)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2.5 text-[9px] font-medium text-[#444]">{formatPrice(property.price)}</td>
                        <td className="px-2.5 py-2.5">
                          <p className="text-[9px] text-[#555]">{property.assignedAgent || property.submittedBy}</p>
                          <input
                            value={property.assignedAgent || ""}
                            onChange={(event) => setProperties((current) => current.map((item) => item.id === property.id ? { ...item, assignedAgent: event.target.value } : item))}
                            onBlur={(event) => updateProperty(property.id, { assignedAgent: event.target.value })}
                            placeholder="Assign agent"
                            aria-label={`Assign agent for ${property.title}`}
                            className="mt-1 w-28 border-b border-[#E5E5E5] bg-transparent py-1 text-[8px] outline-none placeholder:text-[#AAA] focus:border-[#A15912]"
                          />
                        </td>
                        <td className="px-2.5 py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-medium ${getStatusClasses(property.workflowStatus)}`}>
                            <span className="h-1 w-1 rounded-full bg-current" />{getStatusLabel(property.workflowStatus)}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            {property.workflowStatus === "pending" ? (
                              <a href={`/admin/properties/${property.id}`} className="text-[9px] font-semibold text-[#8A4B0B] hover:underline">Review property →</a>
                            ) : (
                              <button type="button" onClick={() => togglePropertyDetails(property.id)} disabled={isLoadingDetails} className="text-[9px] font-semibold text-[#8A4B0B] hover:underline disabled:opacity-50">
                                {expandedPropertyId === property.id ? "Hide details" : "View details"} →
                              </button>
                            )}
                            {property.workflowStatus === "approved" && <button type="button" onClick={() => markSold(property)} className="text-[9px] font-semibold text-[#8A4B0B] hover:underline">Mark sold</button>}
                            {property.workflowStatus === "declined" && <button type="button" onClick={() => updateProperty(property.id, { workflowStatus: "pending" })} className="text-[9px] font-semibold text-[#8A4B0B] hover:underline">Reopen review</button>}
                            {property.workflowStatus === "sold" && <>
                              <select value={property.paymentStatus || "in-progress"} onChange={(event) => updateProperty(property.id, { paymentStatus: event.target.value })} aria-label={`Payment status for ${property.title}`} className="rounded border border-[#E5E5E5] bg-white px-1.5 py-1 text-[8px] text-[#555] outline-none focus:border-[#A15912]">
                                <option value="in-progress">Payment in progress</option>
                                <option value="paid">Paid</option>
                              </select>
                              <button type="button" onClick={() => updateProperty(property.id, { workflowStatus: "approved", soldBy: "", soldAt: null })} className="text-[9px] font-semibold text-[#8A4B0B] hover:underline">Return to approved</button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pageProperties.length === 0 && (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-[#444]">{isLoading ? "Loading properties..." : `No ${selectedQueue?.label.toLowerCase() || ""} listings found`}</p>
                    {!isLoading && <p className="mt-1 text-[10px] text-[#888]">Try another status, property type or search term.</p>}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#ECECEC] pt-2.5 text-[9px] text-[#888]">
                <span>Showing {visibleProperties.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, visibleProperties.length)} of {visibleProperties.length} properties</span>
                <div className="flex items-center gap-2">
                  <span>{page} / {pageCount}</span>
                  <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="font-medium text-[#8A4B0B] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                  <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} className="font-medium text-[#8A4B0B] disabled:cursor-not-allowed disabled:opacity-40">Next →</button>
                </div>
              </div>
            </section>
          )}

          {(activeSection === "overview" || activeSection === "agents") && (
            <section className="mt-4 rounded-lg border border-[#E3E3E3] bg-white p-3.5 sm:p-4" aria-labelledby="agents-title">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 id="agents-title" className="text-sm font-semibold text-[#292929]">Agent overview</h2>
                  <p className="mt-1 text-[9px] text-[#888]">Listing activity by assigned agent and agent-submitted properties</p>
                </div>
                {activeSection === "overview" && <button type="button" onClick={() => navigateTo("agents")} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8A4B0B] hover:underline">Manage agents <ArrowUpRight size={12} /></button>}
              </div>
              {agents.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {agents.slice(0, activeSection === "overview" ? 3 : undefined).map((agent) => (
                    <article key={agent.name} className="border-t border-[#EFEFEF] pt-2.5">
                      <h3 className="text-[10px] font-semibold text-[#333]">{agent.name}</h3>
                      <p className="mt-1 text-[9px] text-[#777]">{agent.total} {agent.total === 1 ? "property" : "properties"} · {agent.pending} pending · {agent.approved} available · {agent.sold} sold</p>
                    </article>
                  ))}
                </div>
              ) : <p className="border-t border-[#EFEFEF] pt-3 text-xs text-[#777]">Agent activity will appear here when properties are assigned or submitted.</p>}
            </section>
          )}

          {activeSection === "landlords" && (
            <section className="rounded-lg border border-[#E3E3E3] bg-white p-3.5 sm:p-4" aria-labelledby="landlords-title">
              <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 id="landlords-title" className="text-sm font-semibold text-[#292929]">Landlord directory</h2>
                  <p className="mt-1 text-[9px] text-[#888]">{visibleLandlords.length} {visibleLandlords.length === 1 ? "account" : "accounts"}</p>
                </div>
                <label className="relative w-full sm:max-w-[230px]">
                  <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search landlords" aria-label="Search landlords" className="w-full rounded border border-[#E4E4E4] bg-white py-2 pl-8 pr-2 text-[10px] outline-none focus:border-[#A15912]" />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead className="bg-[#F5F5F5] text-[9px] text-[#777]"><tr><th className="px-3 py-2.5 font-medium">Landlord</th><th className="px-3 py-2.5 font-medium">Email</th><th className="px-3 py-2.5 font-medium">Phone</th></tr></thead>
                  <tbody className="divide-y divide-[#ECECEC]">
                    {visibleLandlords.map((landlord) => (
                      <tr key={landlord.id}>
                        <td className="px-3 py-3 text-[10px] font-semibold text-[#333]">{landlord.name}</td>
                        <td className="px-3 py-3 text-[10px] text-[#666]"><a href={`mailto:${landlord.email}`} className="hover:text-[#A15912]">{landlord.email}</a></td>
                        <td className="px-3 py-3 text-[10px] text-[#666]">{landlord.phone || "Not provided"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleLandlords.length === 0 && <p className="px-4 py-10 text-center text-xs text-[#777]">{isLoading ? "Loading landlords..." : "No landlords found."}</p>}
              </div>
            </section>
          )}

          {expandedPropertyId && (
            isLoadingDetails ? (
              <p className="mt-4 rounded-lg border border-[#E3E3E3] bg-white p-4 text-xs text-[#777]">Loading property documents...</p>
            ) : expandedProperty?.id === expandedPropertyId && (
              <section className="mt-4 rounded-lg border border-[#E3E3E3] bg-white p-4 sm:p-5" aria-label={`Review details for ${expandedProperty.title}`}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A15912]">Property due diligence</p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-[#292929]">{expandedProperty.title}</h2>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(expandedProperty.propertyAddress || expandedProperty.location)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A4B0B] underline">
                    <MapPin size={14} /> Open property map
                  </a>
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-3 border-y border-[#ECECEC] py-4 sm:grid-cols-2">
                  {[["Title of the property", expandedProperty.propertyTitle], ["Property address", expandedProperty.propertyAddress], ["Root of title", expandedProperty.rootOfTitle], ["Previous owner", expandedProperty.previousOwner], ["Ownership", expandedProperty.ownershipType]].map(([label, value]) => (
                    <div key={label}><dt className="text-[9px] font-semibold uppercase tracking-wide text-[#888]">{label}</dt><dd className="mt-1 text-xs text-[#444]">{value || "Not provided"}</dd></div>
                  ))}
                  <div><dt className="text-[9px] font-semibold uppercase tracking-wide text-[#888]">Declaration</dt><dd className="mt-1 text-xs text-[#444]">{expandedProperty.declarationAcceptedAt ? `Accepted ${new Date(expandedProperty.declarationAcceptedAt).toLocaleString()}` : "No declaration recorded"}</dd></div>
                </dl>
                <h3 className="mt-4 text-xs font-semibold text-[#333]">Property photos</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {expandedProperty.images.map((image, index) => (
                    <a key={`${image.name}-${index}`} href={image.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded border border-[#ECECEC]">
                      <img src={image.url} alt={image.name} className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
                      <span className="block truncate px-2 py-1.5 text-[9px] text-[#666]">{image.name}</span>
                    </a>
                  ))}
                </div>
                <h3 className="mt-4 text-xs font-semibold text-[#333]">Supporting documents</h3>
                {expandedProperty.documents.length > 0 ? (
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {expandedProperty.documents.map((document, index) => (
                      <li key={`${document.name}-${index}`}>
                        <a href={document.url} download={document.name} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border border-[#ECECEC] px-3 py-2.5 text-xs text-[#8A4B0B] hover:bg-[#FBF2E9]">
                          <Building2 size={14} className="shrink-0" /><span className="truncate">{document.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-1 text-[10px] text-[#777]">No supporting documents were uploaded for this listing.</p>}
              </section>
            )
          )}
        </section>
      </div>
    </main>
  );
}
