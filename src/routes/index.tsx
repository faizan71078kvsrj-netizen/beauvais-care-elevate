import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HeartPulse, Shield, Stethoscope, Users, Clock, Award, ArrowRight,
  Sparkles, Home, Brain, Activity, Star, Quote, Phone, Calendar, MessageCircle, CheckCircle2,
  ClipboardList, UserCheck, HeartHandshake, PhoneCall, MapPin, CreditCard, Mail, Search,
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

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center">
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
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
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
      <section className="relative bg-surface py-12 md:py-20 overflow-hidden">
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
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
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
      <section className="relative overflow-hidden gradient-teal-deep text-white py-12 md:py-20">
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
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
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
      <section className="bg-surface py-12 md:py-20">
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

      {/* OUR CARE PROCESS */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <ClipboardList className="h-4 w-4" /> Our Care Process
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
            A thoughtful path to the right care.
          </h2>
          <p className="mt-4 text-muted-foreground">
            From first call to move-in day, we walk with your family every step of the way.
          </p>
        </div>

        <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", icon: PhoneCall, title: "Discovery Call", desc: "A relaxed conversation to understand your loved one's needs and answer your questions." },
            { n: "02", icon: Search, title: "In-Home Assessment", desc: "Our nurse reviews health history, mobility, and preferences to craft the right plan." },
            { n: "03", icon: ClipboardList, title: "Personalized Care Plan", desc: "We design a customized daily routine covering medical, social, and emotional care." },
            { n: "04", icon: HeartHandshake, title: "Warm Welcome", desc: "Move-in support, family orientation, and continuous check-ins from day one." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-3xl bg-white border border-border p-7 shadow-card hover:shadow-elegant transition">
              <div className="absolute -top-4 left-7 rounded-full gradient-hero px-3 py-1 text-xs font-bold text-white shadow-soft">Step {s.n}</div>
              <div className="mt-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CARE PLANS */}
      <section className="bg-surface py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Care Plans
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
              Flexible plans that fit every family.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Choose the level of support that feels right today — adjust anytime as needs change.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Companion Care",
                tagline: "Social & daily-living support",
                features: ["Meal preparation & light housekeeping", "Companionship & conversation", "Errands & appointment reminders", "Wellness check-ins"],
              },
              {
                name: "Personal Care",
                tagline: "Hands-on daily assistance",
                features: ["Bathing, dressing & grooming", "Mobility & transfer assistance", "Medication reminders", "Nutritious home-cooked meals"],
                featured: true,
              },
              {
                name: "Memory & 24/7 Care",
                tagline: "Specialized round-the-clock",
                features: ["Alzheimer's & dementia support", "Overnight & awake caregivers", "Secure, calming environment", "Registered nurse oversight"],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border p-8 shadow-card transition hover:shadow-elegant ${
                  p.featured ? "bg-gradient-to-br from-primary to-secondary text-white border-transparent scale-100 md:scale-105" : "bg-white border-border"
                }`}
              >
                {p.featured && (
                  <div className="absolute -top-3 right-6 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-primary shadow-soft uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className={`text-xs font-semibold uppercase tracking-widest ${p.featured ? "text-white/80" : "text-primary"}`}>
                  {p.tagline}
                </div>
                <h3 className={`mt-2 font-display text-2xl font-bold ${p.featured ? "text-white" : "text-foreground"}`}>{p.name}</h3>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${p.featured ? "text-white/95" : "text-foreground"}`}>
                      <CheckCircle2 className={`h-5 w-5 mt-0.5 shrink-0 ${p.featured ? "text-white" : "text-secondary"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                    p.featured
                      ? "bg-white text-primary hover:shadow-glow"
                      : "border-2 border-primary/40 text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  Discuss This Plan <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEET OUR CAREGIVERS */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
              <UserCheck className="h-4 w-4" /> Meet Our Caregivers
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
              A team that leads with heart.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Every caregiver on our team is background-checked, licensed where required, and trained in dementia care, CPR, and person-centered support. But what sets them apart is something you can't teach — genuine warmth.
            </p>
            <ul className="mt-6 grid gap-3">
              {[
                "Certified Nursing Assistants (CNA) on staff",
                "Registered Nurse (RN) clinical oversight",
                "Ongoing training in specialized memory care",
                "Low resident-to-caregiver ratios",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { img: IMG.nurse, name: "Registered Nurses", role: "Clinical Oversight" },
              { img: IMG.caregiver2, name: "Certified Caregivers", role: "Daily Personal Care" },
              { img: IMG.doctor, name: "Visiting Physicians", role: "On-Call Medical Support" },
              { img: IMG.therapy, name: "Wellness Team", role: "Therapy & Activities" },
            ].map((m, i) => (
              <div key={m.name} className={`group relative overflow-hidden rounded-3xl shadow-card border border-border ${i % 2 === 1 ? "mt-8" : ""}`}>
                <img src={m.img} alt={m.name} className="h-52 w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4">
                  <div className="text-white font-bold text-sm">{m.name}</div>
                  <div className="text-white/85 text-xs">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="relative overflow-hidden bg-surface py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
                <MapPin className="h-4 w-4" /> Service Areas
              </div>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
                Serving families across Gwinnett County.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Based in Lawrenceville, we welcome residents and families from the neighboring communities right around our home.
              </p>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "Lawrenceville", "Dacula", "Grayson",
                  "Snellville", "Lilburn", "Duluth",
                  "Suwanee", "Sugar Hill", "Buford",
                  "Loganville", "Auburn", "Bethlehem",
                ].map((city) => (
                  <div key={city} className="flex items-center gap-2 rounded-xl bg-white border border-border px-3 py-2.5 text-sm font-medium text-foreground shadow-card min-w-0">
                    <MapPin className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">{city}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Not sure if we cover your neighborhood? <Link to="/contact" className="text-primary font-semibold hover:underline">Give us a call</Link> — we often can.
              </p>
            </div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-elegant border-8 border-white h-[440px]">
              <iframe
                title="Service area map"
                src={`https://www.google.com/maps?q=${BRAND.mapsQuery}&z=10&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* INSURANCE & PAYMENT */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <CreditCard className="h-4 w-4" /> Insurance & Payment
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
            Simple, transparent payment options.
          </h2>
          <p className="mt-4 text-muted-foreground">
            We work with families to make quality care accessible and stress-free.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Shield, title: "Long-Term Care Insurance", desc: "We accept most major long-term care insurance policies and assist with claim filing." },
            { icon: HeartPulse, title: "Medicaid Waiver Programs", desc: "Support for eligible families through Georgia's community-based care programs." },
            { icon: Award, title: "Veterans Benefits", desc: "Aid & Attendance and other VA benefits for qualifying veterans and spouses." },
            { icon: CreditCard, title: "Private Pay", desc: "Flexible monthly plans with clear, all-inclusive pricing — no hidden fees." },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl bg-white border border-border p-6 shadow-card hover:shadow-elegant transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero shadow-soft">
                <c.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 p-6 md:p-8 text-center">
          <p className="text-foreground">
            <strong>Have questions about coverage?</strong> Our care advisors offer complimentary consultations to help you understand your options.
          </p>
          <Link to="/contact" className="mt-4 inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3 text-sm font-semibold text-white shadow-soft">
            Request a Free Consultation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CONTACT PREVIEW */}
      <section className="bg-surface py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
                <PhoneCall className="h-4 w-4" /> Get in Touch
              </div>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
                We're one call away — 24 hours a day.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Whether you're exploring options or ready to schedule a visit, our team is here to listen. No pressure, no scripts — just real answers.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Phone, label: "Office", value: BRAND.phone, href: BRAND.phoneHref },
                  { icon: MessageCircle, label: "WhatsApp / Cell", value: BRAND.cell, href: BRAND.whatsapp },
                  { icon: Mail, label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
                  { icon: MapPin, label: "Visit", value: BRAND.address, href: `https://maps.google.com/?q=${BRAND.mapsQuery}` },
                ].map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-2xl bg-white p-4 border border-border shadow-card hover:shadow-elegant hover:border-primary/40 transition"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-hero shadow-soft">
                      <c.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-primary uppercase tracking-widest">{c.label}</div>
                      <div className="text-sm font-semibold text-foreground break-words">{c.value}</div>
                    </div>

                  </a>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] gradient-hero opacity-20 blur-2xl" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-elegant border-8 border-white">
                <img src={IMG.caregiver2} alt="Caregiver assisting senior" className="h-[480px] w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-white p-5 shadow-elegant border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">We answer, day or night</div>
                    <div className="font-bold text-foreground">Available 24 / 7 / 365</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-14">
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
