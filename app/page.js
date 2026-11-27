import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import {
  AboutSection,
  ServicesSection,
  VisionSection,
  MarketplaceSection,
  SellerCallout,
  ConsultantSection,
  InsightsSection,
} from "@/components/HomeSections";
import Footer from "@/components/Footer";
import VideoCom from "@/components/VideoCom";
import Testimonials from "@/components/Testimonials";
import JsonLd from "@/components/JsonLd";
import {
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildWebSiteJsonLd,
  SITE_INFO,
} from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: {
    absolute: "Voks-Kalis Global | Buy, Sell & Manage Real Estate in Port Harcourt & Nigeria",
  },
  description:
    "Discover verified houses, titled land, commercial spaces, rentals, and shortlets in Port Harcourt, Rivers State, and across Nigeria. Trusted real estate advisory for local and diaspora buyers.",
  path: "/",
  keywords: SITE_INFO.keywords,
});

export default function HomePage() {
  return (
    <main className="">
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <Navbar />
           <Hero />
           <Categories />
           <AboutSection />
           <ServicesSection />
          <VideoCom />
          <VisionSection />
          <MarketplaceSection />
           <SellerCallout />
           <ConsultantSection />
           <Testimonials />
           <InsightsSection />
           <Footer />

    </main>
  );
}
