import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG } from "@/lib/site";
import { Music, Palette, BookOpen, Utensils, Bus, Activity, Flower2, Gamepad2, HandHeart, Film, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities & Wellness | Beauvais Group" },
      { name: "description", content: "Enriching daily activities at Beauvais Group — music, art, fitness, outings, and community." },
      { property: "og:title", content: "Activities — Beauvais Group" },
      { property: "og:description", content: "Music, art, therapy, and community engagement every day." },
    ],
  }),
  component: Page,
});

function Page() {
  const activities = [
    { icon: Music, t: "Music Therapy", d: "Live music, sing-alongs, and instrument circles.", c: "from-primary to-primary-glow" },
    { icon: Palette, t: "Arts & Crafts", d: "Painting, ceramics, and creative expression.", c: "from-secondary to-secondary-glow" },
    { icon: BookOpen, t: "Storytelling", d: "Memory-sharing and reading circles.", c: "from-primary to-secondary" },
    { icon: Utensils, t: "Cooking Together", d: "Simple, joyful shared cooking sessions.", c: "from-secondary to-primary-glow" },
    { icon: Bus, t: "Community Outings", d: "Trips to parks, museums, and local events.", c: "from-primary-deep to-primary" },
    { icon: Activity, t: "Chair Fitness", d: "Gentle exercise adapted to every ability.", c: "from-secondary to-secondary-glow" },
    { icon: Flower2, t: "Garden Therapy", d: "Planting, tending, and enjoying our gardens.", c: "from-secondary-glow to-primary-glow" },
    { icon: Gamepad2, t: "Games & Puzzles", d: "Bingo, cards, checkers, and word games.", c: "from-primary to-primary-deep" },
    { icon: HandHeart, t: "Spiritual Care", d: "Optional worship, prayer, and reflection.", c: "from-secondary to-primary" },
    { icon: Film, t: "Movie Nights", d: "Classic films and shared entertainment.", c: "from-primary-glow to-secondary-glow" },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="split"
        eyebrow="Activities"
        title="Every day is filled with purpose and joy."
        subtitle="Our activities program is designed to enrich body, mind, and spirit — from music therapy to gardening to community outings."
        image={IMG.activity}
      />

      {/* Grid with gradient cards */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {activities.map((a) => (
            <div key={a.t} className="group relative overflow-hidden rounded-3xl bg-white border border-border p-6 hover:shadow-elegant hover:-translate-y-1 transition duration-300">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.c} shadow-soft`}>
                <a.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">{a.t}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly schedule preview - unique table style */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">Sample Week</div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-foreground text-balance">A rhythm of engagement.</h2>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-elegant border border-border bg-white">
            {[
              { d: "Monday", a: "Music therapy · Chair yoga · Bingo" },
              { d: "Tuesday", a: "Painting class · Gardening · Movie afternoon" },
              { d: "Wednesday", a: "Community outing · Cooking together" },
              { d: "Thursday", a: "Story circle · Puzzles · Spiritual reflection" },
              { d: "Friday", a: "Live music · Craft market · Family visits" },
              { d: "Weekend", a: "Family day · Outdoor picnic · Games" },
            ].map((row, i) => (
              <div key={row.d} className={`grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] gap-4 p-5 ${i % 2 ? "bg-surface" : "bg-white"} border-b border-border last:border-0`}>
                <div className="font-display font-bold text-primary">{row.d}</div>
                <div className="text-foreground text-sm">{row.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[2rem] gradient-hero p-10 md:p-14 text-white text-center shadow-elegant">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-balance max-w-2xl mx-auto">Want to see activities in action?</h3>
          <p className="mt-3 text-white/90 max-w-lg mx-auto">Visit our gallery or book a tour to experience it yourself.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/gallery" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary">View Gallery <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white">Book a Tour</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
