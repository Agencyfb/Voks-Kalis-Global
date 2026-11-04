"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  Building2,
  Check,
  CircleCheck,
  Clock3,
  FileCheck2,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Phone,
  Settings,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/properties";

const REVIEW_CHECKS = [
  "Ownership and title information reviewed",
  "Address and location match",
  "Photos meet listing standards",
  "Price and property features checked",
];

function getStatusClasses(status) {
  return {
    pending: "bg-[#FFF4DD] text-[#8A5A12]",
    approved: "bg-[#EAF5EE] text-[#246B4D]",
    declined: "bg-[#FCEDED] text-[#B33B3B]",
    sold: "bg-[#EDF2FA] text-[#405A8A]",
  }[status] || "bg-[#F5F5F5] text-[#666666]";
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status[0].toUpperCase() + status.slice(1);
}

function getDateLabel(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPropertyFeatures(property) {
  return (property.features || "")
    .split(/[,;\n]/)
    .map((feature) => feature.trim())
    .filter(Boolean);
}

export default function AdminPropertyReview({ propertyId, adminName }) {
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [checks, setChecks] = useState([]);
  const [reviewNote, setReviewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProperty() {
      try {
        const response = await fetch(`/api/admin/properties?id=${encodeURIComponent(propertyId)}`);
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load this property.");
        if (!active) return;
        setProperty(result.property);
        setReviewNote(result.property.reviewNote || "");
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProperty();
    return () => { active = false; };
  }, [propertyId]);

  const images = useMemo(() => {
    if (property?.images?.length) return property.images;
    return property?.image ? [{ url: property.image, name: "Property photo" }] : [];
  }, [property]);
  const features = useMemo(() => (property ? getPropertyFeatures(property) : []), [property]);
  const firstName = adminName.split(" ")[0] || "Admin";
  const isPending = property?.workflowStatus === "pending";

  function toggleCheck(check) {
    setChecks((current) => current.includes(check)
      ? current.filter((item) => item !== check)
      : [...current, check]);
  }

  async function saveDecision(workflowStatus) {
    setError("");
    if (workflowStatus === "declined" && !reviewNote.trim()) {
      setError("Add a review note before declining this property.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: propertyId,
          updates: { workflowStatus, reviewNote: reviewNote.trim() },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to save this review decision.");
      setProperty(result.property);
      router.push("/admin");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

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
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] font-semibold text-[#A15912]">{firstName[0]?.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-62px)] max-w-[1600px] lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#E5E5E5] bg-white lg:flex lg:flex-col lg:px-3 lg:py-5">
          <p className="rounded-md bg-[#F5F5F5] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B7565]">Admin workspace</p>
          <nav aria-label="Admin dashboard navigation" className="mt-4 grid gap-1">
            <a href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><LayoutDashboard size={16} /> Overview</a>
            <a href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><Home size={16} /> Properties</a>
            <a href="/admin" aria-current="page" className="flex items-center gap-3 rounded-md bg-[#FBF2E9] px-3 py-2.5 text-xs font-semibold text-[#A15912]"><FileCheck2 size={16} /><span className="flex-1">Review queue</span></a>
            <a href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><Users size={16} /> Agents</a>
            <a href="/admin" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><Building2 size={16} /> Sales &amp; landlords</a>
          </nav>
          <div className="mt-auto grid gap-1 border-t border-[#EAEAEA] pt-4">
            <a href="/admin/profile" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><Settings size={16} /> Edit profile</a>
            <a href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><HelpCircle size={16} /> Help center</a>
            <a href="/login" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><LogOut size={16} /> Sign out</a>
            <div className="mt-2 flex items-center gap-2 border-t border-[#EAEAEA] px-2 pt-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] text-xs font-semibold text-[#A15912]">{firstName[0]?.toUpperCase()}</span>
              <div className="min-w-0"><p className="truncate text-[11px] font-medium text-[#333]">{adminName}</p><p className="text-[10px] text-[#888]">Admin account</p></div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <a href="/admin" className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#777] hover:text-[#8A4B0B]"><ArrowLeft size={13} /> Back to property operations</a>

          {isLoading ? (
            <div className="rounded-lg border border-[#E3E3E3] bg-white p-8 text-center text-sm text-[#777]">Loading property preview...</div>
          ) : error && !property ? (
            <div className="rounded-lg border border-[#EBCBCB] bg-white p-6">
              <p role="alert" className="text-sm text-[#9A3434]">{error}</p>
              <a href="/admin" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#8A4B0B]"><ArrowLeft size={13} /> Return to dashboard</a>
            </div>
          ) : property ? (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A15912]">Review queue / {property.id.slice(-6).toUpperCase()}</p>
                  <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-[#242424] sm:text-[30px]">Review {property.title}</h1>
                  <p className="mt-1 text-[10px] text-[#777]">Submitted by {property.submittedBy} · {getDateLabel(property.submittedAt)} · Not visible to buyers</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusClasses(property.workflowStatus)}`}>
                  <span className="h-1 w-1 rounded-full bg-current" /> {formatStatus(property.workflowStatus)}{isPending ? " approval" : ""}
                </span>
              </div>

              {error && <p role="alert" className="mb-3 rounded border border-[#EBCBCB] bg-[#FCEDED] px-3 py-2.5 text-xs text-[#9A3434]">{error}</p>}

              <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
                <div className="min-w-0">
                  <section aria-label="Property photo preview" className="overflow-hidden rounded-lg">
                    {images.length > 0 ? (
                      <>
                        <img src={images[activeImage]?.url || images[0].url} alt={images[activeImage]?.name || property.title} className="aspect-[16/7] w-full bg-[#EEE] object-cover" />
                        {images.length > 1 && (
                          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {images.slice(0, 4).map((image, index) => (
                              <button key={`${image.name}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Show property photo ${index + 1}`} aria-pressed={activeImage === index} className={`overflow-hidden rounded border-2 ${activeImage === index ? "border-[#A15912]" : "border-transparent"}`}>
                                <img src={image.url} alt={image.name} className="aspect-[2/1] w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="mt-1.5 text-[9px] text-[#888]">{images.length} {images.length === 1 ? "photo" : "photos"} supplied · Select a thumbnail to preview</p>
                      </>
                    ) : <div className="flex aspect-[16/7] items-center justify-center bg-[#F0F0F0] text-xs text-[#888]">No property photos were uploaded.</div>}
                  </section>

                  <section className="mt-3 rounded-lg border border-[#E3E3E3] bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <h2 className="font-display text-lg font-semibold text-[#292929]">{property.propertyTitle || property.title}</h2>
                        <p className="mt-1 flex items-start gap-1 text-[10px] text-[#777]"><MapPin size={12} className="mt-0.5 shrink-0" />{property.propertyAddress || property.location}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-display text-lg font-semibold text-[#A15912]">{formatPrice(property.price)}</p>
                        <p className="text-[9px] capitalize text-[#888]">For {property.purpose?.replaceAll("-", " ") || "sale"} · {property.category}</p>
                      </div>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        ["Bedrooms", property.beds],
                        ["Bathrooms", property.baths],
                        ["Floor area", property.areaSqm ? `${property.areaSqm} m²` : ""],
                        ["Property type", property.propertyType?.replaceAll("-", " ")],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded bg-[#F5F5F5] p-2.5">
                          <dd className="text-xs font-semibold capitalize text-[#333]">{value || "—"}</dd>
                          <dt className="mt-0.5 text-[8px] text-[#888]">{label}</dt>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-4 border-t border-[#ECECEC] pt-3">
                      <h3 className="text-xs font-semibold text-[#333]">About this property</h3>
                      <p className="mt-1.5 whitespace-pre-line text-[10px] leading-relaxed text-[#666]">{property.description || "No description provided."}</p>
                    </div>

                    {features.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold text-[#333]">Features &amp; amenities</h3>
                        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                          {features.map((feature) => <li key={feature} className="flex items-start gap-1.5 text-[9px] text-[#555]"><CircleCheck size={12} className="mt-0.5 shrink-0 text-[#A15912]" />{feature}</li>)}
                        </ul>
                      </div>
                    )}

                    {(property.rootOfTitle || property.previousOwner || property.ownershipType || property.landUse || property.landmarks) && (
                      <dl className="mt-4 grid gap-3 border-t border-[#ECECEC] pt-3 sm:grid-cols-2">
                        {[["Root of title", property.rootOfTitle], ["Previous owner", property.previousOwner], ["Ownership", property.ownershipType], ["Land use", property.landUse], ["Nearby landmarks", property.landmarks]].filter(([, value]) => value).map(([label, value]) => (
                          <div key={label}><dt className="text-[8px] font-semibold uppercase tracking-wide text-[#888]">{label}</dt><dd className="mt-1 text-[10px] capitalize text-[#555]">{value}</dd></div>
                        ))}
                      </dl>
                    )}
                    <p className="mt-4 border-t border-[#ECECEC] pt-2.5 text-[8px] text-[#999]">Submitted {getDateLabel(property.submittedAt)}{property.declarationAcceptedAt ? ` · Declaration accepted ${getDateLabel(property.declarationAcceptedAt)}` : ""}</p>
                  </section>
                </div>

                <aside className="grid gap-3">
                  <section className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
                    <h2 className="text-xs font-semibold text-[#292929]">Submitting {property.submittedByRole === "agent" ? "agent" : "seller"}</h2>
                    <p className="mt-3 text-[11px] font-semibold text-[#333]">{property.submittedBy}</p>
                    <p className="mt-1 text-[9px] capitalize text-[#888]">{property.submittedByRole} · Submitted {getDateLabel(property.submittedAt)}</p>
                    {property.assignedAgent && property.assignedAgent !== property.submittedBy && <p className="mt-2 text-[9px] text-[#777]">Assigned agent: {property.assignedAgent}</p>}
                    {property.submitterEmail && <a href={`mailto:${property.submitterEmail}`} className="mt-3 block truncate text-[9px] text-[#666] hover:text-[#A15912]">{property.submitterEmail}</a>}
                    {property.submitterPhone && <a href={`tel:${property.submitterPhone}`} className="mt-2 flex items-center gap-1.5 text-[9px] text-[#666] hover:text-[#A15912]"><Phone size={11} />{property.submitterPhone}</a>}
                    {property.submitterEmail && <a href={`mailto:${property.submitterEmail}`} className="mt-3 inline-flex items-center gap-1 rounded border border-[#E5E5E5] px-2 py-1.5 text-[9px] font-medium text-[#8A4B0B] hover:bg-[#FBF2E9]"><BadgeCheck size={11} /> Contact submitter</a>}
                  </section>

                  <section className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
                    <h2 className="text-xs font-semibold text-[#292929]">Review checklist</h2>
                    <div className="mt-3 grid gap-2.5">
                      {REVIEW_CHECKS.map((check) => (
                        <label key={check} className="flex cursor-pointer items-start gap-2 text-[9px] leading-relaxed text-[#555]">
                          <input type="checkbox" checked={checks.includes(check)} onChange={() => toggleCheck(check)} disabled={!isPending || isSaving} className="mt-0.5 h-3 w-3 accent-[#A15912]" />
                          {check}
                        </label>
                      ))}
                    </div>
                    <p className="mt-3 text-[8px] text-[#888]">Attachments: {property.documents.length} {property.documents.length === 1 ? "file" : "files"}{property.documents.length ? ` · ${property.documents.map((document) => document.name).join(", ")}` : " · None uploaded"}</p>
                    {property.documents.length > 0 ? (
                      <div className="mt-2 grid gap-1.5">
                        {property.documents.map((document, index) => (
                          <a key={`${document.name}-${index}`} href={document.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-1.5 rounded border border-[#EAEAEA] px-2 py-1.5 text-[9px] text-[#8A4B0B] hover:bg-[#FBF2E9]">
                            <FileCheck2 size={11} className="shrink-0" /><span className="truncate">{document.name}</span><span className="ml-auto shrink-0 text-[8px] text-[#888]">Open</span>
                          </a>
                        ))}
                      </div>
                    ) : <p className="mt-2 text-[9px] text-[#A64A4A]">No supporting documents were uploaded.</p>}
                  </section>

                  <section className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
                    <h2 className="text-xs font-semibold text-[#292929]">Your review decision</h2>
                    <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-medium ${getStatusClasses(property.workflowStatus)}`}>
                      {property.workflowStatus === "pending" ? <Clock3 size={10} /> : property.workflowStatus === "declined" ? <ShieldAlert size={10} /> : <BadgeCheck size={10} />}
                      {formatStatus(property.workflowStatus)}
                    </span>
                    {isPending ? (
                      <>
                        <p className="mt-2 text-[9px] leading-relaxed text-[#777]">Use the checklist to guide your review. A decline reason will be shared with the submitter.</p>
                        <label htmlFor="review-note" className="mt-3 block text-[9px] font-medium text-[#555]">Review note</label>
                        <textarea id="review-note" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={500} rows={3} placeholder="Add feedback for the submitter..." className="mt-1 w-full resize-y rounded border border-[#E5E5E5] p-2 text-[9px] leading-relaxed outline-none focus:border-[#A15912]" />
                        <p className="mt-1 text-right text-[8px] text-[#999]">{reviewNote.length}/500</p>
                        <button type="button" onClick={() => saveDecision("approved")} disabled={isSaving} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded bg-[#A15912] px-3 py-2 text-[9px] font-semibold text-white hover:bg-[#78400B] disabled:cursor-not-allowed disabled:opacity-45">
                          <Check size={12} /> {isSaving ? "Saving..." : "Approve property"}
                        </button>
                        <a href="/admin" className="mt-2 inline-flex w-full items-center justify-center rounded border border-[#E5E5E5] px-3 py-2 text-[9px] font-medium text-[#8A4B0B] hover:bg-[#FBF2E9]">Keep pending</a>
                        <button type="button" onClick={() => saveDecision("declined")} disabled={isSaving || !reviewNote.trim()} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded bg-[#FCEDED] px-3 py-2 text-[9px] font-semibold text-[#A64A4A] hover:bg-[#F7DFDF] disabled:cursor-not-allowed disabled:opacity-45">
                          <X size={12} /> {isSaving ? "Saving..." : "Decline property"}
                        </button>
                        <p className="mt-2 text-[8px] leading-relaxed text-[#999]">The review note will be visible to the submitter.</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-2 text-[9px] leading-relaxed text-[#777]">{property.workflowStatus === "approved" ? "This property has been approved and is available to buyers." : property.workflowStatus === "declined" ? "This property was declined." : "This property is marked as sold."}</p>
                        {property.reviewNote && <div className="mt-3 rounded bg-[#F5F5F5] p-2.5"><p className="text-[8px] font-semibold uppercase tracking-wide text-[#888]">Review note</p><p className="mt-1 text-[9px] leading-relaxed text-[#555]">{property.reviewNote}</p></div>}
                        <a href="/admin" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded border border-[#E5E5E5] px-3 py-2 text-[9px] font-medium text-[#8A4B0B] hover:bg-[#FBF2E9]"><ArrowLeft size={11} /> Return to dashboard</a>
                      </>
                    )}
                  </section>
                </aside>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
