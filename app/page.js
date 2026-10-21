import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProperties from "@/components/FeaturedProperties";
import CategorySection from "@/components/CategorySection";
import TrustBand from "@/components/TrustBand";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProperties />

      <CategorySection
        id="estates"
        eyebrow="Move-in ready"
        title="Estates"
        description="Gated developments and standalone homes across Lagos, inspected before listing."
      />

      <CategorySection
        id="land"
        eyebrow="Build or hold"
        title="Land"
        description="Titled plots with verified survey and registry documents."
        tint
      />

      <CategorySection
        id="shortlets"
        eyebrow="By the night"
        title="Shortlets"
        description="Furnished apartments for business trips, weekends and relocations."
      />

      <CategorySection
        id="commercial"
        eyebrow="For business"
        title="Commercial"
        description="Offices, retail units and warehouse space in active trade corridors."
        tint
      />

      <TrustBand />
      <Footer />
    </main>
  );
}
