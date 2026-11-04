import { ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Real Estate Services | Voks-Kalis Global",
  description:
    "Explore Voks-Kalis Global services for buying, selling, property management, consultancy and development.",
};

const SERVICES = [
  {
    id: "buying",
    eyebrow: "A home that fits your life",
    title: "Buying",
    image: "/service-buying.png",
    imageAlt: "Property buyers shaking hands in front of modern homes",
    description:
      "Our agents guide you through the buying process, helping you explore options and find a home that reflects your needs.",
    steps: [
      "Shortlist around your location, budget and priorities.",
      "Arrange an inspection and ask the practical questions.",
      "Discuss offers and the next steps for due diligence.",
    ],
    action: "Explore Properties for sale",
    href: "/marketplace",
  },
  {
    id: "selling",
    eyebrow: "Give your property a clear next chapter",
    title: "Selling",
    image: "/service-selling.jpg",
    imageAlt: "Business partners reviewing a property investment plan",
    description:
      "We help present and market your property, attract qualified buyers and support negotiations with prospective purchasers.",
    steps: [
      "Start with a conversation about the property and your goals.",
      "Build a clear listing and coordinate buyer enquiries.",
      "Plan viewings and discuss offers with agent support.",
    ],
    action: "Discuss selling your property",
    href: "/contact",
  },
  {
    id: "management",
    eyebrow: "Look after the property. Plan for the future.",
    title: "Property Management / Consultancy",
    image: "/service-management.png",
    imageAlt: "Property consultants reviewing plans with a client",
    description:
      "Support for the responsibilities of ownership, with attention to maintenance, tenant relations and financial management.",
    steps: [
      "Coordinate maintenance needs and day-to-day property matters.",
      "Support communication between owners and tenants.",
      "Discuss reporting needs and a management scope that suits you.",
    ],
    action: "Talk about property management",
    href: "/contact",
  },
  {
    id: "development",
    eyebrow: "Thoughtful places. Lasting community value.",
    title: "Development",
    image: "/service-development.png",
    imageAlt: "A real estate professional and builder meeting at a construction site",
    description:
      "Our development approach brings industry expertise and innovative design to high-quality, sustainable properties that enhance community value and aesthetics.",
    steps: [
      "Discuss your site, vision and intended use.",
      "Explore design priorities, sustainability and everyday function.",
      "Define the project brief and practical next steps with the team.",
    ],
    action: "Discuss a development project",
    href: "/contact",
  },
];

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Understand the brief",
    description:
      "Tell us about your property, priorities and timeline. We start with what matters to you.",
  },
  {
    number: "02",
    title: "Agree the approach",
    description:
      "We discuss the relevant service, information needed and proposed scope before moving forward.",
  },
  {
    number: "03",
    title: "Take the next step",
    description:
      "Arrange a viewing, prepare a listing, define a management plan or develop a project brief.",
  },
];

export default function ServicesPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-white px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:px-10 lg:pb-12 lg:pt-12">
        <ScrollReveal className="service-scroll-reveal mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-copper-dark">
                Our services
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-[42px]">
                One property journey. Support at every step.
              </h1>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-text-secondary md:pb-1 md:text-sm">
              Integrated real estate services, designed around the way you buy,
              sell, own and create.
            </p>
          </div>

          <nav
            aria-label="Our services"
            className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
          >
            {SERVICES.map(({ id, title }, index) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex min-h-11 items-center gap-2 rounded-md bg-[#FBF2E9] px-3 py-2 text-[11px] font-medium text-text-primary transition-colors hover:bg-[#F3E2D2]"
              >
                <span className="text-[9px] text-brand-copper-dark">
                  0{index + 1}
                </span>
                <span>{title}</span>
                <span className="ml-auto text-brand-copper-dark" aria-hidden="true">
                  ↓
                </span>
              </a>
            ))}
          </nav>
        </ScrollReveal>
      </section>

      {SERVICES.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`scroll-mt-24 ${index % 2 === 0 ? "bg-white" : "bg-[#F8F8F8]"}`}
        >
          <ScrollReveal className="service-scroll-reveal mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-14">
              <img
                src={service.image}
                alt={service.imageAlt}
                className={`aspect-[4/3] w-full rounded-lg object-cover ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              />
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-copper-dark">
                  {service.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
                  {service.title}
                </h2>
                <p className="mt-4 text-xs leading-relaxed text-text-secondary sm:text-sm">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {service.steps.map((step) => (
                    <li
                      key={step}
                      className="flex gap-2 text-xs leading-relaxed text-text-secondary"
                    >
                      <Check
                        size={14}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-copper-dark"
                      />
                      {step}
                    </li>
                  ))}
                </ul>
                <a
                  href={service.href}
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand-copper-dark px-4 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-copper"
                >
                  {service.action} <ArrowRight size={13} aria-hidden="true" />
                </a>
              </div>
            </div>
          </ScrollReveal>
        </section>
      ))}

      <section className="bg-white px-5 py-11 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <ScrollReveal className="service-scroll-reveal mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
            How we work with you
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
            From a first conversation to a practical plan.
          </h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-3 sm:gap-5">
            {JOURNEY_STEPS.map(({ number, title, description }) => (
              <article
                key={number}
                className="border-t border-[#E8E4DF] pt-4"
              >
                <p className="font-display text-3xl font-semibold text-brand-copper">
                  {number}
                </p>
                <h3 className="mt-3 text-sm font-semibold text-text-primary">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-[10px] leading-relaxed text-text-secondary">
            Service scope, fees and timelines are discussed with the team and
            agreed separately. Legal, title and financial checks should be
            completed with appropriate advisers.
          </p>
        </ScrollReveal>
      </section>

      <section className="bg-[#FBF2E9] px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
        <ScrollReveal className="service-scroll-reveal mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
                Your property journey
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text-primary">
                A property goal in mind? Let&apos;s start there.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                Tell us what you have in mind. We&apos;ll help you choose the
                right service and a practical next step.
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md bg-brand-copper-dark px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-copper sm:self-auto"
            >
              Request a consultation <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </ScrollReveal>
      </section>

      <ScrollReveal className="service-scroll-reveal">
        <Footer />
      </ScrollReveal>
    </main>
  );
}
