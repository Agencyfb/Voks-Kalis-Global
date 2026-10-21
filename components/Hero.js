import { Search, MapPin, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-cream">
      <div
        className="pointer-events-none absolute inset-0 bg-grain opacity-40"
        style={{ backgroundSize: "18px 18px" }}
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-10 lg:pb-28 lg:pt-20">
        {/* Left: thesis */}
        <div className="relative z-10 flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-widest2 text-clay">
            Verified listings, honest pricing
          </span>

          <h1 className="mt-5 text-balance font-display text-5xl italic leading-[1.05] text-forest sm:text-6xl lg:text-[4.2rem]">
            Every address
            <br />
            <span className="not-italic font-medium">tells you</span>
            <br />
            something.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
            Haven brings estates, land, shortlets and commercial space into
            one place — inspected, title-checked, and priced the way the
            neighbourhood actually trades.
          </p>

          {/* Search card */}
          <div className="mt-9 rounded-2xl border border-forest/10 bg-white/80 p-2 shadow-[0_20px_60px_-25px_rgba(23,57,46,0.35)] backdrop-blur">
            <form className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="hero-search" className="sr-only">
                Search by location, estate or listing type
              </label>
              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-3">
                <MapPin size={18} className="shrink-0 text-forest/50" />
                <input
                  id="hero-search"
                  type="text"
                  placeholder="Try “3-bed in Lekki” or “land in Epe”"
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-light"
              >
                <Search size={16} />
                Search
              </button>
            </form>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {[
              ["2,300+", "Verified listings"],
              ["18", "Lagos neighbourhoods"],
              ["4.8/5", "Average client rating"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl text-forest">
                  {value}
                </dt>
                <dd className="text-xs text-ink/55">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: overlapping brochure stack — the signature element */}
        <div className="relative z-10 mx-auto hidden w-full max-w-md lg:block">
          <div className="relative h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80"
              alt="Modern estate home with landscaped courtyard"
              className="absolute left-0 top-0 h-[380px] w-[300px] rotate-[-4deg] rounded-2xl border-4 border-white object-cover shadow-2xl"
            />
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80"
              alt="Living room interior of a listed villa"
              className="absolute right-0 top-16 h-[300px] w-[260px] rotate-[5deg] rounded-2xl border-4 border-white object-cover shadow-2xl"
            />

            <div className="absolute bottom-4 left-8 flex w-64 items-start gap-3 rounded-xl bg-forest px-4 py-3.5 text-cream shadow-xl">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-gold" />
              <p className="text-xs leading-relaxed">
                Every listing on Haven is site-inspected and title-verified
                before it goes live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
