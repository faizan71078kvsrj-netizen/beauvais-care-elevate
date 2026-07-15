import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG, BRAND } from "@/lib/site";
import {
  Home, Brain, Sun, Pill, Utensils, Bath, Heart, Bus, Sparkles, Bed, Stethoscope, Users,
  ArrowRight, Phone, MessageCircle, Calendar,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "All Services | Beauvais Group & Personal Care Home" },
      { name: "description", content: "Explore the full range of senior services at Beauvais Group — residential care, adult day, memory care, therapy, and more." },
      { property: "og:title", content: "Our Services — Beauvais Group" },
      { property: "og:description", content: "Complete senior care services in Lawrenceville, GA." },
    ],
  }),
  component: Page,
});

function Page() {
  const services = [
    { icon: Home, title: "Residential Senior Care", desc: "24/7 personal care in a warm family setting.", to: "/senior-care" },
    { icon: Sun, title: "Adult Day Health Care", desc: "Structured daytime programming and wellness.", to: "/adult-day-health-care" },
    { icon: Brain, title: "Alzheimer's & Dementia", desc: "Specialized, secure memory care.", to: "/alzheimers-dementia-care" },
    { icon: Pill, title: "Medication Management", desc: "Certified oversight of every prescription." },
    { icon: Utensils, title: "Chef-Prepared Meals", desc: "Nutritious meals tailored to each diet." },
    { icon: Bath, title: "Personal Hygiene Support", desc: "Bathing, grooming, and personal care with respect." },
    { icon: Heart, title: "Companionship", desc: "Emotional support and social engagement." },
    { icon: Bus, title: "Transportation", desc: "Assisted transport to appointments and outings." },
    { icon: Sparkles, title: "Housekeeping & Laundry", desc: "Full room cleaning and linen service." },
    { icon: Bed, title: "Respite Care", desc: "Short-term stays for family caregiver relief." },
    { icon: Stethoscope, title: "Wellness Monitoring", desc: "Vitals, health tracking, physician coordination." },
    { icon: Users, title: "Family Support", desc: "Regular updates and open communication." },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="minimal"
        eyebrow="Services"
        title="A complete continuum of care."
        subtitle="Every service is designed around the whole person — physical, emotional, and social wellbeing."
      />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="group relative rounded-3xl border border-border bg-gradient-to-br from-white to-surface p-7 shadow-card hover:shadow-elegant hover:-translate-y-1 transition duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero shadow-soft">
                <s.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              {s.to && (
                <Link to={s.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] gradient-teal-deep p-10 md:p-14 text-white grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, oklch(0.77 0.16 155 / 0.6), transparent 45%)" }} />
          <div className="relative">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-balance">Not sure what care is right?</h3>
            <p className="mt-3 text-white/85 max-w-lg">Speak with our care team for a free assessment. We'll help you find the perfect fit for your loved one.</p>
          </div>
          <div className="relative flex flex-col gap-3">
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary-deep"><Calendar className="h-4 w-4" /> Book Appointment</Link>
            <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-bold text-white"><Phone className="h-4 w-4" /> Call {BRAND.phone}</a>
            <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-sm font-bold text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
