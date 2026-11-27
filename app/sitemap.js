import connectDb from "@/connectDb/connect";
import { BLOG_ARTICLES } from "@/data/blogArticles";
import { getPublishedBlogPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";
import Property from "@/models/Property";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/marketplace", changeFrequency: "daily", priority: 0.9 },
    { path: "/services", changeFrequency: "monthly", priority: 0.85 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.85 },
    { path: "/gallery", changeFrequency: "weekly", priority: 0.75 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
  ].map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let propertyRoutes = [];
  let blogRoutes = [];

  try {
    await connectDb();
    const [properties, posts] = await Promise.all([
      Property.find({ status: "approved", deletedAt: null })
        .select("_id updatedAt reviewedAt createdAt")
        .sort({ reviewedAt: -1, createdAt: -1 })
        .lean(),
      getPublishedBlogPosts(),
    ]);

    propertyRoutes = properties.map((property) => ({
      url: absoluteUrl(`/marketplace/${property._id.toString()}`),
      lastModified: property.updatedAt || property.reviewedAt || property.createdAt || now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    blogRoutes = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.75,
    }));
  } catch (error) {
    console.error("Sitemap dynamic route query failed:", error);
    blogRoutes = BLOG_ARTICLES.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    }));
  }

  return [...staticRoutes, ...propertyRoutes, ...blogRoutes];
}
