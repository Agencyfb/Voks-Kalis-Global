import sanitizeHtml from "sanitize-html";
import connectDb from "@/connectDb/connect";
import { BLOG_ARTICLES } from "@/data/blogArticles";
import BlogPost from "@/models/BlogPost";

export const BLOG_HTML_OPTIONS = {
  allowedTags: [
    "p", "br", "h2", "h3", "blockquote", "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "s", "strike", "a", "pre", "code",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    li: ["data-list"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    li: (tagName, attributes) => ({
      tagName,
      attribs: ["bullet", "ordered"].includes(attributes["data-list"])
        ? { "data-list": attributes["data-list"] }
        : {},
    }),
  },
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function sectionsToHtml(sections) {
  return sections.map((section) => (
    `<h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => (
      `<p>${escapeHtml(paragraph)}</p>`
    )).join("")}`
  )).join("");
}

export function getDefaultBlogPost(article, index) {
  return {
    ...article,
    id: article.slug,
    contentHtml: sectionsToHtml(article.sections),
    imagePublicId: "",
    status: "published",
    featured: index === 0,
    isDefault: true,
    isDeleted: false,
  };
}

export async function seedDefaultBlogPosts() {
  await connectDb();
  await BlogPost.bulkWrite(BLOG_ARTICLES.map((article, index) => {
    const defaults = getDefaultBlogPost(article, index);
    return {
      updateOne: {
        filter: { sourceSlug: article.slug },
        update: {
          $setOnInsert: {
            sourceSlug: article.slug,
            slug: defaults.slug,
            category: defaults.category,
            eyebrow: defaults.eyebrow,
            title: defaults.title,
            excerpt: defaults.excerpt,
            image: defaults.image,
            imageAlt: defaults.imageAlt,
            imagePublicId: "",
            readTime: defaults.readTime,
            published: defaults.published,
            contentHtml: sanitizeHtml(defaults.contentHtml, BLOG_HTML_OPTIONS),
            status: "published",
            featured: index === 0,
            isDefault: true,
            isDeleted: false,
            publishedAt: new Date(),
          },
        },
        upsert: true,
      },
    };
  }), { ordered: false });
}

function serializePost(post) {
  return {
    id: post._id?.toString() || post.id,
    slug: post.slug,
    category: post.category,
    eyebrow: post.eyebrow,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    imageAlt: post.imageAlt,
    imagePublicId: post.imagePublicId || "",
    readTime: post.readTime,
    published: post.published,
    contentHtml: post.contentHtml,
    status: post.status,
    featured: post.featured,
    isDefault: post.isDefault,
    isDeleted: post.isDeleted,
    publishedAt: post.publishedAt,
  };
}

export async function getPublishedBlogPosts() {
  await connectDb();
  const hasManagedPosts = await BlogPost.exists({});
  if (!hasManagedPosts) return BLOG_ARTICLES.map(getDefaultBlogPost);

  const posts = await BlogPost.find({ status: "published", isDeleted: false })
    .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
    .lean();
  return posts.map(serializePost);
}

export async function getPublishedBlogPost(slug) {
  const posts = await getPublishedBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export function toAdminBlogPost(post) {
  return serializePost(post);
}
