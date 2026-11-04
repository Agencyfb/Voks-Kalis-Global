import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";
import Property from "@/models/Property";
import User from "@/models/User";

export const runtime = "nodejs";

function formatProperty(property, includeAttachments = false) {
  const submitter = property.submittedBy;
  const images = property.images?.length ? property.images : [{ data: property.image, name: "Property photo", type: "image/jpeg" }];
  const cloudinary = includeAttachments && property.documents?.some((document) => document.publicId)
    ? getCloudinary()
    : null;
  const downloadExpiresAt = Math.floor(Date.now() / 1000) + 10 * 60;

  return {
    id: property._id.toString(),
    title: property.title,
    category: property.category,
    purpose: property.purpose,
    propertyType: property.propertyType,
    price: property.price,
    location: property.location,
    description: property.description,
    beds: property.beds,
    baths: property.baths,
    areaSqm: property.areaSqm,
    features: property.features,
    landmarks: property.landmarks,
    landUse: property.landUse,
    image: property.image,
    images: includeAttachments
      ? images.map((image) => ({
        url: image.url || image.data,
        name: image.name,
        type: image.type,
      }))
      : [],
    documents: includeAttachments
      ? (property.documents || []).map((document) => ({
        url: document.publicId
          ? cloudinary.utils.private_download_url(document.publicId, document.format, {
            resource_type: document.resourceType || "raw",
            type: "authenticated",
            attachment: true,
            expires_at: downloadExpiresAt,
          })
          : document.data,
        name: document.name,
        type: document.type,
      }))
      : [],
    propertyTitle: property.propertyTitle,
    propertyAddress: property.propertyAddress,
    rootOfTitle: property.rootOfTitle,
    previousOwner: property.previousOwner,
    ownershipType: property.ownershipType,
    declarationAcceptedAt: property.declarationAcceptedAt,
    submittedBy: submitter ? `${submitter.firstName} ${submitter.lastName}`.trim() : "Property seller",
    submittedByRole: submitter?.role || "seller",
    submitterEmail: submitter?.email || "",
    submitterPhone: submitter?.phone || "",
    submittedAt: property.createdAt,
    assignedAgent: property.assignedAgent,
    workflowStatus: property.status,
    reviewNote: property.reviewNote || "",
    paymentStatus: property.paymentStatus,
    soldBy: property.soldBy,
    soldAt: property.soldAt,
    reviewedAt: property.reviewedAt,
  };
}

async function requireAdmin(request) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (user.role !== "admin") return { response: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) };
  return { user };
}

export async function GET(request) {
  try {
    const { response } = await requireAdmin(request);
    if (response) return response;

    const propertyId = new URL(request.url).searchParams.get("id");
    if (propertyId) {
      if (!mongoose.isValidObjectId(propertyId)) {
        return NextResponse.json({ error: "A valid property ID is required." }, { status: 400 });
      }
      const property = await Property.findById(propertyId)
        .populate("submittedBy", "firstName lastName role email phone")
        .lean();
      if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });
      return NextResponse.json(
        { property: formatProperty(property, true) },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const [properties, landlords] = await Promise.all([
      Property.find()
        .select("-images -documents")
        .populate("submittedBy", "firstName lastName role email phone")
        .sort({ createdAt: -1 })
        .lean(),
      User.find({ role: "landlord" })
        .select("firstName lastName email phone")
        .sort({ firstName: 1, lastName: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      properties: properties.map(formatProperty),
      landlords: landlords.map((landlord) => ({
        id: landlord._id.toString(),
        name: `${landlord.firstName} ${landlord.lastName}`.trim(),
        email: landlord.email,
        phone: landlord.phone,
      })),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin property list failed:", error);
    return NextResponse.json({ error: "Unable to load properties right now." }, { status: 500 });
  }
}

export async function PATCH(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body.id !== "string" || !mongoose.isValidObjectId(body.id) || !body.updates || typeof body.updates !== "object") {
    return NextResponse.json({ error: "A valid property and update are required." }, { status: 400 });
  }

  try {
    const { response } = await requireAdmin(request);
    if (response) return response;

    const updates = {};
    if (body.updates.workflowStatus !== undefined) {
      if (!["pending", "approved", "declined", "sold"].includes(body.updates.workflowStatus)) {
        return NextResponse.json({ error: "Choose a valid property status." }, { status: 400 });
      }
      if (body.updates.workflowStatus === "declined"
        && (typeof body.updates.reviewNote !== "string" || !body.updates.reviewNote.trim())) {
        return NextResponse.json({ error: "Add a review note before declining this property." }, { status: 400 });
      }
      updates.status = body.updates.workflowStatus;
      updates.reviewedAt = new Date();
    }
    if (body.updates.reviewNote !== undefined) {
      if (typeof body.updates.reviewNote !== "string" || body.updates.reviewNote.length > 500) {
        return NextResponse.json({ error: "Review notes must be 500 characters or fewer." }, { status: 400 });
      }
      updates.reviewNote = body.updates.reviewNote.trim();
    }
    if (body.updates.paymentStatus !== undefined) {
      if (!["in-progress", "paid"].includes(body.updates.paymentStatus)) {
        return NextResponse.json({ error: "Choose a valid payment status." }, { status: 400 });
      }
      updates.paymentStatus = body.updates.paymentStatus;
    }
    if (body.updates.assignedAgent !== undefined) {
      if (typeof body.updates.assignedAgent !== "string" || body.updates.assignedAgent.length > 120) {
        return NextResponse.json({ error: "Agent name must be 120 characters or fewer." }, { status: 400 });
      }
      updates.assignedAgent = body.updates.assignedAgent.trim();
    }
    if (body.updates.soldBy !== undefined) {
      if (typeof body.updates.soldBy !== "string" || body.updates.soldBy.length > 120) {
        return NextResponse.json({ error: "Seller name must be 120 characters or fewer." }, { status: 400 });
      }
      updates.soldBy = body.updates.soldBy.trim();
    }
    if (body.updates.soldAt !== undefined) updates.soldAt = body.updates.soldAt ? new Date(body.updates.soldAt) : null;

    const property = await Property.findByIdAndUpdate(body.id, { $set: updates }, { new: true, runValidators: true })
      .populate("submittedBy", "firstName lastName role email phone")
      .lean();
    if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });

    return NextResponse.json({ property: formatProperty(property) });
  } catch (error) {
    console.error("Admin property update failed:", error);
    return NextResponse.json({ error: "Unable to update this property right now." }, { status: 500 });
  }
}