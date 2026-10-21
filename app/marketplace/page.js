import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import connectDb from "@/connectDb/connect";
import Property from "@/models/Property";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace | Haven",
  description: "Explore approved property listings across estates, land, shortlets and commercial space.",
};

function toMarketplaceListing(property) {
  return {
    id: property._id.toString(),
    detailHref: `/marketplace/${property._id}`,
    title: property.title,
    category: property.category,
    purpose: property.purpose,
    price: property.price,
    currency: "NGN",
    period: property.purpose === "rent" ? "year" : property.purpose === "shortlet" ? "night" : undefined,
    location: property.location,
    propertyAddress: property.propertyAddress,
    beds: property.beds,
    baths: property.baths,
    areaSqm: property.areaSqm,
    image: property.images?.[0]?.url || property.images?.[0]?.data || property.image,
    images: property.images?.map((image) => image.url || image.data).filter(Boolean) || [],
    verified: true,
  };
}

export default async function MarketplacePage() {
  await connectDb();
  const properties = await Property.find({ status: "approved" })
    .select("title category purpose price location propertyAddress beds baths areaSqm image images")
    .sort({ reviewedAt: -1, createdAt: -1 })
    .lean();
  const listings = properties.map(toMarketplaceListing);

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest2 text-clay">
            Haven marketplace
          </span>
          <h1 className="mt-3 font-display text-4xl text-forest sm:text-5xl">
            Find your next address.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/65">
            Browse properties reviewed and approved by the Haven team.
          </p>
        </div>

        {listings.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-forest/20 bg-white/60 p-10 text-center">
            <h2 className="font-display text-2xl text-forest">New listings are on the way</h2>
            <p className="mt-2 text-sm text-ink/55">
              Properties appear here after they have been reviewed and approved.
            </p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
