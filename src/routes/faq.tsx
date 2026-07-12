import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Phone } from "lucide-react";
import { BRAND } from "@/lib/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | Beauvais Group" },
      { name: "description", content: "Answers to common questions about Beauvais Group Personal Care Home." },
      { property: "og:title", content: "FAQ — Beauvais Group" },
      { property: "og:description", content: "Everything families ask about our senior care services." },
    ],
  }),
  component: Page,
});

function Page() {
  const groups = [
    {
      title: "Care & Services",
      items: [
        { q: "What types of care do you provide?", a: "We offer 24/7 residential senior care, adult day health care, and specialized Alzheimer's & dementia care. Every plan is personalized." },
        { q: "Are you a licensed personal care home?", a: "Yes. Beauvais Group is a fully state-licensed personal care home in Lawrenceville, GA, with all required certifications and insurance." },
        { q: "Is a nurse on staff?", a: "Yes — we have registered nurses and trained caregivers on site around the clock." },
      ],
    },
    {
      title: "Admissions & Costs",
      items: [
        { q: "How do I get started?", a: "Contact us for a free care assessment and private tour. We'll discuss your loved one's needs and create a plan." },
        { q: "What does care cost?", a: "Pricing depends on the level of care required. We provide transparent, all-inclusive rates with no hidden fees." },
        { q: "Do you accept insurance or long-term care policies?", a: "We work with many private long-term care insurance policies. Contact us for eligibility details." },
      ],
    },
    {
      title: "Daily Life",
      items: [
        { q: "Can family visit anytime?", a: "Absolutely. We have an open-door policy and encourage families to visit and stay involved." },
        { q: "What activities do residents enjoy?", a: "Music, art, gardening, chair fitness, cooking, outings, games, and much more — see our Activities page." },
        { q: "How do you handle special diets?", a: "Our chef prepares meals tailored to medical, cultural, and personal preferences." },
      ],
    },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="minimal"
        eyebrow="Frequently Asked"
        title="Answers to your questions."
        subtitle="Choosing a care home is a big decision. Here's what families most often ask us."
      />

      <section className="mx-auto max-w-4xl px-6 py-16 space-y-12">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-hero shadow-soft">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{g.title}</h2>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl bg-white border border-border shadow-card divide-y divide-border overflow-hidden">
              {g.items.map((it, i) => (
                <AccordionItem key={i} value={`${g.title}-${i}`} className="border-0 px-6">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-5">{it.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <div className="rounded-3xl gradient-teal-deep p-10 text-white">
          <h3 className="font-display text-2xl md:text-3xl font-bold">Still have questions?</h3>
          <p className="mt-2 text-white/85">Our team is here 24/7 to help you.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary-deep"><Phone className="h-4 w-4" /> {BRAND.phone}</a>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white">Contact Us</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
