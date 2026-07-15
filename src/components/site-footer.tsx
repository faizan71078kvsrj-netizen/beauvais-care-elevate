import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/site";
import logoAsset from "@/assets/beauvais-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden gradient-teal-deep text-white">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 20% 10%, oklch(0.77 0.16 155 / 0.5), transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.78 0.11 220 / 0.4), transparent 50%)" }} />
      <div className="relative mx-auto max-w-7xl px-6 pt-14 pb-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="Beauvais Group logo"
               className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto shrink-0 select-none"
                draggable={false}
              />
              <div>
                <div className="font-display text-lg font-bold leading-tight">Beauvais Group</div>
                <div className="text-[10px] tracking-widest uppercase text-white/70">Personal Care Home</div>
              </div>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">
              Compassionate, dignified, round-the-clock care for seniors and adults in Lawrenceville, GA. Where every resident is family.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/15 hover:bg-secondary hover:border-secondary transition">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-5">Our Services</h4>
            <ul className="space-y-3 text-sm text-white/80">
              {[
                { to: "/senior-care", label: "Senior Care" },
                { to: "/adult-day-health-care", label: "Adult Day Health Care" },
                { to: "/alzheimers-dementia-care", label: "Alzheimer's & Dementia Care" },
                { to: "/services", label: "All Services" },
                { to: "/activities", label: "Activities & Wellness" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="inline-flex items-center gap-2 hover:text-secondary-glow transition">
                    <ArrowRight className="h-3 w-3" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/80">
              {[
                { to: "/about", label: "About Us" },
                { to: "/gallery", label: "Photo Gallery" },
                { to: "/videos", label: "Videos" },
                { to: "/testimonials", label: "Testimonials" },
                { to: "/faq", label: "FAQ" },
                { to: "/contact", label: "Contact & Appointments" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="inline-flex items-center gap-2 hover:text-secondary-glow transition">
                    <ArrowRight className="h-3 w-3" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-5">Get in Touch</h4>
            <ul className="space-y-4 text-sm text-white/85">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary-glow shrink-0" />
                <a href={`https://maps.google.com/?q=${BRAND.mapsQuery}`} target="_blank" rel="noreferrer" className="hover:text-white">{BRAND.address}</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-secondary-glow shrink-0" />
                <div>
                  <a href={BRAND.phoneHref} className="block hover:text-white">Office: {BRAND.phone}</a>
                  <a href={BRAND.cellHref} className="block hover:text-white">Cell: {BRAND.cell}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-secondary-glow shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-white break-all">{BRAND.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-secondary-glow shrink-0" />
                <span>{BRAND.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-white/15 flex flex-col items-center gap-1.5 text-xs text-white/60 text-center">
          <p>Licensed Personal Care Home · Lawrenceville, GA</p>
          <p>© {new Date().getFullYear()} Beauvais Group & Personal Care Home Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
