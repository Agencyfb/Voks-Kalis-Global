import { Poppins } from "next/font/google";
import SectionRevealProvider from "@/components/SectionRevealProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Voks-Kalis Global | Real Estate",
  description:
    "Your trusted partner for residential and commercial real estate, property management and development.",
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
