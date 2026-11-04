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

export default function HomePage() {
  return (
    <main className="">
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
