"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  X,
} from "lucide-react";
import { formatPrice } from "@/data/properties";

function getImage(property) {
  return property.image || "";
}

function getFeatures(property) {
  return [
    property.beds ? `${property.beds} beds` : "",
    property.baths ? `${property.baths} baths` : "",
    property.areaSqm ? `${property.areaSqm} m²` : "",
    property.features || "",
  ].filter(Boolean).join(" · ");
}

function PropertyTile({ property, saved, onToggleSave }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#E5E1DD] bg-white">
      <div className="relative">
        <a href={property.detailHref} aria-label={`View ${property.title}`}>
          {getImage(property)
            ? <img src={getImage(property)} alt={property.title} className="h-28 w-full object-cover sm:h-32" />
            : <div className="flex h-28 items-center justify-center bg-[#F0EDE9] text-xs text-[#888] sm:h-32">Photo unavailable</div>}
        </a>
        <button type="button" onClick={() => onToggleSave(property)} aria-label={saved ? `Remove ${property.title} from saved homes` : `Save ${property.title}`} aria-pressed={saved}
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm ${saved ? "text-[#A15912]" : "text-[#494949] hover:text-[#A15912]"}`}>
          <Heart size={14} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <p className="text-[11px] font-semibold text-[#A15912]">{formatPrice(property.price)}</p>
          <span className="rounded-full bg-[#EAF5EE] px-2 py-0.5 text-[8px] font-medium text-[#246B4D]">Available</span>
        </div>
        <a href={property.detailHref} className="mt-1.5 block truncate text-[10px] font-semibold text-[#292929] hover:text-[#A15912]">{property.title}</a>
        <p className="mt-1 flex items-center gap-1 truncate text-[9px] text-[#777]"><MapPin size={10} />{property.location}</p>
        <p className="mt-1.5 min-h-3 truncate text-[8px] text-[#777]">{getFeatures(property) || "Verified listing"}</p>
        <a href={property.detailHref} className="mt-2 flex items-center justify-between border-t border-[#EFEFEF] pt-2 text-[8px] font-medium text-[#8A4B0B] hover:underline">
          View home &amp; contact agent <ArrowUpRight size={11} />
        </a>
      </div>
    </article>
  );
}

export default function BuyerDashboard() {
  const [user, setUser] = useState({ firstName: "Buyer", lastName: "", city: "" });
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState("");
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const response = await fetch("/api/buyer/dashboard");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load your dashboard.");
        if (active) {
          setUser(result.user);
          setProperties(result.properties || []);
          setSavedProperties(result.savedProperties || []);
          setSavedIds(result.savedIds || []);
          setLocation(result.preferences?.preferredLocation || result.user.city || "");
          setPurpose(result.preferences?.propertyPurpose === "Buy a home" || result.preferences?.propertyPurpose === "Buy land"
            ? "sales"
            : result.preferences?.propertyPurpose === "Rent a home" ? "rent" : "");
          setMaxPrice(result.preferences?.maximumBudget ? String(result.preferences.maximumBudget) : "");
          setBeds(result.preferences?.preferredBedrooms?.match(/^\d+/)?.[0] || "");
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadDashboard();
    return () => { active = false; };
  }, []);

  const firstName = user.firstName || "there";
  const heroProperty = properties[1] || properties[0];
  const suggestedProperties = properties.slice(0, 3);

  async function toggleSave(property) {
    const shouldSave = !savedIds.includes(property.id);
    setSaveError("");
    setIsSavingId(property.id);
    try {
      const response = await fetch("/api/buyer/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, saved: shouldSave }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to update your saved homes.");
      setSavedIds((current) => shouldSave
        ? [...new Set([...current, property.id])]
        : current.filter((id) => id !== property.id));
      setSavedProperties((current) => shouldSave
        ? current.some((item) => item.id === property.id) ? current : [property, ...current]
        : current.filter((item) => item.id !== property.id));
    } catch (saveErrorValue) {
      setSaveError(saveErrorValue.message);
    } finally {
      setIsSavingId("");
    }
  }

  function searchMarketplace(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (purpose) params.set("purpose", purpose);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (beds) params.set("beds", beds);
    window.location.href = `/marketplace${params.toString() ? `?${params}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#252525]">
      <header className="sticky top-0 z-20 h-[60px] border-b border-[#E7E5E2] bg-white">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <a href="/" className="shrink-0" aria-label="Voks-Kalis Global home"><img src="/voks-kalis-logo.png" alt="Voks-Kalis Global" className="h-9 w-auto max-w-[145px] object-contain" /></a>
            <div className="hidden border-l border-[#E7E5E2] pl-5 text-[10px] text-[#777] sm:block">Workspace <span className="px-1 text-[#BBB]">/</span> Your home search</div>
          </div>
          <div className="flex items-center gap-3 text-[9px] text-[#777] sm:gap-5">
            <span className="hidden sm:block">{user.city || "Lagos"}, Nigeria · NGN</span>
            <button type="button" aria-label="Notifications" className="flex h-8 w-8 items-center justify-center rounded-full text-[#555] hover:bg-[#F5F5F5]"><Bell size={15} /></button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] text-xs font-semibold text-[#A15912]">{firstName[0]?.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-60px)] max-w-[1600px] lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#E7E5E2] bg-white lg:flex lg:flex-col lg:px-3 lg:py-4">
          <p className="rounded-md bg-[#F5F5F5] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8B7565]">Buyer workspace</p>
          <nav aria-label="Buyer dashboard navigation" className="mt-4 grid gap-1">
            <a href="#discover" aria-current="page" className="flex items-center gap-3 rounded-md bg-[#FBF2E9] px-3 py-2.5 text-[10px] font-semibold text-[#A15912]"><Home size={15} /> Discover</a>
            <a href="#saved-homes" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[10px] text-[#555] hover:bg-[#F7F7F7]"><Heart size={15} /> <span className="flex-1">Saved homes</span><span className="text-[9px] text-[#888]">{savedIds.length}</span></a>
            <a href="#viewings" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[10px] text-[#555] hover:bg-[#F7F7F7]"><CalendarDays size={15} /> My viewings</a>
            <a href="#inquiries" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[10px] text-[#555] hover:bg-[#F7F7F7]"><MessageSquare size={15} /> Inquiries</a>
          </nav>
          <div className="mt-auto grid gap-1 border-t border-[#EAEAEA] pt-4">
            <a href="/dashboard/profile" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[10px] text-[#666] hover:bg-[#F7F7F7]"><Settings size={15} /> Edit profile</a>
            <a href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[10px] text-[#666] hover:bg-[#F7F7F7]"><HelpCircle size={15} /> Help center</a>
            <a href="/login" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[10px] text-[#666] hover:bg-[#F7F7F7]"><LogOut size={15} /> Sign out</a>
            <div className="mt-2 flex items-center gap-2 border-t border-[#EAEAEA] px-2 pt-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] text-[10px] font-semibold text-[#A15912]">{firstName[0]?.toUpperCase()}</span>
              <div><p className="text-[10px] font-medium text-[#333]">{firstName} {user.lastName}</p><p className="text-[9px] text-[#888]">Buyer account</p></div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
          {error && <p role="alert" className="mb-3 rounded border border-[#EBCBCB] bg-[#FCEDED] px-3 py-2 text-xs text-[#9A3434]">{error}</p>}
          {saveError && <p role="alert" className="mb-3 flex items-center justify-between rounded border border-[#EBCBCB] bg-[#FCEDED] px-3 py-2 text-xs text-[#9A3434]">{saveError}<button type="button" aria-label="Dismiss error" onClick={() => setSaveError("")}><X size={13} /></button></p>}

          <section id="discover" className="grid items-center gap-4 rounded-xl bg-[#FBF2E9] p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_205px]">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#A15912]">Your next chapter</p>
              <h1 className="mt-1 font-display text-xl font-semibold leading-tight text-[#292929] sm:text-2xl">Find the property you desire</h1>
              <p className="mt-1.5 max-w-xl text-[9px] leading-relaxed text-[#6D6964]">Welcome back, {firstName}. Explore verified homes in your desired location, thoughtfully matched to your search.</p>
              <p className="mt-2 text-[9px] font-medium text-[#8A4B0B]">Browse verified homes across Lagos and find a place that feels like yours.</p>
            </div>
            {heroProperty && getImage(heroProperty) ? (
              <a href={heroProperty.detailHref} className="hidden overflow-hidden rounded-md md:block">
                <img src={getImage(heroProperty)} alt={heroProperty.title} className="h-[105px] w-full object-cover" />
              </a>
            ) : <div className="hidden h-[105px] rounded-md bg-[#F0EDE9] md:block" />}
          </section>

          <form onSubmit={searchMarketplace} className="mt-3 grid gap-2 rounded-xl border border-[#E5E1DD] bg-white p-3 sm:grid-cols-2 lg:grid-cols-[minmax(170px,1.35fr)_minmax(90px,.55fr)_minmax(110px,.65fr)_minmax(90px,.55fr)_auto] lg:items-end">
            <label className="text-[9px] font-medium text-[#555]">
              Where would you like to buy
              <span className="relative mt-1 block">
                <MapPin size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Lekki, Ikoyi, Lagos" className="w-full rounded-full border border-[#E5E5E5] py-2 pl-7 pr-3 text-[9px] outline-none focus:border-[#A15912]" />
              </span>
            </label>
            <label className="text-[9px] font-medium text-[#555]">Looking to
              <select value={purpose} onChange={(event) => setPurpose(event.target.value)} className="mt-1 block w-full rounded-md border border-[#E5E5E5] bg-white px-2.5 py-2 text-[9px] outline-none focus:border-[#A15912]">
                <option value="">Buy or rent</option><option value="sales">Buy</option><option value="rent">Rent</option><option value="lease">Lease</option>
              </select>
            </label>
            <label className="text-[9px] font-medium text-[#555]">Budget
              <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="mt-1 block w-full rounded-md border border-[#E5E5E5] bg-white px-2.5 py-2 text-[9px] outline-none focus:border-[#A15912]">
                <option value="">Any budget</option><option value="50000000">Up to ₦50m</option><option value="100000000">Up to ₦100m</option><option value="300000000">Up to ₦300m</option><option value="500000000">Up to ₦500m</option>
              </select>
            </label>
            <label className="text-[9px] font-medium text-[#555]">Bedrooms
              <select value={beds} onChange={(event) => setBeds(event.target.value)} className="mt-1 block w-full rounded-md border border-[#E5E5E5] bg-white px-2.5 py-2 text-[9px] outline-none focus:border-[#A15912]">
                <option value="">Any</option><option value="1">1+ beds</option><option value="2">2+ beds</option><option value="3">3+ beds</option><option value="4">4+ beds</option><option value="5">5+ beds</option>
              </select>
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#A15912] px-3 py-2.5 text-[9px] font-semibold text-white hover:bg-[#78400B]"><Search size={12} /> Search properties</button>
          </form>

          <section className="mt-4">
            <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
              <div><h2 className="text-sm font-semibold text-[#292929]">Made for your shortlist</h2><p className="mt-0.5 text-[9px] text-[#777]">Approved homes available to explore{location ? ` near ${location}` : ""}.</p></div>
              <a href="/marketplace" className="rounded border border-[#E5E1DD] bg-white px-2.5 py-1.5 text-[9px] font-medium text-[#8A4B0B] hover:bg-[#FBF2E9]">Visit marketplace</a>
            </div>
            {isLoading ? <p className="rounded-lg border border-[#E5E1DD] bg-white p-5 text-xs text-[#777]">Finding approved properties...</p> : suggestedProperties.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {suggestedProperties.map((property) => <PropertyTile key={property.id} property={property} saved={savedIds.includes(property.id)} onToggleSave={toggleSave} />)}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#DED8D0] bg-white p-6 text-center">
                <p className="text-xs font-medium text-[#444]">No approved homes to show yet</p><p className="mt-1 text-[9px] text-[#777]">New listings will appear here as soon as they are approved.</p>
              </div>
            )}
          </section>

          <div className="mt-3 grid items-start gap-2.5 lg:grid-cols-3">
            <section id="saved-homes" className="scroll-mt-20 rounded-xl border border-[#E5E1DD] bg-white p-3">
              <div className="flex items-center justify-between"><h2 className="text-[11px] font-semibold text-[#292929]">Saved homes</h2><a href="/marketplace" className="text-[8px] font-medium text-[#8A4B0B]">Browse all →</a></div>
              {savedProperties.length > 0 ? (
                <div className="mt-2 divide-y divide-[#EFEFEF]">
                  {savedProperties.slice(0, 3).map((property) => (
                    <div key={property.id} className="flex items-center gap-2 py-2 first:pt-1">
                      <a href={property.detailHref} className="h-10 w-12 shrink-0 overflow-hidden rounded">
                        {getImage(property) ? <img src={getImage(property)} alt="" className="h-full w-full object-cover" /> : <div className="h-full bg-[#F0EDE9]" />}
                      </a>
                      <div className="min-w-0 flex-1">
                        <a href={property.detailHref} className="block truncate text-[9px] font-medium text-[#333] hover:text-[#A15912]">{property.title}</a>
                        <p className="text-[8px] text-[#777]">{formatPrice(property.price)} · {property.location}</p>
                        <a href={property.detailHref} className="text-[8px] text-[#8A4B0B] hover:underline">View property →</a>
                      </div>
                      <button type="button" disabled={isSavingId === property.id} onClick={() => toggleSave(property)} aria-label={`Remove ${property.title} from saved homes`} className="p-1 text-[#A15912] disabled:opacity-50"><Heart size={13} fill="currentColor" /></button>
                    </div>
                  ))}
                </div>
              ) : <div className="py-5 text-center"><Heart size={18} className="mx-auto text-[#C9B8A7]" /><p className="mt-2 text-[9px] font-medium text-[#555]">Your shortlist is empty</p><p className="mt-1 text-[8px] text-[#888]">Save homes to compare them here.</p></div>}
            </section>

            <section id="viewings" className="scroll-mt-20 rounded-xl border border-[#E5E1DD] bg-white p-3">
              <div className="flex items-center justify-between"><h2 className="text-[11px] font-semibold text-[#292929]">Upcoming viewings</h2><span className="text-[8px] text-[#999]">No scheduled viewings</span></div>
              <div className="mt-2 flex min-h-[94px] flex-col items-center justify-center border-t border-[#EFEFEF] py-4 text-center">
                <CalendarDays size={17} className="text-[#A15912]" /><p className="mt-2 text-[9px] font-medium text-[#555]">Your viewing plans will appear here</p><p className="mt-1 max-w-[210px] text-[8px] leading-relaxed text-[#888]">Open a home you like to contact its agent and arrange a viewing.</p>
              </div>
              <a href="/marketplace" className="inline-flex items-center gap-1 rounded border border-[#E5E1DD] px-2 py-1.5 text-[8px] font-medium text-[#8A4B0B] hover:bg-[#FBF2E9]">Explore homes <ChevronRight size={11} /></a>
            </section>

            <section id="inquiries" className="scroll-mt-20 rounded-xl border border-[#E5E1DD] bg-white p-3">
              <div className="flex items-center justify-between"><h2 className="text-[11px] font-semibold text-[#292929]">Your conversations with Voks Team</h2><span className="text-[8px] text-[#999]">Inbox</span></div>
              <div className="mt-2 flex min-h-[94px] flex-col items-center justify-center border-t border-[#EFEFEF] py-4 text-center">
                <MessageSquare size={17} className="text-[#A15912]" /><p className="mt-2 text-[9px] font-medium text-[#555]">No conversations yet</p><p className="mt-1 max-w-[210px] text-[8px] leading-relaxed text-[#888]">When you contact our team about a property, your messages will appear here.</p>
              </div>
              <a href="/marketplace" className="inline-flex items-center gap-1 rounded bg-[#A15912] px-2.5 py-1.5 text-[8px] font-semibold text-white hover:bg-[#78400B]">Find a property <ChevronRight size={11} /></a>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
