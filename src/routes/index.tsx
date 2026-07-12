import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HeartPulse, Shield, Stethoscope, Users, Clock, Award, ArrowRight,
  Sparkles, Home, Brain, Activity, Star, Quote, Phone, Calendar, MessageCircle, CheckCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { BRAND, IMG } from "@/lib/site";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-soft" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl -z-10" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl -z-10" />

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Licensed Personal Care Home · Lawrenceville, GA
            </div>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] text-foreground text-balance">
              Where Every Senior is <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Treated Like Family</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Compassionate 24-hour care rooted in dignity, warmth, and clinical excellence. From daily wellness to memory care, Beauvais Group is a true home away from home.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3.5 text-sm font-semibold text-white shadow-elegant hover:shadow-glow transition">
                <Calendar className="h-4 w-4" /> Book Appointment
              </Link>
              <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-white px-6 py-3.5 text-sm font-semibold text-primary hover:bg-primary/5 transition">
                <Phone className="h-4 w-4" /> {BRAND.phone}
              </a>
              <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-secondary/10 border border-secondary/30 px-6 py-3.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary hover:text-white transition">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { n: "20+", l: "Years Caring" },
                { n: "24/7", l: "On-Site Staff" },
                { n: "100%", l: "Family Trust" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-white/70 backdrop-blur border border-border p-4 text-center shadow-card">
                  <div className="font-display text-2xl font-bold text-primary">{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] gradient-hero opacity-30 blur-3xl" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-elegant border-8 border-white">
              <img src={IMG.caregiver1} alt="Compassionate caregiver with senior" className="h-[520px] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-elegant border border-border max-w-[220px]">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15">
                  <Shield className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">State Licensed</div>
                  <div className="text-sm font-bold text-foreground">Fully Insured</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 rounded-2xl bg-primary p-4 text-white shadow-elegant max-w-[200px]">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <div>
                  <div className="text-xs opacity-80">Available</div>
                  <div className="text-sm font-bold">24 / 7 / 365</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <img src={IMG.senior1} alt="Senior" className="rounded-3xl h-64 w-full object-cover shadow-card" />
              <img src={IMG.hands} alt="Caring hands" className="rounded-3xl h-64 w-full object-cover shadow-card mt-8" />
              <img src={IMG.garden} alt="Garden" className="rounded-3xl h-48 w-full object-cover shadow-card col-span-2" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
              <HeartPulse className="h-4 w-4" /> About Beauvais Group
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
              A residence built on love, respect, and family values.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Beauvais Group & Personal Care Home Inc. is a warm, licensed personal care residence in Lawrenceville, Georgia. Our dedicated team blends professional caregiving with genuine affection to create a place where seniors truly thrive.
            </p>
            <ul className="mt-6 grid gap-3">
              {[
                "Personalized care plans tailored to every resident",
                "Home-cooked meals and enriching daily activities",
                "Registered nurses and trained caregivers on site",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3 text-sm font-semibold text-white shadow-soft">
              Learn More About Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US PREVIEW */}
      <section className="relative bg-surface py-20 md:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
              <Award className="h-4 w-4" /> Why Choose Us
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
              The Beauvais difference is felt in every detail.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Licensed & Insured", desc: "State-licensed personal care home with full compliance." },
              { icon: Users, title: "Family Atmosphere", desc: "Small, intimate setting where staff truly know every resident." },
              { icon: Clock, title: "24/7 Care", desc: "Round-the-clock supervision and support, every day of the year." },
              { icon: Stethoscope, title: "Clinical Excellence", desc: "Nurses and trained caregivers overseeing every care plan." },
            ].map((c) => (
              <div key={c.title} className="group relative rounded-3xl bg-white p-6 shadow-card border border-border hover:shadow-elegant transition">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero shadow-glow">
                  <c.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/about" className="inline-flex items-center gap-2 rounded-full border-2 border-primary/40 bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition">
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Featured Services
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance max-w-2xl">
              Comprehensive care, thoughtfully designed.
            </h2>
          </div>
          <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-deep">
            View All Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { to: "/senior-care", img: IMG.senior2, icon: Home, title: "Senior Care", desc: "24-hour personal care in a warm residential setting." },
            { to: "/adult-day-health-care", img: IMG.dayCare, icon: Activity, title: "Adult Day Health Care", desc: "Structured daytime programs promoting wellness and social connection." },
            { to: "/alzheimers-dementia-care", img: IMG.memory, icon: Brain, title: "Alzheimer's & Dementia", desc: "Specialized memory care with trained staff and safe environments." },
          ].map((s) => (
            <Link to={s.to} key={s.to} className="group relative overflow-hidden rounded-3xl border border-border bg-white shadow-card hover:shadow-elegant transition">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={s.img} alt={s.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 backdrop-blur shadow-soft">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* STATISTICS */}
      <section className="relative overflow-hidden gradient-teal-deep text-white py-20 md:py-24">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, oklch(0.77 0.16 155 / 0.5), transparent 45%), radial-gradient(circle at 70% 80%, oklch(0.78 0.11 220 / 0.5), transparent 50%)" }} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <Star className="h-3.5 w-3.5" /> By the Numbers
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold text-balance">Trusted by families across Georgia</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, n: "500+", l: "Families Served" },
              { icon: Clock, n: "24/7", l: "Care Availability" },
              { icon: Award, n: "20+", l: "Years Experience" },
              { icon: HeartPulse, n: "98%", l: "Family Satisfaction" },
            ].map((s) => (
              <div key={s.l} className="rounded-3xl bg-white/10 backdrop-blur border border-white/15 p-8 text-center hover:bg-white/15 transition">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/25 border border-secondary/40">
                  <s.icon className="h-7 w-7 text-secondary-glow" />
                </div>
                <div className="mt-5 font-display text-5xl font-bold">{s.n}</div>
                <div className="mt-2 text-sm text-white/80">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <Quote className="h-4 w-4" /> Testimonials
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
            Kind words from the families we serve.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { q: "The care and love my mother receives is beyond anything we imagined. The staff feel like extended family.", a: "Denise R.", role: "Daughter of Resident" },
            { q: "Choosing Beauvais was the best decision. Warm, professional, and genuinely caring — every single day.", a: "Marcus L.", role: "Son of Resident" },
            { q: "My father is thriving here. The dementia care team is patient, kind, and truly gifted at what they do.", a: "Sophia N.", role: "Family Member" },
          ].map((t) => (
            <figure key={t.a} className="relative rounded-3xl bg-gradient-to-br from-white to-surface p-8 shadow-card border border-border">
              <Quote className="h-8 w-8 text-primary/30" />
              <blockquote className="mt-3 text-foreground leading-relaxed">"{t.q}"</blockquote>
              <div className="mt-6 flex items-center gap-1 text-secondary">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <figcaption className="mt-4 text-sm">
                <div className="font-bold text-foreground">{t.a}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/testimonials" className="inline-flex items-center gap-2 rounded-full border-2 border-primary/40 bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition">
            View All Testimonials <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">Gallery</div>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance max-w-xl">
                Moments of joy from our home.
              </h2>
            </div>
            <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-deep">
              View All Photos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[IMG.senior3, IMG.activity, IMG.meal, IMG.music, IMG.reading, IMG.garden].map((src, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl shadow-card ${i === 0 ? "row-span-2 md:col-span-1" : ""}`}>
                <img src={src} alt="" className={`w-full object-cover hover:scale-105 transition duration-500 ${i === 0 ? "h-full min-h-[280px]" : "h-40 md:h-48"}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] gradient-hero p-10 md:p-16 shadow-elegant">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white, transparent 40%), radial-gradient(circle at 80% 70%, white, transparent 40%)" }} />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white text-balance">
                Ready to give your loved one the care they deserve?
              </h2>
              <p className="mt-4 text-white/90 max-w-xl">
                Schedule a private tour or speak with our care team today. We're here 24/7.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-primary shadow-soft">
                <Calendar className="h-4 w-4" /> Book an Appointment
              </Link>
              <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/30 px-6 py-4 text-sm font-bold text-white hover:bg-white/25">
                <Phone className="h-4 w-4" /> Call {BRAND.phone}
              </a>
              <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-4 text-sm font-bold text-white shadow-soft">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
