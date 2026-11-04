import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  House,
  KeyRound,
  MapPin,
  MessageCircle,
  Search,
  Settings2,
  TrendingUp,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const SERVICES = [
  {
    icon: Search,
    title: "Buying",
    body: "VOKS-KALIS GLOBAL INVESTMENT simplifies property investment. Our expert agents leverage their extensive network to guide you through the buying process, ensuring you find the perfect home.",
  },
  {
    icon: House,
    title: "Selling",
    body: "Trust our skilled agents to seamlessly and profitably sell your property. We effectively market your property, attract qualified buyers, and negotiate the best possible deal.",
  },
  {
    icon: Settings2,
    title: "Property Management / Consultancy",
    body: "Maximize your property investments with our comprehensive management services. We handle maintenance, tenant relations, and financial management, so you can enjoy the benefits of ownership without the daily burdens.",
  },
  {
    icon: Building2,
    title: "Development",
    body: "VOKS-KALIS GLOBAL INVESTMENT develops properties that enhance community value and aesthetics. Our team uses industry expertise and innovative designs to create high-quality, sustainable properties.",
  },
];

const WHATSAPP_CONTACT = "https://wa.me/2348063880053";

const MARKETPLACES = [
  {
    title: "Lands",
    subtitle: "Explore Available Landed Properties",
    image: "photo-1500382017468-9049fed747ef",
  },
  {
    title: "Buildings",
    subtitle: "Explore Available Houses",
    image: "photo-1600596542815-ffad4c1539a9",
  },
  {
    title: "Shortlets",
    subtitle: "Explore Available Shortlets",
    image: "photo-1600210492486-724fe5c67fb0",
  },
  {
    title: "Rentals",
    subtitle: "Explore Available Houses for Rent",
    image: "photo-1486406146926-c627a92ad1ab",
  },
];

