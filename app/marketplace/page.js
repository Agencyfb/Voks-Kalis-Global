import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import JsonLd from "@/components/JsonLd";
import connectDb from "@/connectDb/connect";
import { formatPrice } from "@/data/properties";
import {
  buildBreadcrumbJsonLd,
  buildMarketplaceCollectionJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import Property from "@/models/Property";

export const dynamic = "force-dynamic";

const CATEGORY_OPTIONS = [
  { value: "lands", label: "Land" },
  { value: "buildings", label: "Building" },
  { value: "shortlets", label: "Shortlets" },
  { value: "rentals", label: "Rentals" },
  { value: "estates", label: "Estates" },
  { value: "commercial", label: "Commercial" },
];

const TYPE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "raw-land", label: "Land (Raw)" },
  { value: "agricultural-land", label: "Land (Agricultural)" },
];

const PURPOSE_OPTIONS = [
  { value: "sales", label: "For Sale" },
  { value: "lease", label: "For Lease" },
  { value: "rent", label: "For Rent" },
  { value: "shortlet", label: "Shortlet" },
];

function parseMarketplaceFilters(searchParams = {}) {
  const rawFilters = {
    category: typeof searchParams.category === "string" ? searchParams.category : "",
    propertyType: typeof searchParams.propertyType === "string"
      ? searchParams.propertyType
      : typeof searchParams.type === "string" ? searchParams.type : "",
    purpose: typeof searchParams.purpose === "string" ? searchParams.purpose : "",
    location: typeof searchParams.location === "string" ? searchParams.location.trim() : "",
    maxPrice: typeof searchParams.maxPrice === "string" ? searchParams.maxPrice : "",
    beds: typeof searchParams.beds === "string" ? searchParams.beds : "",
  };
  return {
    ...rawFilters,
    category: CATEGORY_OPTIONS.some((option) => option.value === rawFilters.category) ? rawFilters.category : "",
    propertyType: TYPE_OPTIONS.some((option) => option.value === rawFilters.propertyType) ? rawFilters.propertyType : "",
    purpose: PURPOSE_OPTIONS.some((option) => option.value === rawFilters.purpose) ? rawFilters.purpose : "",
    maxPrice: /^\d+$/.test(rawFilters.maxPrice) && Number(rawFilters.maxPrice) > 0 ? rawFilters.maxPrice : "",
    beds: /^\d+$/.test(rawFilters.beds) && Number(rawFilters.beds) > 0 ? rawFilters.beds : "",
  };
}

export async function generateMetadata({ searchParams = {} }) {
  const filters = parseMarketplaceFilters(searchParams);
  const hasActiveFilter = Object.values(filters).some(Boolean);

  if (!hasActiveFilter) {
    return buildPageMetadata({
      title: "Property Marketplace in Port Harcourt & Nigeria",
      description:
        "Browse verified houses, titled land, estates, commercial spaces, rentals, and shortlets for sale or lease in Port Harcourt, Rivers State, and across Nigeria.",
      path: "/marketplace",
      image: "/Estate New.png",
      imageAlt: "Verified properties in the Voks-Kalis Global marketplace",
      keywords: [
        "Port Harcourt property marketplace",
        "houses for sale Port Harcourt",
        "land for sale Rivers State",
        "shortlets Port Harcourt",
        "commercial properties Nigeria",
      ],
    });
  }

  const parts = [];
  if (filters.propertyType) {
    parts.push(TYPE_OPTIONS.find((option) => option.value === filters.propertyType)?.label);
  }
  if (filters.category) {
    parts.push(CATEGORY_OPTIONS.find((option) => option.value === filters.category)?.label);
  }
  if (filters.purpose) {
    parts.push(PURPOSE_OPTIONS.find((option) => option.value === filters.purpose)?.label);
  }
  if (filters.beds) {
    parts.push(`${filters.beds}+ Bedrooms`);
  }
  if (filters.location) {
    parts.push(`in ${filters.location}`);
  }
  if (filters.maxPrice) {
    parts.push(`up to ${formatPrice(Number(filters.maxPrice))}`);
  }

  const summary = parts.filter(Boolean).join(" ") || "Filtered Properties";
  return buildPageMetadata({
    title: `${summary} | Marketplace`,
    description: `Explore verified ${summary.toLowerCase()} listings on Voks-Kalis Global across Port Harcourt, Rivers State, and Nigeria.`,
    path: "/marketplace",
    noIndex: true,
    follow: true,
  });
}

