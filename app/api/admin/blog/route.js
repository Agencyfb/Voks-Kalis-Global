import mongoose from "mongoose";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import connectDb from "@/connectDb/connect";
import { getCloudinary } from "@/lib/cloudinary";
import { BLOG_HTML_OPTIONS, seedDefaultBlogPosts, toAdminBlogPost } from "@/lib/blog";
import { getRequestUser } from "@/lib/requestUser";
import BlogPost from "@/models/BlogPost";

export const runtime = "nodejs";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function requireAdmin(request) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (user.role !== "admin") {
    return { response: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) };
  }
  return { user };
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isHttpsUrl(value) {
  if (typeof value !== "string" || value.length > 2_000) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validateFields(body) {
  return body && typeof body === "object" && !Array.isArray(body)
    && typeof body.slug === "string" && SLUG_PATTERN.test(body.slug.trim().toLowerCase()) && body.slug.length <= 140
    && typeof body.category === "string" && body.category.trim().length > 0 && body.category.length <= 80
    && typeof body.eyebrow === "string" && body.eyebrow.trim().length > 0 && body.eyebrow.length <= 100
    && typeof body.title === "string" && body.title.trim().length > 0 && body.title.length <= 180
    && typeof body.excerpt === "string" && body.excerpt.trim().length > 0 && body.excerpt.length <= 400
    && typeof body.image === "string" && (body.image === "" || isHttpsUrl(body.image))
    && typeof body.imageAlt === "string" && body.imageAlt.trim().length > 0 && body.imageAlt.length <= 180
    && typeof body.imagePublicId === "string" && body.imagePublicId.length <= 255
    && Number.isInteger(body.readTime) && body.readTime >= 1 && body.readTime <= 120
    && typeof body.published === "string" && body.published.trim().length > 0 && body.published.length <= 100
    && typeof body.contentHtml === "string" && body.contentHtml.length > 0 && body.contentHtml.length <= 80_000
    && ["draft", "published"].includes(body.status)
    && typeof body.featured === "boolean";
}

function cleanContent(contentHtml) {
  const clean = sanitizeHtml(contentHtml, BLOG_HTML_OPTIONS);
  if (!sanitizeHtml(clean, { allowedTags: [], allowedAttributes: {} }).trim()) {
    throw new Error("Write some article content before saving.");
  }
  return clean;
}

async function getUploadedImage(publicId, user) {
  if (!publicId.startsWith(`haven/blog/${user._id}/`)) {
    throw new Error("This uploaded image does not belong to your blog uploads.");
  }
  const cloudinary = getCloudinary();
  let asset;
  try {
    asset = await cloudinary.api.resource(publicId, { resource_type: "image", type: "upload" });
  } catch (error) {
    if (error.http_code === 404) throw new Error("The uploaded cover image could not be found.");
    throw error;
  }
  if (!IMAGE_FORMATS.includes(asset.format) || asset.bytes < 1 || asset.bytes > 5 * 1024 * 1024
    || typeof asset.secure_url !== "string" || !asset.secure_url.startsWith("https://")) {
    throw new Error("The cover image format or size is not allowed.");
  }
  return { image: asset.secure_url, imagePublicId: asset.public_id };
}

function validatedArticle(body, image) {
  return {
    slug: body.slug.trim().toLowerCase(),
    category: body.category.trim(),
    eyebrow: body.eyebrow.trim(),
    title: body.title.trim(),
    excerpt: body.excerpt.trim(),
    image: image.image,
    imageAlt: body.imageAlt.trim(),
    imagePublicId: image.imagePublicId,
    readTime: body.readTime,
    published: body.published.trim(),
    contentHtml: cleanContent(body.contentHtml),
    status: body.status,
    featured: body.featured,
    isDeleted: false,
  };
}

export async function GET(request) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;
    await seedDefaultBlogPosts();
    const posts = await BlogPost.find({ isDeleted: false })
      .sort({ featured: -1, updatedAt: -1, createdAt: -1 })
      .lean();
    return NextResponse.json({ articles: posts.map(toAdminBlogPost) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin blog load failed:", error);
    return NextResponse.json({ error: "Unable to load blog management right now." }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await parseBody(request);
  if (!validateFields(body) || !body.imagePublicId) {
    return NextResponse.json({ error: "Provide all article details, content and a cover image upload." }, { status: 400 });
  }

  try {
    const { user, response } = await requireAdmin(request);
    if (response) return response;
    const image = await getUploadedImage(body.imagePublicId, user);
    await connectDb();
    const article = await BlogPost.create({
      ...validatedArticle(body, image),
      status: body.status,
      publishedAt: body.status === "published" ? new Date() : null,
    });
    return NextResponse.json({ article: toAdminBlogPost(article) }, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error.code === "CLOUDINARY_CONFIG_MISSING") {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error.message.startsWith("This uploaded image") || error.message.includes("cover image")
      || error.message === "The image format or size is not allowed.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "An article already uses that slug." }, { status: 409 });
    }
    if (error.message === "Write some article content before saving.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Admin blog article creation failed:", error);
    return NextResponse.json({ error: "Unable to create this article." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const body = await parseBody(request);
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id) || !validateFields(body)) {
    return NextResponse.json({ error: "Provide a valid article and all required details." }, { status: 400 });
  }

  try {
    const { user, response } = await requireAdmin(request);
    if (response) return response;
    await connectDb();
    const article = await BlogPost.findById(body.id);
    if (!article || article.isDeleted) return NextResponse.json({ error: "Article not found." }, { status: 404 });

    let image;
    if (body.imagePublicId && body.imagePublicId === article.imagePublicId) {
      image = { image: article.image, imagePublicId: article.imagePublicId };
    } else if (body.imagePublicId) {
      image = await getUploadedImage(body.imagePublicId, user);
    } else if (body.image) {
      image = { image: body.image, imagePublicId: "" };
    } else {
      return NextResponse.json({ error: "Choose a cover image before saving." }, { status: 400 });
    }

    const previousImagePublicId = article.imagePublicId;
    const wasPublished = article.status === "published";
    Object.assign(article, validatedArticle(body, image));
    article.publishedAt = body.status === "published"
      ? (wasPublished ? article.publishedAt : new Date())
      : null;
    await article.save();

    if (previousImagePublicId && previousImagePublicId !== article.imagePublicId) {
      try {
        const cloudinary = getCloudinary();
        const result = await cloudinary.uploader.destroy(previousImagePublicId, { resource_type: "image", type: "upload" });
        if (!["ok", "not found"].includes(result.result)) {
          console.error("Replaced blog cover cleanup failed:", result);
        }
      } catch (cleanupError) {
        console.error("Replaced blog cover cleanup failed:", cleanupError);
      }
    }
    return NextResponse.json({ article: toAdminBlogPost(article) }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error.code === "CLOUDINARY_CONFIG_MISSING") {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error.message.startsWith("This uploaded image") || error.message.includes("cover image")
      || error.message === "The image format or size is not allowed.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "An article already uses that slug." }, { status: 409 });
    }
    if (error.message === "Write some article content before saving.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Admin blog article update failed:", error);
    return NextResponse.json({ error: "Unable to update this article." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const body = await parseBody(request);
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) {
    return NextResponse.json({ error: "A valid article is required." }, { status: 400 });
  }

  try {
    const { response } = await requireAdmin(request);
    if (response) return response;
    await connectDb();
    const article = await BlogPost.findById(body.id);
    if (!article || article.isDeleted) return NextResponse.json({ error: "Article not found." }, { status: 404 });

    if (article.imagePublicId) {
      const cloudinary = getCloudinary();
      const result = await cloudinary.uploader.destroy(article.imagePublicId, { resource_type: "image", type: "upload" });
      if (!["ok", "not found"].includes(result.result)) {
        console.error("Blog cover cleanup failed:", result);
        return NextResponse.json({ error: "Unable to remove the cover image from storage." }, { status: 502 });
      }
    }

    if (article.isDefault) {
      article.isDeleted = true;
      article.status = "draft";
      article.featured = false;
      article.imagePublicId = "";
      await article.save();
    } else {
      await article.deleteOne();
    }
    return NextResponse.json({ removed: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin blog article removal failed:", error);
    return NextResponse.json({ error: "Unable to remove this article right now." }, { status: 500 });
  }
}
