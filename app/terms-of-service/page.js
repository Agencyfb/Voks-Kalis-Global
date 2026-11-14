import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | Voks-Kalis Global",
  description:
    "Review the terms of service for browsing, enquiries, listings, and transactions on the Voks-Kalis Global website.",
};

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "Welcome to Voks Kalis Global Investment Limited. By accessing, browsing or using this website, scheduling inspections, or engaging with our digital real estate services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these Terms, please discontinue use of the Website immediately.",
    ],
  },
  {
    title: "2. Scope of Services",
    content: [
      "The Website provides information regarding real estate listings, property development projects, sales, lettings, property management, and real estate advisory services.",
      "• Informational Purpose Only: All property descriptions, floor plans, architectural renders, dimensions, pricing, and availability displayed on the Website are provided for general informational purposes only and do not constitute a legally binding offer, representation, or warranty.",
      "• Subject to Contract: Any property purchase, lease, or agency engagement is strictly subject to formal written contracts executed by the relevant parties, independent title due diligence, and availability at the time of commitment.",
    ],
  },
  {
    title: "3. Eligibility and User Conduct",
    content: [
      "By using this Website, you represent that you are at least 18 years old and possess the legal capacity to enter into binding contracts under the laws of the Federal Republic of Nigeria. You agree not to:",
      "• Use the Website for any unlawful, fraudulent, or unauthorised purpose.",
      "• Submit false, inaccurate, or misleading information in inquiry forms, tenancy applications, or Know Your Customer (KYC) documentation.",
      "• Scrape, harvest, copy, or extract property listings, images, or contact databases from the Website using automated bots, spiders, or manual methods for commercial resale or competing listings.",
      "• Interfere with, disrupt, or compromise the security, servers, or networks connected to the Website.",
    ],
  },
  {
    title: "4. Property Listings, Pricing, and Third-Party Properties",
    content: [
      "• Accuracy of Listings: While we strive to keep listings accurate and current, properties may be withdrawn, sold, leased, or repriced without prior notice. Visuals, artist impressions, and virtual tours are illustrative and may differ from the completed or physical property.",
      "• Third-Party Listings: Where we act as an agent or marketer for third-party developers, landlords, or property owners, we rely on information supplied by those principals. Users are strongly advised to conduct independent physical inspections and legal/title verification before making financial commitments.",
    ],
  },
  {
    title: "5. Fees, Payments, and Agency Commissions",
    content: [
      "Accessing general information on the Website is free. Any agency commissions, legal and documentation fees, inspection fees, caution deposits, service charges, or purchase prices applicable to a transaction will be communicated in writing prior to commitment and governed by the specific Offer Letter, Agency Agreement, Lease Agreement, or Contract of Sale.",
      "Payments must only be made into official corporate bank accounts designated in writing by Voks Kalis Global Investment Limited; we shall not be liable for funds transferred to unauthorised third parties or personal accounts.",
    ],
  },
  {
    title: "6. Intellectual Property Rights",
    content: [
      "All content on the Website, including text, logos, trademarks, property photographs, drone footage, architectural designs, graphics, layout, and software, is the exclusive property of Voks Kalis Global Investment Limited or its licensors and is protected under Nigerian copyright, trademark, and intellectual property laws.",
      "You may view and print pages solely for personal, non-commercial property evaluation. Any reproduction, modification, distribution, or commercial exploitation without our prior written consent is strictly prohibited.",
    ],
  },
  {
    title: "7. Third-Party Links and Tools",
    content: [
      "The Website may contain links to third-party websites or tools. These links are provided solely for convenience. We do not endorse, control, or assume responsibility for the content, accuracy, or practices of third-party sites.",
    ],
  },
  {
    title: "8. Disclaimer of Warranties",
    content: [
      "The Website and its content are provided on an 'AS IS' and 'AS AVAILABLE' basis without warranties of any kind, whether express or implied. To the fullest extent permitted by law, Voks Kalis Global Investment Limited disclaims all warranties regarding uninterrupted access, error-free functionality, freedom from viruses, or the absolute accuracy and completeness of property listings.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    content: [
      "To the maximum extent permitted under Nigerian law, Voks Kalis Global Investment Limited, its directors, officers, employees, and agents shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with your access to, use of, or inability to use the Website; reliance on any property listing, valuation estimate, or information published on the Website; or unauthorised access to or alteration of your information through the Website.",
    ],
  },
  {
    title: "10. Indemnification",
    content: [
      "You agree to indemnify, defend, and hold harmless Voks Kalis Global Investment Limited, its directors, employees, and affiliates from and against any claims, liabilities, damages, losses, and legal costs arising out of your breach of these Terms, misuse of the Website, or violation of any law or third-party rights.",
    ],
  },
  {
    title: "11. Governing Law and Dispute Resolution",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute, controversy, or claim arising out of or relating to these Terms or the use of the Website shall first be resolved amicably through good-faith negotiation within fourteen (14) days of written notice. If unresolved, the dispute shall be referred to mediation or arbitration in accordance with the Arbitration and Mediation Act 2023, seated in Port Harcourt, Rivers State, Nigeria, before resorting to litigation in a court of competent jurisdiction.",
    ],
  },
  {
    title: "12. Modifications to Terms",
    content: [
      "We reserve the right to amend or update these Terms at any time without prior notice. Revised Terms become effective immediately upon posting on this page. Your continued use of the Website after changes are posted constitutes acceptance of the updated Terms.",
    ],
  },
  {
    title: "13. Contact Information",
    content: [
      "For questions, notices, or inquiries regarding these Terms of Service, please contact us at:",
      "Client Relation +234-8034-802-460",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="bg-[#f8f5f2] text-text-primary">
      <Navbar />

      <section className="bg-white px-5 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-14 lg:px-10 lg:pt-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-copper-dark">
            Terms and conditions
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-[46px]">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-text-secondary">
            Effective Date: 13th November 2026 • Last Updated: 12th November 2026
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-5">
          {TERMS_SECTIONS.map(({ title, content }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E9E2DA] bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-lg font-semibold text-text-primary sm:text-xl">{title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary sm:text-[15px]">
                {content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
