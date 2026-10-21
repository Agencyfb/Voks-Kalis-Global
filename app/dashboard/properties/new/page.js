import PropertyUploadForm from "@/components/PropertyUploadForm";

export const metadata = {
  title: "Add a property | Haven",
  description: "Create a property listing for Haven.",
};

export default function NewPropertyPage() {
  return <PropertyUploadForm />;
}