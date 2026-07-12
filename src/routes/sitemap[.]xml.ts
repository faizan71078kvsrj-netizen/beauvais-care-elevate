import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

interface SitemapEntry { path: string; changefreq?: string; priority?: string; }

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.9" },
          { path: "/services", changefreq: "monthly", priority: "0.9" },
          { path: "/senior-care", changefreq: "monthly", priority: "0.9" },
          { path: "/adult-day-health-care", changefreq: "monthly", priority: "0.9" },
          { path: "/alzheimers-dementia-care", changefreq: "monthly", priority: "0.9" },
          { path: "/activities", changefreq: "monthly", priority: "0.7" },
          { path: "/gallery", changefreq: "monthly", priority: "0.6" },
          { path: "/videos", changefreq: "monthly", priority: "0.6" },
          { path: "/testimonials", changefreq: "monthly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.9" },
        ];
        const urls = entries.map((e) =>
          `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
