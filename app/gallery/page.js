import GalleryBrowser from "@/components/GalleryBrowser";
import JsonLd from "@/components/JsonLd";
import connectDb from "@/connectDb/connect";
import { encodeGalleryCursor } from "@/lib/galleryPagination";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import GalleryItem from "@/models/GalleryItem";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export async function generateMetadata({ searchParams }) {
  const category = ["clients", "projects"].includes(searchParams?.category)
    ? searchParams.category
    : "";

  return buildPageMetadata({
    title: category === "clients"
      ? "Satisfied Clients Gallery"
      : category === "projects"
        ? "Delivered Projects Gallery"
        : "Client Stories & Delivered Projects Gallery",
    description:
      "Explore satisfied clients and delivered real estate projects by Voks-Kalis Global Investment Limited across Port Harcourt, Rivers State, and Nigeria.",
    path: "/gallery",
    noIndex: Boolean(category),
    follow: true,
    keywords: [
      "Voks-Kalis Global projects",
      "Port Harcourt delivered real estate projects",
      "Voks-Kalis Global clients",
    ],
  });
}

export default async function GalleryPage({ searchParams }) {
  const category = ["clients", "projects"].includes(searchParams?.category)
    ? searchParams.category
    : "";

  let initialItems = [];
  let initialNextCursor = null;

  try {
    await connectDb();
    const filter = category ? { category } : {};
    const items = await GalleryItem.find(filter)
      .select("category caption imageUrl createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .limit(PAGE_SIZE + 1)
      .lean();
    const hasMore = items.length > PAGE_SIZE;
    const pageItems = hasMore ? items.slice(0, PAGE_SIZE) : items;
    initialItems = pageItems.map((item) => ({
      id: item._id.toString(),
      category: item.category,
      caption: item.caption,
      imageUrl: item.imageUrl,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    }));
    initialNextCursor = hasMore ? encodeGalleryCursor(pageItems[pageItems.length - 1]) : null;
  } catch (error) {
    console.error("Gallery SSR preload failed:", error);
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />
      <GalleryBrowser
        initialCategory={category}
        initialItems={initialItems}
        initialNextCursor={initialNextCursor}
      />
    </>
  );
}
