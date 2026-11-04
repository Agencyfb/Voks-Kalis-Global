import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us | Voks-Kalis Global Investment Limited",
  description:
    "Learn about Voks-Kalis Global Investment Limited and our thoughtful approach to real estate.",
};

const CLIENTS = [
  {
    title: "Buyers & renters",
    description:
      "Explore your options, compare spaces and prepare for viewings around the way you want to live.",
  },
  {
    title: "Sellers & owners",
    description:
      "Find support with presenting a property, connecting with prospective buyers and ongoing management.",
  },
  {
    title: "Investors & developers",
    description:
      "Discuss property goals, ownership responsibilities and development ideas with a practical perspective.",
  },
];

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Tell us your goals",
    description:
      "Share your needs, preferred location, budget and the support you are looking for.",
  },
  {
    number: "02",
    title: "Explore with guidance",
    description:
      "Shortlist properties, arrange inspections or agree a service brief with the team.",
  },
  {
    number: "03",
    title: "Move ahead thoughtfully",
    description:
      "Discuss terms, arrange appropriate document checks and agree the next steps before committing.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-white px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-2 lg:gap-16">
          <div className="py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-copper-dark">
              About Voks-Kalis Global Investment
            </p>
            <h1 className="mt-5 max-w-xl font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-[46px]">
              Property is personal. So is our approach.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
              We bring people, places and practical guidance together — helping
              you take your next property step with greater clarity.
            </p>
            <a
              href="/services"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-brand-copper px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-copper-dark"
            >
              Explore our services <ArrowRight size={15} aria-hidden="true" />
            </a>
            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.12em] text-brand-copper-dark">
              Your real estate partner
            </p>
          </div>
          <img
            src="/about-building.jpg"
            alt="Contemporary residential property in a landscaped setting"
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        </div>
      </section>

      <section className="border-t border-[#EEEEEE] bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[.65fr_1fr] lg:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
              Who we are
            </p>
            <h2 className="mt-3 max-w-xs font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
              Making property trade feel more human.
            </h2>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-text-secondary sm:text-sm">
            <p className="text-text-primary">
              VOKS-KALIS GLOBAL INVESTMENT is a leading real estate platform
              dedicated to providing seamless property trading experiences for
              buyers, sellers, and renters.
            </p>
            <p>
              The company was formed to provide real estate solutions, helping
              buyers and sellers have smooth and seamless transactions across
              the globe.
            </p>
            <p>
              Over the years, we’ve remained committed to contributing to
              economic growth and development while improving individuals and
              corporate organizations through real estate investment and
              management services.
            </p>
            <p>
              We connect clients with guidance across buying, selling, property
              management, consultancy and development.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#FBF2E9] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 md:gap-8">
          <article className="rounded-lg bg-white p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
              Our vision
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-text-primary">
              To make property trade easy and secured.
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">
              A simple ambition that keeps the client’s experience at the centre
              of our work.
            </p>
          </article>
          <article className="p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
              Our mission
            </p>
            <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-text-primary">
              To provide a seamless and secure platform that simplifies
              property trading for every client.
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">
              Through clear communication and practical support, we help
              clients understand the next step in their journey.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
            Different goals. One personal approach.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
              Here for your kind of next chapter.
            </h2>
            <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
              Whether you are looking for a home or planning the future of a
              property, we start by understanding you.
            </p>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {CLIENTS.map(({ title, description }) => (
              <article
                key={title}
                className="rounded-lg border border-[#E8E4DF] p-5 transition-colors hover:border-brand-copper"
              >
                <h3 className="text-base font-semibold text-text-primary">
                  {title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                  {description}
                </p>
                <a
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-brand-copper-dark hover:text-brand-copper"
                >
                  Start a conversation <ArrowRight size={13} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F8F8] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <img
            src="/about-consultation.png"
            alt="A real estate consultant discussing plans with clients"
            className="aspect-square w-full rounded-lg object-cover"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
              What guides our service
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
              Good property decisions begin with listening.
            </h2>
            <div className="mt-6 space-y-5">
              <article>
                <h3 className="text-sm font-semibold text-text-primary">
                  Clarity at each step
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  We explain the process, surface questions early and keep the
                  next action clear.
                </p>
              </article>
              <article>
                <h3 className="text-sm font-semibold text-text-primary">
                  Care for the individual
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  We listen to your priorities, your timeline and the practical
                  details of your search.
                </p>
              </article>
              <article>
                <h3 className="text-sm font-semibold text-text-primary">
                  Thoughtful stewardship
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  From maintenance to development, we consider how a property
                  serves people over time.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
            Support that follows your journey
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
            Not just a listing. A way forward.
          </h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-3 sm:gap-5">
            {JOURNEY_STEPS.map(({ number, title, description }) => (
              <article key={number} className="border-t border-[#E8E4DF] pt-4">
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
        </div>
      </section>

      <section className="bg-[#FBF2E9] px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-copper-dark">
              Your property journey
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-text-primary">
              Your next chapter starts with a conversation.
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Tell us what you have in mind. We’ll help you choose the right
              service and a practical next step.
            </p>
          </div>
          <a
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-brand-copper px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-copper-dark"
          >
            Contact the Voks team <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
