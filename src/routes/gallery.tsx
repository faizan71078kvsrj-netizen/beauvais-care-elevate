import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG } from "@/lib/site";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery | Beauvais Group" },
      { name: "description", content: "Moments from daily life at Beauvais Group Personal Care Home." },
      { property: "og:title", content: "Photo Gallery — Beauvais Group" },
      { property: "og:description", content: "See our residents, caregivers, activities, and beautiful home." },
    ],
  }),
  component: Page,
});

function Page() {
  const photos = [
    { src: IMG.caregiver1, tag: "Caregivers" },
    { src: IMG.senior1, tag: "Residents" },
    { src: IMG.senior2, tag: "Daily Life" },
    { src: IMG.senior3, tag: "Community" },
    { src: IMG.nurse, tag: "Wellness" },
    { src: IMG.doctor, tag: "Medical" },
    { src: IMG.assistedLiving, tag: "Assisted Living" },
    { src: IMG.dayCare, tag: "Day Care" },
    { src: IMG.memory, tag: "Memory Care" },
    { src: IMG.activity, tag: "Activities" },
    { src: IMG.garden, tag: "Gardens" },
    { src: IMG.hands, tag: "Companionship" },
    { src: IMG.reading, tag: "Reading Circle" },
    { src: IMG.meal, tag: "Meals" },
    { src: IMG.music, tag: "Music Therapy" },
    { src: IMG.therapy, tag: "Therapy" },
    { src: IMG.caregiver2, tag: "Support" },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="gradient"
        eyebrow="Gallery"
        title="Snapshots of life at Beauvais."
        subtitle="Real moments, real smiles, real care."
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 [column-fill:_balance]">
          {photos.map((p, i) => (
            <div key={i} className="mb-3 md:mb-4 break-inside-avoid group relative overflow-hidden rounded-2xl shadow-card">
              <img src={p.src} alt={p.tag} className="w-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                <span className="rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-semibold text-foreground">{p.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">Come see it in person.</h3>
        <p className="mt-3 text-muted-foreground">Photos capture beauty, but a visit tells the whole story.</p>
        <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3.5 text-sm font-bold text-white shadow-soft">
          <Calendar className="h-4 w-4" /> Book a Tour
        </Link>
      </section>
    </SiteLayout>
  );
}
