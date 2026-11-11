"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ImagePlus, Trash2, Upload } from "lucide-react";
import { removeCloudinaryAssets, uploadFileToCloudinary } from "@/lib/cloudinaryUpload";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 10;

export default function AdminGalleryManager() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [category, setCategory] = useState("projects");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState([]);
  const [hasConsent, setHasConsent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadItems() {
      try {
        const response = await fetch("/api/admin/gallery");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load gallery images.");
        if (active) {
          setItems(result.items || []);
          setCursor(result.nextCursor || null);
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadItems();
    return () => { active = false; };
  }, []);

  function chooseFiles(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    setError("");
    setNotice("");
    if (selected.length > MAX_FILES) {
      setError(`Choose no more than ${MAX_FILES} images at a time.`);
      return;
    }
    if (selected.some((file) => !IMAGE_TYPES.includes(file.type))) {
      setError("Use JPG, PNG or WEBP images.");
      return;
    }
    if (selected.some((file) => file.size < 1 || file.size > MAX_FILE_BYTES)) {
      setError("Each image must be no larger than 5 MB.");
      return;
    }
    setFiles(selected);
  }

  async function submitImages(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!files.length) {
      setError("Choose at least one image to upload.");
      return;
    }
    if (!hasConsent && category === "clients") {
      setError("Confirm you have permission to publish the client images.");
      return;
    }

    setIsSubmitting(true);
    let uploadedCount = 0;
    try {
      for (const file of files) {
        const asset = await uploadFileToCloudinary(file, "gallery-image");
        try {
          const response = await fetch("/api/admin/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category,
              caption: caption.trim(),
              publicId: asset.publicId,
            }),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.error || `Unable to save ${file.name} to the gallery.`);
          setItems((current) => [result.item, ...current]);
          uploadedCount += 1;
        } catch (saveError) {
          try {
            await removeCloudinaryAssets([{
              publicId: asset.publicId,
              resourceType: asset.resourceType,
              type: asset.uploadType,
            }]);
          } catch (cleanupError) {
            console.error("Could not remove an unsaved gallery image:", cleanupError);
          }
          throw saveError;
        }
      }
      setFiles([]);
      setCaption("");
      setHasConsent(false);
      setNotice(`${uploadedCount} ${uploadedCount === 1 ? "image was" : "images were"} added to the gallery.`);
    } catch (uploadError) {
      if (uploadedCount > 0) setFiles((current) => current.slice(uploadedCount));
      setError(uploadedCount
        ? `${uploadError.message} ${uploadedCount} earlier ${uploadedCount === 1 ? "image was" : "images were"} saved successfully.`
        : uploadError.message || "Unable to upload gallery images.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadMore() {
    if (!cursor || isLoadingMore) return;
    setError("");
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/admin/gallery?cursor=${encodeURIComponent(cursor)}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to load more gallery images.");
      setItems((current) => [...current, ...(result.items || [])]);
      setCursor(result.nextCursor || null);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function removeItem(item) {
    if (!window.confirm("Remove this image from the gallery?")) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to remove this gallery image.");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
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
          <h1 className="mt-2 font-display text-3xl font-semibold">Manage the gallery</h1>
          <p className="mt-2 text-sm leading-6 text-[#777]">Upload photos of completed projects and satisfied clients for the public gallery.</p>
        </div>

        <form onSubmit={submitImages} className="mt-7 rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-6">
          <h2 className="text-base font-semibold">Add gallery images</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Gallery section
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-md border border-[#E0E0E0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A15912]">
                <option value="projects">Projects delivered</option>
                <option value="clients">Satisfied clients</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Caption (optional, applies to each selected image)
              <input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={180} placeholder="e.g. New residential development" className="rounded-md border border-[#E0E0E0] px-3 py-2.5 text-sm outline-none focus:border-[#A15912]" />
            </label>
          </div>
          <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#D4C7BA] bg-[#FBF9F6] px-4 py-5 text-center hover:bg-[#FBF2E9]">
            <ImagePlus size={23} className="text-[#A15912]" />
            <span className="mt-2 text-xs font-semibold text-[#444]">{files.length ? `${files.length} image${files.length === 1 ? "" : "s"} selected` : "Choose images to upload"}</span>
            <span className="mt-1 text-[10px] text-[#888]">JPG, PNG or WEBP · up to 5 MB each · max 10 per upload</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseFiles} className="sr-only" />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 grid gap-1 text-[10px] text-[#666] sm:grid-cols-2">
              {files.map((file) => <li key={`${file.name}-${file.lastModified}`} className="truncate">{file.name}</li>)}
            </ul>
          )}
          {category === "clients" && (
            <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#555]">
              <input type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} className="mt-1 accent-[#A15912]" />
              I confirm we have the client&apos;s permission to publish these images.
            </label>
          )}
          {error && <p role="alert" className="mt-4 rounded-md border border-[#EBCBCB] bg-[#FCEDED] px-3 py-2.5 text-xs text-[#9A3434]">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-md border border-[#CFE4D5] bg-[#EFF8F1] px-3 py-2.5 text-xs text-[#246B4D]">{notice}</p>}
          <button type="submit" disabled={isSubmitting} className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#A15912] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78400B] disabled:cursor-wait disabled:opacity-60">
            <Upload size={14} /> {isSubmitting ? "Uploading..." : "Upload images"}
          </button>
        </form>

        <section className="mt-8" aria-labelledby="gallery-list-heading">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="gallery-list-heading" className="text-lg font-semibold">Published images</h2>
              <p className="mt-1 text-xs text-[#777]">These images are visible to everyone on the public gallery.</p>
            </div>
            <span className="rounded-full bg-[#F0EEF7] px-3 py-1 text-[10px] font-medium text-[#555]">{items.length} shown</span>
          </div>

          {isLoading ? (
            <p className="mt-5 text-sm text-[#777]">Loading images...</p>
          ) : items.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-[#E3E3E3] bg-white">
                  <img src={item.imageUrl} alt={item.caption || (item.category === "clients" ? "Satisfied client" : "Delivered project")} className="aspect-[4/3] w-full bg-[#F0EEF7] object-cover" loading="lazy" />
                  <div className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{item.caption || (item.category === "clients" ? "Satisfied client" : "Project delivered")}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#888]">{item.category === "clients" ? "Satisfied client" : "Project delivered"}</p>
                    </div>
                    <button type="button" onClick={() => removeItem(item)} aria-label={`Remove ${item.caption || "gallery image"}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9A3434] hover:bg-[#FCEDED]">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-[#D8D2CC] bg-white px-5 py-10 text-center text-sm text-[#777]">No gallery images have been uploaded yet.</p>
          )}

          {cursor && (
            <button type="button" onClick={loadMore} disabled={isLoadingMore} className="mx-auto mt-6 flex items-center gap-2 rounded-full border border-[#17392E]/20 bg-white px-4 py-2 text-xs font-semibold text-[#17392E] hover:bg-[#F5F5F5] disabled:opacity-60">
              {isLoadingMore ? "Loading..." : "Load more"} {!isLoadingMore && <ArrowDown size={14} />}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
