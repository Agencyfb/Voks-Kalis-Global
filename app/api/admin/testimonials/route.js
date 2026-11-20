import mongoose from "mongoose";
import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";
import Testimonial from "@/models/Testimonial";

export const runtime = "nodejs";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

async function requireAdmin(request) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (user.role !== "admin") {
    return { response: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) };
  }
  return { user };
}

function isInstagramUrl(value) {
  if (typeof value !== "string" || value.length > 2_000) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && (url.hostname === "instagram.com" || url.hostname.endsWith(".instagram.com"));
  } catch {
    return false;
  }
}

function serialize(item) {
  return {
    id: item._id.toString(),
    name: item.name,
    detail: item.detail,
    quote: item.quote,
    rating: item.rating,
    instagramUrl: item.instagramUrl,
    imageUrl: item.imageUrl,
    publicId: item.publicId,
    createdAt: item.createdAt,
  };
}

function validateFields(body) {
  return body && typeof body === "object" && !Array.isArray(body)
    && typeof body.name === "string" && body.name.trim().length > 0 && body.name.length <= 100
    && typeof body.detail === "string" && body.detail.trim().length > 0 && body.detail.length <= 180
    && typeof body.quote === "string" && body.quote.trim().length > 0 && body.quote.length <= 1_000
    && Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5
    && isInstagramUrl(body.instagramUrl)
    && typeof body.publicId === "string" && body.publicId.length > 0 && body.publicId.length <= 255;
}

async function getUploadedImage(publicId, user) {
  if (!publicId.startsWith(`haven/testimonials/${user._id}/`)) {
    throw new Error("This uploaded image does not belong to your testimonial uploads.");
  }
  const cloudinary = getCloudinary();
  let asset;
  try {
    asset = await cloudinary.api.resource(publicId, { resource_type: "image", type: "upload" });
  } catch (error) {
    if (error.http_code === 404) {
      throw new Error("The uploaded image could not be found.");
    }
    throw error;
  }
  if (!IMAGE_FORMATS.includes(asset.format) || asset.bytes < 1 || asset.bytes > 5 * 1024 * 1024
    || typeof asset.secure_url !== "string" || !asset.secure_url.startsWith("https://")) {
    throw new Error("The image format or size is not allowed.");
  }
  return { imageUrl: asset.secure_url, publicId: asset.public_id };
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;
    await connectDb();
    const items = await Testimonial.find().sort({ createdAt: -1, _id: -1 }).lean();
    return NextResponse.json({ testimonials: items.map(serialize) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin testimonials load failed:", error);
    return NextResponse.json({ error: "Unable to load testimonial management right now." }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await parseBody(request);
  if (!validateFields(body)) {
    return NextResponse.json({ error: "Provide a name, benefit, testimony, 1–5 star rating, Instagram post URL and uploaded image." }, { status: 400 });
  }

  try {
    const { user, response } = await requireAdmin(request);
    if (response) return response;
    const image = await getUploadedImage(body.publicId, user);
    await connectDb();
    const item = await Testimonial.create({
      name: body.name.trim(),
      detail: body.detail.trim(),
      quote: body.quote.trim(),
      rating: body.rating,
      instagramUrl: body.instagramUrl.trim(),
      ...image,
      submittedBy: user._id,
    });
    return NextResponse.json({ testimonial: serialize(item) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.code === "CLOUDINARY_CONFIG_MISSING") {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error.message.startsWith("This uploaded image") || error.message === "The image format or size is not allowed.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "This image has already been used for a testimonial." }, { status: 409 });
    }
    console.error("Admin testimonial creation failed:", error);
    return NextResponse.json({ error: "Unable to publish this testimonial." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const body = await parseBody(request);
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id) || !validateFields(body)) {
    return NextResponse.json({ error: "Provide a valid testimonial and all required details." }, { status: 400 });
  }

  try {
    const { user, response } = await requireAdmin(request);
    if (response) return response;
    await connectDb();
    const item = await Testimonial.findById(body.id);
    if (!item) return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });

    const image = body.publicId === item.publicId
      ? { imageUrl: item.imageUrl, publicId: item.publicId }
      : await getUploadedImage(body.publicId, user);
    const previousPublicId = item.publicId;
    item.name = body.name.trim();
    item.detail = body.detail.trim();
    item.quote = body.quote.trim();
    item.rating = body.rating;
    item.instagramUrl = body.instagramUrl.trim();
    item.imageUrl = image.imageUrl;
    item.publicId = image.publicId;
    await item.save();

    if (previousPublicId !== item.publicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(previousPublicId, { resource_type: "image", type: "upload" });
      } catch (cleanupError) {
        console.error("Replaced testimonial image cleanup failed:", cleanupError);
      }
    }
    return NextResponse.json({ testimonial: serialize(item) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error.code === "CLOUDINARY_CONFIG_MISSING") {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error.message.startsWith("This uploaded image") || error.message === "The uploaded image could not be found."
      || error.message === "The image format or size is not allowed.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "This image has already been used for a testimonial." }, { status: 409 });
    }
    console.error("Admin testimonial update failed:", error);
    return NextResponse.json({ error: "Unable to update this testimonial." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const body = await parseBody(request);
  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id)) {
    return NextResponse.json({ error: "A valid testimonial is required." }, { status: 400 });
  }

  try {
    const { response } = await requireAdmin(request);
    if (response) return response;
    await connectDb();
    const item = await Testimonial.findById(body.id).select("publicId");
    if (!item) return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });

    const cloudinary = getCloudinary();
    const result = await cloudinary.uploader.destroy(item.publicId, { resource_type: "image", type: "upload" });
    if (!["ok", "not found"].includes(result.result)) {
      console.error("Testimonial image cleanup failed:", result);
      return NextResponse.json({ error: "Unable to remove the testimonial image from storage." }, { status: 502 });
    }
    await item.deleteOne();
    return NextResponse.json({ removed: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin testimonial removal failed:", error);
    return NextResponse.json({ error: "Unable to remove this testimonial right now." }, { status: 500 });
  }
}
