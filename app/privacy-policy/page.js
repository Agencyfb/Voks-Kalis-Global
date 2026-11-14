import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Voks-Kalis Global",
  description:
    "Read Voks-Kalis Global's privacy policy covering data collection, use, rights, cookies, security and contact information.",
};

const PRIVACY_SECTIONS = [
  {
    title: "1. Introduction",
    content: [
      "Voks Kalis Global Investment Limited respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose and safeguard your information when you visit our website, use our services, or engage with us regarding property sales, lettings, acquisitions, or real estate advisory services.",
      "By accessing our website and/or submitting your personal data to us, you acknowledge the practices described in this Privacy Policy. This Policy is drafted in compliance with the Nigeria Data Protection Act 2023 and applicable data protection regulations in force in the Federal Republic of Nigeria.",
    ],
  },
  {
    title: "2. Information We Collect",
    content: [
      "We may collect and process the following categories of personal data:",
      "• Identity and Contact Data: Full name, residential or business address, email address, telephone numbers, date of birth, and nationality.",
      "• Verification and Compliance (KYC) Data: Copies of government-issued identification such as NIN, International Passport, Driver’s Licence, Bank Verification Number (BVN), corporate registration documents, and proof of address where legally required.",
      "• Property and Transaction Data: Property preferences, budget range, inspection records, lease or sale agreements, title verification details, and communication logs.",
      "• Financial Data: Payment records, proof of funds, bank account details for rent remittances, agency fees, or refunds.",
      "• Technical and Usage Data: IP address, browser type, device information, operating system, pages visited, time spent on the site, and referring website addresses collected via cookies and analytics tools.",
    ],
  },
  {
    title: "3. How We Collect Your Data",
    content: [
      "We collect personal data through:",
      "• Direct Interactions: When you fill out contact forms, schedule property inspections, subscribe to property alerts, submit tenancy or purchase applications, or communicate with our agents via phone, email, or WhatsApp.",
      "• Automated Technologies: When you browse our website, we automatically collect technical data using cookies and similar tracking technologies.",
      "• Third Parties: From property portals, legal representatives, mortgage institutions, corporate registries, or verification agencies during due diligence.",
    ],
  },
  {
    title: "4. Purpose and Lawful Basis for Processing",
    content: [
      "We process your personal data only when permitted under the Nigeria Data Protection Act 2023, including:",
      "• Responding to property inquiries and scheduling inspections — Legitimate interest and pre-contractual steps.",
      "• Drafting, executing, and managing sale, lease, or agency agreements — Performance of a contract.",
      "• Conducting Know Your Customer (KYC) and Anti-Money Laundering checks, including SCUML compliance — Legal obligation.",
      "• Sending property listings, market updates, and newsletters — Consent.",
      "• Improving website functionality, security, and user experience — Legitimate interest.",
      "• Resolving disputes, enforcing agreements, and defending legal claims — Legal obligation and legitimate interest.",
    ],
  },
  {
    title: "5. Disclosure and Sharing of Your Information",
    content: [
      "We do not sell or rent your personal data. However, we may share your information with trusted third parties strictly where necessary, including but not limited to:",
      "• Property owners, landlords, and developers, to facilitate inspections, negotiations, and contract execution.",
      "• Professional advisors, such as legal practitioners, estate surveyors, valuers, and auditors involved in your transaction.",
      "• Regulatory and law enforcement bodies where required by law, including the Economic and Financial Crimes Commission, land registries, tax authorities, or courts.",
      "• Service providers such as IT support, cloud hosting providers, CRM software vendors, and payment processors bound by confidentiality obligations.",
    ],
  },
  {
    title: "6. Data Security",
    content: [
      "We implement appropriate technical and organisational measures, including encryption, access controls, secure servers, and staff confidentiality protocols, to protect your personal data against unauthorised access, alteration, disclosure, or destruction.",
      "However, no internet transmission is completely secure, and you transmit data at your own risk.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, including satisfying legal, accounting, tax, or regulatory reporting requirements. Once no longer required, data is securely deleted or anonymised.",
    ],
  },
  {
    title: "8. Cookies and Tracking Technologies",
    id: "cookies",
    content: [
      "Our website uses cookies to distinguish you from other users, remember your property search preferences, and analyse site traffic. You can set your browser to refuse all or some browser cookies; however, disabling cookies may affect certain functionalities of our website.",
      "We may also use analytics and performance tools to improve usability, reliability, and website performance. If you do not wish to receive cookies, you can manage your browser settings or clear existing cookies at any time.",
    ],
  },
  {
    title: "9. Third-Party Links",
    content: [
      "Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites and encourage you to review their privacy policies separately.",
    ],
  },
  {
    title: "10. Contact Details and Data Protection Officer",
    content: [
      "If you have questions about this Privacy Policy, wish to exercise your data rights, or have a privacy complaint, please contact us:",
      "Client Relation +234-8034-802-460",
    ],
  },
  {
    title: "11. Changes to This Privacy Policy",
    content: [
      "We reserve the right to update this Privacy Policy periodically to reflect changes in legal requirements or our business operations. Any updates will be posted on this page with a revised 'Last Updated' date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#f8f5f2] text-text-primary">
      <Navbar />

      <section className="bg-white px-5 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-14 lg:px-10 lg:pt-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-copper-dark">
            Legal information
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-[46px]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-text-secondary">
            Effective Date: 13th November 2026 • Last Updated: 12th November 2026
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-5">
          {PRIVACY_SECTIONS.map(({ title, content, id }) => (
            <article
              key={title}
              id={id}
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
