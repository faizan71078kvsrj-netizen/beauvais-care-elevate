import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone, Calendar, MessageCircle, HeartPulse } from "lucide-react";
import { BRAND, NAV } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer is open + close on Escape
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = original || "";
      };
    }
    document.body.style.overflow = original || "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="hidden gradient-teal-deep text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2"><HeartPulse className="h-3.5 w-3.5 text-secondary-glow" />{BRAND.hours} · Compassionate 24-Hour Care</span>
          </div>
          <div className="flex items-center gap-5">
            <a href={BRAND.phoneHref} className="hover:text-secondary-glow transition">Office {BRAND.phone}</a>
            <a href={BRAND.cellHref} className="hover:text-secondary-glow transition">Cell {BRAND.cell}</a>
            <a href={`mailto:${BRAND.email}`} className="hover:text-secondary-glow transition">{BRAND.email}</a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 group min-w-0">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl gradient-hero opacity-90 blur-md group-hover:opacity-100 transition" />
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl gradient-hero shadow-soft">
              <HeartPulse className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="font-display text-base lg:text-lg xl:text-xl font-bold leading-tight text-foreground whitespace-nowrap">
              Beauvais Group
            </div>
            <div className="text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary-deep font-semibold whitespace-nowrap">
              & Personal Care Home
            </div>
          </div>
        </Link>

        <nav className="hidden 2xl:flex items-center justify-center gap-0.5 text-sm font-medium">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-2.5 py-2 rounded-lg text-foreground/75 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap"
              activeProps={{ className: "px-2.5 py-2 rounded-lg text-primary bg-primary/10 font-semibold whitespace-nowrap" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="2xl:hidden" aria-hidden />

        <div className="flex items-center gap-2 justify-end shrink-0">
          <a
            href={BRAND.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp us"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white transition
                       h-10 w-10 xl:h-auto xl:w-auto xl:px-4 xl:py-2.5 justify-center text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden xl:inline">WhatsApp</span>
          </a>
          <a
            href={BRAND.phoneHref}
            aria-label="Call us"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition
                       h-10 w-10 xl:h-auto xl:w-auto xl:px-4 xl:py-2.5 justify-center text-sm font-semibold"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden xl:inline">Call</span>
          </a>
          <Link
            to="/contact"
            className="hidden sm:inline-flex items-center gap-2 rounded-full gradient-hero px-4 lg:px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition whitespace-nowrap"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden lg:inline">Book Appointment</span>
            <span className="lg:hidden">Book</span>
          </Link>

          <button
            className="2xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-foreground shrink-0 hover:bg-primary/5 transition"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Right-side Drawer */}
      <div
        className={`fixed inset-0 z-[9999] 2xl:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        {/* Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={`absolute right-0 top-0 h-full w-80 max-w-[88%] overflow-y-auto overscroll-contain border-l border-border bg-background shadow-elegant transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/95 backdrop-blur px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero">
                <HeartPulse className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="font-display font-bold text-foreground">Menu</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground hover:bg-primary/5 hover:text-primary transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-4 py-4 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary whitespace-nowrap"
                activeProps={{
                  className:
                    "block rounded-lg px-3 py-3 text-sm font-semibold text-primary bg-primary/10 whitespace-nowrap",
                }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}

            <div className="grid grid-cols-1 gap-2 pt-4">
              <a
                href={BRAND.whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
              <a
                href={BRAND.phoneHref}
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition"
              >
                <Phone className="h-4 w-4" />
                Call {BRAND.phone}
              </a>
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full gradient-hero px-4 py-3 text-sm font-semibold text-white shadow-soft"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </header>
  );
}
