import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone, Calendar, MessageCircle, HeartPulse } from "lucide-react";
import { BRAND, NAV } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

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

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group min-w-0">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl gradient-hero opacity-90 blur-md group-hover:opacity-100 transition" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero shadow-soft">
              <HeartPulse className="h-7 w-7 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg sm:text-xl font-bold leading-tight text-foreground truncate">
              Beauvais Group
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-primary-deep font-semibold truncate">
              & Personal Care Home Inc.
            </div>
          </div>
        </Link>

        {/* Desktop nav - single line */}
        <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-lg text-foreground/75 hover:text-primary hover:bg-primary/5 transition-colors"
              activeProps={{ className: "px-3 py-2 rounded-lg text-primary bg-primary/10 font-semibold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <a href={BRAND.whatsapp} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2.5 text-sm font-semibold text-secondary-foreground border border-secondary/30 hover:bg-secondary hover:text-white transition">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a href={BRAND.phoneHref}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition">
            <Phone className="h-4 w-4" /> Call
          </a>
          <Link to="/contact"
            className="inline-flex items-center gap-2 rounded-full gradient-hero px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
            <Calendar className="h-4 w-4" /> Book Appointment
          </Link>
        </div>

        <button
          className="xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="xl:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary"
                activeProps={{ className: "block rounded-lg px-3 py-3 text-sm font-semibold text-primary bg-primary/10" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="grid grid-cols-1 gap-2 pt-3">
              <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-white">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
              <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-4 py-3 text-sm font-semibold text-primary">
                <Phone className="h-4 w-4" /> Call {BRAND.phone}
              </a>
              <Link to="/contact" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-full gradient-hero px-4 py-3 text-sm font-semibold text-white">
                <Calendar className="h-4 w-4" /> Book Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
