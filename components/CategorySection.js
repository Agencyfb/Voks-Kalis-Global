import PropertyCard from "@/components/PropertyCard";
import { getByCategory } from "@/data/properties";

export default function CategorySection({
  id,
  eyebrow,
  title,
  description,
  tint = false,
}) {
  const listings = getByCategory(id);

  return (
    <section
      id={id}
      className={`px-6 py-20 lg:px-10 ${tint ? "bg-sand/40" : "bg-cream"}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest2 text-clay">
              {eyebrow}
            </span>
            <h2 className="mt-2 font-display text-3xl text-forest sm:text-4xl">
              {title}
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink/60">{description}</p>
        </div>

        {listings.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-forest/20 p-10 text-center text-sm text-ink/50">
            No listings here yet — check back soon, or tell us what you're
            looking for and we'll find it.
          </div>
        )}
      </div>
    </section>
  );
}
