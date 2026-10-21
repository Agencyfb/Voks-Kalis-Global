import { BedDouble, Bath, Ruler, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/data/properties";

const PURPOSE_STYLES = {
  sale: "bg-forest text-cream",
  rent: "bg-gold text-forest-dark",
  shortlet: "bg-clay text-cream",
};

const PURPOSE_LABEL = {
  sale: "For sale",
  rent: "For rent",
  shortlet: "Shortlet",
};

export default function PropertyCard({ property }) {
  const {
    title,
    location,
    price,
    currency,
    period,
    purpose,
    beds,
    baths,
    areaSqm,
    image,
    images,
    verified,
    propertyAddress,
    detailHref,
  } = property;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white transition-shadow hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${PURPOSE_STYLES[purpose]}`}
        >
          {PURPOSE_LABEL[purpose]}
        </span>
        {verified && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-forest">
            <ShieldCheck size={13} />
            Verified
          </span>
        )}
      </div>
      {images?.length > 1 && (
        <div className="flex gap-1 overflow-x-auto border-b border-forest/10 p-2" aria-label={`${images.length} property photos`}>
          {images.map((photo, index) => (
            <a key={index} href={photo} target="_blank" rel="noreferrer" aria-label={`Open photo ${index + 1} for ${title}`} className="shrink-0">
              <img src={photo} alt={`${title}, photo ${index + 1}`} className="h-12 w-16 object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg leading-snug text-forest">
            {title}
          </h3>
          <p className="mt-0.5 text-sm text-ink/55">{location}</p>
        </div>

        {(beds || baths || areaSqm) && (
          <div className="flex items-center gap-4 text-xs text-ink/60">
            {beds && (
              <span className="flex items-center gap-1.5">
                <BedDouble size={15} /> {beds}
              </span>
            )}
            {baths && (
              <span className="flex items-center gap-1.5">
                <Bath size={15} /> {baths}
              </span>
            )}
            {areaSqm && (
              <span className="flex items-center gap-1.5">
                <Ruler size={15} /> {areaSqm} m²
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-3 pt-2">
          <p className="font-display text-xl text-forest">
            {formatPrice(price, currency)}
            {period && (
              <span className="ml-1 font-body text-xs font-normal text-ink/50">
                /{period}
              </span>
            )}
          </p>
          <div className="flex items-center gap-4">
            <a
              href={detailHref || "#contact"}
              className="text-xs font-semibold text-forest underline-offset-4 hover:underline"
            >
              View details
            </a>
            {propertyAddress && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-clay underline-offset-4 hover:underline"
              >
                View map
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
