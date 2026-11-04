"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, FileText, ImagePlus, MapPin, Upload, X } from "lucide-react";
import { removeCloudinaryAssets, uploadFileToCloudinary } from "@/lib/cloudinaryUpload";

const DECLARATION = "I hereby declare that the informations i herein contained are true and is not intended to deceive anyone or the general public, should liability arise as a result of falsehood connected to the above information, i take full responsibility. I hereby indemnify the company of any loss that may be occasioned by these information that I have provided.";
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const DRAFT_KEY = "voks-kalis-property-upload-draft";

const INITIAL_VALUES = {
  title: "",
  category: "buildings",
  purpose: "sales",
  propertyType: "residential",
  price: "",
  location: "",
  propertyTitle: "",
  otherPropertyTitle: "",
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

async function uploadFilesWithConcurrency(files, purposes, concurrency = 3) {
  const results = new Array(files.length);
  const errors = new Array(files.length);
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, async () => {
    while (nextIndex < files.length) {
      const index = nextIndex++;
      try {
        results[index] = await uploadFileToCloudinary(files[index], purposes[index]);
      } catch (error) {
        errors[index] = error;
      }
    }
  }));
  const firstError = errors.find(Boolean);
  if (firstError) {
    firstError.uploadedAssets = results.filter(Boolean);
    throw firstError;
  }
  return results;
}

