import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/data/properties";
import connectDb from "@/connectDb/connect";
import Property from "@/models/Property";

export const dynamic = "force-dynamic";

function getPeriod(purpose) {
  if (purpose === "rent" || purpose === "lease") return "year";
  if (purpose === "shortlet") return "night";
  return "";
}

export async function generateMetadata({ params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return { title: "Property not found | Voks-Kalis Global" };
  }
  await connectDb();
  const property = await Property.findOne({ _id: params.id, status: "approved" })
    .select("title location")
    .lean();

  return {
    title: property ? `${property.title} | Voks-Kalis Global` : "Property | Voks-Kalis Global",
    description: property ? `${property.title} in ${property.location}. View this approved Voks-Kalis Global listing.` : "Approved Voks-Kalis Global property listing.",
  };
}

export default async function MarketplacePropertyPage({ params }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectDb();
  const property = await Property.findOne({ _id: params.id, status: "approved" })
    .select("title category purpose propertyType price location propertyAddress description beds baths areaSqm features landmarks landUse image images")
    .lean();

  if (!property) notFound();

  const images = property.images?.length
    ? property.images.map((image) => image.url || image.data).filter(Boolean)
    : [property.image];
  const mapAddress = property.propertyAddress || property.location;
  const whatsappLink = (message) =>
    `https://wa.me/2348063880053?text=${encodeURIComponent(message)}`;
  const propertyDetails = `${property.title} (${mapAddress})`;

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <article className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <a href="/marketplace" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
          &larr; Back to marketplace
        </a>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${property.title}, photo ${index + 1}`}
              className={`w-full object-cover ${index === 0 ? "aspect-[4/3] sm:row-span-2 sm:h-full" : "aspect-[4/3]"}`}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest2 text-clay">
              {[property.category, property.propertyType].filter(Boolean).join(" · ").replaceAll("-", " ")}
            </span>
            <h1 className="mt-2 font-display text-4xl text-forest sm:text-5xl">{property.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-base text-ink/60">
              <MapPin size={17} /> {property.propertyAddress || property.location}
            </p>
            <h2 className="mt-9 font-display text-2xl text-forest">About this property</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">{property.description}</p>

            {(property.beds || property.baths || property.areaSqm) && (
              <div className="mt-6 flex flex-wrap gap-6 border-y border-forest/10 py-5 text-sm text-ink/65">
                {property.beds > 0 && <span className="flex items-center gap-2"><BedDouble size={17} /> {property.beds} bedrooms</span>}
                {property.baths > 0 && <span className="flex items-center gap-2"><Bath size={17} /> {property.baths} bathrooms</span>}
                {property.areaSqm > 0 && <span className="flex items-center gap-2"><Ruler size={17} /> {property.areaSqm} m²</span>}
              </div>
            )}
            {property.features && <p className="mt-5 text-sm leading-relaxed text-ink/70"><strong className="text-forest">Features:</strong> {property.features}</p>}
            {property.landmarks && <p className="mt-3 text-sm leading-relaxed text-ink/70"><strong className="text-forest">Nearby landmarks:</strong> {property.landmarks}</p>}
            {property.landUse && <p className="mt-3 text-sm text-ink/70"><strong className="text-forest">Land use:</strong> {property.landUse}</p>}
          </div>

          <aside className="h-fit border border-forest/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">
              {property.purpose === "sale" || property.purpose === "sales" ? "For sale" : property.purpose === "lease" ? "For lease" : property.purpose === "rent" ? "For rent" : "Shortlet"}
            </p>
            <p className="mt-3 font-display text-3xl text-forest">
              {formatPrice(property.price)}
              {getPeriod(property.purpose) && <span className="ml-1 text-sm text-ink/50">/{getPeriod(property.purpose)}</span>}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-center gap-2 border border-forest/20 px-4 py-3 text-sm font-semibold text-forest hover:bg-forest/5"
            >
              <MapPin size={16} /> View map
            </a>
            <div className="mt-8 border-t border-forest/10 pt-6">
              <h2 className="font-display text-xl text-ink">Already know the property?</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                You can express your interest without making a payment or a binding commitment.
              </p>
              <div className="mt-4 flex flex-col items-start gap-3">
                <a
                  href={whatsappLink(`Hello, I would like to make a payment for ${propertyDetails}. Please share the next steps.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-clay hover:underline"
                >
                  Make a Payment &rarr;
                </a>
                <a
                  href={whatsappLink(`Hello, I would like to book an inspection for ${propertyDetails}. Please let me know the available times.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-clay hover:underline"
                >
                  Book an inspection &rarr;
                </a>
              </div>
            </div>
          </aside>
        </div>
      </article>
      <Footer />
    </main>
  );
}
