import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG, BRAND } from "@/lib/site";
import { HeartPulse, Target, Eye, Sparkles, Users, Award, Leaf, Shield, ArrowRight, Phone } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Beauvais Group & Personal Care Home Inc." },
      { name: "description", content: "Learn about Beauvais Group's mission to provide compassionate, dignified 24/7 senior care in Lawrenceville, GA." },
      { property: "og:title", content: "About Beauvais Group & Personal Care Home Inc." },
      { property: "og:description", content: "Our story, mission, and the values behind our family-centered senior care." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        variant="split"
        eyebrow="Our Story"
        title="Caring for seniors like they are our own family."
        subtitle="Founded on faith, love, and clinical excellence — Beauvais Group has been a trusted home for seniors in the Lawrenceville community for over two decades."
        image={IMG.senior1}
      />

      {/* Story */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          <HeartPulse className="h-3.5 w-3.5" /> The Heart of What We Do
        </div>
        <h2 className="mt-5 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
          More than a care home — a place where seniors are seen, heard, and loved.
        </h2>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Beauvais Group & Personal Care Home Inc. was founded with a simple but powerful vision: to create a residence that feels like home. Every meal, every conversation, every gentle hand carries the warmth of family and the discipline of professional caregiving.
        </p>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-6 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Our Mission", body: "To provide exceptional, personalized care that honors the dignity, independence, and joy of every senior we serve." },
            { icon: Eye, title: "Our Vision", body: "A world where aging is embraced with grace — where every senior lives in comfort, safety, and community." },
            { icon: Sparkles, title: "Our Values", body: "Compassion. Dignity. Excellence. Family. These are not words on a wall — they guide every choice we make." },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl bg-white p-8 shadow-card border border-border">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero shadow-soft">
                <c.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us - Full */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <img src={IMG.nurse} alt="Nurse caring for senior" className="rounded-3xl shadow-elegant h-[500px] w-full object-cover" />
            <div className="absolute -bottom-6 -right-6 hidden md:block rounded-2xl bg-white p-6 shadow-elegant border border-border max-w-[240px]">
              <Award className="h-8 w-8 text-secondary" />
              <div className="mt-2 font-display text-2xl font-bold text-foreground">Award-winning care</div>
              <div className="text-xs text-muted-foreground">Recognized for excellence in senior services</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-secondary uppercase tracking-widest">Why Families Trust Us</div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">
              A rare blend of clinical rigor and genuine warmth.
            </h2>
            <div className="mt-8 space-y-5">
              {[
                { icon: Shield, title: "State licensed & fully insured", desc: "Full regulatory compliance and comprehensive coverage." },
                { icon: Users, title: "Low staff-to-resident ratio", desc: "Personal attention every hour of every day." },
                { icon: HeartPulse, title: "Registered nurses on staff", desc: "Medical oversight built into every care plan." },
                { icon: Leaf, title: "Home-cooked, dietitian-approved meals", desc: "Fresh, nutritious food that residents love." },
              ].map((r) => (
                <div key={r.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{r.title}</div>
                    <div className="text-sm text-muted-foreground">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] gradient-teal-deep p-10 md:p-14 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, oklch(0.77 0.16 155 / 0.6), transparent 40%)" }} />
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-balance max-w-xl">Come see our home for yourself.</h3>
              <p className="mt-3 text-white/85 max-w-lg">Schedule a private tour and meet the team who will care for your loved one.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary-deep">
                Schedule a Tour <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-bold text-white">
                <Phone className="h-4 w-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
