import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";

export const runtime = "nodejs";

const PROFILE_ROLES = ["admin", "agent", "buyer"];
const PROPERTY_ROLES = ["admin", "agent", "landlord"];
const FILE_RULES = {
  "property-image": {
    resourceType: "image",
    maximumBytes: 2 * 1024 * 1024,
    mimeTypes: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
  },
  "property-document": {
    resourceType: "raw",
    maximumBytes: 4 * 1024 * 1024,
    mimeTypes: {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    },
  },
  "profile-photo": {
    resourceType: "image",
    maximumBytes: 5 * 1024 * 1024,
    mimeTypes: { "image/jpeg": "jpg", "image/png": "png" },
  },
};

function getUploadFolder(user, purpose) {
  return purpose === "profile-photo"
    ? `haven/profiles/${user._id}`
    : `haven/properties/${user._id}`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const rule = body && FILE_RULES[body.purpose];
  if (!rule || typeof body.contentType !== "string" || !rule.mimeTypes[body.contentType]
    || !Number.isSafeInteger(body.bytes) || body.bytes < 1 || body.bytes > rule.maximumBytes) {
    return NextResponse.json({ error: "The selected file type or size is not allowed." }, { status: 400 });
  }

  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Sign in before uploading files." }, { status: 401 });
    const allowedRoles = body.purpose === "profile-photo" ? PROFILE_ROLES : PROPERTY_ROLES;
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Your account cannot upload this file." }, { status: 403 });
    }

    const cloudinary = getCloudinary();
    const folder = getUploadFolder(user, body.purpose);
    const fileExtension = rule.mimeTypes[body.contentType];
    const publicId = `${randomUUID()}${rule.resourceType === "raw" ? `.${fileExtension}` : ""}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      allowed_formats: Object.values(rule.mimeTypes).join(","),
      folder,
      public_id: publicId,
      timestamp,
    };
    if (body.purpose === "property-document") paramsToSign.type = "authenticated";

    return NextResponse.json({
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      resourceType: rule.resourceType,
      uploadType: body.purpose === "property-document" ? "authenticated" : "upload",
      params: paramsToSign,
      signature: cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Cloudinary upload signing failed:", error);
    return NextResponse.json({ error: "Unable to prepare a secure file upload." }, { status: 500 });
  }
}

export async function DELETE(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || !Array.isArray(body.assets) || body.assets.length > 20) {
    return NextResponse.json({ error: "Provide up to 20 uploaded assets to remove." }, { status: 400 });
  }

  try {
    const user = await getRequestUser(request);
    if (!user) return NextResponse.json({ error: "Sign in before removing uploaded files." }, { status: 401 });

    const propertyFolder = `haven/properties/${user._id}/`;
    const profileFolder = `haven/profiles/${user._id}/`;
    const assets = body.assets.filter((asset) => {
      if (!asset || typeof asset.publicId !== "string") return false;
      const propertyAsset = asset.publicId.startsWith(propertyFolder);
      const profileAsset = asset.publicId.startsWith(profileFolder) && user.role !== "landlord";
      return (propertyAsset && PROPERTY_ROLES.includes(user.role) || profileAsset && PROFILE_ROLES.includes(user.role))
        && (asset.resourceType === "image" || asset.resourceType === "raw")
        && (asset.type === "upload" || asset.type === "authenticated");
    });

    if (assets.length !== body.assets.length) {
      return NextResponse.json({ error: "One or more assets cannot be removed by this account." }, { status: 403 });
    }

    if (assets.length === 0) return NextResponse.json({ removed: 0 });
    const cloudinary = getCloudinary();
    const results = await Promise.all(assets.map((asset) => cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType,
      type: asset.type,
    })));
    const failures = results.filter((result) => !["ok", "not found"].includes(result.result));
    if (failures.length) {
      console.error("Cloudinary asset cleanup incomplete:", failures);
      return NextResponse.json({ error: "Some uploaded files could not be removed." }, { status: 502 });
    }
    return NextResponse.json({ removed: assets.length });
  } catch (error) {
    console.error("Cloudinary asset cleanup failed:", error);
    return NextResponse.json({ error: "Unable to remove uploaded files right now." }, { status: 500 });
  }
}
