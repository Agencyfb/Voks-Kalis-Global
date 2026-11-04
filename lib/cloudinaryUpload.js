"use client";

export async function uploadFileToCloudinary(file, purpose) {
  const signatureResponse = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purpose, contentType: file.type, bytes: file.size }),
  });
  const signature = await signatureResponse.json().catch(() => ({}));
  if (!signatureResponse.ok) {
    throw new Error(signature.error || "Unable to prepare a secure file upload.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("signature", signature.signature);
  Object.entries(signature.params).forEach(([key, value]) => formData.append(key, String(value)));

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType}/upload`,
    { method: "POST", body: formData },
  );
  const result = await uploadResponse.json().catch(() => ({}));
  if (!uploadResponse.ok) {
    throw new Error(result.error?.message || "Cloudinary could not upload this file.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    uploadType: result.type,
    format: result.format || "",
    bytes: result.bytes,
    name: file.name,
    mimeType: file.type,
  };
}

export async function removeCloudinaryAssets(assets) {
  if (assets.length === 0) return;
  const response = await fetch("/api/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assets }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Unable to remove uploaded files.");
  }
}
