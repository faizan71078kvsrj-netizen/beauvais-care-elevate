import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { BRAND } from "@/lib/site";
import { MapPin, Phone, Smartphone, Printer, Mail, Clock, MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitAppointment } from "@/lib/appointments.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Appointments | Beauvais Group" },
      { name: "description", content: "Contact Beauvais Group Personal Care Home in Lawrenceville, GA. Call, email, WhatsApp, or book a private tour." },
      { property: "og:title", content: "Contact — Beauvais Group" },
      { property: "og:description", content: "Reach our care team 24/7. Book a tour today." },
    ],
  }),
  component: Page,
});

function Page() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", date: "", message: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitAppointment({ data: form });
      setSubmitted(true);
      toast.success("Thank you! We'll be in touch within 24 hours.");
      setForm({ name: "", email: "", phone: "", service: "", date: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please call us at " + BRAND.phone);
    } finally {
      setSubmitting(false);
    }
  };

  const contactCards = [
    { icon: MapPin, label: "Visit", value: BRAND.address, href: `https://maps.google.com/?q=${BRAND.mapsQuery}` },
    { icon: Phone, label: "Office", value: BRAND.phone, href: BRAND.phoneHref },
    { icon: Smartphone, label: "Cell", value: BRAND.cell, href: BRAND.cellHref },
    { icon: Printer, label: "Fax", value: BRAND.fax, href: `tel:${BRAND.fax.replace(/\D/g, "")}` },
    { icon: Mail, label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
    { icon: Clock, label: "Hours", value: BRAND.hours, href: "#" },
  ];

  return (
    <SiteLayout>
      <PageHero
        variant="gradient"
        eyebrow="Get In Touch"
        title="We're here 24/7 — let's talk."
        subtitle="Whether you're ready to schedule a tour or just have questions, our team is one message away."
      />

      {/* Contact cards */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactCards.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 border border-border shadow-card hover:shadow-elegant hover:border-primary/40 transition"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-hero shadow-soft group-hover:shadow-glow transition">
                <c.icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-primary uppercase tracking-widest">{c.label}</div>
                <div className="mt-1 font-semibold text-foreground break-words">{c.value}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Quick action bar */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <a href={BRAND.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-4 text-sm font-bold text-white shadow-soft">
            <MessageCircle className="h-4 w-4" /> WhatsApp Us
          </a>
          <a href={BRAND.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full gradient-hero px-6 py-4 text-sm font-bold text-white shadow-soft">
            <Phone className="h-4 w-4" /> Call Now
          </a>
          <a href={`mailto:${BRAND.email}`} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/40 bg-white px-6 py-4 text-sm font-bold text-primary">
            <Mail className="h-4 w-4" /> Email
          </a>
        </div>
      </section>

      {/* Form + Map */}
      <section className="bg-surface py-12">
        <div className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-3xl bg-white p-8 md:p-10 shadow-elegant border border-border">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">Book an Appointment</div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold text-foreground">Schedule a private tour or consultation</h2>

            {submitted && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/10 border border-secondary/30 p-3 text-sm text-secondary-foreground">
                <CheckCircle2 className="h-4 w-4 text-secondary" /> Message received. We'll reply within 24 hours.
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Phone *" type="tel" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              </div>
              <Field label="Email *" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Service Interest</label>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a service</option>
                    <option>Senior Care</option>
                    <option>Adult Day Health Care</option>
                    <option>Alzheimer's & Dementia Care</option>
                    <option>Respite Care</option>
                    <option>Tour / General Inquiry</option>
                  </select>
                </div>
                <Field label="Preferred Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your loved one's needs..."
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-hero px-6 py-4 text-sm font-bold text-white shadow-soft hover:shadow-glow transition disabled:opacity-70 disabled:cursor-not-allowed">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send Appointment Request</>}
              </button>
              <p className="text-xs text-muted-foreground text-center">We respond within 24 hours. For urgent needs, please call {BRAND.phone}.</p>
            </form>
          </div>

          {/* Map */}
          <div className="rounded-3xl overflow-hidden shadow-elegant border border-border bg-white flex flex-col">
            <div className="p-6 border-b border-border">
              <div className="text-xs font-semibold text-secondary uppercase tracking-widest">Find Us</div>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground">Our Location</h3>
              <p className="mt-1 text-sm text-muted-foreground">{BRAND.address}</p>
            </div>
            <div className="flex-1 min-h-[400px]">
              <iframe
                title="Beauvais Group location"
                src={`https://www.google.com/maps?q=${BRAND.mapsQuery}&output=embed`}
                className="w-full h-full min-h-[400px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
