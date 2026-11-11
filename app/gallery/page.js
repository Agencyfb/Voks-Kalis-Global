import GalleryBrowser from "@/components/GalleryBrowser";

export const metadata = {
  title: "Gallery | Voks-Kalis Global",
  description: "See the clients we have served and projects delivered by Voks-Kalis Global.",
};

export default function GalleryPage({ searchParams }) {
  const category = ["clients", "projects"].includes(searchParams?.category)
    ? searchParams.category
    : "";
  return <GalleryBrowser initialCategory={category} />;
}
