"use client";

import { useEffect, useState } from "react";
import { Bell, Bookmark, Building2, CheckCircle2, ChevronRight, FileText, Home, LayoutDashboard, LogOut, Plus, Settings, UserRound, Users } from "lucide-react";
import { PROPERTIES, formatPrice } from "@/data/properties";
import AgentPropertyStatus from "@/components/AgentPropertyStatus";

const ROLE_CONTENT = {
  buyer: {
    label: "Buyer",
    eyebrow: "Your property journey",
    title: "A clearer way to find home.",
    description: "Keep your shortlist close, track viewings and let Voks-Kalis Global help you move with confidence.",
    stats: [["Saved properties", "6", Bookmark], ["Upcoming viewings", "2", Bell], ["Messages", "4", FileText]],
  },
  agent: {
    label: "Agent",
    eyebrow: "Your agency workspace",
    title: "Your listings, in good hands.",
    description: "Keep your pipeline moving and give every client a more considered property experience.",
    stats: [["Active listings", "12", Building2], ["New enquiries", "8", Bell], ["Viewings this week", "5", Users]],
  },
  landlord: {
    label: "Landlord",
    eyebrow: "Your property portfolio",
    title: "Make every property count.",
    description: "Share your properties with the right audience, review interest and stay close to every lead.",
    stats: [["Published properties", "4", Building2], ["Active enquiries", "9", Bell], ["Documents ready", "7", FileText]],
  },
};

function getStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem("haven-user")) || {};
  } catch {
    return {};
  }
}

export default function ProfileDashboard() {
  const [user, setUser] = useState({ name: "Ada Okafor", role: "buyer" });
  const [role, setRole] = useState("buyer");

  useEffect(() => {
    const storedUser = getStoredUser();
    const nextRole = ROLE_CONTENT[storedUser.role] ? storedUser.role : "buyer";
    setUser({ name: storedUser.name || "Ada Okafor", role: nextRole });
    setRole(nextRole);
  }, []);

  const content = ROLE_CONTENT[role];
  const firstName = user.name.split(" ")[0];

  function changeRole(nextRole) {
    setRole(nextRole);
    const nextUser = { ...user, role: nextRole };
    setUser(nextUser);
    window.localStorage.setItem("haven-user", JSON.stringify(nextUser));
  }

  if (role === "agent") return <AgentPropertyStatus agentName={user.name} />;

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-forest/10 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a href="/" className="flex items-center gap-2 text-forest" aria-label="Voks-Kalis Global home"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-cream"><Home size={18} /></span><span className="font-display text-xl font-medium">Voks-Kalis Global</span></a>
          <div className="flex items-center gap-3 sm:gap-6"><button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-forest/65 hover:bg-forest/5"><Bell size={19} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-clay" /></button><div className="hidden h-8 w-px bg-forest/10 sm:block" /><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand font-display text-lg text-forest">{firstName[0]}</span><span className="hidden text-sm font-medium text-forest sm:block">{user.name}</span></div></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-forest/10 px-5 py-8 lg:block">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest2 text-ink/40">Workspace</p>
          <nav className="mt-4 grid gap-1">
            <a href="#overview" className="flex items-center gap-3 rounded-xl bg-forest px-3 py-3 text-sm font-medium text-cream"><LayoutDashboard size={17} /> Overview</a>
            <a href="#properties" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink/65 hover:bg-forest/5"><Building2 size={17} /> Properties</a>
            <a href="#profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink/65 hover:bg-forest/5"><UserRound size={17} /> Profile</a>
            <a href="#settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink/65 hover:bg-forest/5"><Settings size={17} /> Settings</a>
          </nav>
          <a href="/" className="mt-12 flex items-center gap-3 px-3 py-3 text-sm text-ink/55 hover:text-forest"><LogOut size={17} /> Sign out</a>
        </aside>

        <section id="overview" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-widest2 text-clay">{content.eyebrow}</p><h1 className="mt-2 max-w-2xl font-display text-4xl leading-tight text-forest sm:text-5xl">Good morning, {firstName}.</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60">{content.description}</p></div><a href={role === "buyer" ? "/marketplace" : "/dashboard/properties/new"} className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-forest px-5 py-3 text-sm font-medium text-cream hover:bg-forest-light md:self-auto"><Plus size={17} /> {role === "buyer" ? "Start a search" : "Add a property"}</a></div>
          <div className="mb-8 flex gap-2 overflow-x-auto border-b border-forest/10 pb-3 lg:hidden">{Object.entries(ROLE_CONTENT).map(([value, option]) => <button key={value} type="button" onClick={() => changeRole(value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${role === value ? "bg-forest text-cream" : "bg-white text-ink/60"}`}>{option.label} view</button>)}</div>
          <div className="mb-8 grid gap-4 md:grid-cols-3">{content.stats.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-forest/10 bg-white p-5"><div className="flex items-center justify-between"><span className="text-sm text-ink/55">{label}</span><Icon size={18} className="text-gold" /></div><p className="mt-5 font-display text-4xl text-forest">{value}</p><p className="mt-1 text-xs text-clay">+12% this month</p></div>)}</div>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"><section id="properties" className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest2 text-clay">{role === "buyer" ? "Your shortlist" : "Your portfolio"}</p><h2 className="mt-2 font-display text-2xl text-forest">{content.title}</h2></div><button type="button" aria-label="View all properties" className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/15 text-forest hover:bg-forest/5"><ChevronRight size={17} /></button></div><div className="mt-6 grid gap-3">{PROPERTIES.slice(0, 3).map((property) => <div key={property.id} className="flex items-center gap-4 border-t border-forest/10 py-4"><img src={property.image} alt="" className="h-16 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-forest">{property.title}</p><p className="mt-1 text-xs text-ink/55">{property.location}</p></div><p className="hidden text-sm font-semibold text-forest sm:block">{formatPrice(property.price)}</p><CheckCircle2 size={18} className="text-gold" /></div>)}</div></section><aside id="profile" className="rounded-2xl bg-forest p-6 text-cream sm:p-7"><p className="text-xs font-semibold uppercase tracking-widest2 text-gold-light">Profile mode</p><h2 className="mt-3 font-display text-3xl">See Voks-Kalis Global through your role.</h2><p className="mt-3 text-sm leading-relaxed text-cream/65">Switch views while you shape your account. Your role controls the tools and updates you see.</p><div className="mt-7 grid gap-2">{Object.entries(ROLE_CONTENT).map(([value, option]) => <button key={value} type="button" onClick={() => changeRole(value)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${role === value ? "border-gold bg-gold/15 text-cream" : "border-cream/15 text-cream/65 hover:border-cream/35"}`}><span>{option.label}</span>{role === value && <CheckCircle2 size={16} className="text-gold-light" />}</button>)}</div></aside></div>
        </section>
      </div>
    </main>
  );
}