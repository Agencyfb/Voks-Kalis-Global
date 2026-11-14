import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

const FOOTER_GROUPS = [
  {
    title: "Company",
    links: [
      ["About us", "/about"],
      ["Services", "/services"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Marketplace", "/marketplace"],
      ["List a property", "/login"],
      ["Blog", "/blog"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "/privacy-policy"],
      ["Terms of service", "/terms-of-service"],
    ],
  },
];

export default function Footer() {
  const socialLinks = [
    { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61553402184259" },
    { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/vokskalis/" },
    { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/100426279/voks-kalisgloballimited" },
  ];

  return (
    <footer className="bg-[#242424] text-white/75">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <a href="/" aria-label="Voks-Kalis Global home">
              <img
                src="/voks-kalis-logo.png"
                alt="Voks-Kalis Global"
                className="h-12 w-[170px] object-contain brightness-0 invert"
              />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              VOKS-KALIS GLOBAL INVESTMENT is a leading real estate platform
              dedicated to providing seamless property trading experiences
              for buyers, sellers, and renters.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/75 transition-colors hover:bg-brand-copper hover:text-white"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-xs text-white/60">
              <a href="mailto:vokskalisglobal@gmail.com" className="block transition-colors hover:text-white">vokskalisglobal@gmail.com</a>
              <a href="tel:+2348063880053" className="block transition-colors hover:text-white">+234 806 388 0053</a>
              <a href="https://wa.me/2348063880053" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                <MessageCircle size={14} aria-hidden="true" />
                Chat with us on WhatsApp
              </a>
            </div>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3 text-sm">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition-colors hover:text-white">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} VOKS-KALIS GLOBAL INVESTMENT. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-white">Terms of Service</a>
            <a href="/privacy-policy#cookies" className="hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
