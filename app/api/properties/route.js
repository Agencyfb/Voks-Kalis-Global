import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";
import Property from "@/models/Property";

export const runtime = "nodejs";

const ALLOWED_ROLES = ["admin", "agent", "landlord"];
const CATEGORIES = ["estates", "land", "shortlets", "commercial"];
const PURPOSES = ["sale", "rent", "shortlet"];
const OWNERSHIP_TYPES = ["individual", "community", "family"];
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOCUMENT_TYPES = ["application/pdf", ...IMAGE_TYPES];
const MAX_IMAGES = 10;
const MAX_DOCUMENTS = 10;
const FILE_EXTENSIONS = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function getDataUrlSize(value, allowedTypes) {
  if (typeof value !== "string") return null;
  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/]*={0,2})$/);
  if (!match || !allowedTypes.includes(match[1])) return null;

  const encoded = match[2];
  return {
    type: match[1],
    bytes: Math.floor(encoded.length * 3 / 4) - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0),
  };
}

function isValidUpload(upload, allowedTypes, maximumBytes) {
  if (!upload || typeof upload !== "object" || Array.isArray(upload)) return false;
  if (typeof upload.name !== "string" || !upload.name.trim() || upload.name.length > 160) return false;
  const dataUrl = getDataUrlSize(upload.data, allowedTypes);
  return Boolean(dataUrl && dataUrl.bytes > 0 && dataUrl.bytes <= maximumBytes && upload.type === dataUrl.type);
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
      .select("title category purpose price location status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ properties: properties.map((property) => ({
      id: property._id.toString(),
      title: property.title,
      category: property.category,
      purpose: property.purpose,
      price: property.price,
      location: property.location,
      status: property.status,
      createdAt: property.createdAt,
    })) });
  } catch (error) {
    console.error("Property list failed:", error);
    return NextResponse.json({ error: "Unable to load your properties right now." }, { status: 500 });
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
  if (!Array.isArray(body.images) || body.images.length < 2 || body.images.length > MAX_IMAGES || !body.images.every((image) => isValidUpload(image, IMAGE_TYPES, 2 * 1024 * 1024))) {
    return NextResponse.json({ error: "Upload 2 to 10 valid property photos, each no larger than 2 MB." }, { status: 400 });
  }
  if (!Array.isArray(body.documents) || body.documents.length < 1 || body.documents.length > MAX_DOCUMENTS || !body.documents.every((document) => isValidUpload(document, DOCUMENT_TYPES, 4 * 1024 * 1024))) {
    return NextResponse.json({ error: "Upload 1 to 10 valid supporting documents (PDF or image, up to 4 MB each)." }, { status: 400 });
  }
  const totalAttachmentBytes = [...body.images, ...body.documents]
    .reduce((total, upload) => total + getDataUrlSize(upload.data, IMAGE_TYPES.concat("application/pdf")).bytes, 0);
  if (totalAttachmentBytes > MAX_ATTACHMENT_BYTES) {
    return NextResponse.json({ error: "All property photos and documents must total 8 MB or less." }, { status: 400 });
  }
  if (body.declarationAccepted !== true) {
    return NextResponse.json({ error: "Accept the declaration before submitting this property." }, { status: 400 });
  }
  if (!CATEGORIES.includes(body.category) || !PURPOSES.includes(body.purpose)) {
    return NextResponse.json({ error: "Choose a valid property type and listing type." }, { status: 400 });
  }
  if (!Number.isFinite(Number(body.price)) || Number(body.price) < 1) {
    return NextResponse.json({ error: "Enter a valid property price." }, { status: 400 });
  }
  const optionalNumber = (value) => value === "" || value == null ? null : Number(value);
  const numericFields = ["beds", "baths", "areaSqm"].map((field) => optionalNumber(body[field]));
  if (numericFields.some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
    return NextResponse.json({ error: "Property measurements must be zero or greater." }, { status: 400 });
  }
  if (body.category === "land" && !["commercial", "residential", "industrial"].includes(body.landUse)) {
    return NextResponse.json({ error: "Choose a valid land use." }, { status: 400 });
  }

  let cloudinary;
  const uploadedAssets = [];
  let savingProperty = false;
  try {
    cloudinary = getCloudinary();
    const folder = `haven/properties/${user._id}`;
    const uploadedImages = [];
    const uploadedDocuments = [];

    for (const image of body.images) {
      const result = await cloudinary.uploader.upload(image.data, {
        folder,
        resource_type: "image",
        use_filename: false,
        public_id: randomUUID(),
      });
      uploadedAssets.push({ publicId: result.public_id, resourceType: "image", type: "upload" });
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        name: image.name.trim(),
        type: image.type,
        bytes: getDataUrlSize(image.data, IMAGE_TYPES).bytes,
      });
    }

    for (const document of body.documents) {
      const result = await cloudinary.uploader.upload(document.data, {
        folder,
        resource_type: "raw",
        type: "authenticated",
        use_filename: false,
        public_id: `${randomUUID()}${FILE_EXTENSIONS[document.type]}`,
      });
      uploadedAssets.push({ publicId: result.public_id, resourceType: "raw", type: "authenticated" });
      uploadedDocuments.push({
        publicId: result.public_id,
        resourceType: "raw",
        format: result.format || FILE_EXTENSIONS[document.type].slice(1),
        name: document.name.trim(),
        type: document.type,
        bytes: getDataUrlSize(document.data, DOCUMENT_TYPES).bytes,
      });
    }

    savingProperty = true;
    const property = await Property.create({
      title: body.title.trim(),
      category: body.category,
      purpose: body.purpose,
      price: Number(body.price),
      location: body.location.trim(),
      propertyTitle: body.propertyTitle.trim(),
      propertyAddress: body.propertyAddress.trim(),
      rootOfTitle: body.rootOfTitle.trim(),
      previousOwner: body.previousOwner.trim(),
      ownershipType: body.ownershipType,
      description: body.description.trim(),
      beds: body.category === "land" ? null : numericFields[0],
      baths: body.category === "land" ? null : numericFields[1],
      areaSqm: numericFields[2],
      features: body.category === "land" ? String(body.features || "").trim() : "",
      landmarks: body.category === "land" ? String(body.landmarks || "").trim() : "",
      landUse: body.category === "land" ? body.landUse : "",
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
    if (cloudinary && uploadedAssets.length > 0) {
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