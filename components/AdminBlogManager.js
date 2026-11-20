"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ImagePlus, Pencil, Trash2, Upload, X } from "lucide-react";
import { removeCloudinaryAssets, uploadFileToCloudinary } from "@/lib/cloudinaryUpload";
import QuillEditor from "@/components/QuillEditor";

const EMPTY_FORM = {
  slug: "",
  category: "",
  eyebrow: "",
  title: "",
  excerpt: "",
  image: "",
  imageAlt: "",
  imagePublicId: "",
  readTime: 5,
  published: "Voks Journal",
  contentHtml: "",
  status: "draft",
  featured: false,
};
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const FIELD_CLASS = "w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A15912]";

function createSlug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminBlogManager() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [file, setFile] = useState(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadArticles() {
      try {
        const response = await fetch("/api/admin/blog");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load blog articles.");
        if (active) setArticles(result.articles || []);
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadArticles();
    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    if (name === "slug") setSlugTouched(true);
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : name === "readTime" ? Number(value) : value,
      ...(name === "title" && !slugTouched && !editingId ? { slug: createSlug(value) } : {}),
    }));
  }

  function updateContent(contentHtml) {
    setForm((current) => ({ ...current, contentHtml }));
  }

  function chooseFile(event) {
    const selected = event.target.files?.[0] || null;
    event.target.value = "";
    setError("");
    setNotice("");
    if (!selected) return;
    if (!IMAGE_TYPES.includes(selected.type)) {
      setError("Use a JPG, PNG or WEBP cover image.");
      return;
    }
    if (selected.size < 1 || selected.size > MAX_FILE_BYTES) {
      setError("The cover image must be no larger than 5 MB.");
      return;
    }
    setFile(selected);
  }

  function resetForm() {
    setEditingId("");
    setForm(EMPTY_FORM);
    setFile(null);
    setSlugTouched(false);
    setEditorVersion((current) => current + 1);
  }

  function editArticle(article) {
    setEditingId(article.id);
    setForm({
      slug: article.slug,
      category: article.category,
      eyebrow: article.eyebrow,
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      imageAlt: article.imageAlt,
      imagePublicId: article.imagePublicId || "",
      readTime: article.readTime,
      published: article.published,
      contentHtml: article.contentHtml,
      status: article.status,
      featured: article.featured,
    });
    setFile(null);
    setSlugTouched(true);
    setEditorVersion((current) => current + 1);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitArticle(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!editingId && !file) {
      setError("Choose a cover image before creating an article.");
      return;
    }
    if (editingId && !file && !form.image) {
      setError("Choose a cover image before saving.");
      return;
    }

    setIsSubmitting(true);
    let uploadedAsset = null;
    try {
      if (file) uploadedAsset = await uploadFileToCloudinary(file, "blog-image");
      const response = await fetch("/api/admin/blog", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
          image: uploadedAsset?.url || form.image,
          imagePublicId: uploadedAsset?.publicId || form.imagePublicId,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to save this article.");

      setArticles((current) => editingId
        ? current.map((article) => article.id === editingId ? result.article : article)
        : [result.article, ...current]);
      resetForm();
      setNotice(editingId ? "Article updated." : form.status === "published" ? "Article published." : "Draft saved.");
    } catch (submitError) {
      if (uploadedAsset) {
        try {
          await removeCloudinaryAssets([{
            publicId: uploadedAsset.publicId,
            resourceType: uploadedAsset.resourceType,
            type: uploadedAsset.uploadType,
          }]);
        } catch (cleanupError) {
          console.error("Could not remove an unsaved blog cover image:", cleanupError);
        }
      }
      setError(submitError.message || "Unable to save this article.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeArticle(article) {
    if (!window.confirm(`Remove "${article.title}" from the journal?`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: article.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to remove this article.");
      setArticles((current) => current.filter((entry) => entry.id !== article.id));
      if (editingId === article.id) resetForm();
      setNotice("Article removed from the journal.");
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
          <h1 className="mt-2 font-display text-3xl font-semibold">Manage the Voks Journal</h1>
          <p className="mt-2 text-sm leading-6 text-[#777]">Create, edit and publish articles with the rich-text Quill editor.</p>
        </div>

        <form onSubmit={submitArticle} className="mt-7 rounded-xl border border-[#E3E3E3] bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{editingId ? "Edit article" : "Create an article"}</h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-xs text-[#777] hover:text-[#333]">
                <X size={14} /> Cancel edit
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Article title
              <input name="title" value={form.title} onChange={updateField} maxLength={180} required className={FIELD_CLASS} placeholder="Write a clear, useful headline" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              URL slug
              <input name="slug" value={form.slug} onChange={updateField} maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" required className={FIELD_CLASS} placeholder="article-url-slug" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Category
              <input name="category" value={form.category} onChange={updateField} maxLength={80} required className={FIELD_CLASS} placeholder="Buying, Investment, Ownership..." />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Eyebrow / label
              <input name="eyebrow" value={form.eyebrow} onChange={updateField} maxLength={100} required className={FIELD_CLASS} placeholder="e.g. Buying guides" />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555] sm:col-span-2">
              Short summary
              <textarea name="excerpt" value={form.excerpt} onChange={updateField} maxLength={400} rows={2} required className={`${FIELD_CLASS} resize-y`} placeholder="A short introduction shown on the journal cards..." />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Cover image
              <span className="flex min-h-[90px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#D4C7BA] bg-[#FBF9F6] px-4 py-3 text-center hover:bg-[#FBF2E9]">
                <ImagePlus size={20} className="text-[#A15912]" />
                <span className="mt-1 text-[11px] font-semibold text-[#444]">{file?.name || (form.image ? "Choose a new cover image (optional)" : "Choose an image to upload")}</span>
                <span className="mt-1 text-[9px] text-[#888]">JPG, PNG or WEBP · up to 5 MB · stored on Cloudinary</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} className="sr-only" />
              </span>
            </label>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-xs font-medium text-[#555]">
                Image description (alt text)
                <input name="imageAlt" value={form.imageAlt} onChange={updateField} maxLength={180} required className={FIELD_CLASS} placeholder="Describe the cover image" />
              </label>
              {form.image && !file && <img src={form.image} alt={form.imageAlt || "Current article cover"} className="h-[78px] w-32 rounded-md object-cover" />}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Estimated reading time (minutes)
              <input name="readTime" type="number" min="1" max="120" value={form.readTime} onChange={updateField} required className={FIELD_CLASS} />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Author / byline
              <input name="published" value={form.published} onChange={updateField} maxLength={100} required className={FIELD_CLASS} />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#555]">
              Publication status
              <select name="status" value={form.status} onChange={updateField} className={FIELD_CLASS}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <label className="mt-4 flex items-center gap-2 text-xs text-[#555]">
            <input name="featured" type="checkbox" checked={form.featured} onChange={updateField} className="accent-[#A15912]" />
            Feature this article at the top of the journal
          </label>

          <div className="mt-5">
            <h3 className="mb-2 text-xs font-semibold text-[#555]">Article content</h3>
            <QuillEditor key={editorVersion} initialValue={form.contentHtml} onChange={updateContent} />
          </div>

          {error && <p role="alert" className="mt-4 rounded-md border border-[#EBCBCB] bg-[#FCEDED] px-3 py-2.5 text-xs text-[#9A3434]">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-md border border-[#CFE4D5] bg-[#EFF8F1] px-3 py-2.5 text-xs text-[#246B4D]">{notice}</p>}
          <button type="submit" disabled={isSubmitting} className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#A15912] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#78400B] disabled:cursor-wait disabled:opacity-60">
            <Upload size={14} /> {isSubmitting ? "Saving..." : editingId ? "Update article" : form.status === "published" ? "Publish article" : "Save draft"}
          </button>
        </form>

        <section className="mt-8" aria-labelledby="admin-blog-list-heading">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="admin-blog-list-heading" className="text-lg font-semibold">Articles</h2>
              <p className="mt-1 text-xs text-[#777]">Published posts appear in the public Voks Journal.</p>
            </div>
            <span className="rounded-full bg-[#F0EEF7] px-3 py-1 text-[10px] font-medium text-[#555]">{articles.length} articles</span>
          </div>
          {isLoading ? (
            <p className="mt-5 text-sm text-[#777]">Loading articles...</p>
          ) : articles.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {articles.map((article) => (
                <article key={article.id} className="flex gap-4 rounded-xl border border-[#E3E3E3] bg-white p-4">
                  <img src={article.image} alt="" className="h-20 w-24 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-semibold">{article.title}</h3>
                        <p className="mt-1 truncate text-xs text-[#777]">/blog/{article.slug}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${article.status === "published" ? "bg-[#EAF5EE] text-[#246B4D]" : "bg-[#FFF4DD] text-[#8A5A12]"}`}>
                        {article.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-[#666]">{article.excerpt}</p>
                    <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold text-[#8A4B0B]">
                      {article.status === "published" && <a href={`/blog/${article.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline"><BookOpen size={11} /> View</a>}
                      <button type="button" onClick={() => editArticle(article)} className="inline-flex items-center gap-1 hover:underline"><Pencil size={11} /> Edit</button>
                      <button type="button" onClick={() => removeArticle(article)} aria-label={`Remove ${article.title}`} className="inline-flex items-center gap-1 text-[#9A3434] hover:underline"><Trash2 size={11} /> Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-[#D8D2CC] bg-white px-5 py-10 text-center text-sm text-[#777]">No articles yet. Create your first post above.</p>
          )}
        </section>
      </div>
    </main>
  );
}
