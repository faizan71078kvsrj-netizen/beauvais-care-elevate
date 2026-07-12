import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { IMG } from "@/lib/site";
import { Play, Clock } from "lucide-react";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Videos | Beauvais Group" },
      { name: "description", content: "Watch stories, tours, and testimonials from Beauvais Group Personal Care Home." },
      { property: "og:title", content: "Videos — Beauvais Group" },
      { property: "og:description", content: "Video tours, resident stories, and educational content." },
    ],
  }),
  component: Page,
});

function Page() {
  const videos = [
    { title: "A Day at Beauvais", desc: "Take a walk through a typical day in our home.", cover: IMG.senior3, length: "3:42" },
    { title: "Meet Our Care Team", desc: "The nurses and caregivers who make it home.", cover: IMG.nurse, length: "2:18" },
    { title: "Memory Care in Action", desc: "How we support residents with dementia.", cover: IMG.memory, length: "4:05" },
    { title: "Family Testimonials", desc: "Hear from the families we serve.", cover: IMG.hands, length: "5:12" },
    { title: "Activities & Community", desc: "Music, art, and connection every day.", cover: IMG.activity, length: "3:24" },
    { title: "Virtual Home Tour", desc: "See every room and space at Beauvais.", cover: IMG.assistedLiving, length: "6:30" },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="minimal"
        eyebrow="Videos"
        title="Watch our story unfold."
        subtitle="Video tours, resident stories, and glimpses of daily life at Beauvais Group."
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <div key={v.title} className="group rounded-3xl overflow-hidden bg-white border border-border shadow-card hover:shadow-elegant transition">
              <div className="relative aspect-video overflow-hidden">
                <img src={v.cover} alt={v.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-elegant group-hover:scale-110 transition">
                    <Play className="h-7 w-7 text-primary fill-primary ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-xs text-white">
                  <Clock className="h-3 w-3" /> {v.length}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-foreground">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">Want to see more?</h3>
        <p className="mt-3 text-muted-foreground">Schedule a live in-person tour and see everything for yourself.</p>
        <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-hero px-6 py-3.5 text-sm font-bold text-white shadow-soft">
          Book a Visit
        </Link>
      </section>
    </SiteLayout>
  );
}
