import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG, BRAND } from "@/lib/site";
import { Home, Utensils, Pill, Bath, Bed, Shirt, HeartPulse, ArrowRight, CheckCircle2, Phone } from "lucide-react";

export const Route = createFileRoute("/senior-care")({
  head: () => ({
    meta: [
      { title: "Senior Care | Beauvais Group Personal Care Home" },
      { name: "description", content: "24/7 residential senior care in Lawrenceville, GA — personalized plans, medication management, and dignified assistance." },
      { property: "og:title", content: "Senior Care — Beauvais Group" },
      { property: "og:description", content: "Warm, dignified 24-hour senior care in a licensed personal care home." },
    ],
  }),
  component: SeniorCarePage,
});

function SeniorCarePage() {
  const services = [
    { icon: Bed, title: "Assistance with Daily Living", desc: "Personalized help with dressing, grooming, and mobility." },
    { icon: Pill, title: "Medication Management", desc: "Certified staff oversight of prescriptions and dosages." },
    { icon: Utensils, title: "Nutritious Home-Cooked Meals", desc: "Three chef-prepared meals plus snacks, tailored to diets." },
    { icon: Bath, title: "Personal Hygiene Support", desc: "Respectful assistance with bathing and personal care." },
    { icon: Shirt, title: "Laundry & Housekeeping", desc: "Full laundry, linen changes, and room maintenance." },
    { icon: HeartPulse, title: "Wellness Monitoring", desc: "Vital signs, health tracking, and coordination with physicians." },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="image"
        eyebrow="Residential Care"
        title="Senior Care that feels like coming home."
        subtitle="Round-the-clock support in a warm, family-style residence — where independence is preserved and dignity is central."
        image={IMG.senior2}
      />

      {/* Intro strip */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 grid gap-6 md:grid-cols-3 text-center">
          {[
            { n: "24/7", l: "On-Site Care Team" },
            { n: "1:5", l: "Caregiver to Resident" },
            { n: "365", l: "Days of Comfort" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-4xl font-bold text-primary">{s.n}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services list - unique layout: cards with left icon strip */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">What's Included</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
            Complete daily care, thoughtfully delivered.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="group flex gap-5 rounded-2xl bg-white border border-border p-6 hover:border-primary/40 hover:shadow-card transition">
              <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 group-hover:from-primary group-hover:to-secondary transition">
                <s.icon className="h-7 w-7 text-primary group-hover:text-white transition" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* A day here */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-2 lg:items-center">
          <img src={IMG.assistedLiving} alt="Assisted living" className="rounded-3xl shadow-elegant h-[480px] w-full object-cover" />
          <div>
            <div className="text-xs font-semibold text-secondary uppercase tracking-widest">A Day at Beauvais</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
              Structured yet gentle — every day flows with purpose.
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                { t: "Morning", d: "Breakfast, medication, gentle stretching, and personal care." },
                { t: "Midday", d: "Lunch, group activities, therapy sessions, and quiet time." },
                { t: "Afternoon", d: "Outdoor time, hobbies, family visits, and snacks." },
                { t: "Evening", d: "Dinner, entertainment, evening care, and restful sleep." },
              ].map((row) => (
                <li key={row.t} className="flex gap-4 items-start">
                  <div className="mt-1 rounded-full gradient-hero px-3 py-1 text-xs font-bold text-white shrink-0">{row.t}</div>
                  <div className="text-sm text-foreground">{row.d}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Home features */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">The Residence</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">A safe, beautiful home to grow older in.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[Home, HeartPulse, Utensils, Bath].map((Icon, i) => (
            <div key={i} className="rounded-3xl overflow-hidden border border-border bg-white shadow-card">
              <img src={[IMG.senior3, IMG.hands, IMG.meal, IMG.garden][i]} alt="" className="h-48 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="font-bold text-foreground">{["Private Rooms", "Wellness Suite", "Communal Dining", "Peaceful Gardens"][i]}</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Curated for comfort, safety, and community.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Unique CTA - checklist band */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] bg-white border-2 border-primary/20 p-10 md:p-14 shadow-elegant">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">Ready to explore senior care?</h3>
              <ul className="mt-6 space-y-2">
                {["Free personalized care assessment", "Private in-person tour", "Transparent pricing — no surprises"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-secondary" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full gradient-hero px-6 py-3.5 text-sm font-bold text-white shadow-soft">
                Book a Tour <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-6 py-3.5 text-sm font-bold text-primary">
                <Phone className="h-4 w-4" /> Call {BRAND.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
