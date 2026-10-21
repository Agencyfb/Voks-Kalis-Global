"use client";

import { useState } from "react";
import { ArrowLeft, Check, FileText, ImagePlus, MapPin, Upload, X } from "lucide-react";

const DECLARATION = "I hereby declare that the informations i herein contained are true and is not intended to deceive anyone or the general public, should liability arise as a result of falsehood connected to the above information, i take full responsibility. I hereby indemnify the company of any loss that may be occasioned by these information that I have provided.";
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

const INITIAL_VALUES = {
  title: "",
  category: "estates",
  purpose: "sale",
  price: "",
  location: "",
  propertyTitle: "",
  propertyAddress: "",
  rootOfTitle: "",
  previousOwner: "",
  ownershipType: "",
  description: "",
  beds: "",
  baths: "",
  areaSqm: "",
  features: "",
  landmarks: "",
  landUse: "",
  declarationAccepted: false,
};

const FIELD_CLASS = "w-full rounded-md border border-forest/15 bg-white px-3.5 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`The file "${file.name}" could not be prepared.`));
    reader.readAsDataURL(file);
  });
}

export default function PropertyUploadForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isProcessingAttachments, setIsProcessingAttachments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }

  async function handleAttachments(event, kind) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const isImage = kind === "images";
    const allowedTypes = isImage
      ? ["image/jpeg", "image/png", "image/webp"]
      : ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    const maxFileBytes = isImage ? 2 * 1024 * 1024 : 4 * 1024 * 1024;
    const existingBytes = [...photos, ...documents].reduce((total, file) => total + file.size, 0);
    const currentCount = isImage ? photos.length : documents.length;
    if (currentCount + files.length > 10) {
      setError(`You can upload up to 10 ${isImage ? "photos" : "documents"}.`);
      return;
    }
    if (files.some((file) => !allowedTypes.includes(file.type))) {
      setError(isImage ? "Use JPG, PNG or WEBP photos." : "Use PDF, JPG, PNG or WEBP supporting documents.");
      return;
    }
    if (files.some((file) => file.size > maxFileBytes)) {
      setError(isImage ? "Each photo must be no larger than 2 MB." : "Each supporting document must be no larger than 4 MB.");
      return;
    }
    if (existingBytes + files.reduce((total, file) => total + file.size, 0) > MAX_ATTACHMENT_BYTES) {
      setError("All property photos and documents must total 8 MB or less.");
      return;
    }

    setIsProcessingAttachments(true);
    setError("");
    try {
      const preparedFiles = await Promise.all(files.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        data: await readFileAsDataUrl(file),
      })));
      if (isImage) setPhotos((current) => [...current, ...preparedFiles]);
      else setDocuments((current) => [...current, ...preparedFiles]);
      setSaved(false);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsProcessingAttachments(false);
    }
  }

  async function submitListing(event) {
    event.preventDefault();
    if (photos.length < 2) {
      setError("Add at least two property photos before submitting.");
      return;
    }
    if (documents.length === 0) {
      setError("Add at least one property title or supporting document.");
      return;
    }
    if (!values.declarationAccepted) {
      setError("Accept the declaration before submitting this property.");
      return;
    }

    const listing = {
      ...values,
      price: Number(values.price),
      propertyTitle: values.propertyTitle.trim(),
      propertyAddress: values.propertyAddress.trim(),
      rootOfTitle: values.rootOfTitle.trim(),
      previousOwner: values.previousOwner.trim(),
      beds: values.category === "land" ? null : values.beds ? Number(values.beds) : null,
      baths: values.category === "land" ? null : values.baths ? Number(values.baths) : null,
      areaSqm: values.areaSqm ? Number(values.areaSqm) : null,
      features: values.category === "land" ? values.features.trim() : "",
      landmarks: values.category === "land" ? values.landmarks.trim() : "",
      landUse: values.category === "land" ? values.landUse : "",
      images: photos.map(({ data, name, type }) => ({ data, name, type })),
      documents: documents.map(({ data, name, type }) => ({ data, name, type })),
      declarationAccepted: values.declarationAccepted,
    };

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "Unable to submit this property. Please try again.");
        return;
      }
      setSaved(true);
    } catch {
      setError("We couldn't reach Haven. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-forest/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/dashboard" className="flex items-center gap-2 text-forest" aria-label="Back to dashboard">
            <ArrowLeft size={17} />
            <span className="font-display text-lg">Haven</span>
          </a>
          <span className="text-xs font-semibold uppercase tracking-widest2 text-ink/45">Listing studio</span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">For agents, landlords and admins</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-forest sm:text-5xl">Add a property</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60">Share the details buyers need to find the right place.</p>
          </div>
          <a href="/dashboard" className="inline-flex items-center gap-2 self-start text-sm font-medium text-forest hover:text-clay sm:self-auto">
            <ArrowLeft size={16} /> Back to dashboard
          </a>
        </div>

        <form onSubmit={submitListing} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-8">
            <section className="border-t-2 border-forest pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">01 / The listing</p>
              <h2 className="mt-2 font-display text-2xl text-forest">Property details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium">Listing title</span>
                  <input className={FIELD_CLASS} name="title" value={values.title} onChange={updateValue} placeholder="e.g. Whitestone Villa" required maxLength={90} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Property type</span>
                  <select className={FIELD_CLASS} name="category" value={values.category} onChange={updateValue}>
                    <option value="estates">Residential</option>
                    <option value="land">Land</option>
                    <option value="shortlets">Shortlet</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Listing type</span>
                  <select className={FIELD_CLASS} name="purpose" value={values.purpose} onChange={updateValue}>
                    <option value="sale">For sale</option>
                    <option value="rent">For rent</option>
                    <option value="shortlet">Short stay</option>
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium">Description</span>
                  <textarea className={`${FIELD_CLASS} min-h-32 resize-y`} name="description" value={values.description} onChange={updateValue} placeholder="What makes this property a good fit? Include its standout features." required maxLength={1500} />
                  <span className="mt-1.5 block text-right text-xs text-ink/40">{values.description.length}/1500</span>
                </label>
              </div>
            </section>

            <section className="border-t border-forest/15 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">02 / Price & location</p>
              <h2 className="mt-2 font-display text-2xl text-forest">Where it is, what it costs</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-medium">Price (NGN)</span>
                  <div className="flex rounded-md border border-forest/15 bg-white focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15">
                    <span className="flex items-center border-r border-forest/10 px-3 text-sm text-ink/50">₦</span>
                    <input className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none" name="price" value={values.price} onChange={updateValue} type="number" min="1" step="1" placeholder="185000000" required />
                  </div>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Location</span>
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/45" />
                    <input className={`${FIELD_CLASS} pl-10`} name="location" value={values.location} onChange={updateValue} placeholder="Ikoyi, Lagos" required maxLength={120} />
                  </div>
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium">Full property address</span>
                  <input className={FIELD_CLASS} name="propertyAddress" value={values.propertyAddress} onChange={updateValue} placeholder="Street, area, city and state" required maxLength={300} />
                </label>
                {values.propertyAddress.trim() && (
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm font-medium">Google Maps preview</p>
                    <iframe
                      title="Google Maps preview of the property address"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(values.propertyAddress.trim())}&output=embed`}
                      className="h-64 w-full border border-forest/15"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(values.propertyAddress.trim())}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-forest underline">
                      Check this address in Google Maps
                    </a>
                  </div>
                )}
              </div>
            </section>

            <section className="border-t border-forest/15 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">03 / {values.category === "land" ? "Property features" : "Useful specifics"}</p>
              <h2 className="mt-2 font-display text-2xl text-forest">{values.category === "land" ? "Land details" : "Space & rooms"}</h2>
              {values.category === "land" ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-medium">Land use</span>
                    <select className={FIELD_CLASS} name="landUse" value={values.landUse} onChange={updateValue} required>
                      <option value="">Select a purpose</option>
                      <option value="commercial">Commercial</option>
                      <option value="residential">Residential</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-medium">Size (sqm)</span>
                    <input className={FIELD_CLASS} name="areaSqm" value={values.areaSqm} onChange={updateValue} type="number" min="0" step="1" placeholder="e.g. 500" />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-medium">Features</span>
                    <textarea className={`${FIELD_CLASS} min-h-24 resize-y`} name="features" value={values.features} onChange={updateValue} placeholder="e.g. Fenced, dry and level" maxLength={500} />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium">Nearby landmarks</span>
                    <textarea className={`${FIELD_CLASS} min-h-24 resize-y`} name="landmarks" value={values.landmarks} onChange={updateValue} placeholder="e.g. 5 minutes from the expressway" maxLength={500} />
                  </label>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
                  {[{ name: "beds", label: "Bedrooms" }, { name: "baths", label: "Bathrooms" }, { name: "areaSqm", label: "Area (m²)" }].map((field) => (
                    <label key={field.name}>
                      <span className="mb-2 block text-sm font-medium">{field.label}</span>
                      <input className={FIELD_CLASS} name={field.name} value={values[field.name]} onChange={updateValue} type="number" min="0" step="1" placeholder="Optional" />
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className="border-t border-forest/15 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">04 / Title & ownership</p>
              <h2 className="mt-2 font-display text-2xl text-forest">Property title details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-medium">Title of the property</span>
                  <input className={FIELD_CLASS} name="propertyTitle" value={values.propertyTitle} onChange={updateValue} placeholder="e.g. Certificate of Occupancy" required maxLength={120} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Previous owner</span>
                  <input className={FIELD_CLASS} name="previousOwner" value={values.previousOwner} onChange={updateValue} placeholder="Full name or organisation" required maxLength={160} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Root of title</span>
                  <textarea className={`${FIELD_CLASS} min-h-24 resize-y`} name="rootOfTitle" value={values.rootOfTitle} onChange={updateValue} placeholder="Describe how ownership originated" required maxLength={500} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Ownership</span>
                  <select className={FIELD_CLASS} name="ownershipType" value={values.ownershipType} onChange={updateValue} required>
                    <option value="">Select ownership</option>
                    <option value="individual">Individual</option>
                    <option value="community">Community</option>
                    <option value="family">Family</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="border-t border-forest/15 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">05 / Declaration</p>
              <h2 className="mt-2 font-display text-2xl text-forest">Confirm your information</h2>
              <div className="mt-5 border border-forest/10 bg-white p-5">
                <p className="text-sm leading-relaxed text-ink/75">{DECLARATION}</p>
                <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-forest/10 pt-4 text-sm font-medium text-forest">
                  <input
                    type="checkbox"
                    checked={values.declarationAccepted}
                    onChange={(event) => {
                      setValues((current) => ({ ...current, declarationAccepted: event.target.checked }));
                      setSaved(false);
                    }}
                    className="mt-0.5 h-4 w-4 accent-forest"
                    required
                  />
                  <span>Check this box to agree on terms and conditions.</span>
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <section className="border-t-2 border-gold pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">Property photos</p>
              <p className="mt-2 text-xs text-ink/55">Add 2-10 JPG, PNG or WEBP photos, up to 2 MB each.</p>
              <label className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed border-forest/25 bg-white p-5 text-center transition hover:border-gold">
                <ImagePlus size={22} className="mb-3 text-forest" />
                <span className="text-sm font-semibold text-forest">Choose property photos</span>
                <span className="mt-1 text-xs text-ink/50">Select multiple photos at once</span>
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => handleAttachments(event, "images")} disabled={isProcessingAttachments || isSubmitting} />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <div key={`${photo.name}-${index}`} className="relative min-w-0 border border-forest/10 bg-white">
                    <img src={photo.data} alt={photo.name} className="aspect-[4/3] w-full object-cover" />
                    <p className="truncate px-2 py-1.5 text-[11px] text-ink/60">{photo.name}</p>
                    <button type="button" aria-label={`Remove ${photo.name}`} onClick={() => {
                      setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
                      setSaved(false);
                    }} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center bg-white/90 text-ink hover:text-clay"><X size={15} /></button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink/50">{photos.length} photo{photos.length === 1 ? "" : "s"} selected</p>
            </section>

            <section className="border-t border-forest/15 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">Title documents</p>
              <p className="mt-2 text-xs text-ink/55">Add 1-10 supporting PDFs or images, up to 4 MB each.</p>
              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 border border-forest/15 bg-white px-4 py-3 text-sm font-semibold text-forest hover:border-gold">
                <FileText size={16} /> Choose documents
                <input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple onChange={(event) => handleAttachments(event, "documents")} disabled={isProcessingAttachments || isSubmitting} />
              </label>
              {documents.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {documents.map((document, index) => (
                    <li key={`${document.name}-${index}`} className="flex items-center justify-between gap-2 border border-forest/10 bg-white px-3 py-2 text-xs">
                      <span className="flex min-w-0 items-center gap-2 text-ink/70"><FileText size={14} className="shrink-0 text-forest" /><span className="truncate">{document.name}</span></span>
                      <button type="button" aria-label={`Remove ${document.name}`} onClick={() => {
                        setDocuments((current) => current.filter((_, documentIndex) => documentIndex !== index));
                        setSaved(false);
                      }} className="shrink-0 text-ink/50 hover:text-clay"><X size={15} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {isProcessingAttachments && <p role="status" className="text-xs text-ink/55">Preparing your files...</p>}

            <section className="border-t border-forest/15 pt-5">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">Live preview</p>
              <div className="mt-4 overflow-hidden border border-forest/10 bg-white">
                {photos[0] ? <img src={photos[0].data} alt="" className="aspect-[16/9] w-full object-cover" /> : <div className="flex aspect-[16/9] items-center justify-center bg-sand/40 text-forest/35"><ImagePlus size={28} /></div>}
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-clay">{values.purpose === "sale" ? "For sale" : values.purpose === "rent" ? "For rent" : "Short stay"}</p>
                  <h3 className="mt-2 truncate font-display text-xl text-forest">{values.title || "Your property title"}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink/55"><MapPin size={13} />{values.location || "Property location"}</p>
                  <p className="mt-4 font-semibold text-forest">{values.price ? `₦${Number(values.price).toLocaleString("en-NG")}` : "Price"}</p>
                </div>
              </div>
            </section>

            {error && <p role="alert" className="border-l-2 border-clay bg-clay/5 px-3 py-2 text-sm text-clay">{error}</p>}
            {saved && <p role="status" className="flex items-center gap-2 border-l-2 border-forest bg-forest/5 px-3 py-2 text-sm text-forest"><Check size={16} /> Property submitted for review.</p>}
            <button type="submit" disabled={isProcessingAttachments || isSubmitting || saved} className="flex w-full items-center justify-center gap-2 bg-forest px-5 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest-light disabled:cursor-wait disabled:opacity-70">
              {isProcessingAttachments ? "Preparing files..." : isSubmitting ? "Submitting..." : saved ? "Submitted" : "Submit property"} {!isProcessingAttachments && !isSubmitting && !saved && <Upload size={16} />}
            </button>
            <a href="/dashboard" className="flex w-full items-center justify-center gap-2 py-2 text-sm text-ink/55 hover:text-forest"><X size={15} /> Cancel</a>
          </aside>
        </form>
      </div>
    </main>
  );
}