export default function PropertyUploadForm() {
  const previewUrls = useRef(new Set());
  const [values, setValues] = useState(INITIAL_VALUES);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const isLand = ["land", "lands"].includes(values.category);
  const checklist = [
    ["Property details", Boolean(values.title && values.description)],
    ["Price and location", Boolean(values.price && values.location && values.propertyAddress)],
    ["At least 2 photos", photos.length >= 2],
    ["Title document", documents.length > 0 && Boolean(values.propertyTitle)],
    ["Declaration accepted", values.declarationAccepted],
  ];

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft && typeof parsedDraft === "object" && !Array.isArray(parsedDraft)) {
          setValues((current) => ({ ...current, ...parsedDraft }));
        }
      }
    } catch (draftError) {
      console.error("Unable to load the property form draft:", draftError);
    }
  }, []);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => {
      if (name === "propertyType") {
        return { ...current, propertyType: value };
      }
      if (name !== "category") return { ...current, [name]: value };
      const selectingLand = value === "lands";
      const currentTypeIsLand = ["raw-land", "agricultural-land"].includes(current.propertyType);
      return {
        ...current,
        category: value,
        propertyType: selectingLand
          ? currentTypeIsLand ? current.propertyType : "raw-land"
          : currentTypeIsLand ? "residential" : current.propertyType,
      };
    });
    setSaved(false);
    setDraftSaved(false);
  }

  function processAttachments(files, kind) {
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

    setError("");
    const preparedFiles = files.map((file) => {
      const preview = isImage ? URL.createObjectURL(file) : "";
      if (preview) previewUrls.current.add(preview);
      return { file, name: file.name, type: file.type, size: file.size, preview };
    });
    if (isImage) setPhotos((current) => [...current, ...preparedFiles]);
    else setDocuments((current) => [...current, ...preparedFiles]);
    setSaved(false);
    setDraftSaved(false);
  }

  function handleAttachments(event, kind) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    processAttachments(files, kind);
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      setDraftSaved(true);
      setError("");
    } catch (draftError) {
      console.error("Unable to save the property form draft:", draftError);
      setError("Unable to save a draft on this device.");
    }
  }

  function removePhoto(index) {
    setPhotos((current) => {
      const photo = current[index];
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
        previewUrls.current.delete(photo.preview);
      }
      return current.filter((_, photoIndex) => photoIndex !== index);
    });
    setSaved(false);
    setDraftSaved(false);
  }

  function removeDocument(index) {
    setDocuments((current) => current.filter((_, documentIndex) => documentIndex !== index));
    setSaved(false);
    setDraftSaved(false);
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
      propertyTitle: values.propertyTitle === "other" ? values.otherPropertyTitle.trim() : values.propertyTitle.trim(),
      propertyAddress: values.propertyAddress.trim(),
      rootOfTitle: values.rootOfTitle.trim(),
      previousOwner: values.previousOwner.trim(),
      beds: isLand ? null : values.beds ? Number(values.beds) : null,
      baths: isLand ? null : values.baths ? Number(values.baths) : null,
      areaSqm: values.areaSqm ? Number(values.areaSqm) : null,
      features: isLand ? values.features.trim() : "",
      landmarks: isLand ? values.landmarks.trim() : "",
      landUse: isLand ? values.landUse : "",
      declarationAccepted: values.declarationAccepted,
    };

    setIsSubmitting(true);
    setError("");
    let uploadedAssets = [];
    try {
      try {
        setIsUploadingFiles(true);
        const allFiles = [...photos, ...documents];
        const uploadedFiles = await uploadFilesWithConcurrency(
          allFiles.map((attachment) => attachment.file),
          [
            ...photos.map(() => "property-image"),
            ...documents.map(() => "property-document"),
          ],
        );
        const uploadedImages = uploadedFiles.slice(0, photos.length);
        const uploadedDocuments = uploadedFiles.slice(photos.length);
        uploadedAssets = uploadedFiles;
        setIsUploadingFiles(false);
        listing.images = uploadedImages.map((asset) => ({
          ...asset,
          name: asset.name,
          mimeType: asset.mimeType,
        }));
        listing.documents = uploadedDocuments.map((asset) => ({
          ...asset,
          name: asset.name,
          mimeType: asset.mimeType,
        }));
      } catch (uploadError) {
        setIsUploadingFiles(false);
        uploadedAssets = uploadError.uploadedAssets || [];
        try {
          await removeCloudinaryAssets(uploadedAssets.map((asset) => ({
            publicId: asset.publicId,
            resourceType: asset.resourceType,
            type: asset.uploadType,
          })));
        } catch (cleanupError) {
          console.error("Could not remove partially uploaded property assets:", cleanupError);
        }
        throw uploadError;
      }

      let response;
      try {
        response = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(listing),
        });
      } catch {
        setError("We couldn't confirm the property submission. Check your submitted properties before trying again.");
        return;
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        try {
          await removeCloudinaryAssets(uploadedAssets.map((asset) => ({
            publicId: asset.publicId,
            resourceType: asset.resourceType,
            type: asset.uploadType,
          })));
        } catch (cleanupError) {
          console.error("Could not remove property assets after submission failed:", cleanupError);
        }
        setError(result.error || "Unable to submit this property. Please try again.");
        return;
      }
      setSaved(true);
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch (draftError) {
        console.error("Unable to clear the submitted property draft:", draftError);
      }
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload property files. Please try again.");
    } finally {
      setIsUploadingFiles(false);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <header className="border-b border-forest/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/dashboard" className="flex items-center gap-2 text-forest" aria-label="Back to dashboard">
            <ArrowLeft size={17} />
            <span className="font-display text-lg">Voks-Kalis Global</span>
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
                  <span className="mb-2 block text-sm font-medium">Property category</span>
                  <select className={FIELD_CLASS} name="category" value={values.category} onChange={updateValue}>
                    <option value="lands">Lands</option>
                    <option value="buildings">Buildings</option>
                    <option value="shortlets">Shortlets</option>
                    <option value="rentals">Rentals</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Property purpose</span>
                  <select className={FIELD_CLASS} name="purpose" value={values.purpose} onChange={updateValue}>
                    <option value="sales">Sales</option>
                    <option value="lease">Lease</option>
                    <option value="rent">Rent</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Property type</span>
                  <select className={FIELD_CLASS} name="propertyType" value={values.propertyType} onChange={updateValue} required>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <optgroup label="Land">
                      <option value="raw-land">Raw</option>
                      <option value="agricultural-land">Agricultural</option>
                    </optgroup>
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
              <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">03 / {isLand ? "Property features" : "Useful specifics"}</p>
              <h2 className="mt-2 font-display text-2xl text-forest">{isLand ? "Land details" : "Space & rooms"}</h2>
              {isLand ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-medium">Land use</span>
                    <select className={FIELD_CLASS} name="landUse" value={values.landUse} onChange={updateValue} required>
                      <option value="">Select land use</option>
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
                      setDraftSaved(false);
                    }}
                    className="mt-0.5 h-4 w-4 accent-forest"
                    required
                  />
                  <span>Check this box to agree on terms and conditions.</span>
                </label>
              </div>
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-6">
            <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
              <h2 className="font-display text-base font-semibold text-forest">Property photos</h2>
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!isSubmitting) {
                    processAttachments(Array.from(event.dataTransfer.files), "images");
                  }
                }}
                className="mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gold/60 bg-[#fff9f1] p-4 text-center transition hover:border-gold"
              >
                <ImagePlus size={20} className="mb-2 text-forest" />
                <span className="text-xs font-semibold text-clay">Drop photos or browse files</span>
                <span className="mt-1 text-[10px] text-ink/50">JPG, PNG or WEBP · Up to 2 MB each</span>
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => handleAttachments(event, "images")} disabled={isSubmitting} />
              </label>
              {photos[0] && (
                <div className="group relative mt-3 overflow-hidden rounded-md">
                  <img src={photos[0].preview} alt={photos[0].name} className="h-28 w-full object-cover" />
                  <button type="button" aria-label={`Remove ${photos[0].name}`} onClick={() => removePhoto(0)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink hover:text-clay"><X size={14} /></button>
                </div>
              )}
              {photos.length > 0 && (
                <p className="mt-2 truncate text-[10px] text-ink/55">Cover photo · {photos[0].name}</p>
              )}
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.slice(1, 4).map((photo, index) => {
                  const photoIndex = index + 1;
                  return (
                    <div key={`${photo.name}-${photoIndex}`} className="group relative overflow-hidden rounded-md">
                      <img src={photo.preview} alt={photo.name} className="h-14 w-full object-cover" />
                      <button type="button" aria-label={`Remove ${photo.name}`} onClick={() => removePhoto(photoIndex)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition group-hover:opacity-100 focus:opacity-100"><X size={12} /></button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] text-ink/55">{photos.length} photo{photos.length === 1 ? "" : "s"} added · Include at least 2 clear photos</p>
            </section>

            <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
              <h2 className="font-display text-base font-semibold text-forest">Ownership documents</h2>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-xs font-medium text-ink/75">Title type</span>
                <select className={`${FIELD_CLASS} py-2.5 text-xs`} name="propertyTitle" value={values.propertyTitle} onChange={updateValue} required>
                  <option value="">Select title type</option>
                  <option value="Certificate of Occupancy">Certificate of Occupancy</option>
                  <option value="Deed of Assignment">Deed of Assignment</option>
                  <option value="Governor's Consent">Governor&apos;s Consent</option>
                  <option value="Survey Plan">Survey Plan</option>
                  <option value="other">Other</option>
                </select>
              </label>
              {values.propertyTitle === "other" && (
                <input className={`${FIELD_CLASS} mt-2 py-2.5 text-xs`} name="otherPropertyTitle" value={values.otherPropertyTitle} onChange={updateValue} placeholder="Enter title type" required maxLength={120} />
              )}
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-forest/15 px-3 py-2.5 text-xs font-semibold text-forest transition hover:border-gold">
                <Upload size={14} /> Attach title document
                <input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple onChange={(event) => handleAttachments(event, "documents")} disabled={isSubmitting} />
              </label>
              {documents.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {documents.map((document, index) => (
                    <li key={`${document.name}-${index}`} className="flex items-center justify-between gap-2 rounded bg-[#f8f7f5] px-2 py-1.5 text-[10px]">
                      <span className="flex min-w-0 items-center gap-1.5 text-ink/70"><FileText size={12} className="shrink-0 text-clay" /><span className="truncate">{document.name}</span></span>
                      <button type="button" aria-label={`Remove ${document.name}`} onClick={() => removeDocument(index)} className="shrink-0 text-ink/50 hover:text-clay"><X size={13} /></button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[10px] leading-relaxed text-ink/50">PDF or image · Up to 4 MB each. Documents are private and reviewed by the Voks-Kalis team.</p>
            </section>

            <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
              <h2 className="font-display text-base font-semibold text-forest">Ready to list?</h2>
              <p className="mt-2 text-xs leading-relaxed text-ink/55">Complete the required details, photos and ownership document before submitting.</p>
              <ul className="mt-3 space-y-2">
                {checklist.map(([label, complete]) => (
                  <li key={label} className="flex items-center gap-2 text-[11px] text-ink/65">
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full ${complete ? "bg-forest text-white" : "border border-ink/20 text-transparent"}`}>{complete && <Check size={10} />}</span>
                    {label}
                  </li>
                ))}
              </ul>
              {isUploadingFiles && <p role="status" className="mt-3 text-xs text-ink/55">Uploading files securely to Cloudinary...</p>}
              {error && <p role="alert" className="mt-3 rounded border border-clay/20 bg-clay/5 px-2.5 py-2 text-xs text-clay">{error}</p>}
              {saved && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-forest"><Check size={14} /> Property submitted for review.</p>}
              {draftSaved && <p role="status" className="mt-3 text-xs text-forest">Draft saved on this device. Reattach photos and documents before submitting.</p>}
              <button type="button" onClick={saveDraft} disabled={isSubmitting} className="mt-3 w-full rounded-md border border-forest/15 px-3 py-2 text-xs font-semibold text-clay transition hover:border-gold disabled:opacity-50">Save draft</button>
              <button type="submit" disabled={isSubmitting || saved} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#a65f0c] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#854b09] disabled:cursor-wait disabled:opacity-70">
                {isUploadingFiles ? "Uploading files..." : isSubmitting ? "Submitting..." : saved ? "Submitted" : "Submit for review"} {!isSubmitting && !saved && <Upload size={13} />}
              </button>
              <p className="mt-2 text-[10px] leading-relaxed text-ink/50">For agents · Listings are usually reviewed within 24–48 hours.</p>
            </section>
            <a href="/dashboard" className="flex w-full items-center justify-center gap-2 py-2 text-xs text-ink/55 hover:text-forest"><X size={14} /> Cancel</a>
          </aside>
        </form>
      </div>
    </main>
  );
}