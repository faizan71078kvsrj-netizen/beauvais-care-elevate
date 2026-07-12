import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG, BRAND } from "@/lib/site";
import { Brain, Shield, HeartPulse, Lightbulb, Users, Clock, MessageCircle, ArrowRight, Phone } from "lucide-react";

export const Route = createFileRoute("/alzheimers-dementia-care")({
  head: () => ({
    meta: [
      { title: "Alzheimer's & Dementia Care | Beauvais Group" },
      { name: "description", content: "Specialized memory care in Lawrenceville, GA with trained staff, secure environment, and person-centered support." },
      { property: "og:title", content: "Alzheimer's & Dementia Care — Beauvais Group" },
      { property: "og:description", content: "Compassionate, specialized memory care for individuals living with Alzheimer's and dementia." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero
        variant="image"
        eyebrow="Memory Care"
        title="Specialized care for those living with Alzheimer's and dementia."
        subtitle="A safe, calming environment where memory challenges are met with patience, expertise, and unconditional love."
        image={IMG.memory}
      />

      {/* Approach - 2 col */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-widest">Our Approach</div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
            Person-centered memory care that honors who they are.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            We meet each resident where they are — not where they used to be. Our team draws on years of specialized dementia training to deliver care that reduces anxiety, encourages familiar routines, and preserves dignity.
          </p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3 text-sm font-semibold text-white shadow-soft">
            Talk to Our Care Team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src={IMG.hands} alt="" className="rounded-2xl h-56 w-full object-cover shadow-card" />
          <img src={IMG.senior1} alt="" className="rounded-2xl h-56 w-full object-cover shadow-card mt-8" />
          <img src={IMG.music} alt="" className="rounded-2xl h-56 w-full object-cover shadow-card" />
          <img src={IMG.reading} alt="" className="rounded-2xl h-56 w-full object-cover shadow-card mt-8" />
        </div>
      </section>

      {/* Program pillars - unique dark section with cards */}
      <section className="relative overflow-hidden gradient-teal-deep text-white py-20">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, oklch(0.77 0.16 155 / 0.4), transparent 45%)" }} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-secondary-glow uppercase tracking-widest">Program Pillars</div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-balance">Built on evidence, delivered with love.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, t: "Safe & Secure Environment", d: "Wander-safe design, monitored spaces, and 24/7 supervision." },
              { icon: Brain, t: "Cognitive Engagement", d: "Sensory therapy, music, art, and memory-boosting activities." },
              { icon: HeartPulse, t: "Medical Oversight", d: "Coordination with physicians and specialists on every plan." },
              { icon: Lightbulb, t: "Familiar Routines", d: "Consistent, predictable daily rhythms that ease anxiety." },
              { icon: Users, t: "Family Involvement", d: "Regular updates and open-door policy for loved ones." },
              { icon: Clock, t: "24/7 Trained Staff", d: "Specialized caregivers on site day and night." },
            ].map((p) => (
              <div key={p.t} className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-6 hover:bg-white/15 transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/25 border border-secondary/40">
                  <p.icon className="h-6 w-6 text-secondary-glow" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{p.t}</h3>
                <p className="mt-2 text-sm text-white/80">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Family support CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] bg-white border-2 border-secondary/20 p-10 md:p-14 shadow-elegant grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-semibold text-secondary uppercase tracking-widest">You're Not Alone</div>
            <h3 className="mt-3 font-display text-3xl md:text-4xl font-bold text-foreground text-balance">Supporting families every step of the journey.</h3>
            <p className="mt-4 text-muted-foreground">Caring for a loved one with dementia is heavy work. Our team walks alongside you with resources, guidance, and around-the-clock partnership.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
            <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-sm font-bold text-white">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full gradient-hero px-6 py-3.5 text-sm font-bold text-white">
              <Phone className="h-4 w-4" /> Call {BRAND.phone}
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
