// Mock data source. Swap this file's exports for real API/CMS calls later
// (e.g. fetch from your backend in a Server Component) without touching
// any component markup.

export const CATEGORIES = [
  {
    id: "estates",
    label: "Estates",
    tagline: "Gated homes, ready to move in",
  },
  {
    id: "land",
    label: "Land",
    tagline: "Titled plots for building or holding",
  },
  {
    id: "shortlets",
    label: "Shortlets",
    tagline: "Furnished stays, by the night",
  },
  {
    id: "commercial",
    label: "Commercial",
    tagline: "Offices, retail and warehouse space",
  },
];

export const PROPERTIES = [
  {
    id: "p1",
    title: "Whitestone Villa",
    category: "estates",
    purpose: "sale",
    price: 185000000,
    currency: "NGN",
    location: "Ikoyi, Lagos",
    beds: 5,
    baths: 6,
    areaSqm: 620,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    featured: true,
    verified: true,
  },
  {
    id: "p2",
    title: "Parkview Terrace",
    category: "estates",
    purpose: "rent",
    price: 4500000,
    period: "year",
    currency: "NGN",
    location: "Parkview, Ikoyi",
    beds: 4,
    baths: 4,
    areaSqm: 410,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
    featured: true,
    verified: true,
  },
  {
    id: "p3",
    title: "Origin Ridge Plots",
    category: "land",
    purpose: "sale",
    price: 35000000,
    currency: "NGN",
    location: "Epe, Lagos",
    areaSqm: 1000,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    featured: true,
    verified: true,
  },
  {
    id: "p4",
    title: "Lakeshore Acres",
    category: "land",
    purpose: "sale",
    price: 22000000,
    currency: "NGN",
    location: "Sangotedo, Lagos",
    areaSqm: 650,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    featured: false,
    verified: true,
  },
  {
    id: "p5",
    title: "The Marina Loft",
    category: "shortlets",
    purpose: "shortlet",
    price: 95000,
    period: "night",
    currency: "NGN",
    location: "Victoria Island, Lagos",
    beds: 2,
    baths: 2,
    areaSqm: 120,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    featured: true,
    verified: true,
  },
  {
    id: "p6",
    title: "Palmgrove Studio",
    category: "shortlets",
    purpose: "shortlet",
    price: 45000,
    period: "night",
    currency: "NGN",
    location: "Lekki Phase 1, Lagos",
    beds: 1,
    baths: 1,
    areaSqm: 55,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    featured: false,
    verified: true,
  },
  {
    id: "p7",
    title: "Broad Street Suites",
    category: "commercial",
    purpose: "rent",
    price: 12000000,
    period: "year",
    currency: "NGN",
    location: "Marina, Lagos Island",
    areaSqm: 340,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    featured: true,
    verified: true,
  },
  {
    id: "p8",
    title: "Alaba Logistics Hub",
    category: "commercial",
    purpose: "sale",
    price: 260000000,
    currency: "NGN",
    location: "Ojo, Lagos",
    areaSqm: 2400,
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80",
    featured: false,
    verified: true,
  },
];

export function formatPrice(price, currency = "NGN") {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
  return formatted;
}

export function getFeatured() {
  return PROPERTIES.filter((p) => p.featured);
}

export function getByCategory(categoryId) {
  return PROPERTIES.filter((p) => p.category === categoryId);
}
