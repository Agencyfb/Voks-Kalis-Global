"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Search } from "lucide-react";
import { BLOG_ARTICLES, BLOG_CATEGORIES } from "@/data/blogArticles";

const FEATURED_ARTICLE = BLOG_ARTICLES[0];
const PAGE_SIZE = 6;

export default function BlogJournal() {
  const [category, setCategory] = useState(BLOG_CATEGORIES[0]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [email, setEmail] = useState("");

  const filteredArticles = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return BLOG_ARTICLES.slice(1).filter((article) => {
      const matchesCategory = category === BLOG_CATEGORIES[0] || article.category === category;
      const matchesQuery = !searchTerm || [
        article.title,
        article.excerpt,
        article.category,
        article.eyebrow,
      ].some((value) => value.toLowerCase().includes(searchTerm));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);
  const visibleArticles = filteredArticles.slice(0, visibleCount);

  function subscribe(event) {
    event.preventDefault();
    const subject = "Subscribe to the Voks Journal";
    const body = `Please add ${email} to the Voks Journal mailing list.`;
    window.location.href = `mailto:vokskalisglobal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <>
      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pb-12">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-copper-dark">The Voks Journal</p>
              <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-[#242424] sm:text-4xl lg:text-[42px]">
                A better perspective<br className="hidden sm:block" /> on property.
              </h1>
            </div>
            <div className="max-w-sm pb-1 sm:text-right">
              <p className="text-sm leading-relaxed text-[#666]">
                Ideas, practical guides and thoughtful perspectives for your next property decision.
              </p>
              <p className="mt-3 text-[9px] font-medium uppercase tracking-wide text-brand-copper-dark">Buy well. Live well. Plan ahead.</p>
            </div>
          </div>

          <article className="mt-7 grid overflow-hidden rounded-lg bg-[#FBF2E9] md:grid-cols-[1.35fr_1fr]">
            <a href={`/blog/${FEATURED_ARTICLE.slug}`} className="block min-h-[230px] overflow-hidden sm:min-h-[300px] lg:min-h-[355px]" aria-label={`Read ${FEATURED_ARTICLE.title}`}>
              <img src={FEATURED_ARTICLE.image} alt={FEATURED_ARTICLE.imageAlt} className="h-full min-h-[230px] w-full object-cover transition-transform duration-500 hover:scale-[1.02] sm:min-h-[300px] lg:min-h-[355px]" />
            </a>
            <div className="flex flex-col items-start justify-center p-6 sm:p-8 lg:p-9">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-copper-dark">{FEATURED_ARTICLE.eyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-[#292724] sm:text-[28px]">{FEATURED_ARTICLE.title}</h2>
              <p className="mt-3 text-xs leading-relaxed text-[#666]">{FEATURED_ARTICLE.excerpt}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[9px] text-[#777]">
                {FEATURED_ARTICLE.published} · <Clock3 size={11} aria-hidden="true" /> {FEATURED_ARTICLE.readTime} min read
              </p>
              <a href={`/blog/${FEATURED_ARTICLE.slug}`} className="mt-5 inline-flex items-center gap-1 rounded bg-brand-copper-dark px-3 py-2 text-[10px] font-semibold text-white transition-colors hover:bg-brand-copper">
                Read the story <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-10" aria-labelledby="journal-articles-title">
          <div className="flex flex-col gap-4 border-b border-[#E9E7E4] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter articles by category">
              {BLOG_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setCategory(item); setVisibleCount(PAGE_SIZE); }}
                  aria-pressed={category === item}
                  className={`rounded-full px-3 py-1.5 text-[10px] transition-colors ${category === item ? "bg-[#FBF2E9] font-semibold text-brand-copper-dark" : "text-[#555] hover:bg-[#F6F4F2]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="relative block w-full lg:max-w-[270px]">
              <span className="sr-only">Search the journal</span>
              <input
                type="search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="Search the journal"
                className="w-full rounded-full border border-[#E5E2DF] py-2 pl-4 pr-10 text-[10px] outline-none transition focus:border-brand-copper"
              />
              <Search size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#555]" aria-hidden="true" />
            </label>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <h2 id="journal-articles-title" className="text-lg font-semibold text-[#292724]">Explore the journal</h2>
            <p className="hidden text-[9px] text-[#777] sm:block">Guides, perspectives &amp; archived reports</p>
          </div>

          {visibleArticles.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <article key={article.slug} className="overflow-hidden rounded-lg border border-[#E9E7E4] bg-white p-3 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,.07)]">
                  <a href={`/blog/${article.slug}`} className="block overflow-hidden rounded-md">
                    <img src={article.image} alt={article.imageAlt} className="h-[150px] w-full object-cover transition-transform duration-500 hover:scale-[1.03] sm:h-[165px]" loading="lazy" />
                  </a>
                  <div className="px-1 pb-1 pt-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-copper-dark">{article.eyebrow}</p>
                    <h3 className="mt-2 text-sm font-semibold leading-snug text-[#292724]">
                      <a href={`/blog/${article.slug}`} className="hover:text-brand-copper-dark">{article.title}</a>
                    </h3>
                    <p className="mt-2 text-[10px] leading-relaxed text-[#777]">{article.excerpt}</p>
                    <p className="mt-3 flex items-center gap-1.5 text-[9px] text-[#888]">{article.published} · {article.readTime} min read</p>
                    <a href={`/blog/${article.slug}`} className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-copper-dark hover:underline">
                      Read article <ArrowRight size={12} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-lg border border-dashed border-[#DDD7D1] px-4 py-10 text-center text-sm text-[#666]">
              No articles match your search. Try another keyword or category.
            </p>
          )}

          {visibleArticles.length < filteredArticles.length && (
            <div className="mt-7 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded border border-[#E5E2DF] px-3 py-2 text-[10px] font-medium text-brand-copper-dark transition-colors hover:bg-[#FBF2E9]">
                Load more articles
              </button>
              <span className="text-[9px] text-[#777]">More practical reading at your pace.</span>
            </div>
          )}
        </section>

        <section className="bg-[#FBF2E9] px-5 py-10 sm:px-8 lg:px-10 lg:py-14" aria-labelledby="journal-subscribe-title">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 sm:items-center">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-copper-dark">Let good ideas find you</p>
              <h2 id="journal-subscribe-title" className="mt-2 max-w-sm text-2xl font-semibold leading-tight text-[#292724]">Property insight,<br />without the noise.</h2>
              <p className="mt-3 text-[10px] text-[#777]">Subscribe for new guides and perspectives from the Voks Journal.</p>
            </div>
            <form onSubmit={subscribe} className="w-full sm:justify-self-end sm:max-w-md">
              <label htmlFor="journal-email" className="text-[10px] font-medium text-[#292724]">Email address</label>
              <input id="journal-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" className="mt-2 w-full rounded border border-[#E5E2DF] bg-white px-3 py-2.5 text-[10px] outline-none focus:border-brand-copper" />
              <button type="submit" className="mt-2 w-full rounded bg-brand-copper-dark px-4 py-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-brand-copper">Subscribe to the journal</button>
              <p className="mt-2 text-[8px] leading-relaxed text-[#777]">Your email app will open with a subscription request addressed to our team. You can unsubscribe at any time.</p>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
