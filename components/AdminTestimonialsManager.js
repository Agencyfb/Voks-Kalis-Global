"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Pencil, Star, Trash2, Upload, X } from "lucide-react";
import { removeCloudinaryAssets, uploadFileToCloudinary } from "@/lib/cloudinaryUpload";

const EMPTY_FORM = {
  name: "",
  detail: "",
  quote: "",
  rating: 5,
  instagramUrl: "",
};
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const FIELD_CLASS = "w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A15912]";

export default function AdminTestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadTestimonials() {
      try {
        const response = await fetch("/api/admin/testimonials");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load testimonials.");
        if (active) setTestimonials(result.testimonials || []);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadTestimonials();
    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "rating" ? Number(value) : value }));
  }

  function chooseFile(event) {
    const selected = event.target.files?.[0] || null;
    event.target.value = "";
    setError("");
    setNotice("");
    if (!selected) return;
    if (!IMAGE_TYPES.includes(selected.type)) {
      setError("Use a JPG, PNG or WEBP image.");
      return;
    }
    if (selected.size < 1 || selected.size > MAX_FILE_BYTES) {
      setError("The image must be no larger than 5 MB.");
      return;
    }
    setFile(selected);
  }

  function editTestimonial(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      detail: item.detail,
      quote: item.quote,
      rating: item.rating,
      instagramUrl: item.instagramUrl,
    });
    setCurrentImage(item.imageUrl);
    setFile(null);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setForm(EMPTY_FORM);
    setCurrentImage("");
    setFile(null);
  }

  async function submitTestimonial(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!editingId && !file) {
      setError("Choose a portrait image for this testimonial.");
      return;
    }
    if (editingId && !file && !currentImage) {
      setError("Choose a portrait image for this testimonial.");
      return;
    }

    setIsSubmitting(true);
    let uploadedAsset = null;
    try {
      if (file) uploadedAsset = await uploadFileToCloudinary(file, "testimonial-image");
      const currentItem = testimonials.find((item) => item.id === editingId);
      const response = await fetch("/api/admin/testimonials", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
          publicId: uploadedAsset?.publicId || currentItem?.publicId,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to save this testimonial.");

      setTestimonials((current) => editingId
        ? current.map((item) => item.id === editingId ? result.testimonial : item)
        : [result.testimonial, ...current]);
      resetForm();
      setNotice(editingId ? "Testimonial updated on the homepage." : "Testimonial published on the homepage.");
    } catch (submitError) {
      if (uploadedAsset) {
        try {
          await removeCloudinaryAssets([{
            publicId: uploadedAsset.publicId,
            resourceType: uploadedAsset.resourceType,
            type: uploadedAsset.uploadType,
          }]);
        } catch (cleanupError) {
          console.error("Could not remove an unsaved testimonial image:", cleanupError);
        }
      }
      setError(submitError.message || "Unable to save this testimonial.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeTestimonial(item) {
    if (!window.confirm(`Remove ${item.name}'s testimonial from the homepage?`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to remove this testimonial.");
      setTestimonials((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
      setNotice("Testimonial removed from the homepage.");
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-6 text-[#242424] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <a href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-[#8A4B0B] hover:underline">
          <ArrowLeft size={14} /> Back to admin dashboard
        </a>
        <div className="mt-5 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A15912]">Admin workspace</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Manage testimonials</h1>
          <p className="mt-2 text-sm leading-6 text-[#777]">Publish client stories, ratings and Instagram testimony links on the homepage.</p>
        </div>

        <form onSubmit={submitTestimonial} className="mt-7 rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{editingId ? "Edit testimonial" : "Add a testimonial"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-xs text-[#777] hover:text-[#333]">
                <X size={14} /> Cancel edit
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Testifier name
              <input name="name" value={form.name} onChange={updateField} maxLength={100} required className={FIELD_CLASS} placeholder="e.g. Mrs Jennifer" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              What they received
              <input name="detail" value={form.detail} onChange={updateField} maxLength={180} required className={FIELD_CLASS} placeholder="e.g. Bought 2 plots of land" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Rating
              <select name="rating" value={form.rating} onChange={updateField} className={FIELD_CLASS}>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Instagram testimony post URL
              <input name="instagramUrl" type="url" value={form.instagramUrl} onChange={updateField} maxLength={2_000} required className={FIELD_CLASS} placeholder="https://www.instagram.com/p/..." />
            </label>
          </div>
          <label className="mt-4 grid gap-1.5 text-xs font-medium text-[#555]">
            Testimony
            <textarea name="quote" value={form.quote} onChange={updateField} maxLength={1_000} rows={4} required className={`${FIELD_CLASS} resize-y`} placeholder="Share what the client said about their experience..." />
          </label>

          <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#D4C7BA] bg-[#FBF9F6] px-4 py-5 text-center hover:bg-[#FBF2E9]">
            <ImagePlus size={23} className="text-[#A15912]" />
            <span className="mt-2 text-xs font-semibold text-[#444]">{file?.name || (currentImage ? "Choose a new testifier image (optional)" : "Choose the testifier's image")}</span>
            <span className="mt-1 text-[10px] text-[#888]">JPG, PNG or WEBP · up to 5 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} className="sr-only" />
          </label>
          {currentImage && !file && <Image unoptimized width={1200} height={800} src={currentImage} alt="Current testifier" className="mt-3 h-24 w-24 rounded-md object-cover" />}

          {error && <p role="alert" className="mt-4 rounded-md border border-[#EBCBCB] bg-[#FCEDED] px-3 py-2.5 text-xs text-[#9A3434]">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-md border border-[#CFE4D5] bg-[#EFF8F1] px-3 py-2.5 text-xs text-[#246B4D]">{notice}</p>}
          <button type="submit" disabled={isSubmitting} className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#A15912] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78400B] disabled:cursor-wait disabled:opacity-60">
            <Upload size={14} /> {isSubmitting ? "Saving..." : editingId ? "Update testimonial" : "Publish testimonial"}
          </button>
        </form>

        <section className="mt-8" aria-labelledby="testimonial-list-heading">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="testimonial-list-heading" className="text-lg font-semibold">Published testimonials</h2>
              <p className="mt-1 text-xs text-[#777]">Changes appear in the homepage testimonial carousel.</p>
            </div>
            <span className="rounded-full bg-[#F0EEF7] px-3 py-1 text-[10px] font-medium text-[#555]">{testimonials.length} published</span>
          </div>
          {isLoading ? (
            <p className="mt-5 text-sm text-[#777]">Loading testimonials...</p>
          ) : testimonials.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {testimonials.map((item) => (
                <article key={item.id} className="flex gap-4 rounded-xl border border-[#E3E3E3] bg-white p-4">
                  <Image unoptimized width={1200} height={800} src={item.imageUrl} alt={item.name} className="h-20 w-20 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                        <p className="mt-1 truncate text-xs text-[#777]">{item.detail}</p>
                      </div>
                      <div aria-label={`${item.rating} out of 5 stars`} className="flex shrink-0 text-[#FF7918]">
                        {Array.from({ length: item.rating }, (_, index) => <Star key={index} size={13} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#555]">{item.quote}</p>
                    <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold text-[#8A4B0B]">
                      <a href={item.instagramUrl} target="_blank" rel="noreferrer" className="hover:underline">Instagram post ↗</a>
                      <button type="button" onClick={() => editTestimonial(item)} className="inline-flex items-center gap-1 hover:underline"><Pencil size={11} /> Edit</button>
                      <button type="button" onClick={() => removeTestimonial(item)} aria-label={`Remove ${item.name}'s testimonial`} className="inline-flex items-center gap-1 text-[#9A3434] hover:underline"><Trash2 size={11} /> Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-[#D8D2CC] bg-white px-5 py-10 text-center text-sm text-[#777]">No managed testimonials yet. The homepage will continue to show its existing testimonials until you publish one.</p>
          )}
        </section>
      </div>
    </main>
  );
}
