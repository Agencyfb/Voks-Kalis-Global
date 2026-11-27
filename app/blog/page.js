import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogJournal from "@/components/BlogJournal";
import JsonLd from "@/components/JsonLd";
import { getPublishedBlogPosts } from "@/lib/blog";
import { absoluteUrl, buildBreadcrumbJsonLd, buildPageMetadata, getBaseUrl, SITE_INFO } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "The Voks Journal — Real Estate Guides & Market Insights",
  description:
    "Practical real estate buying guides, title due-diligence advice, property investment perspectives, and Nigerian market insights from Voks-Kalis Global.",
  path: "/blog",
  keywords: [
    "Nigerian real estate blog",
    "Port Harcourt property guide",
    "buying land in Nigeria guide",
    "real estate investment tips Nigeria",
    "The Voks Journal",
  ],
});

export default async function BlogPage() {
  const articles = await getPublishedBlogPosts();
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Voks Journal",
    description: metadata.description,
    url: absoluteUrl("/blog"),
    publisher: { "@id": `${getBaseUrl()}/#organization` },
    blogPost: articles.slice(0, 10).map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      description: article.excerpt,
      url: absoluteUrl(`/blog/${article.slug}`),
      author: { "@type": "Organization", name: SITE_INFO.name },
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          blogJsonLd,
        ]}
      />
      <Navbar />
      <BlogJournal articles={articles} />
      <Footer />
    </>
  );
}
