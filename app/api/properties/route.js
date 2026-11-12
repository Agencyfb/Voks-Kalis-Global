import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";
import Property from "@/models/Property";

export const runtime = "nodejs";

const ALLOWED_ROLES = ["admin", "agent", "landlord"];
const CATEGORIES = ["estates", "land", "shortlets", "commercial", "lands", "buildings", "rentals"];
const PURPOSES = ["sale", "rent", "shortlet", "sales", "lease"];
const PROPERTY_TYPES = ["residential", "commercial", "industrial", "raw-land", "agricultural-land"];
const OWNERSHIP_TYPES = ["individual", "community", "family", "company"];
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCUMENT_TYPES = ["application/pdf", ...IMAGE_TYPES];
const MAX_IMAGES = 10;
const MAX_DOCUMENTS = 10;
function isValidUpload(upload, allowedTypes, maximumBytes, resourceType) {
  if (!upload || typeof upload !== "object" || Array.isArray(upload)) return false;
  if (typeof upload.name !== "string" || !upload.name.trim() || upload.name.length > 160) return false;
  if (!allowedTypes.includes(upload.mimeType) || !Number.isSafeInteger(upload.bytes)
    || upload.bytes < 1 || upload.bytes > maximumBytes) return false;
  if (typeof upload.publicId !== "string" || !/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(upload.publicId)) return false;
  if (resourceType === "image") {
    if (upload.resourceType !== "image" || upload.uploadType !== "upload" || typeof upload.url !== "string") return false;
    try {
      const url = new URL(upload.url);
      return url.protocol === "https:" && url.hostname.endsWith(".res.cloudinary.com");
    } catch {
      return false;
    }
  }
  return upload.resourceType === "raw" && upload.uploadType === "authenticated";
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await callback(items[index]);
    }
  }));
  return results;
}

export async function GET(request) {
  let user;
  try {
    user = await getRequestUser(request);
  } catch (error) {
    console.error("Property list authentication failed:", error);
    return NextResponse.json({ error: "Unable to verify your account right now." }, { status: 500 });
  }

  if (!user) return NextResponse.json({ error: "Sign in to view your properties." }, { status: 401 });
  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Your account cannot view submitted properties." }, { status: 403 });
  }

  try {
    const properties = await Property.find({ submittedBy: user._id })
      .select("title category propertyType purpose price location image status createdAt reviewedAt reviewNote")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ properties: properties.map((property) => ({
      id: property._id.toString(),
      title: property.title,
      category: property.category,
      purpose: property.purpose,
      propertyType: property.propertyType,
      price: property.price,
      location: property.location,
      image: property.image,
      status: property.status,
      createdAt: property.createdAt,
      reviewedAt: property.reviewedAt,
      reviewNote: property.reviewNote || "",
    })) });
  } catch (error) {
    console.error("Property list failed:", error);
    return NextResponse.json({ error: "Unable to load your properties right now." }, { status: 500 });
  }
}

