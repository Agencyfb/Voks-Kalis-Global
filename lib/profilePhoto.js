import { randomUUID } from "crypto";

const LEGACY_PHOTO_PATTERN = /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/]*={0,2})$/;
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

function invalidPhotoError() {
  const error = new Error("Profile photo must be a JPG or PNG no larger than 5 MB.");
  error.code = "INVALID_PROFILE_PHOTO";
  return error;
}

export async function resolveProfilePhoto(cloudinary, user, photo, requestedPublicId) {
  if (typeof photo !== "string") throw invalidPhotoError();
  if (!photo) return { url: "", publicId: "", createdAsset: null };

  const folder = `haven/profiles/${user._id}`;
  const legacyMatch = photo.match(LEGACY_PHOTO_PATTERN);
  if (legacyMatch) {
    const encoded = legacyMatch[2];
    const bytes = Math.floor(encoded.length * 3 / 4) - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
    if (bytes < 1 || bytes > MAX_PROFILE_PHOTO_BYTES) throw invalidPhotoError();
    const result = await cloudinary.uploader.upload(photo, {
      folder,
      resource_type: "image",
      public_id: randomUUID(),
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      createdAsset: { publicId: result.public_id, resourceType: "image", type: "upload" },
    };
  }

  if (typeof requestedPublicId !== "string" || !requestedPublicId.startsWith(`${folder}/`)) {
    throw invalidPhotoError();
  }

  let resource;
  try {
    resource = await cloudinary.api.resource(requestedPublicId, { resource_type: "image", type: "upload" });
  } catch {
    throw invalidPhotoError();
  }
  if (resource.secure_url !== photo || resource.bytes < 1 || resource.bytes > MAX_PROFILE_PHOTO_BYTES) {
    throw invalidPhotoError();
  }

  return { url: resource.secure_url, publicId: resource.public_id, createdAsset: null };
}
