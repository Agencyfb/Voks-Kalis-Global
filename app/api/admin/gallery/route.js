import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import { getCloudinary } from "@/lib/cloudinary";
import { decodeGalleryCursor, encodeGalleryCursor } from "@/lib/galleryPagination";
import { getRequestUser } from "@/lib/requestUser";
import GalleryItem from "@/models/GalleryItem";

export const runtime = "nodejs";

const PAGE_SIZE = 30;
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

async function requireAdmin(request) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (user.role !== "admin") {
    return { response: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request) {
  const cursorValue = new URL(request.url).searchParams.get("cursor");
  const cursor = cursorValue ? decodeGalleryCursor(cursorValue) : null;
  if (cursorValue && !cursor) {
    return NextResponse.json({ error: "The gallery page cursor is invalid." }, { status: 400 });
  }

  try {
    const { response } = await requireAdmin(request);
    if (response) return response;
    await connectDb();

    const filter = cursor ? {
      $or: [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
      ],
    } : {};
    const items = await GalleryItem.find(filter)
      .select("category caption imageUrl publicId createdAt")
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
        publicId: item.publicId,
        createdAt: item.createdAt,
      })),
      nextCursor: hasMore ? encodeGalleryCursor(pageItems[pageItems.length - 1]) : null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin gallery load failed:", error);
    return NextResponse.json({ error: "Unable to load gallery management right now." }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)
    || !["clients", "projects"].includes(body.category)
    || typeof body.caption !== "string" || body.caption.length > 180
    || typeof body.publicId !== "string"
    || body.publicId.length > 255) {
    return NextResponse.json({ error: "Provide a valid gallery category, caption and uploaded image." }, { status: 400 });
  }

  try {
    const { user, response } = await requireAdmin(request);
    if (response) return response;
    const expectedFolder = `haven/gallery/${user._id}/`;
    if (!body.publicId.startsWith(expectedFolder)) {
      return NextResponse.json({ error: "This uploaded image does not belong to your gallery uploads." }, { status: 400 });
    }

    const cloudinary = getCloudinary();
    let asset;
    try {
      asset = await cloudinary.api.resource(body.publicId, { resource_type: "image", type: "upload" });
    } catch (error) {
      if (error.http_code === 404) {
        return NextResponse.json({ error: "The uploaded image could not be found." }, { status: 400 });
      }
      throw error;
    }

    if (!IMAGE_FORMATS.includes(asset.format) || asset.bytes < 1 || asset.bytes > 5 * 1024 * 1024
      || typeof asset.secure_url !== "string" || !asset.secure_url.startsWith("https://")) {
      return NextResponse.json({ error: "The image format or size is not allowed." }, { status: 400 });
    }

    const item = await GalleryItem.create({
      category: body.category,
      caption: body.caption.trim(),
      imageUrl: asset.secure_url,
      publicId: asset.public_id,
      submittedBy: user._id,
    });
    return NextResponse.json({
      item: {
        id: item._id.toString(),
        category: item.category,
        caption: item.caption,
        imageUrl: item.imageUrl,
        publicId: item.publicId,
        createdAt: item.createdAt,
      },
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.code === "CLOUDINARY_CONFIG_MISSING") {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "This image has already been added to the gallery." }, { status: 409 });
    }
    console.error("Admin gallery upload failed:", error);
    return NextResponse.json({ error: "Unable to add this image to the gallery." }, { status: 500 });
  }
}

export async function DELETE(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) {
    return NextResponse.json({ error: "A valid gallery image is required." }, { status: 400 });
  }

  try {
    const { response } = await requireAdmin(request);
    if (response) return response;
    await connectDb();
    const item = await GalleryItem.findById(body.id).select("publicId");
    if (!item) return NextResponse.json({ error: "Gallery image not found." }, { status: 404 });

    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.destroy(item.publicId, {
      resource_type: "image",
      type: "upload",
    });
    if (!["ok", "not found"].includes(result.result)) {
      console.error("Gallery image cleanup failed:", result);
      return NextResponse.json({ error: "Unable to remove the image from storage." }, { status: 502 });
    }
    await item.deleteOne();
    return NextResponse.json({ removed: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin gallery image removal failed:", error);
    return NextResponse.json({ error: "Unable to remove this gallery image right now." }, { status: 500 });
  }
}
