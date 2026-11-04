import { ArrowRight, ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Contact Us | Voks-Kalis Global",
  description:
    "Contact Voks-Kalis Global for property buying, selling, management, consultancy and development enquiries.",
};

const SUPPORT_OPTIONS = [
  {
    title: "Buying & inspections",
    description:
      "Share a listing or location. The property team can help you shortlist and request a Tuesday viewing.",
  },
  {
    title: "Selling a property",
    description:
      "Tell us about your property and timeline to begin a conversation about marketing and buyer enquiries.",
  },
  {
    title: "Management & development",
    description:
      "Describe your property or project so the consultancy, management or development team can understand the brief.",
  },
];

const FAQS = [
  {
    question: "How do I request a property inspection?",
    answer:
      "Choose a property in the Marketplace, open its details and request a Tuesday inspection. Our agent will confirm the time and meeting arrangements.",
  },
  {
    question: "Can I enquire before choosing a property?",
    answer:
      "Yes. Select Buying and tell us your preferred area, budget and priorities. The team can help you identify a practical next step.",
  },
  {
    question: "Can I discuss an existing property or a project?",
    answer:
      "Choose Selling, Property Management / Consultancy or Development in the form and include a short overview. We’ll route your enquiry to the relevant team.",
  },
];

export default function ContactPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-white px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:px-10 lg:pb-12 lg:pt-12">
        <ScrollReveal className="contact-scroll-reveal mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-copper-dark">
                Contact us
              </p>
              <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-[42px]">
                Let&apos;s make your next move clearer.
              </h1>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-text-secondary md:justify-self-end md:text-sm">
              Tell us where you are in your property journey. We&apos;ll help you
              find the right conversation.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section className="bg-white px-5 pb-12 sm:px-8 sm:pb-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-start gap-7 lg:grid-cols-[minmax(260px,.72fr)_minmax(0,1.28fr)] lg:gap-9">
          <ScrollReveal className="contact-scroll-reveal">
            <aside>
              <img
                src="/contact-building.jpg"
                alt="Voks-Kalis residential property in a landscaped setting"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <h2 className="mt-5 font-display text-lg font-semibold leading-snug text-text-primary">
                A real conversation, built around you.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                Share your goal and a little context. Choose the service that
                fits best so your enquiry reaches the right team.
              </p>

              <div className="mt-5 rounded-lg bg-[#F8F8F8] p-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  Contact information
                </h3>
                <div className="mt-4 space-y-4 text-xs">
                  <a
                    href="mailto:vokskalisglobal@gmail.com"
                    className="flex items-center justify-between gap-3 text-text-primary hover:text-brand-copper-dark"
                  >
                    <span className="flex items-center gap-2">
                      <Mail size={14} aria-hidden="true" />
                      Email
                    </span>
                    <span className="break-all text-right text-text-secondary">
                      vokskalisglobal@gmail.com
                    </span>
                  </a>
                  <a
                    href="tel:+2348063880053"
                    className="flex items-center justify-between gap-3 text-text-primary hover:text-brand-copper-dark"
                  >
                    <span className="flex items-center gap-2">
                      <Phone size={14} aria-hidden="true" />
                      Phone
                    </span>
                    <span className="text-text-secondary">
                      +234 806 388 0053
                    </span>
                  </a>
                  <a
                    href="https://wa.me/2348063880053"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 text-text-primary hover:text-brand-copper-dark"
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle size={14} aria-hidden="true" />
                      Chat with our Team
                    </span>
                    <span className="text-text-secondary">
                      +234 806 388 0053
                    </span>
                  </a>
                </div>
              </div>
            </aside>
          </ScrollReveal>

          <ScrollReveal className="contact-scroll-reveal">
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-[#FBF2E9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <ScrollReveal className="contact-scroll-reveal mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            The right support for your enquiry.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {SUPPORT_OPTIONS.map(({ title, description }) => (
              <article
                key={title}
                className="rounded-lg border border-[#E8E4DF] bg-white p-5"
              >
                <h3 className="text-sm font-semibold text-text-primary">
                  {title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="bg-white px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
        <ScrollReveal className="contact-scroll-reveal mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
                Have a home in mind?
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-text-primary">
                See the property before you decide.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                Open a property&apos;s details and choose “Book an inspection”.
                Tuesdays are our inspection days; the team will confirm
                availability.
              </p>
            </div>
            <a
              href="/marketplace"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md bg-brand-copper-dark px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-copper sm:self-auto"
            >
              Explore properties <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </ScrollReveal>
      </section>

      <section className="bg-[#F8F8F8] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.65fr_1.35fr] md:gap-12">
          <ScrollReveal className="contact-scroll-reveal">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
                Your questions, answered
              </p>
              <h2 className="mt-3 max-w-xs font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
                A little clarity, before you begin.
              </h2>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-text-secondary">
                Have a different question? Send an enquiry and we&apos;ll help
                you find the right next step.
              </p>
            </div>
          </ScrollReveal>
          <div>
            {FAQS.map(({ question, answer }, index) => (
              <ScrollReveal
                key={question}
                className="contact-scroll-reveal"
              >
                <details
                  open={index === 0}
                  className="border-b border-[#DDDDDD] py-4 first:pt-0"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-text-primary marker:text-brand-copper-dark">
                    {question}
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                    {answer}
                  </p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <ScrollReveal className="contact-scroll-reveal">
        <Footer />
      </ScrollReveal>
    </main>
  );
}
