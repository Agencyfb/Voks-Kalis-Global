import { FileCheck2, ScanSearch, Handshake } from "lucide-react";

const STEPS = [
  {
    icon: ScanSearch,
    title: "We inspect first",
    body: "An agent visits every listing in person before it's published — no stock photos, no surprises.",
  },
  {
    icon: FileCheck2,
    title: "We check the title",
    body: "Land and estate documents are verified against the registry, so you're not buying someone else's dispute.",
  },
  {
    icon: Handshake,
    title: "We stay through closing",
    body: "From first viewing to signed agreement, the same agent sees your deal through.",
  },
];

export default function TrustBand() {
  return (
    <section className="bg-forest">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-lg">
          <span className="text-xs font-semibold uppercase tracking-widest2 text-gold">
            Why Haven
          </span>
          <h2 className="mt-2 font-display text-3xl text-cream sm:text-4xl">
            Property in Lagos moves fast. We slow down the parts that matter.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-t border-cream/20 pt-6">
              <Icon size={22} className="text-gold" strokeWidth={1.75} />
              <h3 className="mt-4 font-display text-xl text-cream">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/65">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
