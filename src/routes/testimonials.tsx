import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { Star, Quote } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials | Beauvais Group" },
      { name: "description", content: "Read what families say about Beauvais Group Personal Care Home." },
      { property: "og:title", content: "Testimonials — Beauvais Group" },
      { property: "og:description", content: "Kind words from the families we've had the privilege to serve." },
    ],
  }),
  component: Page,
});

function Page() {
  const stories = [
    { q: "The care and love my mother receives is beyond anything we imagined. The staff feel like extended family, and mom actually looks forward to each day.", a: "Denise R.", role: "Daughter of Resident" },
    { q: "Choosing Beauvais was the best decision our family has made. Warm, professional, and genuinely caring — every single day. We visit often and always leave reassured.", a: "Marcus L.", role: "Son of Resident" },
    { q: "My father is thriving here. The dementia care team is patient, kind, and truly gifted at what they do. He's calmer than he's been in years.", a: "Sophia N.", role: "Family Member" },
    { q: "From our first tour we felt at home. The house is beautiful, the food is real, and the caregivers treat residents like their own parents.", a: "Amanda P.", role: "Daughter" },
    { q: "As a nurse myself, I have high standards. Beauvais exceeds them — clinically excellent AND deeply compassionate. Rare combination.", a: "Karen T., RN", role: "Family Member" },
    { q: "Mom's health has actually improved since moving in. Regular meals, medications on time, and a community of friends. Grateful beyond words.", a: "Christopher B.", role: "Son" },
    { q: "The transparency is refreshing. Regular updates, open communication, and never a hidden fee. We feel like true partners in Dad's care.", a: "Renee M.", role: "Daughter" },
    { q: "My aunt has been at Beauvais for over three years now. The consistency of loving care she receives is remarkable.", a: "Jamal K.", role: "Nephew" },
    { q: "The activities program keeps mom engaged and happy. Music therapy has been transformative for her.", a: "Elise D.", role: "Daughter" },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="gradient"
        eyebrow="Testimonials"
        title="Words from the families we serve."
        subtitle="Every story is a reminder of why we do this work."
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((t) => (
            <figure key={t.a} className="relative flex flex-col rounded-3xl bg-gradient-to-br from-white to-surface p-8 shadow-card border border-border">
              <div className="flex items-center gap-1 text-secondary">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <Quote className="h-8 w-8 text-primary/25 mt-4" />
              <blockquote className="mt-2 text-foreground leading-relaxed flex-1">"{t.q}"</blockquote>
              <figcaption className="mt-6 pt-6 border-t border-border">
                <div className="font-bold text-foreground">{t.a}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">Ready to write your family's story?</h3>
        <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3.5 text-sm font-bold text-white shadow-soft">
          Schedule a Tour
        </Link>
      </section>
    </SiteLayout>
  );
}
