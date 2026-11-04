import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { getRequestUser } from "@/lib/requestUser";
import { hashPassword, passwordsMatch } from "@/lib/auth";
import { resolveProfilePhoto } from "@/lib/profilePhoto";
import User from "@/models/User";

export const runtime = "nodejs";

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "city",
  "country",
  "agency",
  "registrationNumber",
  "specialty",
  "yearsExperience",
  "serviceAreas",
  "bio",
  "profilePhoto",
];
const BUYER_PROFILE_FIELDS = [
  "propertyPurpose",
  "preferredPropertyType",
  "preferredCategory",
  "preferredLocation",
  "minimumBudget",
  "maximumBudget",
  "preferredBedrooms",
  "buyingTimeline",
  "mustHaveAmenities",
  "preferenceEmailNotifications",
];
const BUYER_PROFILE_OPTIONS = {
  propertyPurpose: ["Buy a home", "Rent a home", "Buy land", "Invest in property"],
  preferredPropertyType: ["Residential", "Commercial", "Land"],
  preferredCategory: ["House", "Apartment", "Land", "Commercial property"],
  preferredBedrooms: ["Any", "1+ bedrooms", "2+ bedrooms", "3+ bedrooms", "4+ bedrooms", "5+ bedrooms"],
  buyingTimeline: ["As soon as possible", "Within 3 months", "Within 6 months", "Within 12 months", "Just exploring"],
};
const ALLOWED_AMENITIES = ["Parking", "24-hour security", "Backup power", "Pool", "Garden", "Gym"];
function formatProfile(user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    city: user.city || "",
    country: user.country || "",
    agency: user.agency || "",
    registrationNumber: user.registrationNumber || "",
    specialty: user.specialty || "",
    yearsExperience: user.yearsExperience || "",
    serviceAreas: user.serviceAreas || "",
    bio: user.bio || "",
    profilePhoto: user.profilePhoto || "",
    profilePhotoPublicId: user.profilePhotoPublicId || "",
    showPhone: user.showPhone ?? true,
    emailInquiries: user.emailInquiries ?? true,
    propertyPurpose: user.propertyPurpose || "Buy a home",
    preferredPropertyType: user.preferredPropertyType || "Residential",
    preferredCategory: user.preferredCategory || "House",
    preferredLocation: user.preferredLocation || "",
    minimumBudget: user.minimumBudget ?? "",
    maximumBudget: user.maximumBudget ?? "",
    preferredBedrooms: user.preferredBedrooms || "Any",
    buyingTimeline: user.buyingTimeline || "Within 6 months",
    mustHaveAmenities: user.mustHaveAmenities || [],
    preferenceEmailNotifications: user.preferenceEmailNotifications ?? true,
  };
}

async function getAccountUser(request) {
  const user = await getRequestUser(request);
  if (!user) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (!["agent", "buyer"].includes(user.role)) {
    return { response: NextResponse.json({ error: "Buyer or agent access is required." }, { status: 403 }) };
  }
  return { user };
}