export async function PATCH(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id) || !body.updates || typeof body.updates !== "object" || Array.isArray(body.updates)) {
    return NextResponse.json({ error: "A valid property and classification update are required." }, { status: 400 });
  }

  let user;
  try {
    user = await getRequestUser(request);
  } catch (error) {
    console.error("Property update authentication failed:", error);
    return NextResponse.json({ error: "Unable to verify your account right now." }, { status: 500 });
  }

  if (!user) return NextResponse.json({ error: "Sign in to update this property." }, { status: 401 });
  if (!["agent", "landlord"].includes(user.role)) {
    return NextResponse.json({ error: "Only the property owner can update its classification." }, { status: 403 });
  }

  const { category, propertyType, purpose } = body.updates;
  if (!CATEGORIES.includes(category) || !PROPERTY_TYPES.includes(propertyType) || !PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: "Choose a valid property category, type and purpose." }, { status: 400 });
  }

  try {
    const property = await Property.findOne({ _id: body.id, submittedBy: user._id });
    if (!property) return NextResponse.json({ error: "Property not found in your listings." }, { status: 404 });

    const classificationChanged = property.category !== category
      || property.propertyType !== propertyType
      || property.purpose !== purpose;
    property.category = category;
    property.propertyType = propertyType;
    property.purpose = purpose;
    if (classificationChanged && property.status !== "pending") {
      property.status = "pending";
      property.reviewedAt = null;
    }
    await property.save();

    return NextResponse.json({
      property: {
        id: property._id.toString(),
        category: property.category,
        propertyType: property.propertyType,
        purpose: property.purpose,
        status: property.status,
        reviewedAt: property.reviewedAt,
      },
    });
  } catch (error) {
    console.error("Property classification update failed:", error);
    return NextResponse.json({ error: "Unable to update this property right now." }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  let user;
  try {
    user = await getRequestUser(request);
  } catch (error) {
    console.error("Property upload authentication failed:", error);
    return NextResponse.json({ error: "Unable to verify your account right now." }, { status: 500 });
  }

  if (!user) return NextResponse.json({ error: "Sign in to submit a property." }, { status: 401 });
  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Your account cannot submit properties." }, { status: 403 });
  }

  const requiredText = ["title", "location", "description", "propertyTitle", "propertyAddress", "rootOfTitle", "previousOwner"];
  if (requiredText.some((field) => typeof body[field] !== "string" || !body[field].trim())) {
    return NextResponse.json({ error: "Complete all required property, ownership and title details." }, { status: 400 });
  }
  if (body.propertyAddress.length > 300 || body.propertyTitle.length > 120 || body.rootOfTitle.length > 500 || body.previousOwner.length > 160) {
    return NextResponse.json({ error: "One or more title or ownership details exceed the allowed length." }, { status: 400 });
  }
  if (!OWNERSHIP_TYPES.includes(body.ownershipType)) {
    return NextResponse.json({ error: "Choose who owns the property." }, { status: 400 });
  }
  const assetFolder = `haven/properties/${user._id}`;
  if (!Array.isArray(body.images) || body.images.length < 2 || body.images.length > MAX_IMAGES || !body.images.every((image) => isValidUpload(image, IMAGE_TYPES, 2 * 1024 * 1024, "image"))) {
    return NextResponse.json({ error: "Upload 2 to 10 valid property photos, each no larger than 2 MB." }, { status: 400 });
  }
  if (!Array.isArray(body.documents) || body.documents.length < 1 || body.documents.length > MAX_DOCUMENTS || !body.documents.every((document) => isValidUpload(document, DOCUMENT_TYPES, 4 * 1024 * 1024, "raw"))) {
    return NextResponse.json({ error: "Upload 1 to 10 valid supporting documents (PDF or image, up to 4 MB each)." }, { status: 400 });
  }
  const totalAttachmentBytes = [...body.images, ...body.documents]
    .reduce((total, upload) => total + upload.bytes, 0);
  if (totalAttachmentBytes > MAX_ATTACHMENT_BYTES) {
    return NextResponse.json({ error: "All property photos and documents must total 8 MB or less." }, { status: 400 });
  }
  if (body.declarationAccepted !== true) {
    return NextResponse.json({ error: "Accept the declaration before submitting this property." }, { status: 400 });
  }
  if (!CATEGORIES.includes(body.category) || !PURPOSES.includes(body.purpose) || !PROPERTY_TYPES.includes(body.propertyType)) {
    return NextResponse.json({ error: "Choose a valid property category, purpose and property type." }, { status: 400 });
  }
  const isLandCategory = ["land", "lands"].includes(body.category);
  if (!Number.isFinite(Number(body.price)) || Number(body.price) < 1) {
    return NextResponse.json({ error: "Enter a valid property price." }, { status: 400 });
  }
  const optionalNumber = (value) => value === "" || value == null ? null : Number(value);
  const numericFields = ["beds", "baths", "areaSqm"].map((field) => optionalNumber(body[field]));
  if (numericFields.some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
    return NextResponse.json({ error: "Property measurements must be zero or greater." }, { status: 400 });
  }
  if (isLandCategory && !["commercial", "residential", "industrial"].includes(body.landUse)) {
    return NextResponse.json({ error: "Choose a valid land use." }, { status: 400 });
  }

  let cloudinary;
  let savingProperty = false;
  try {
    cloudinary = getCloudinary();
    const uploads = [
      ...body.images.map((image) => ({ ...image, resourceType: "image", uploadType: "upload" })),
      ...body.documents.map((document) => ({ ...document, resourceType: "raw", uploadType: "authenticated" })),
    ];
    await mapWithConcurrency(uploads, 4, async (upload) => {
      const resource = await cloudinary.api.resource(upload.publicId, {
        resource_type: upload.resourceType,
        type: upload.uploadType,
      });
      const assetBelongsToUser = resource.asset_folder === assetFolder
        || resource.public_id.startsWith(`${assetFolder}/`);
      if (!assetBelongsToUser || resource.public_id !== upload.publicId || resource.bytes !== upload.bytes
        || resource.bytes > (upload.resourceType === "image" ? 2 * 1024 * 1024 : 4 * 1024 * 1024)
        || (upload.format && resource.format !== upload.format)
        || (upload.resourceType === "image" && resource.secure_url !== upload.url)) {
        throw new Error("Cloudinary upload verification failed.");
      }
    });

    const uploadedImages = body.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
      name: image.name.trim(),
      type: image.mimeType,
      bytes: image.bytes,
    }));
    const uploadedDocuments = body.documents.map((document) => ({
      publicId: document.publicId,
      resourceType: "raw",
      format: document.format,
      name: document.name.trim(),
      type: document.mimeType,
      bytes: document.bytes,
    }));

    savingProperty = true;
    const property = await Property.create({
      title: body.title.trim(),
      category: body.category,
      purpose: body.purpose,
      propertyType: body.propertyType,
      price: Number(body.price),
      location: body.location.trim(),
      propertyTitle: body.propertyTitle.trim(),
      propertyAddress: body.propertyAddress.trim(),
      rootOfTitle: body.rootOfTitle.trim(),
      previousOwner: body.previousOwner.trim(),
      ownershipType: body.ownershipType,
      description: body.description.trim(),
      beds: isLandCategory ? null : numericFields[0],
      baths: isLandCategory ? null : numericFields[1],
      areaSqm: numericFields[2],
      features: isLandCategory ? String(body.features || "").trim() : "",
      landmarks: isLandCategory ? String(body.landmarks || "").trim() : "",
      landUse: isLandCategory ? body.landUse : "",
      image: uploadedImages[0].url,
      images: uploadedImages,
      documents: uploadedDocuments,
      declarationAcceptedAt: new Date(),
      submittedBy: user._id,
      assignedAgent: user.role === "agent" ? `${user.firstName} ${user.lastName}`.trim() : "",
    });

    return NextResponse.json({ propertyId: property._id.toString(), status: property.status }, { status: 201 });
  } catch (error) {
    console.error("Property submission failed:", error);
    const uploadedAssets = [
      ...(Array.isArray(body.images) ? body.images.map((image) => ({ publicId: image.publicId, resourceType: "image", type: "upload" })) : []),
      ...(Array.isArray(body.documents) ? body.documents.map((document) => ({ publicId: document.publicId, resourceType: "raw", type: "authenticated" })) : []),
    ].filter((asset) => typeof asset.publicId === "string" && asset.publicId.startsWith(`${assetFolder}/`));
    if (cloudinary && uploadedAssets.length > 0 && savingProperty) {
      const cleanupResults = await Promise.allSettled(uploadedAssets.map((asset) =>
        cloudinary.uploader.destroy(asset.publicId, {
          resource_type: asset.resourceType,
          type: asset.type,
        }),
      ));
      cleanupResults.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Cloudinary asset cleanup failed:", result.reason);
        } else if (result.value.result !== "ok" && result.value.result !== "not found") {
          console.error("Cloudinary asset cleanup did not complete:", result.value);
        }
      });
    }
    if (error.code === "CLOUDINARY_CONFIG_MISSING") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!savingProperty) {
      return NextResponse.json({ error: "Unable to upload property files right now. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ error: "Unable to save your property. Please try again." }, { status: 500 });
  }
}