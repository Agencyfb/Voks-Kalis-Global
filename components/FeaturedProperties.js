import PropertyCard from "@/components/PropertyCard";
import { getFeatured } from "@/data/properties";

export default function FeaturedProperties() {
  const featured = getFeatured();

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest2 text-clay">
            Handpicked this week
          </span>
          <h2 className="mt-2 font-display text-3xl text-forest sm:text-4xl">
            Featured properties
          </h2>
        </div>
        <p className="max-w-sm text-sm text-ink/60">
          A rotating shortlist our agents personally inspected — across
          estates, land, shortlets and commercial space.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