const INSIGHTS = [
  {
    slug: "sustainable-living-urban-cities",
    category: "TRENDS",
    title: "The Future of Sustainable Living in Urban Cities",
    description: "How modern architecture is shifting towards eco-friendly materials and smart home technology.",
    image: "photo-1600607687939-ce8a6c25118c",
  },
  {
    slug: "first-time-homebuyer-guide",
    category: "GUIDES",
    title: "A Beginner's Guide to Buying Your First Home",
    description: "Everything you need to know before making the biggest investment of your life.",
    image: "photo-1600566753086-00f18fb6b3ea",
  },
  {
    slug: "q3-property-market-report",
    category: "MARKET",
    title: "Q3 Market Report: What to Consider When Comparing Properties",
    description: "A practical framework for weighing location, condition and long-term suitability in a changing market.",
    image: "photo-1486406146926-c627a92ad1ab",
  },
];

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-copper-dark">
      {children}
    </p>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="bg-white px-5 py-14 sm:px-8 lg:min-h-[768px] lg:px-10 lg:pb-[72px] lg:pt-[88px]">
      <div className="mx-auto grid max-w-[1046px] gap-10 lg:grid-cols-[385px_437px] lg:justify-between lg:gap-0 lg:pr-[26px]">
        <div>
          <h2 className="max-w-[360px] pl-[10px] text-[28px] font-semibold leading-[1.14] text-[#252525]">
            Your Trusted Property
            <br />
            Platform
          </h2>
          <div className="mt-12 grid max-w-[385px] grid-cols-2 gap-[14px]">
            {[
              ["30+", "Satisfied Customer"],
              ["5k+", "Award winning"],
              ["07+", "Years of Experience"],
              ["33+", "Projects Delivered"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`flex min-h-[148px] flex-col justify-center rounded-[20px] px-[22px] py-4 ${
                  index === 1
                    ? "bg-[#A85B0B] text-white"
                    : "bg-[#F0EEF7] text-[#292929]"
                }`}
              >
                <p className="text-[36px] font-semibold leading-none">{value}</p>
                <p className={`mt-4 text-[14px] leading-5 ${index === 1 ? "text-white/90" : "text-[#292929]"}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-0 lg:pt-[31px]">
          <p className="mb-[31px] max-w-[420px] pl-2 text-[16px] leading-[24px] text-[#909090]">
            Find Your Property, we&apos;ve put together Verified Properties and
            easier for acquisition
          </p>
          <div className="relative h-[390px] w-full sm:h-[477px]">
            <img
              src="/trust-city-growth.png"
              alt="City skyline with property investment growth"
              className="absolute left-0 top-0 h-[136px] w-full rounded-[20px] object-cover object-center shadow-[0_8px_18px_rgba(63,83,190,.22)] sm:h-[164px]"
            />
            <img
              src="/trust-resort.png"
              alt="Guests relaxing at a resort"
              className="absolute left-0 top-[150px] h-[140px] w-[45%] rounded-[20px] object-cover object-[center_68%] shadow-[0_8px_18px_rgba(63,83,190,.22)] sm:top-[181px] sm:h-[166px] sm:w-[198px]"
            />
            <img
              src="/trust-surveyors.png"
              alt="Surveyors measuring a plot of land"
              className="absolute right-0 top-[150px] h-[230px] w-[52%] rounded-[20px] object-cover object-center shadow-[0_8px_18px_rgba(63,83,190,.22)] sm:top-[181px] sm:h-[295px] sm:w-[226px]"
            />
            <div className="absolute left-[46%] top-[115px] z-10 flex h-[92px] w-[92px] -translate-x-1/2 items-center justify-center rounded-full bg-[#252525] text-white shadow-md sm:left-[46%] sm:top-[147px]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <path id="trust-badge-ring" d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0" />
                </defs>
                <text fill="white" fontSize="6.1" letterSpacing=".45">
                  <textPath href="#trust-badge-ring" startOffset="4%">
                    Simplified Luxury. Your Real Estate Partner You Can Trust.
                  </textPath>
                </text>
              </svg>
              <TrendingUp size={19} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className="bg-[#F2F2F2] px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-text-primary">
            Our Services
          </p>
          <h2 className="mx-auto mt-5 max-w-5xl text-xl font-medium leading-relaxed text-text-primary sm:text-2xl">
            We offer a range of integrated real estate services designed to meet your needs.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {SERVICES.map(({ icon: Icon, title, body }) => (
            <ScrollReveal key={title} className="h-full">
              <article className="group h-full min-h-[280px] rounded-[28px] bg-white px-6 py-8 text-center shadow-[0_12px_24px_rgba(0,0,0,.035)] transition duration-300 hover:-translate-y-2 sm:hover:bg-brand-copper-dark sm:hover:shadow-[0_20px_40px_rgba(0,0,0,.12)] sm:px-7">
                <span className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#D28A3D] text-white shadow-[0_12px_22px_rgba(42,73,182,.22)] transition duration-300 group-hover:scale-110 group-hover:rotate-3 sm:group-hover:bg-white sm:group-hover:text-brand-copper-dark">
                  <Icon size={30} strokeWidth={1.8} />
                </span>
                <h3 className="mt-7 text-base font-medium leading-tight text-text-primary transition-colors sm:group-hover:text-white">
                  {title}
                </h3>
                <p className="mt-3 text-xs leading-[1.5] text-[#888888] transition-colors sm:group-hover:text-white/85">{body}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VisionSection() {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="flex min-h-[300px] items-center justify-center sm:min-h-[390px]">
          <img
            src="/vision-property.png"
            alt="Property consultant presenting a home for sale"
            className="max-h-[390px] w-full object-contain"
          />
        </div>
        <div className="max-w-xl">
          <article>
            <p className="text-2xl font-normal text-[#D28A3D]">Vision</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-[#10283A] sm:text-3xl">
              We make property trade easy and Secured
            </h2>
          </article>
          <article className="mt-8">
            <p className="text-2xl font-normal text-[#D28A3D]">Mission</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
              To provide a seamless and secure platform that simplifies property trading for every client.
            </h2>
          </article>
          <a
            href={WHATSAPP_CONTACT}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1 rounded border border-brand-copper px-3 py-2 text-sm font-semibold text-brand-copper-dark transition-colors hover:bg-brand-copper-subtle"
          >
            Message Us <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function MarketplaceSection() {
  return (
    <section id="marketplace" className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
      <ScrollReveal className="mx-auto max-w-7xl">
        <div className="grid items-end gap-3 sm:grid-cols-2 sm:gap-8">
          <div>
            <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">Marketplace</h2>
            <a href="/marketplace" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-copper">
              Explore <ArrowRight size={15} />
            </a>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-[#999999] sm:text-xl">
            Discover your Perfect Property in our Marketplace
          </p>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 sm:gap-7">
          {MARKETPLACES.map((item) => (
            <a
              key={item.title}
              href="/marketplace"
              className="group relative aspect-[1.21/1] overflow-hidden rounded-[16px] bg-surface-subtle"
            >
              <img
                src={`https://images.unsplash.com/${item.image}?w=1000&q=85`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-[9%] left-[10%] flex min-h-[100px] w-[68%] items-start justify-between bg-white/90 px-5 py-4 backdrop-blur-[2px] sm:px-5">
                <span className="pr-2">
                  <span className="block text-[20px] font-semibold leading-6 text-text-primary">{item.title}</span>
                  <span className="mt-2 block text-[12px] leading-[18px] text-[#888888]">{item.subtitle}</span>
                </span>
                <span className="mt-1 shrink-0 text-brand-copper-dark">
                  <MapPin size={16} strokeWidth={1.8} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

export function SellerCallout() {
  return (
    <section id="list" className="bg-white px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="mx-auto flex max-w-5xl items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#FAFAFA] via-[#F5FAFD] to-[#EFF8FD] px-6 py-6 sm:px-10 lg:px-12">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-xl font-semibold text-[#10283A] sm:text-2xl">Have a property to sell?</h2>
          <p className="mt-1 text-xs text-[#52606A] sm:text-sm">
            List your property in just few clicks &amp; connect with clients faster!
          </p>
          <a
            href="/login"
            className="mt-5 inline-flex items-center gap-1 rounded-sm bg-brand-copper-dark px-3 py-2 text-xs font-semibold text-white hover:bg-brand-copper"
          >
            Sell Your Property <ArrowRight size={13} />
          </a>
        </div>
        <img
          src="/seller-property.png"
          alt="A family meeting at a home for sale"
          className="ml-4 hidden h-[155px] w-[210px] object-contain sm:block"
        />
      </div>
    </section>
  );
}

export function ConsultantSection() {
  return (
    <section className="bg-white px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
      <ScrollReveal className="mx-auto max-w-[1300px]">
      <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,542px)_minmax(0,1fr)] xl:gap-[212px]">
        <div className="group relative mx-auto w-full max-w-[542px] xl:mx-0">
          <img
            src="/consultant-building.png"
            alt="Modern glass building used by the property consultancy"
            className="aspect-[.92/1] w-full rounded-sm object-cover"
          />
          <div className="absolute bottom-0 right-0 w-[66%] bg-[#242424] px-4 py-5 text-center text-white shadow-xl transition duration-500 group-hover:-translate-y-3 sm:group-hover:bg-brand-copper-dark sm:bottom-[20%] sm:right-[-8%] sm:w-[58%] sm:px-6 sm:py-6 xl:bottom-auto xl:right-[-157px] xl:top-[22%] xl:h-[341px] xl:w-[315px] xl:px-8 xl:py-9">
            <img
              src="/Geraldine.png"
              alt=""
              className="mx-auto h-16 w-16 rounded-full border-4 border-white object-cover xl:h-[150px] xl:w-[150px]"
            />
            <p className="mt-3 text-sm font-semibold xl:mt-6 xl:text-lg">Iwarri Geraldine</p>
            <p className="mt-2 text-[10px] leading-relaxed text-white/70 xl:mt-5 xl:text-[13px] xl:leading-[21px]">
              More than 5 years of experience in the Real estate Market and has
              worked with more than a 100+ Clients
            </p>
          </div>
        </div>

        <div className="xl:pl-1">
          <h2 className="text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
            Meet and talk with our best consultants
          </h2>
          <p className="mt-7 text-xs font-semibold text-[#BEBEBE]">
            Do You Have Any Questions? Get Help From Us.
          </p>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[#BEBEBE]">
            All our teams are professional and competent in their fields and
            will help you realize your dream building with the excellent result.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <a
              href={WHATSAPP_CONTACT}
              target="_blank"
              rel="noreferrer"
              aria-label="Message us on WhatsApp"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand-copper-dark px-5 py-3 text-xs font-semibold text-white shadow-md hover:bg-brand-copper"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Message Us
            </a>
            <a href="/contact" className="rounded-sm bg-[#292929] px-5 py-3 text-center text-xs font-semibold text-white hover:bg-black">
              Contact Us
            </a>
          </div>
        </div>
      </div>
      </ScrollReveal>
    </section>
  );
}

export function InsightsSection() {
  return (
    <section id="insights" className="bg-white px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-7xl rounded-2xl bg-[#F5F9FC] px-4 py-8 sm:px-7 sm:py-10 lg:px-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#10283A] sm:text-3xl">Latest Insights</h2>
          <p className="mx-auto mt-2 max-w-lg text-xs text-[#999999]">
            Stay updated with the latest trends, market analysis, and expert advice in
            <br className="hidden sm:block" /> the real estate industry.
          </p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {INSIGHTS.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-xl bg-white p-3 shadow-[0_6px_18px_rgba(24,48,68,.06)]">
              <img
                src={`https://images.unsplash.com/${item.image}?w=800&q=80`}
                alt=""
                className="h-[145px] w-full rounded-lg object-cover"
              />
              <div className="px-1 pb-2 pt-3">
                <p className="text-[9px] font-semibold text-brand-copper-dark">{item.category}</p>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-[#10283A]">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-[#888888]">{item.description}</p>
                <a href={`/blog/${item.slug}`} className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-500">
                  Read Article <ArrowDownRight size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <a href="/blog" className="mx-auto mt-7 flex w-fit items-center gap-2 text-xs font-semibold text-[#10283A]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#7B8790]">
            <ArrowUpRight size={16} />
          </span>
          View All Articles
        </a>
      </div>
    </section>
  );
}
