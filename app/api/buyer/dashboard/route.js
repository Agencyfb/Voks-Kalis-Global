import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requestUser";
import Property from "@/models/Property";

export const runtime = "nodejs";

function formatListing(property) {
  return {
    id: property._id.toString(),
    title: property.title,
    category: property.category,
    purpose: property.purpose,
    price: property.price,
    location: property.location,
    image: property.images?.find((image) => image.url || image.data)?.url
      || property.images?.find((image) => image.url || image.data)?.data
      || property.image,
    beds: property.beds,
    baths: property.baths,
    areaSqm: property.areaSqm,
    features: property.features || "",
    detailHref: `/marketplace/${property._id}`,
  };
}

async function getBuyer(request) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (user.role !== "buyer") return { response: NextResponse.json({ error: "Buyer access is required." }, { status: 403 }) };
  return { user };
}

export async function GET(request) {
  try {
    const { user, response } = await getBuyer(request);
    if (response) return response;

    const savedIds = (user.savedProperties || []).map((id) => id.toString());
    const [properties, savedProperties] = await Promise.all([
      Property.find({ status: "approved" })
        .select("title category purpose price location image images beds baths areaSqm features")
        .sort({ reviewedAt: -1, createdAt: -1 })
        .limit(12)
        .lean(),
      savedIds.length
        ? Property.find({ _id: { $in: savedIds }, status: "approved" })
          .select("title category purpose price location image images beds baths areaSqm features")
          .lean()
        : [],
    ]);

    return NextResponse.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city || "",
      },
      preferences: {
        propertyPurpose: user.propertyPurpose || "Buy a home",
        preferredLocation: user.preferredLocation || "",
        maximumBudget: user.maximumBudget ?? "",
        preferredBedrooms: user.preferredBedrooms || "Any",
      },
      properties: properties.map(formatListing),
      savedProperties: savedProperties.map(formatListing),
      savedIds: savedProperties.map((property) => property._id.toString()),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Buyer dashboard load failed:", error);
    return NextResponse.json({ error: "Unable to load your dashboard right now." }, { status: 500 });
  }
}

export async function PATCH(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)
    || typeof body.propertyId !== "string" || !mongoose.isValidObjectId(body.propertyId)
    || typeof body.saved !== "boolean") {
    return NextResponse.json({ error: "A valid property and saved state are required." }, { status: 400 });
  }

  try {
    const { user, response } = await getBuyer(request);
    if (response) return response;

    const property = await Property.findOne({ _id: body.propertyId, status: "approved" }).select("_id");
    if (!property) return NextResponse.json({ error: "This approved property could not be found." }, { status: 404 });

    await user.updateOne(body.saved
      ? { $addToSet: { savedProperties: property._id } }
      : { $pull: { savedProperties: property._id } });

    return NextResponse.json({ propertyId: property._id.toString(), saved: body.saved });
  } catch (error) {
    console.error("Buyer saved property update failed:", error);
    return NextResponse.json({ error: "Unable to update your saved homes right now." }, { status: 500 });
  }
}
