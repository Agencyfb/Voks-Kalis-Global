import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_ARTICLES, getBlogArticle } from "@/data/blogArticles";

export function generateStaticParams() {
  return BLOG_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const article = getBlogArticle(params.slug);
  if (!article) return { title: "Article not found | Voks-Kalis Global" };
  return {
    title: `${article.title} | The Voks Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default function BlogArticlePage({ params }) {
  const article = getBlogArticle(params.slug);
  if (!article) notFound();

  const otherArticles = BLOG_ARTICLES.filter((item) => item.slug !== article.slug);
  const relatedArticles = otherArticles
    .filter((item) => item.category === article.category)
    .slice(0, 3);
  const recommendations = [
    ...relatedArticles,
    ...otherArticles.filter((item) => !relatedArticles.some((related) => related.slug === item.slug)),
  ].slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <article className="mx-auto max-w-4xl px-5 py-9 sm:px-8 sm:py-12">
          <a href="/blog" className="inline-flex items-center gap-2 text-xs font-medium text-brand-copper-dark hover:underline">
            <ArrowLeft size={14} aria-hidden="true" /> Back to the journal
          </a>
          <header className="mt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-copper-dark">{article.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#242424] sm:text-4xl lg:text-5xl">{article.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#666]">{article.excerpt}</p>
            <p className="mt-4 flex items-center gap-2 text-[10px] text-[#777]">
              {article.published}<span aria-hidden="true">·</span><Clock3 size={12} aria-hidden="true" />{article.readTime} min read
            </p>
          </header>

          <img src={article.image} alt={article.imageAlt} className="mt-7 max-h-[520px] w-full rounded-lg object-cover" />

          <div className="mx-auto mt-8 max-w-2xl">
            {article.sections.map((section) => (
              <section key={section.heading} className="mb-8">
                <h2 className="text-xl font-semibold text-[#292724] sm:text-2xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-sm leading-7 text-[#555]">{paragraph}</p>
                ))}
              </section>
            ))}
            <aside className="rounded-lg bg-[#FBF2E9] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[#292724]">Thinking about your next property move?</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#666]">Our team can help you explore available properties and discuss the next steps.</p>
              <a href="/marketplace" className="mt-4 inline-flex items-center gap-2 rounded bg-brand-copper-dark px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-copper">
                Explore properties <ArrowRight size={14} aria-hidden="true" />
              </a>
            </aside>
          </div>
        </article>

        <section className="border-t border-[#EEE] bg-[#FAFAFA] px-5 py-10 sm:px-8" aria-labelledby="related-articles-heading">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="related-articles-heading" className="text-xl font-semibold text-[#292724]">Continue reading</h2>
              <a href="/blog" className="text-xs font-medium text-brand-copper-dark hover:underline">All articles</a>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((item) => (
                <a key={item.slug} href={`/blog/${item.slug}`} className="group overflow-hidden rounded-lg border border-[#E9E7E4] bg-white p-3">
                  <img src={item.image} alt={item.imageAlt} className="h-40 w-full rounded-md object-cover" loading="lazy" />
                  <p className="mt-3 text-[9px] font-semibold uppercase tracking-wide text-brand-copper-dark">{item.eyebrow}</p>
                  <h3 className="mt-1 text-sm font-semibold text-[#292724] group-hover:text-brand-copper-dark">{item.title}</h3>
                  <p className="mt-2 text-[10px] leading-relaxed text-[#777]">{item.excerpt}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
