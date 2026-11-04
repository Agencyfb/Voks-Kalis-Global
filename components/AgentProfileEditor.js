"use client";

import { useEffect, useRef, useState } from "react";
import { uploadFileToCloudinary } from "@/lib/cloudinaryUpload";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
} from "lucide-react";

const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  country: "Nigeria",
  agency: "",
  registrationNumber: "",
  specialty: "",
  yearsExperience: "",
  serviceAreas: "",
  bio: "",
  profilePhoto: "",
  profilePhotoPublicId: "",
  showPhone: true,
  emailInquiries: true,
};

const inputClass = "mt-1.5 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-[10px] text-[#444] outline-none transition focus:border-[#A15912] focus:ring-1 focus:ring-[#A15912]/15";
const labelClass = "block text-[9px] font-medium text-[#555]";

function getInitials(profile) {
  return `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "A";
}

export default function AgentProfileEditor({ agentName }) {
  const photoInput = useRef(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [originalProfile, setOriginalProfile] = useState(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [activeSection, setActiveSection] = useState("personal");
  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || agentName;

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const response = await fetch("/api/account/profile");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Unable to load your profile.");
        if (active) {
          setProfile({ ...EMPTY_PROFILE, ...result.profile });
          setOriginalProfile({ ...EMPTY_PROFILE, ...result.profile });
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadProfile();
    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setProfile((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setNotice("");
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setPhotoError("");
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPhotoError("Choose a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Profile photos must be no larger than 5 MB.");
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const photo = await uploadFileToCloudinary(file, "profile-photo");
      setProfile((current) => ({
        ...current,
        profilePhoto: photo.url,
        profilePhotoPublicId: photo.publicId,
      }));
      setNotice("");
    } catch (photoReadError) {
      setPhotoError(photoReadError.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to save your profile.");
      const savedProfile = { ...EMPTY_PROFILE, ...result.profile };
      setProfile(savedProfile);
      setOriginalProfile(savedProfile);
      setNotice("Your profile changes have been saved.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSavingPassword(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to change your password.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordFormOpen(false);
      setNotice("Your password has been changed.");
    } catch (passwordError) {
      setError(passwordError.message);
    } finally {
      setIsSavingPassword(false);
    }
  }

  function cancelChanges() {
    setProfile(originalProfile);
    setError("");
    setNotice("");
    setPhotoError("");
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#242424]">
      <header className="sticky top-0 z-20 h-[62px] border-b border-[#E5E5E5] bg-white">
        <div className="flex h-full items-center justify-between px-4 sm:px-7 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <a href="/" className="flex shrink-0 items-center" aria-label="Voks-Kalis Global home">
              <img src="/voks-kalis-logo.png" alt="Voks-Kalis Global" className="h-9 w-auto max-w-[150px] object-contain" />
            </a>
            <div className="hidden border-l border-[#E5E5E5] pl-5 text-xs text-[#777] sm:block">Workspace <span className="px-1 text-[#B5B5B5]">/</span> Account settings</div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#666] sm:gap-5">
            <span className="hidden sm:block">Lagos, Nigeria · NGN</span>
            <button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full text-[#555] hover:bg-[#F5F5F5]"><Bell size={17} /></button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] text-xs font-semibold text-[#A15912]">{getInitials(profile)[0]}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-62px)] max-w-[1600px] lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#E5E5E5] bg-white lg:flex lg:flex-col lg:px-3 lg:py-5">
          <p className="rounded-md bg-[#F5F5F5] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B7565]">Agent workspace</p>
          <nav aria-label="Agent dashboard navigation" className="mt-4 grid gap-1">
            <a href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><Home size={16} /> Overview</a>
            <a href="/dashboard#properties" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><Building2 size={16} /> My listings</a>
            <a href="/dashboard#inquiries" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><MessageSquare size={16} /> Inquiries</a>
            <a href="/dashboard#viewings" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><CalendarDays size={16} /> Viewings</a>
            <a href="/dashboard#performance" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#555] hover:bg-[#F7F7F7]"><BarChart3 size={16} /> Performance</a>
          </nav>
          <div className="mt-auto grid gap-1 border-t border-[#EAEAEA] pt-4">
            <a href="/dashboard/profile" aria-current="page" className="flex items-center gap-3 rounded-md bg-[#FBF2E9] px-3 py-2.5 text-xs font-semibold text-[#A15912]"><Settings size={16} /> Edit profile</a>
            <a href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><HelpCircle size={16} /> Help center</a>
            <a href="/login" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#666] hover:bg-[#F7F7F7]"><LogOut size={16} /> Sign out</a>
            <div className="mt-2 flex items-center gap-2 border-t border-[#EAEAEA] px-2 pt-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF2E9] text-xs font-semibold text-[#A15912]">{getInitials(profile)[0]}</span>
              <div className="min-w-0"><p className="truncate text-[11px] font-medium text-[#333]">{displayName}</p><p className="text-[10px] text-[#888]">Agent account</p></div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mb-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A15912]">Account / Edit profile</p>
            <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-[#242424] sm:text-[30px]">Your profile, {profile.firstName || agentName.split(" ")[0]}</h1>
            <p className="mt-1 text-xs text-[#777]">Make a confident first impression. Keep your professional profile current.</p>
          </div>

          {error && <p role="alert" className="mb-3 rounded border border-[#EBCBCB] bg-[#FCEDED] px-3 py-2.5 text-xs text-[#9A3434]">{error}</p>}
          {notice && <p role="status" className="mb-3 rounded border border-[#CDE4D3] bg-[#EAF5EE] px-3 py-2.5 text-xs text-[#246B4D]">{notice}</p>}

          {isLoading ? (
            <div className="rounded-lg border border-[#E3E3E3] bg-white p-8 text-center text-sm text-[#777]">Loading your profile...</div>
          ) : (
            <form onSubmit={saveProfile}>
              <div className="grid items-start gap-3 xl:grid-cols-[210px_minmax(0,1fr)]">
                <div className="grid gap-3">
                  <section className="rounded-lg border border-[#E3E3E3] bg-white p-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#FBF2E9] font-display text-xl font-semibold text-[#A15912]">
                      {profile.profilePhoto
                        ? <img src={profile.profilePhoto} alt={`${displayName} profile`} className="h-full w-full object-cover" />
                        : getInitials(profile)}
                    </div>
                    <p className="mt-2.5 text-xs font-semibold text-[#333]">{displayName}</p>
                    <p className="mt-1 text-[9px] text-[#888]">Verified property agent</p>
                    <input ref={photoInput} type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="hidden" />
                    <button type="button" onClick={() => photoInput.current?.click()} disabled={isUploadingPhoto} className="mt-3 inline-flex items-center gap-1.5 rounded border border-[#E5E5E5] px-2.5 py-1.5 text-[9px] font-medium text-[#8A4B0B] hover:bg-[#FBF2E9] disabled:opacity-50"><Camera size={11} /> {isUploadingPhoto ? "Uploading..." : "Change photo"}</button>
                    <p className="mt-1 text-[8px] text-[#999]">JPG or PNG · Max 5 MB</p>
                    {isUploadingPhoto && <p role="status" className="mt-1 text-[9px] text-[#777]">Uploading securely to Cloudinary...</p>}
                    {photoError && <p role="alert" className="mt-2 text-[9px] text-[#A64A4A]">{photoError}</p>}
                  </section>

                  <section className="rounded-lg border border-[#E3E3E3] bg-white p-3.5">
                    <h2 className="px-1 text-xs font-semibold text-[#292929]">Account settings</h2>
                    <nav className="mt-2 grid gap-1" aria-label="Profile sections">
                      {[
                        ["personal", "Personal information"],
                        ["professional", "Professional details"],
                        ["security", "Security & privacy"],
                      ].map(([id, label]) => (
                        <a key={id} href={`#${id}`} onClick={() => setActiveSection(id)} className={`rounded px-2.5 py-2 text-[9px] ${activeSection === id ? "bg-[#FBF2E9] font-medium text-[#8A4B0B]" : "text-[#666] hover:bg-[#F7F7F7]"}`}>{label}</a>
                      ))}
                    </nav>
                    <p className="mt-3 px-1 text-[8px] leading-relaxed text-[#999]">Manage the details that help Voks work better for you.</p>
                  </section>
                </div>

                <div className="grid min-w-0 gap-3">
                  <section id="personal" className="scroll-mt-20 rounded-lg border border-[#E3E3E3] bg-white p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-[#292929]">Personal information</h2>
                    <p className="mt-1 text-[9px] text-[#777]">Keep your contact details up to date. Your email is used for account notifications.</p>
                    <div className="mt-3 grid gap-x-3 gap-y-2.5 sm:grid-cols-2">
                      <label className={labelClass}>First name *
                        <input required name="firstName" value={profile.firstName} onChange={updateField} maxLength={100} className={inputClass} />
                      </label>
                      <label className={labelClass}>Last name *
                        <input required name="lastName" value={profile.lastName} onChange={updateField} maxLength={100} className={inputClass} />
                      </label>
                      <label className={labelClass}>Email address *
                        <input required type="email" name="email" value={profile.email} onChange={updateField} maxLength={254} className={inputClass} />
                      </label>
                      <label className={labelClass}>Phone number *
                        <input required type="tel" name="phone" value={profile.phone} onChange={updateField} maxLength={40} className={inputClass} />
                      </label>
                      <label className={labelClass}>City
                        <input name="city" value={profile.city} onChange={updateField} maxLength={100} placeholder="e.g. Lagos" className={inputClass} />
                      </label>
                      <label className={`${labelClass} relative`}>Country
                        <select name="country" value={profile.country} onChange={updateField} className={`${inputClass} appearance-none pr-8`}>
                          <option value="">Select a country</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown size={13} className="pointer-events-none absolute bottom-3 right-3 text-[#888]" />
                      </label>
                    </div>
                  </section>

                  <section id="professional" className="scroll-mt-20 rounded-lg border border-[#E3E3E3] bg-white p-4 sm:p-5">
                    <h2 className="text-xs font-semibold text-[#292929]">Professional details</h2>
                    <div className="mt-3 grid gap-x-3 gap-y-2.5 sm:grid-cols-2">
                      <label className={labelClass}>Agency / company
                        <input name="agency" value={profile.agency} onChange={updateField} maxLength={160} placeholder="Agency name" className={inputClass} />
                      </label>
                      <label className={labelClass}>Registration number
                        <input name="registrationNumber" value={profile.registrationNumber} onChange={updateField} maxLength={100} placeholder="Professional registration" className={inputClass} />
                      </label>
                      <label className={labelClass}>Specialty
                        <select name="specialty" value={profile.specialty} onChange={updateField} className={`${inputClass} appearance-none`}>
                          <option value="">Select a specialty</option>
                          <option value="Luxury residential sales">Luxury residential sales</option>
                          <option value="Residential sales">Residential sales</option>
                          <option value="Commercial property">Commercial property</option>
                          <option value="Land and development">Land and development</option>
                          <option value="Property management">Property management</option>
                          <option value="Rentals and leasing">Rentals and leasing</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                      <label className={labelClass}>Years of experience
                        <select name="yearsExperience" value={profile.yearsExperience} onChange={updateField} className={`${inputClass} appearance-none`}>
                          <option value="">Select experience</option>
                          <option value="Less than 1 year">Less than 1 year</option>
                          <option value="1 year">1 year</option>
                          <option value="2 years">2 years</option>
                          <option value="3 years">3 years</option>
                          <option value="4 years">4 years</option>
                          <option value="5 years">5 years</option>
                          <option value="6 years">6 years</option>
                          <option value="7 years">7 years</option>
                          <option value="8 years">8 years</option>
                          <option value="9 years">9 years</option>
                          <option value="10+ years">10+ years</option>
                        </select>
                      </label>
                      <label className={`${labelClass} sm:col-span-2`}>Service areas
                        <input name="serviceAreas" value={profile.serviceAreas} onChange={updateField} maxLength={300} placeholder="e.g. Ikoyi, Lekki Phase 1, Victoria Island" className={inputClass} />
                      </label>
                      <label className={`${labelClass} sm:col-span-2`}>Professional bio
                        <textarea name="bio" value={profile.bio} onChange={updateField} maxLength={1000} rows={4} placeholder="Introduce your experience, expertise and approach..." className={`${inputClass} resize-y`} />
                        <span className="mt-1 block text-right text-[8px] text-[#999]">{profile.bio.length}/1000</span>
                      </label>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label className="flex items-start gap-2 text-[9px] text-[#555]"><input type="checkbox" name="showPhone" checked={profile.showPhone} onChange={updateField} className="mt-0.5 h-3 w-3 accent-[#A15912]" />Show phone on my listings</label>
                      <label className="flex items-start gap-2 text-[9px] text-[#555]"><input type="checkbox" name="emailInquiries" checked={profile.emailInquiries} onChange={updateField} className="mt-0.5 h-3 w-3 accent-[#A15912]" />Email me new inquiries</label>
                    </div>
                    <p className="mt-3 text-[8px] text-[#999]">Your name, photo, biography and professional details appear on your public agent profile.</p>
                  </section>

                  <section id="security" className="scroll-mt-20 rounded-lg border border-[#E3E3E3] bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xs font-semibold text-[#292929]">Security &amp; privacy</h2>
                        <p className="mt-2 text-[9px] text-[#555]">Password</p>
                        <p className="mt-0.5 text-[8px] text-[#999]">Keep your account secure with a strong password.</p>
                      </div>
                      <button type="button" onClick={() => { setIsPasswordFormOpen((current) => !current); setError(""); }} disabled={isSavingPassword} className="rounded border border-[#E5E5E5] px-2.5 py-1.5 text-[9px] font-medium text-[#8A4B0B] hover:bg-[#FBF2E9] disabled:opacity-50">{isPasswordFormOpen ? "Cancel" : "Change password"}</button>
                    </div>
                    {isPasswordFormOpen && (
                      <form onSubmit={changePassword} className="mt-4 grid gap-2.5 border-t border-[#ECECEC] pt-3 sm:grid-cols-3">
                        <label className={labelClass}>Current password
                          <input required type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} />
                        </label>
                        <label className={labelClass}>New password
                          <input required type="password" autoComplete="new-password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} className={inputClass} />
                        </label>
                        <label className={labelClass}>Confirm new password
                          <input required type="password" autoComplete="new-password" value={passwords.confirmPassword} onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))} className={inputClass} />
                        </label>
                        <p className="text-[8px] text-[#999] sm:col-span-3">Use at least 8 characters, including one uppercase letter and one number.</p>
                        <button type="submit" disabled={isSavingPassword} className="inline-flex items-center justify-center gap-1.5 rounded bg-[#A15912] px-3 py-2 text-[9px] font-semibold text-white hover:bg-[#78400B] disabled:opacity-50 sm:col-span-3"><ShieldCheck size={12} />{isSavingPassword ? "Updating..." : "Update password"}</button>
                      </form>
                    )}
                    <p className="mt-3 border-t border-[#ECECEC] pt-2.5 text-[8px] leading-relaxed text-[#999]">Your email and phone are used for work-related updates. Never share your password with clients or other agents.</p>
                  </section>

                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                    <p className="text-[8px] text-[#888]">* Required fields · Changes are not yet saved</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={cancelChanges} disabled={isSaving} className="rounded border border-[#E5E5E5] bg-white px-3 py-2 text-[9px] font-medium text-[#555] hover:bg-[#F7F7F7] disabled:opacity-50">Cancel</button>
                      <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 rounded bg-[#A15912] px-3 py-2 text-[9px] font-semibold text-white hover:bg-[#78400B] disabled:opacity-50"><Check size={12} />{isSaving ? "Saving..." : "Save changes"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
