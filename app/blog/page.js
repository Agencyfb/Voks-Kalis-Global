import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogJournal from "@/components/BlogJournal";
import { getPublishedBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Voks Journal | Voks-Kalis Global",
  description: "Practical property guides, market perspectives and thoughtful ideas from Voks-Kalis Global.",
};

export default async function BlogPage() {
  const articles = await getPublishedBlogPosts();
  return (
    <>
      <Navbar />
      <BlogJournal articles={articles} />
      <Footer />
    </>
  );
}
