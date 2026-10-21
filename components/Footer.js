import { Home, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-forest-dark text-cream/80">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-forest-dark">
                <Home size={18} strokeWidth={2} />
              </span>
              <span className="font-display text-xl font-medium text-cream">
                Haven
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/55">
              Estates, land, shortlets and commercial property across Lagos —
              inspected before it's ever listed.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest2 text-cream/50">
              Browse
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#estates" className="hover:text-cream">Estates</a></li>
              <li><a href="#land" className="hover:text-cream">Land</a></li>
              <li><a href="#shortlets" className="hover:text-cream">Shortlets</a></li>
              <li><a href="#commercial" className="hover:text-cream">Commercial</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest2 text-cream/50">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#list" className="hover:text-cream">List a property</a></li>
              <li><a href="#" className="hover:text-cream">About Haven</a></li>
              <li><a href="#" className="hover:text-cream">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest2 text-cream/50">
              Talk to us
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-gold" /> +234 800 123 4567
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-gold" /> hello@haven.ng
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-gold" /> Victoria Island, Lagos
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-6 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Haven Estates. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-cream/80">Privacy</a>
            <a href="#" className="hover:text-cream/80">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
