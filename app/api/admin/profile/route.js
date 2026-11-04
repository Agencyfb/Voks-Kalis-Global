import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";
import { hashPassword, passwordsMatch } from "@/lib/auth";
import { resolveProfilePhoto } from "@/lib/profilePhoto";
import User from "@/models/User";

export const runtime = "nodejs";

const PROFILE_FIELDS = ["firstName", "lastName", "email", "phone", "city", "country", "jobTitle", "department"];
const PROFILE_LIMITS = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 40,
  city: 100,
  country: 100,
  jobTitle: 120,
  department: 120,
};
function formatProfile(user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    city: user.city || "",
    country: user.country || "",
    jobTitle: user.jobTitle || "Platform administrator",
    department: user.department || "Property operations",
    profilePhoto: user.profilePhoto || "",
    profilePhotoPublicId: user.profilePhotoPublicId || "",
    submissionNotifications: user.submissionNotifications ?? true,
    salesNotifications: user.salesNotifications ?? true,
  };
}

async function getAdmin(request) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (user.role !== "admin") return { response: NextResponse.json({ error: "Admin access is required." }, { status: 403 }) };
  return { user };
}

export async function GET(request) {
  try {
    const { user, response } = await getAdmin(request);
    if (response) return response;
    return NextResponse.json({ profile: formatProfile(user) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin profile load failed:", error);
    return NextResponse.json({ error: "Unable to load your profile right now." }, { status: 500 });
  }
}

export async function PATCH(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  let cloudinary;
  let newlyUploadedPhoto;
  try {
    const { user, response } = await getAdmin(request);
    if (response) return response;

    const updates = {};
    for (const field of PROFILE_FIELDS) {
      if (body[field] === undefined) continue;
      if (typeof body[field] !== "string") {
        return NextResponse.json({ error: `${field} must be text.` }, { status: 400 });
      }
      const value = body[field].trim();
      if (value.length > PROFILE_LIMITS[field]) {
        return NextResponse.json({ error: `${field} must be ${PROFILE_LIMITS[field]} characters or fewer.` }, { status: 400 });
      }
      updates[field] = value;
    }

    for (const field of ["firstName", "lastName", "phone"]) {
      if (updates[field] !== undefined && !updates[field]) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 });
      }
    }
    if (updates.email !== undefined) {
      if (!/^\S+@\S+\.\S+$/.test(updates.email)) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      }
      updates.email = updates.email.toLowerCase();
    }
    if (updates.department !== undefined && !["Property operations", "Sales", "Administration", "Customer support"].includes(updates.department)) {
      return NextResponse.json({ error: "Choose a valid department." }, { status: 400 });
    }

    for (const field of ["submissionNotifications", "salesNotifications"]) {
      if (body[field] === undefined) continue;
      if (typeof body[field] !== "boolean") {
        return NextResponse.json({ error: `${field} must be enabled or disabled.` }, { status: 400 });
      }
      updates[field] = body[field];
    }

    const hasPasswordChange = body.currentPassword !== undefined
      || body.newPassword !== undefined
      || body.confirmPassword !== undefined;
    if (hasPasswordChange) {
      if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string" || typeof body.confirmPassword !== "string") {
        return NextResponse.json({ error: "Enter your current password and confirm your new password." }, { status: 400 });
      }
      if (!passwordsMatch(body.currentPassword, { hash: user.passwordHash, salt: user.passwordSalt })) {
        return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
      }
      if (body.newPassword.length < 8 || !/[A-Z]/.test(body.newPassword) || !/[0-9]/.test(body.newPassword)) {
        return NextResponse.json({ error: "Use at least 8 characters, including one uppercase letter and one number." }, { status: 400 });
      }
      if (body.newPassword !== body.confirmPassword) {
        return NextResponse.json({ error: "The new passwords do not match." }, { status: 400 });
      }
      const { hash, salt } = hashPassword(body.newPassword);
      user.passwordHash = hash;
      user.passwordSalt = salt;
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email }).select("_id");
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
    }

    if (body.profilePhoto !== undefined) {
      if (typeof body.profilePhoto !== "string") {
        return NextResponse.json({ error: "Profile photo must be an image." }, { status: 400 });
      }
      cloudinary = getCloudinary();
      const resolvedPhoto = await resolveProfilePhoto(
        cloudinary,
        user,
        body.profilePhoto,
        body.profilePhotoPublicId || user.profilePhotoPublicId || "",
      );
      updates.profilePhoto = resolvedPhoto.url;
      updates.profilePhotoPublicId = resolvedPhoto.publicId;
      newlyUploadedPhoto = resolvedPhoto.createdAsset;
    }

    const previousPhotoPublicId = user.profilePhotoPublicId;
    Object.assign(user, updates);
    await user.save();
    if (previousPhotoPublicId && previousPhotoPublicId !== user.profilePhotoPublicId) {
      try {
        cloudinary ||= getCloudinary();
        await cloudinary.uploader.destroy(previousPhotoPublicId, { resource_type: "image", type: "upload" });
      } catch (cleanupError) {
        console.error("Previous admin profile photo cleanup failed:", cleanupError);
      }
    }
    return NextResponse.json({ profile: formatProfile(user) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (newlyUploadedPhoto && cloudinary) {
      try {
        await cloudinary.uploader.destroy(newlyUploadedPhoto.publicId, {
          resource_type: newlyUploadedPhoto.resourceType,
          type: newlyUploadedPhoto.type,
        });
      } catch (cleanupError) {
        console.error("New admin profile photo cleanup failed:", cleanupError);
      }
    }
    if (error.code === "INVALID_PROFILE_PHOTO") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Admin profile update failed:", error);
    return NextResponse.json({ error: "Unable to save your profile right now." }, { status: 500 });
  }
}
