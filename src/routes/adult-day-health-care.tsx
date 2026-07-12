import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG, BRAND } from "@/lib/site";
import { Sun, Activity, Users, Music, Palette, BookOpen, Utensils, Bus, ArrowRight, Phone } from "lucide-react";

export const Route = createFileRoute("/adult-day-health-care")({
  head: () => ({
    meta: [
      { title: "Adult Day Health Care | Beauvais Group" },
      { name: "description", content: "Structured, enriching adult day health programs in Lawrenceville, GA — social engagement, therapy, and wellness in a safe environment." },
      { property: "og:title", content: "Adult Day Health Care — Beauvais Group" },
      { property: "og:description", content: "Enriching daytime programs for adults needing supervision, therapy, and community." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero
        variant="gradient"
        eyebrow="Daytime Program"
        title="Adult Day Health Care with heart."
        subtitle="A vibrant, supervised day program that nurtures body, mind, and spirit — while giving families the support they need."
      />

      {/* Feature strip - unique alternating layout */}
      <section className="mx-auto max-w-7xl px-6 py-20 space-y-16">
        {[
          { icon: Sun, title: "Structured, joyful days", desc: "Our carefully planned schedule keeps participants engaged, active, and connected. Every day brings meaningful activity, warm meals, and moments of genuine joy.", img: IMG.dayCare, reverse: false },
          { icon: Activity, title: "Wellness and light therapy", desc: "On-site health monitoring, physical therapy, gentle exercise, and medication support — supervised by trained staff throughout the day.", img: IMG.therapy, reverse: true },
          { icon: Users, title: "Social community that thrives", desc: "Friendships bloom over meals, games, music, and shared stories. Isolation fades in a warm community that shows up for one another.", img: IMG.activity, reverse: false },
        ].map((row) => (
          <div key={row.title} className={`grid gap-10 lg:grid-cols-2 lg:items-center ${row.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero shadow-soft">
                <row.icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="mt-5 font-display text-3xl md:text-4xl font-bold text-foreground text-balance">{row.title}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{row.desc}</p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl gradient-hero opacity-20 blur-2xl" />
              <img src={row.img} alt="" className="relative rounded-3xl shadow-elegant h-[380px] w-full object-cover" />
            </div>
          </div>
        ))}
      </section>

      {/* Activities grid - masonry-like */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold text-secondary uppercase tracking-widest">What Happens Each Day</div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">Rich programming that keeps every day new.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Music, t: "Music & Sing-Alongs" },
              { icon: Palette, t: "Arts & Crafts" },
              { icon: BookOpen, t: "Storytelling Circles" },
              { icon: Utensils, t: "Cooking Together" },
              { icon: Bus, t: "Community Outings" },
              { icon: Activity, t: "Chair Yoga & Fitness" },
              { icon: Sun, t: "Garden Walks" },
              { icon: Users, t: "Game Tournaments" },
            ].map((a) => (
              <div key={a.t} className="rounded-2xl bg-white p-6 border border-border hover:border-secondary/40 hover:shadow-card transition text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15">
                  <a.icon className="h-7 w-7 text-secondary" />
                </div>
                <div className="mt-4 font-semibold text-foreground">{a.t}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/activities" className="inline-flex items-center gap-2 rounded-full border-2 border-primary/40 bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition">
              See All Activities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Family support */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] gradient-hero p-10 md:p-14 text-white grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center shadow-elegant">
          <div>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-balance">Peace of mind for caregivers, too.</h3>
            <p className="mt-4 text-white/90 max-w-xl">Adult day care gives family caregivers a well-deserved break, while their loved one thrives in a nurturing, professionally staffed environment.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary">
              Enroll Today
            </Link>
            <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-bold text-white">
              <Phone className="h-4 w-4" /> {BRAND.phone}
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
