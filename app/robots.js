import { getBaseUrl } from "@/lib/seo";

export default function robots() {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/login",
          "/register",
          "/forgot-password",
          "/otp",
          "/confirm-otp",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