function normalizeCategory(category) {
  if (category === "land") return "lands";
  if (category === "estates") return "buildings";
  return category;
}

function normalizePurpose(purpose) {
  return purpose === "sale" ? "sales" : purpose;
}

function toMarketplaceListing(property) {
  return {
    id: property._id.toString(),
    detailHref: `/marketplace/${property._id}`,
    title: property.title,
    category: property.category,
    propertyType: property.propertyType,
    purpose: normalizePurpose(property.purpose),
    price: property.price,
    currency: "NGN",
    period: ["rent", "lease"].includes(property.purpose) ? "year" : property.purpose === "shortlet" ? "night" : undefined,
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

function createMarketplaceHref(filters, key, value) {
  const nextFilters = { ...filters, [key]: value };
  const params = new URLSearchParams();
  Object.entries(nextFilters).forEach(([filterKey, filterValue]) => {
    if (filterValue) params.set(filterKey, filterValue);
  });
  const query = params.toString();
  return query ? `/marketplace?${query}` : "/marketplace";
}

function MarketplaceFacetSection({ title, description, options, field, listings, filters }) {
  const activeValue = filters[field];
  const groupedListings = options.map((option) => ({
    ...option,
    listings: listings.filter((property) => (
      field === "category"
        ? normalizeCategory(property.category) === option.value
        : field === "purpose"
          ? normalizePurpose(property.purpose) === option.value
          : property[field] === option.value
    )),
  })).filter((option) => option.listings.length > 0 || option.value === activeValue);

  return (
    <section className="mt-12 first:mt-0">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest2 text-clay">Browse by</p>
          <h2 className="mt-2 font-display text-2xl text-forest">{title}</h2>
          <p className="mt-1 text-sm text-ink/55">{description}</p>
        </div>
        {activeValue && (
          <a href={createMarketplaceHref(filters, field, "")} className="text-xs font-semibold text-clay hover:underline">
            Clear {title.toLowerCase()} filter
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => (
          <a
            key={option.value}
            href={createMarketplaceHref(filters, field, activeValue === option.value ? "" : option.value)}
            aria-pressed={activeValue === option.value}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${activeValue === option.value ? "border-forest bg-forest text-cream" : "border-forest/15 bg-white text-ink/65 hover:border-forest/40 hover:text-forest"}`}
          >
            {option.label}
          </a>
        ))}
      </div>

      {groupedListings.some((option) => option.listings.length > 0) ? (
        <div className="mt-6 space-y-8">
          {groupedListings.filter((option) => option.listings.length > 0).map((option) => (
            <div key={option.value}>
              <h3 className="font-display text-lg font-medium text-forest">{option.label}</h3>
              <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {option.listings.map((property) => (
                  <PropertyCard key={`${field}-${option.value}-${property.id}`} property={property} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default async function MarketplacePage({ searchParams = {} }) {
  const filters = parseMarketplaceFilters(searchParams);

  await connectDb();
  const approvedProperties = await Property.find({ status: "approved", deletedAt: null })
    .select("title category propertyType purpose price location propertyAddress beds baths areaSqm image images")
    .sort({ reviewedAt: -1, createdAt: -1 })
    .lean();
  const allListings = approvedProperties.map(toMarketplaceListing);
  const filteredListings = allListings.filter((property) => (
    (!filters.category || normalizeCategory(property.category) === filters.category)
    && (!filters.propertyType || property.propertyType === filters.propertyType)
    && (!filters.purpose || normalizePurpose(property.purpose) === filters.purpose)
    && (!filters.location || property.location.toLowerCase().includes(filters.location.toLowerCase()))
    && (!filters.maxPrice || property.price <= Number(filters.maxPrice))
    && (!filters.beds || Number(property.beds || 0) >= Number(filters.beds))
  ));

  const filterOptions = {
    category: CATEGORY_OPTIONS,
    propertyType: TYPE_OPTIONS,
    purpose: PURPOSE_OPTIONS,
  };
  const sections = [
    {
      title: "Property Categories",
      description: "Browse approved listings by the category selected when they were uploaded.",
      options: filterOptions.category,
      field: "category",
    },
    {
      title: "Property Types",
      description: "Find properties by their selected use or land type.",
      options: filterOptions.propertyType,
      field: "propertyType",
    },
    {
      title: "Property Purpose",
      description: "Browse listings by sale, lease, rent or shortlet purpose.",
      options: filterOptions.purpose,
      field: "purpose",
    },
  ];

  return (
    <main className="min-h-screen bg-cream">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Marketplace", path: "/marketplace" },
          ]),
          buildMarketplaceCollectionJsonLd(filteredListings),
        ]}
      />
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest2 text-clay">Voks-Kalis marketplace</span>
          <h1 className="mt-3 font-display text-4xl text-forest sm:text-5xl">Find your next address.</h1>
          <p className="mt-4 text-base leading-relaxed text-ink/65">
            Browse approved properties by category, type, and purpose. Each listing appears in every section matching its saved details.
          </p>
        </div>

        <form action="/marketplace" method="get" className="mt-8 grid gap-3 rounded-xl border border-forest/10 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto]">
          <label className="text-xs font-medium text-ink/65">
            Category
            <select name="category" defaultValue={filters.category} className="mt-1.5 w-full rounded-md border border-forest/15 bg-white px-3 py-2.5 text-sm text-ink">
              <option value="">All categories</option>
              {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-ink/65">
            Property type
            <select name="propertyType" defaultValue={filters.propertyType} className="mt-1.5 w-full rounded-md border border-forest/15 bg-white px-3 py-2.5 text-sm text-ink">
              <option value="">All types</option>
              {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-ink/65">
            Purpose
            <select name="purpose" defaultValue={filters.purpose} className="mt-1.5 w-full rounded-md border border-forest/15 bg-white px-3 py-2.5 text-sm text-ink">
              <option value="">All purposes</option>
              {PURPOSE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-ink/65">
            Location
            <input name="location" type="search" defaultValue={filters.location} placeholder="Search location" className="mt-1.5 w-full rounded-md border border-forest/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35" />
          </label>
          <label className="text-xs font-medium text-ink/65">
            Maximum budget
            <input name="maxPrice" type="number" min="1" defaultValue={filters.maxPrice} placeholder="Any budget" className="mt-1.5 w-full rounded-md border border-forest/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35" />
          </label>
          <label className="text-xs font-medium text-ink/65">
            Minimum bedrooms
            <select name="beds" defaultValue={filters.beds} className="mt-1.5 w-full rounded-md border border-forest/15 bg-white px-3 py-2.5 text-sm text-ink">
              <option value="">Any</option>
              <option value="1">1+ bedrooms</option>
              <option value="2">2+ bedrooms</option>
              <option value="3">3+ bedrooms</option>
              <option value="4">4+ bedrooms</option>
              <option value="5">5+ bedrooms</option>
            </select>
          </label>
          <button type="submit" className="self-end rounded-md bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-light">Filter</button>
        </form>

        {filteredListings.length > 0 && (
          <p className="mt-5 text-sm text-ink/55">
            Showing {filteredListings.length} approved {filteredListings.length === 1 ? "property" : "properties"} matching your filters.
          </p>
        )}

        <div className="mt-8">
          {sections.map((section) => (
            <MarketplaceFacetSection
              key={section.field}
              title={section.title}
              description={section.description}
              options={section.options}
              field={section.field}
              filters={filters}
              listings={filteredListings}
            />
          ))}
        </div>

        {allListings.length > 0 && filteredListings.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-forest/20 bg-white/60 p-8 text-center">
            <h2 className="font-display text-xl text-forest">No matching listings yet</h2>
            <p className="mt-2 text-sm text-ink/55">Try changing or clearing one of your filters.</p>
          </div>
        )}

        {allListings.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-forest/20 bg-white/60 p-10 text-center">
            <h2 className="font-display text-2xl text-forest">New listings are on the way</h2>
            <p className="mt-2 text-sm text-ink/55">Properties appear here after they have been reviewed and approved.</p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
