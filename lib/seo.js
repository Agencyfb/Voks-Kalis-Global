const FALLBACK_SITE_URL = "https://vokskalisglobal.com";

export const SITE_INFO = {
  name: "Voks-Kalis Global",
  legalName: "Voks-Kalis Global Investment Limited",
  tagline: "Trusted Real Estate in Port Harcourt, Rivers State & Nigeria",
  description:
    "Voks-Kalis Global Investment Limited is a trusted real estate platform in Port Harcourt, Rivers State, and Nigeria for buying, selling, renting, property management, consultancy, and development.",
  email: "vokskalisglobal@gmail.com",
  phone: "+2348063880053",
  displayPhone: "+234 806 388 0053",
  whatsapp: "https://wa.me/2348063880053",
  logo: "/voks-kalis-logo.png",
  defaultOgImage: "/about-building.jpg",
  defaultOgAlt: "Voks-Kalis Global contemporary residential real estate in Port Harcourt, Nigeria",
  locale: "en_NG",
  city: "Port Harcourt",
  state: "Rivers State",
  country: "NG",
  countryName: "Nigeria",
  socialLinks: [
    "https://www.facebook.com/profile.php?id=61553402184259",
    "https://www.instagram.com/vokskalisglobal/?hl=en",
    "https://www.linkedin.com/company/100426279/voks-kalisgloballimited",
  ],
  keywords: [
    "Voks-Kalis Global",
    "Voks-Kalis Global Investment Limited",
    "real estate Port Harcourt",
    "Port Harcourt properties for sale",
    "land for sale in Port Harcourt",
    "houses for sale in Rivers State",
    "Nigerian real estate marketplace",
    "property management Port Harcourt",
    "shortlets Port Harcourt",
    "commercial property Nigeria",
    "diaspora real estate investment Nigeria",
    "verified properties Nigeria",
  ],
};

export const NO_INDEX_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export function getBaseUrl() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").trim();
  if (!configured) return FALLBACK_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl() {
  try {
    return new URL(getBaseUrl());
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export function absoluteUrl(path = "/") {
  if (!path) return getBaseUrl();
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalized}`;
}

export function isShareableImageUrl(src) {
  return typeof src === "string" && src.length > 0 && !src.startsWith("data:");
}

export function resolveOgImages(image, alt) {
  const candidate = Array.isArray(image)
    ? image.find(isShareableImageUrl)
    : isShareableImageUrl(image)
      ? image
      : null;

  const url = candidate ? absoluteUrl(candidate) : absoluteUrl(SITE_INFO.defaultOgImage);
  return [
    {
      url,
      alt: alt || SITE_INFO.defaultOgAlt,
    },
  ];
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageAlt,
  type = "website",
  noIndex = false,
  follow = false,
  publishedTime,
  modifiedTime,
  section,
  authors,
}) {
  const resolvedImages = resolveOgImages(image, imageAlt || (typeof title === "string" ? title : SITE_INFO.name));
  const fullTitle = typeof title === "string" ? title : title?.absolute || SITE_INFO.name;

  const metadata = {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      title: fullTitle,
      description,
      ...(path ? { url: absoluteUrl(path) } : {}),
      siteName: SITE_INFO.name,
      locale: SITE_INFO.locale,
      type,
      images: resolvedImages,
      ...(type === "article"
        ? {
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
            ...(section ? { section } : {}),
            ...(authors?.length ? { authors } : {}),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: resolvedImages.map((item) => item.url),
    },
  };

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow,
      googleBot: {
        index: false,
        follow,
      },
    };
  }

  return metadata;
}

export function buildOrganizationJsonLd() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "Organization"],
    "@id": `${baseUrl}/#organization`,
    name: SITE_INFO.name,
    legalName: SITE_INFO.legalName,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE_INFO.logo),
    },
    image: absoluteUrl(SITE_INFO.defaultOgImage),
    description: SITE_INFO.description,
    email: SITE_INFO.email,
    telephone: SITE_INFO.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_INFO.city,
      addressRegion: SITE_INFO.state,
      addressCountry: SITE_INFO.country,
    },
    areaServed: [
      { "@type": "City", name: "Port Harcourt" },
      { "@type": "State", name: "Rivers State" },
      { "@type": "Country", name: "Nigeria" },
      { "@type": "Place", name: "Worldwide" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE_INFO.phone,
        email: SITE_INFO.email,
        contactType: "customer service",
        areaServed: ["NG", "Worldwide"],
        availableLanguage: ["en"],
      },
    ],
    sameAs: SITE_INFO.socialLinks,
  };
}

export function buildWebSiteJsonLd() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: SITE_INFO.name,
    description: SITE_INFO.description,
    publisher: { "@id": `${baseUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/marketplace?location={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildServicesJsonLd(services) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Real Estate Services | Voks-Kalis Global",
    url: absoluteUrl("/services"),
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        url: absoluteUrl(`/services#${service.id}`),
        provider: { "@id": `${baseUrl}/#organization` },
        areaServed: ["Port Harcourt", "Rivers State", "Nigeria"],
      },
    })),
  };
}

export function buildFaqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildPropertyJsonLd(property, images = []) {
  const baseUrl = getBaseUrl();
  const id = property._id?.toString() || property.id;
  const url = absoluteUrl(`/marketplace/${id}`);
  const shareableImages = images.filter(isShareableImageUrl).map((img) => absoluteUrl(img));
  const resolvedImages = shareableImages.length
    ? shareableImages
    : [absoluteUrl(SITE_INFO.defaultOgImage)];

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url,
    image: resolvedImages,
    datePosted: property.reviewedAt || property.createdAt || undefined,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url,
      seller: { "@id": `${baseUrl}/#organization` },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.propertyAddress || property.location,
      addressLocality: property.location,
      addressCountry: SITE_INFO.country,
    },
    ...(property.beds > 0 ? { numberOfBedrooms: property.beds } : {}),
    ...(property.baths > 0 ? { numberOfBathroomsTotal: property.baths } : {}),
    ...(property.areaSqm > 0
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.areaSqm,
            unitCode: "MTK",
          },
        }
      : {}),
  };
}

export function buildBlogPostingJsonLd(article) {
  const baseUrl = getBaseUrl();
  const url = absoluteUrl(`/blog/${article.slug}`);
  const imageUrl = isShareableImageUrl(article.image)
    ? absoluteUrl(article.image)
    : absoluteUrl(SITE_INFO.defaultOgImage);
  const publishedIso = article.publishedAt
    ? new Date(article.publishedAt).toISOString()
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: [imageUrl],
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: article.category,
    ...(publishedIso ? { datePublished: publishedIso, dateModified: publishedIso } : {}),
    author: {
      "@type": "Organization",
      name: SITE_INFO.name,
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: SITE_INFO.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_INFO.logo),
      },
    },
  };
}

export function buildMarketplaceCollectionJsonLd(listings = []) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Property Marketplace | Voks-Kalis Global",
    description:
      "Browse verified houses, lands, commercial spaces, rentals, and shortlets for sale or lease in Port Harcourt, Rivers State, and across Nigeria.",
    url: absoluteUrl("/marketplace"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 24).map((listing, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: listing.title,
        url: absoluteUrl(listing.detailHref || `/marketplace/${listing.id}`),
      })),
    },
  };
}
