import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import { decodeGalleryCursor, encodeGalleryCursor } from "@/lib/galleryPagination";
import GalleryItem from "@/models/GalleryItem";

export const runtime = "nodejs";

const PAGE_SIZE = 24;

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const category = searchParams.get("category") || "";
  const cursorValue = searchParams.get("cursor");
  const cursor = cursorValue ? decodeGalleryCursor(cursorValue) : null;

  if (category && !["clients", "projects"].includes(category)) {
    return NextResponse.json({ error: "Choose a valid gallery category." }, { status: 400 });
  }
  if (cursorValue && !cursor) {
    return NextResponse.json({ error: "The gallery page cursor is invalid." }, { status: 400 });
  }

  try {
    await connectDb();
    const filter = {};
    if (category) filter.category = category;
    if (cursor) {
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
      ];
    }

    const items = await GalleryItem.find(filter)
      .select("category caption imageUrl createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .limit(PAGE_SIZE + 1)
      .lean();
    const hasMore = items.length > PAGE_SIZE;
    const pageItems = hasMore ? items.slice(0, PAGE_SIZE) : items;

    return NextResponse.json({
      items: pageItems.map((item) => ({
        id: item._id.toString(),
        category: item.category,
        caption: item.caption,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
      })),
      nextCursor: hasMore ? encodeGalleryCursor(pageItems[pageItems.length - 1]) : null,
    }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Gallery load failed:", error);
    return NextResponse.json({ error: "Unable to load the gallery right now." }, { status: 500 });
  }
}
