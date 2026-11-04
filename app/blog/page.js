import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogJournal from "@/components/BlogJournal";

export const metadata = {
  title: "The Voks Journal | Voks-Kalis Global",
  description: "Practical property guides, market perspectives and thoughtful ideas from Voks-Kalis Global.",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <BlogJournal />
      <Footer />
    </>
  );
}
