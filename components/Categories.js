import { Building2, Trees, BedDouble, Store } from "lucide-react";
import { CATEGORIES } from "@/data/properties";

const ICONS = {
  estates: Building2,
  land: Trees,
  shortlets: BedDouble,
  commercial: Store,
};

export default function Categories() {
  return (
    <section className="border-y border-forest/10 bg-sand/50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.id];
            return (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-forest/10 bg-cream/70 p-5 transition-all hover:-translate-y-1 hover:border-forest/30 hover:bg-white hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-cream">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-display text-lg text-forest">
                    {cat.label}
                  </h3>
                  <p className="mt-0.5 text-xs leading-snug text-ink/55">
                    {cat.tagline}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
