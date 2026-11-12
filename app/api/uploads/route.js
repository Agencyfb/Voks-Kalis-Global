import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";

export const runtime = "nodejs";

const PROFILE_ROLES = ["admin", "agent", "buyer"];
const PROPERTY_ROLES = ["admin", "agent", "landlord"];
const GALLERY_ROLES = ["admin"];
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
  "gallery-image": {
    resourceType: "image",
    maximumBytes: 5 * 1024 * 1024,
    mimeTypes: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
  },
};

function getUploadFolder(user, purpose) {
  if (purpose === "profile-photo") return `haven/profiles/${user._id}`;
  if (purpose === "gallery-image") return `haven/gallery/${user._id}`;
  return `haven/properties/${user._id}`;
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
    const allowedRoles = body.purpose === "profile-photo"
      ? PROFILE_ROLES
      : body.purpose === "gallery-image" ? GALLERY_ROLES : PROPERTY_ROLES;
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
    if (body.assets.length === 0) return NextResponse.json({ removed: 0 });

    const allowedFolders = [];
    if (PROPERTY_ROLES.includes(user.role)) allowedFolders.push(`haven/properties/${user._id}`);
    if (PROFILE_ROLES.includes(user.role)) allowedFolders.push(`haven/profiles/${user._id}`);
    if (GALLERY_ROLES.includes(user.role)) allowedFolders.push(`haven/gallery/${user._id}`);
    const cloudinary = getCloudinary();
    const assets = await Promise.all(body.assets.map(async (asset) => {
      if (!asset || typeof asset.publicId !== "string"
        || !["image", "raw"].includes(asset.resourceType)
        || !["upload", "authenticated"].includes(asset.type)) return null;

      const ownedFolder = allowedFolders.find((folder) => asset.publicId.startsWith(`${folder}/`));
      if (ownedFolder) return asset;

      try {
        const resource = await cloudinary.api.resource(asset.publicId, {
          resource_type: asset.resourceType,
          type: asset.type,
        });
        return resource.public_id === asset.publicId && allowedFolders.includes(resource.asset_folder)
          ? asset
          : null;
      } catch (error) {
        if (error.http_code === 404) return null;
        throw error;
      }
    }));
    const authorizedAssets = assets.filter(Boolean);

    if (authorizedAssets.length !== body.assets.length) {
      return NextResponse.json({ error: "One or more assets cannot be removed by this account." }, { status: 403 });
    }

    if (authorizedAssets.length === 0) return NextResponse.json({ removed: 0 });
    const results = await Promise.all(authorizedAssets.map((asset) => cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType,
      type: asset.type,
    })));
    const failures = results.filter((result) => !["ok", "not found"].includes(result.result));
    if (failures.length) {
      console.error("Cloudinary asset cleanup incomplete:", failures);
      return NextResponse.json({ error: "Some uploaded files could not be removed." }, { status: 502 });
    }
    return NextResponse.json({ removed: authorizedAssets.length });
  } catch (error) {
    console.error("Cloudinary asset cleanup failed:", error);
    return NextResponse.json({ error: "Unable to remove uploaded files right now." }, { status: 500 });
  }
}
