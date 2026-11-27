import { Poppins } from "next/font/google";
import SectionRevealProvider from "@/components/SectionRevealProvider";
import { absoluteUrl, getSiteUrl, SITE_INFO } from "@/lib/seo";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: `${SITE_INFO.name} | Real Estate in Port Harcourt & Nigeria`,
    template: `%s | ${SITE_INFO.name}`,
  },
  description: SITE_INFO.description,
  keywords: SITE_INFO.keywords,
  applicationName: SITE_INFO.name,
  authors: [{ name: SITE_INFO.legalName }],
  creator: SITE_INFO.legalName,
  publisher: SITE_INFO.legalName,
  category: "Real Estate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: `${SITE_INFO.name} | Real Estate in Port Harcourt & Nigeria`,
    description: SITE_INFO.description,
    url: "/",
    siteName: SITE_INFO.name,
    locale: SITE_INFO.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl(SITE_INFO.defaultOgImage),
        alt: SITE_INFO.defaultOgAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_INFO.name} | Real Estate in Port Harcourt & Nigeria`,
    description: SITE_INFO.description,
    images: [absoluteUrl(SITE_INFO.defaultOgImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-body antialiased">
        <SectionRevealProvider>{children}</SectionRevealProvider>
      </body>
    </html>
  );
}
