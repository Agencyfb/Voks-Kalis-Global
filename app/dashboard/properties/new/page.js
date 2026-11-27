import PropertyUploadForm from "@/components/PropertyUploadForm";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata = {
  title: "Add a property",
  description: "Create a property listing for Voks-Kalis Global.",
  robots: NO_INDEX_ROBOTS,
};

export default function NewPropertyPage() {
  return <PropertyUploadForm />;
}