import { v2 as cloudinary } from "cloudinary";

export function getCloudinary() {
  const currentConfig = cloudinary.config();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || currentConfig.cloud_name;
  const apiKey = process.env.CLOUDINARY_API_KEY || currentConfig.api_key;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || currentConfig.api_secret;

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
    error.code = "CLOUDINARY_CONFIG_MISSING";
    throw error;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}
