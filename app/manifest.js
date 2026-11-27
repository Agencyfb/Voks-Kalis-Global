import { SITE_INFO } from "@/lib/seo";

export default function manifest() {
  return {
    name: SITE_INFO.legalName,
    short_name: SITE_INFO.name,
    description: SITE_INFO.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#CB843F",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
