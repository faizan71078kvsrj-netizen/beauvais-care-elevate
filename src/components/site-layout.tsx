import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  variant = "gradient",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  variant?: "gradient" | "image" | "split" | "minimal";
}) {
  if (variant === "image" && image) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img src={image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          {eyebrow && <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-widest backdrop-blur">{eyebrow}</div>}
          <h1 className="mt-6 max-w-3xl text-4xl md:text-6xl font-bold text-white text-balance">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/85">{subtitle}</p>}
        </div>
      </section>
    );
  }
  if (variant === "split" && image) {
    return (
      <section className="relative overflow-hidden gradient-soft">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            {eyebrow && <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">{eyebrow}</div>}
            <h1 className="mt-5 text-4xl md:text-5xl font-bold text-foreground text-balance">{title}</h1>
            {subtitle && <p className="mt-5 text-lg text-muted-foreground max-w-xl">{subtitle}</p>}
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl gradient-hero opacity-20 blur-2xl" />
            <img src={image} alt="" className="relative rounded-3xl shadow-elegant w-full h-[420px] object-cover" />
          </div>
        </div>
      </section>
    );
  }
  if (variant === "minimal") {
    return (
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 text-center">
          {eyebrow && <div className="text-xs font-semibold text-primary uppercase tracking-widest">{eyebrow}</div>}
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground text-balance">{title}</h1>
          {subtitle && <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      </section>
    );
  }
  return (
    <section className="relative isolate overflow-hidden gradient-teal-deep text-white">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, oklch(0.77 0.16 155 / 0.4), transparent 45%), radial-gradient(circle at 80% 60%, oklch(0.78 0.11 220 / 0.5), transparent 50%)" }} />
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-28 text-center">
        {eyebrow && <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">{eyebrow}</div>}
        <h1 className="mt-5 text-4xl md:text-6xl font-bold text-balance max-w-4xl mx-auto">{title}</h1>
        {subtitle && <p className="mt-5 text-lg text-white/85 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