export async function GET(request) {
  try {
    const { user, response } = await getAccountUser(request);
    if (response) return response;
    return NextResponse.json({ profile: formatProfile(user) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Account profile load failed:", error);
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
    const { user, response } = await getAccountUser(request);
    if (response) return response;

    const allowedFields = user.role === "buyer" ? [...PROFILE_FIELDS.slice(0, 6), "profilePhoto", ...BUYER_PROFILE_FIELDS] : PROFILE_FIELDS;
    const profileUpdates = {};
    for (const field of allowedFields) {
      if (body[field] === undefined) continue;
      if (field === "minimumBudget" || field === "maximumBudget") {
        const value = body[field];
        if (value !== "" && (!Number.isSafeInteger(value) || value < 0)) {
          return NextResponse.json({ error: "Budget must be a non-negative whole number." }, { status: 400 });
        }
        profileUpdates[field] = value === "" ? null : value;
        continue;
      }
      if (field === "mustHaveAmenities") {
        if (!Array.isArray(body[field]) || !body[field].every((amenity) => typeof amenity === "string" && ALLOWED_AMENITIES.includes(amenity))) {
          return NextResponse.json({ error: "Choose valid must-have amenities." }, { status: 400 });
        }
        profileUpdates[field] = [...new Set(body[field])];
        continue;
      }
      if (field === "preferenceEmailNotifications" && typeof body[field] === "boolean") {
        profileUpdates[field] = body[field];
        continue;
      }
      if (field === "preferenceEmailNotifications") {
        return NextResponse.json({ error: "Preference email notifications must be enabled or disabled." }, { status: 400 });
      }
      if (typeof body[field] !== "string") {
        return NextResponse.json({ error: `${field} must be text.` }, { status: 400 });
      }
      profileUpdates[field] = body[field].trim();
    }

    if (profileUpdates.firstName !== undefined && !profileUpdates.firstName) {
      return NextResponse.json({ error: "First name is required." }, { status: 400 });
    }
    if (profileUpdates.lastName !== undefined && !profileUpdates.lastName) {
      return NextResponse.json({ error: "Last name is required." }, { status: 400 });
    }
    if (profileUpdates.phone !== undefined && !profileUpdates.phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    if (profileUpdates.email !== undefined) {
      if (!/^\S+@\S+\.\S+$/.test(profileUpdates.email)) {
        return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      }
      profileUpdates.email = profileUpdates.email.toLowerCase();
    }

    const limits = {
      firstName: 100,
      lastName: 100,
      email: 254,
      phone: 40,
      city: 100,
      country: 100,
      agency: 160,
      registrationNumber: 100,
      specialty: 120,
      yearsExperience: 40,
      serviceAreas: 300,
      bio: 1000,
    };
    for (const [field, maximum] of Object.entries(limits)) {
      if (profileUpdates[field] !== undefined && profileUpdates[field].length > maximum) {
        return NextResponse.json({ error: `${field} must be ${maximum} characters or fewer.` }, { status: 400 });
      }
    }

    for (const [field, options] of Object.entries(BUYER_PROFILE_OPTIONS)) {
      if (profileUpdates[field] !== undefined && !options.includes(profileUpdates[field])) {
        return NextResponse.json({ error: `Choose a valid ${field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}.` }, { status: 400 });
      }
    }
    if (profileUpdates.preferredLocation !== undefined && profileUpdates.preferredLocation.length > 160) {
      return NextResponse.json({ error: "Preferred location must be 160 characters or fewer." }, { status: 400 });
    }
    const minimumBudget = profileUpdates.minimumBudget !== undefined ? profileUpdates.minimumBudget : user.minimumBudget;
    const maximumBudget = profileUpdates.maximumBudget !== undefined ? profileUpdates.maximumBudget : user.maximumBudget;
    if (minimumBudget !== null && minimumBudget !== undefined
      && maximumBudget !== null && maximumBudget !== undefined
      && minimumBudget > maximumBudget) {
      return NextResponse.json({ error: "Minimum budget cannot exceed maximum budget." }, { status: 400 });
    }

    if (typeof body.showPhone === "boolean") profileUpdates.showPhone = body.showPhone;
    else if (body.showPhone !== undefined) return NextResponse.json({ error: "Phone visibility must be enabled or disabled." }, { status: 400 });
    if (typeof body.emailInquiries === "boolean") profileUpdates.emailInquiries = body.emailInquiries;
    else if (body.emailInquiries !== undefined) return NextResponse.json({ error: "Email inquiries must be enabled or disabled." }, { status: 400 });

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

    if (profileUpdates.email && profileUpdates.email !== user.email) {
      const existingUser = await User.findOne({ email: profileUpdates.email }).select("_id");
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
    }

    if (profileUpdates.profilePhoto !== undefined) {
      cloudinary = getCloudinary();
      const resolvedPhoto = await resolveProfilePhoto(
        cloudinary,
        user,
        profileUpdates.profilePhoto,
        body.profilePhotoPublicId || user.profilePhotoPublicId || "",
      );
      profileUpdates.profilePhoto = resolvedPhoto.url;
      profileUpdates.profilePhotoPublicId = resolvedPhoto.publicId;
      newlyUploadedPhoto = resolvedPhoto.createdAsset;
    }

    const previousPhotoPublicId = user.profilePhotoPublicId;
    Object.assign(user, profileUpdates);
    await user.save();
    if (previousPhotoPublicId && previousPhotoPublicId !== user.profilePhotoPublicId) {
      try {
        cloudinary ||= getCloudinary();
        await cloudinary.uploader.destroy(previousPhotoPublicId, { resource_type: "image", type: "upload" });
      } catch (cleanupError) {
        console.error("Previous profile photo cleanup failed:", cleanupError);
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
        console.error("New profile photo cleanup failed:", cleanupError);
      }
    }
    if (error.code === "INVALID_PROFILE_PHOTO") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Account profile update failed:", error);
    return NextResponse.json({ error: "Unable to save your profile right now." }, { status: 500 });
  }
}
